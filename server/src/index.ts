import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/error';

import { authRouter } from './routes/auth.routes';
import { symptomsRouter } from './routes/symptoms.routes';
import { medicationsRouter } from './routes/medications.routes';
import { checkInsRouter } from './routes/checkins.routes';
import { dietRouter } from './routes/diet.routes';
import { flaresRouter } from './routes/flares.routes';
import { medicalRecordsRouter } from './routes/medical-records.routes';
import { communityRouter } from './routes/community.routes';
import { insightsRouter } from './routes/insights.routes';
import { calendarRouter } from './routes/calendar.routes';

const app = express();

app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

// Health check
app.get('/api/health', (_req, res) =>
  res.json({ ok: true, service: 'flaire-server', timestamp: new Date().toISOString() })
);

// API routes
app.use('/api/auth', authRouter);
app.use('/api/symptoms', symptomsRouter);
app.use('/api/medications', medicationsRouter);
app.use('/api/checkins', checkInsRouter);
app.use('/api/diet', dietRouter);
app.use('/api/flares', flaresRouter);
app.use('/api/medical-records', medicalRecordsRouter);
app.use('/api/community', communityRouter);
app.use('/api/insights', insightsRouter);
app.use('/api/calendar', calendarRouter);

// 404
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// Errors
app.use(errorHandler);

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`[flaire] API listening on http://localhost:${env.port}`);
});
