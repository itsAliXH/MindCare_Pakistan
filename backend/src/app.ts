// backend/src/app.ts
import express from 'express';
import cors from 'cors';
import therapistRouter from './routes/therapists';

const app = express();

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
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200', // Angular dev server
  credentials: true
}));
app.use(express.json());

app.use('/api/therapists', therapistRouter);
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

export default app;
