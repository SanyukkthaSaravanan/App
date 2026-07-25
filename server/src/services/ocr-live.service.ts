/**
 * Live medication-scan service.
 *
 * Spawns the desktop Python scanner (scan_bridge.py) which opens the physical
 * camera + OpenCV window on the user's machine, captures the label, runs OCR +
 * matching, and prints ONE marker-prefixed JSON line to stdout. We parse that
 * line and return the structured result.
 *
 * This only works because the backend runs on the SAME machine as the camera
 * (local dev / desktop deployment) — the browser cannot drive a native camera
 * window itself.
 *
 * Concurrency: the camera is a single shared device, so only ONE scan may run
 * at a time. The lock (`scanInProgress`) is held until the child process has
 * ACTUALLY exited (the 'close' event), never released early on a kill — so a
 * retry can't race a still-dying process that still holds the camera.
 */

import { spawn, exec, type ChildProcess } from 'child_process';

const RESULT_MARKER = '@@FLAIRE_SCAN@@';

// Configurable via env; sensible defaults for this machine.
const OCR_DIR =
  process.env.OCR_DIR ?? 'C:\\Users\\sanyu\\OneDrive\\Desktop\\Flaire\\OCR';
const PYTHON_BIN = process.env.PYTHON_BIN ?? 'python';
const DEFAULT_CAMERA = process.env.OCR_CAMERA ?? '2';

// The OpenCV window is interactive — give the user time to line up & press SPACE.
const SCAN_TIMEOUT_MS = Number(process.env.OCR_SCAN_TIMEOUT_MS ?? 300_000); // 5 min

// Single shared camera → single concurrent scan. Held until the child truly exits.
let scanInProgress = false;
let activeChild: ChildProcess | null = null;

export interface LiveScanMatch {
  name: string;
  generic: string;
  category: string;
  score: number;
  matched_token?: string;
}

export interface LiveScanFields {
  medication_name: string;
  dosage: string;
  doctors_instructions: string[];
  schedule: string;
  generic?: string;
  category?: string;
  match_score?: number;
}

export interface LiveScanResult {
  ok: boolean;
  aborted?: boolean;
  type: 'box' | 'bottle';
  camera: string;
  ocr_raw?: string;
  warning?: string | null;
  fields?: LiveScanFields | null;
  matches?: LiveScanMatch[];
  online?: Record<string, unknown>;
  message?: string;
  error?: string;
  processing_time_s?: number;
}

export interface LiveScanOptions {
  type: 'box' | 'bottle';
  camera?: string | number;
  seconds?: number;
  online?: boolean;
}

export function isScanInProgress(): boolean {
  return scanInProgress;
}

/**
 * Forcibly terminate a child and its descendants. On Windows, the python
 * process spawns the OpenCV window as part of its own process, but child.kill()
 * may not reap the full tree reliably — use taskkill /T (tree) /F (force).
 */
function killTree(child: ChildProcess): void {
  if (!child.pid) return;
  if (process.platform === 'win32') {
    exec(`taskkill /pid ${child.pid} /T /F`, () => { /* best effort */ });
  } else {
    try { child.kill('SIGKILL'); } catch { /* ignore */ }
  }
}

/**
 * Cancel the in-flight scan, if any. Kills the scanner process; the lock is
 * cleared by the child's 'close' handler once the OS has reaped it.
 * Returns true if a scan was actually running.
 */
export function cancelLiveScan(): boolean {
  if (activeChild) {
    killTree(activeChild);
    return true;
  }
  return false;
}

export async function runLiveScan(opts: LiveScanOptions): Promise<LiveScanResult> {
  if (scanInProgress) {
    const err: any = new Error('A scan is already in progress. Finish or cancel it first.');
    err.status = 409;
    throw err;
  }

  const camera = String(opts.camera ?? DEFAULT_CAMERA);
  const seconds = Number.isFinite(opts.seconds) ? Number(opts.seconds) : 4.0;

  const args = [
    'scan_bridge.py',
    '--type', opts.type,
    '--camera', camera,
    '--seconds', String(seconds),
    '--json',
  ];
  if (opts.online) args.push('--online');

  let child: ChildProcess;
  try {
    child = spawn(PYTHON_BIN, args, {
      cwd: OCR_DIR,
      windowsHide: false, // allow the OpenCV window to surface
    });
  } catch (e: any) {
    const err: any = new Error(`Failed to launch scanner: ${e.message}`);
    err.status = 500;
    throw err;
  }

  // Take the lock only once we have a live child handle.
  scanInProgress = true;
  activeChild = child;

  return new Promise<LiveScanResult>((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    let settled = false;

    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn();
    };

    const timer = setTimeout(() => {
      // Kill the process; the lock is released by 'close' once it's truly gone.
      killTree(child);
      settle(() => {
        const err: any = new Error('Scan timed out. The scanner window was closed.');
        err.status = 408;
        reject(err);
      });
    }, SCAN_TIMEOUT_MS);

    child.stdout?.on('data', (d) => { stdout += d.toString('utf8'); });
    child.stderr?.on('data', (d) => { stderr += d.toString('utf8'); });

    child.on('error', (e: any) => {
      // Spawn-level failure (e.g. python not found). 'close' may not fire, so
      // release the lock here too (idempotent).
      scanInProgress = false;
      activeChild = null;
      settle(() => {
        const err: any = new Error(
          e.code === 'ENOENT'
            ? `Python executable "${PYTHON_BIN}" not found. Set PYTHON_BIN in server/.env.`
            : `Scanner process error: ${e.message}`
        );
        err.status = 500;
        reject(err);
      });
    });

    child.on('close', (code, signal) => {
      // The process is truly gone now — safe to release the camera lock.
      scanInProgress = false;
      activeChild = null;

      // If a timeout/error already settled this promise, we're only here to
      // release the lock.
      if (settled) return;

      const line = stdout
        .split(/\r?\n/)
        .find((l) => l.includes(RESULT_MARKER));

      if (!line) {
        const tail = stderr.trim().split(/\r?\n/).slice(-3).join(' ');
        const how = signal
          ? `killed by signal ${signal}`
          : `exit code ${code}`;
        const err: any = new Error(
          `Scanner returned no result (${how}). ${tail || 'No diagnostic output.'}`
        );
        err.status = 502;
        settle(() => reject(err));
        return;
      }

      try {
        const jsonStr = line.slice(line.indexOf(RESULT_MARKER) + RESULT_MARKER.length);
        const parsed = JSON.parse(jsonStr) as LiveScanResult;
        settle(() => resolve(parsed));
      } catch (e: any) {
        const err: any = new Error(`Failed to parse scanner result: ${e.message}`);
        err.status = 502;
        settle(() => reject(err));
      }
    });
  });
}
