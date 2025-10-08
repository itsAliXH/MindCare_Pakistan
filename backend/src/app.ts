// backend/src/app.ts
import express from 'express';
import cors from 'cors';
import therapistRouter from './routes/therapists';

const app = express();

// Disable ETag generation to prevent 304 responses during development
app.set('etag', false);

// Add middleware to disable caching
app.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  next();
});

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`, {
    query: req.query,
    body: req.body,
    headers: req.headers
  });
  next();
});

app.use(cors({
  origin: [
    'http://localhost:4200', // Development
    'https://mindcare-therapist.netlify.app', // Production
    process.env.CORS_ORIGIN || 'http://localhost:4200' // Environment variable
  ],
  credentials: true
}));
app.use(express.json());

app.use('/api/therapists', therapistRouter);
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

export default app;
