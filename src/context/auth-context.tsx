import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth as authApi, token as tokenStore, type AuthUser, type OnboardingInput } from '../lib/api';
import { identifyUser, resetAnalytics } from '../lib/analytics';

// Tie analytics events to the signed-in user (id + basic account fields only —
// never health data).
function identifyFromUser(u: AuthUser) {
  identifyUser(u.id, {
    email: u.email,
    username: u.username,
    name: u.firstName ? `${u.firstName}${u.lastName ? ` ${u.lastName}` : ''}` : null,
  });
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  needsOnboarding: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  completeOnboarding: (data: OnboardingInput) => Promise<void>;
  logout: () => void;
}

// Local backstop so onboarding never loops even if the DB columns aren't
// migrated yet (server flag is authoritative once available).
const onboardedKey = (id: string) => `flaire_onboarded_${id}`;

// Local backstop for the user's saved preferences (condition / tracked factors
// / known triggers). The server is authoritative once the columns are migrated;
// until then this keeps preferences "checked off" across reloads on the device.
const prefsKey = (id: string) => `flaire_prefs_${id}`;

type SavedPrefs = Pick<AuthUser, 'condition' | 'trackedFactors' | 'knownTriggers'>;

function loadPrefs(id: string): SavedPrefs {
  try {
    return JSON.parse(localStorage.getItem(prefsKey(id)) || '{}');
  } catch {
    return {};
  }
}

function savePrefs(id: string, data: OnboardingInput) {
  const prev = loadPrefs(id);
  const next: SavedPrefs = {
    condition: data.condition ?? prev.condition ?? null,
    trackedFactors: data.trackedFactors ?? prev.trackedFactors ?? null,
    knownTriggers: data.knownTriggers ?? prev.knownTriggers ?? null,
  };
  localStorage.setItem(prefsKey(id), JSON.stringify(next));
}

// Server value wins when present; otherwise fall back to the local copy so a
// reload/login on the same device still shows the saved preferences.
function mergePrefs(u: AuthUser): AuthUser {
  const saved = loadPrefs(u.id);
  const hasArr = (v: unknown) => Array.isArray(v) && v.length > 0;
  return {
    ...u,
    condition: u.condition ?? saved.condition ?? null,
    trackedFactors: hasArr(u.trackedFactors) ? u.trackedFactors : saved.trackedFactors ?? u.trackedFactors,
    knownTriggers: hasArr(u.knownTriggers) ? u.knownTriggers : saved.knownTriggers ?? u.knownTriggers,
  };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: restore session from stored token
  useEffect(() => {
    const restore = async () => {
      const t = tokenStore.get();
      if (!t) { setIsLoading(false); return; }
      try {
        const { user: me } = await authApi.me();
        setUser(mergePrefs(me));
        identifyFromUser(me);
      } catch {
        // Token invalid/expired — clear it
        tokenStore.clear();
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    tokenStore.set(res.token);
    setUser(mergePrefs(res.user));
    identifyFromUser(res.user);
  }, []);

  const register = useCallback(async (
    email: string, username: string, password: string, firstName?: string, lastName?: string
  ) => {
    // Create the account only — do NOT log the user in. They must log in
    // afterwards with their new credentials.
    await authApi.register(email, username, password, firstName, lastName);
  }, []);

  const completeOnboarding = useCallback(async (data: OnboardingInput) => {
    await authApi.onboarding(data);
    if (user) {
      localStorage.setItem(onboardedKey(user.id), '1');
      savePrefs(user.id, data);
    }
    setUser((prev) =>
      prev
        ? {
            ...prev,
            onboardingCompleted: true,
            condition: data.condition ?? prev.condition,
            trackedFactors: data.trackedFactors ?? prev.trackedFactors,
            knownTriggers: data.knownTriggers ?? prev.knownTriggers,
          }
        : prev
    );
  }, [user]);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    resetAnalytics();
  }, []);

  const needsOnboarding =
    !!user &&
    !user.onboardingCompleted &&
    localStorage.getItem(onboardedKey(user.id)) !== '1';

  return (
    <AuthContext.Provider
      value={{ user, isLoading, needsOnboarding, login, register, completeOnboarding, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
