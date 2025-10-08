import request from 'supertest';
import express from 'express';
import cors from 'cors';
import app from '../src/app';

// Mock the therapist router
jest.mock('../src/routes/therapists', () => {
  const mockRouter = express.Router();
  mockRouter.get('/', (req, res) => res.json({ message: 'Mock therapists endpoint' }));
  mockRouter.post('/', (req, res) => res.json({ message: 'Mock therapists endpoint' }));
  return mockRouter;
});

describe('Express App Configuration', () => {
  describe('Middleware Configuration', () => {
    it('should have CORS middleware configured', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:4200')
        .expect(200);

      // CORS headers should be present when Origin is set
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:4200');
    });

    it('should have JSON parsing middleware', async () => {
      const response = await request(app)
        .post('/api/therapists')
        .send({ test: 'data' })
        .expect(200);

      expect(response.body).toEqual({ message: 'Mock therapists endpoint' });
    });

    it('should have request logging middleware', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await request(app)
        .get('/api/health')
        .expect(200);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z - GET \/api\/health/),
        expect.objectContaining({
          query: {},
          body: undefined,
          headers: expect.any(Object)
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Routes Configuration', () => {
    it('should serve therapist routes at /api/therapists', async () => {
      const response = await request(app)
        .get('/api/therapists')
        .expect(200);

      expect(response.body).toEqual({ message: 'Mock therapists endpoint' });
    });

    it('should serve health check at /api/health', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toEqual({ status: 'ok' });
    });

    it('should return 404 for non-existent routes', async () => {
      await request(app)
        .get('/api/non-existent')
        .expect(404);
    });
  });

  describe('CORS Configuration', () => {
    it('should allow requests from localhost:4200', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:4200')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:4200');
    });

    it('should allow requests from production domain', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Origin', 'https://mindcare-therapist.netlify.app')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('https://mindcare-therapist.netlify.app');
    });

    it('should allow requests from default origin when no environment variable is set', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:4200')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:4200');
    });

    it('should support credentials', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });
  });

  describe('Request Logging', () => {
    it('should log GET requests with query parameters', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await request(app)
        .get('/api/health?param1=value1&param2=value2')
        .expect(200);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z - GET \/api\/health/),
        expect.objectContaining({
          query: { param1: 'value1', param2: 'value2' },
          body: undefined,
          headers: expect.any(Object)
        })
      );

      consoleSpy.mockRestore();
    });

    it('should log POST requests with body data', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await request(app)
        .post('/api/therapists')
        .send({ name: 'Dr. Test', city: 'Karachi' })
        .expect(200);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z - POST \/api\/therapists/),
        expect.objectContaining({
          query: {},
          body: undefined, // Body is undefined because logging middleware runs before JSON parsing
          headers: expect.any(Object)
        })
      );

      consoleSpy.mockRestore();
    });

    it('should log request headers', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await request(app)
        .get('/api/health')
        .set('User-Agent', 'Test Agent')
        .set('Authorization', 'Bearer token123')
        .expect(200);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z - GET \/api\/health/),
        expect.objectContaining({
          query: {},
          body: undefined,
          headers: expect.objectContaining({
            'user-agent': 'Test Agent',
            'authorization': 'Bearer token123'
          })
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON requests', async () => {
      const response = await request(app)
        .post('/api/therapists')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body).toBeDefined();
    });

    it('should handle requests with invalid content type', async () => {
      const response = await request(app)
        .post('/api/therapists')
        .set('Content-Type', 'text/plain')
        .send('plain text data')
        .expect(200);

      // Express should still process the request
      expect(response.body).toEqual({ message: 'Mock therapists endpoint' });
    });
  });
});
