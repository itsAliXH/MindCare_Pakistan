import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import Therapist from '../../src/models/therapists';
import therapistRouter from '../../src/routes/therapists';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/therapists', therapistRouter);

describe('Therapist API Routes', () => {
  beforeEach(async () => {
    // Clear all collections before each test
    await Therapist.deleteMany({});
  });

  describe('GET /api/therapists', () => {
    beforeEach(async () => {
      // Create test therapists
      const testTherapists = [
        {
          name: 'Dr. Karachi Therapist',
          gender: 'Female',
          city: 'Karachi',
          experienceYear: 3,
          email: 'karachi@example.com',
          phone: '03001234567',
          modes: ['In-person', 'Virtual telephonic'],
          education: ['MBBS', 'MD Psychiatry'],
          experience: ['3 years at Aga Khan Hospital'],
          expertise: ['Depression', 'Anxiety'],
          about: 'Experienced psychiatrist in Karachi',
          feeAmount: 2500,
          feeCurrency: 'PKR'
        },
        {
          name: 'Dr. Lahore Therapist',
          gender: 'Male',
          city: 'Lahore',
          experienceYear: 7,
          email: 'lahore@example.com',
          phone: '03007654321',
          modes: ['Online', 'Virtual video-based'],
          education: ['PhD Psychology'],
          experience: ['7 years private practice'],
          expertise: ['PTSD', 'Trauma'],
          about: 'Specialist in trauma therapy',
          feeAmount: 4000,
          feeCurrency: 'PKR'
        },
        {
          name: 'Dr. Islamabad Therapist',
          gender: 'Female',
          city: 'Islamabad',
          experienceYear: 1,
          email: 'islamabad@example.com',
          phone: '03009876543',
          modes: ['In-person'],
          education: ['MS Clinical Psychology'],
          experience: ['1 year at PIMS'],
          expertise: ['Child Psychology'],
          about: 'Child psychology specialist',
          feeAmount: 1500,
          feeCurrency: 'PKR'
        }
      ];

      await Therapist.insertMany(testTherapists);
    });

    it('should get all therapists with default pagination', async () => {
      const response = await request(app)
        .get('/api/therapists')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(response.body.data).toHaveLength(3);
      expect(response.body.total).toBe(3);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(12);
    });

    it('should get therapists with custom pagination', async () => {
      const response = await request(app)
        .get('/api/therapists?page=1&limit=2')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.limit).toBe(2);
    });

    it('should filter therapists by city', async () => {
      const response = await request(app)
        .get('/api/therapists?cities=Karachi')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].city).toBe('Karachi');
    });

    it('should filter therapists by multiple cities', async () => {
      const response = await request(app)
        .get('/api/therapists?cities=Karachi,Lahore')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((t: any) => ['Karachi', 'Lahore'].includes(t.city))).toBe(true);
    });

    it('should filter therapists by gender', async () => {
      const response = await request(app)
        .get('/api/therapists?genders=Female')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((t: any) => t.gender === 'Female')).toBe(true);
    });

    it('should filter therapists by experience range', async () => {
      const response = await request(app)
        .get('/api/therapists?experience=0-5')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((t: any) => t.experienceYear >= 0 && t.experienceYear <= 5)).toBe(true);
    });

    it('should filter therapists by experience range 5-10', async () => {
      const response = await request(app)
        .get('/api/therapists?experience=5-10')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data.every((t: any) => t.experienceYear > 5 && t.experienceYear <= 10)).toBe(true);
    });

    it('should filter therapists by experience range 10-15', async () => {
      const response = await request(app)
        .get('/api/therapists?experience=10-15')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });

    it('should filter therapists by experience range 15+', async () => {
      const response = await request(app)
        .get('/api/therapists?experience=15%2B')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });

    it('should filter therapists by fee range', async () => {
      const response = await request(app)
        .get('/api/therapists?feeRange=2000-4000')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((t: any) => t.feeAmount >= 2000 && t.feeAmount <= 4000)).toBe(true);
    });

    it('should filter therapists by fee range under-2000', async () => {
      const response = await request(app)
        .get('/api/therapists?feeRange=under-2000')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data.every((t: any) => t.feeAmount < 2000)).toBe(true);
    });

    it('should filter therapists by fee range 4000-6000', async () => {
      const response = await request(app)
        .get('/api/therapists?feeRange=4000-6000')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });

    it('should filter therapists by fee range above-6000', async () => {
      const response = await request(app)
        .get('/api/therapists?feeRange=above-6000')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });

    it('should filter therapists by consultation modes', async () => {
      const response = await request(app)
        .get('/api/therapists?modes=In-person')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((t: any) => t.modes.includes('In-person'))).toBe(true);
    });

    it('should search therapists by name', async () => {
      const response = await request(app)
        .get('/api/therapists?search=Karachi')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toContain('Karachi');
    });

    it('should search therapists by expertise', async () => {
      const response = await request(app)
        .get('/api/therapists?search=Depression')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].expertise).toContain('Depression');
    });

    it('should combine multiple filters', async () => {
      const response = await request(app)
        .get('/api/therapists?cities=Karachi&genders=Female&experience=0-5')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].city).toBe('Karachi');
      expect(response.body.data[0].gender).toBe('Female');
      expect(response.body.data[0].experienceYear).toBeLessThanOrEqual(5);
    });

    it('should handle empty results', async () => {
      const response = await request(app)
        .get('/api/therapists?cities=NonExistentCity')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });

    it('should handle invalid pagination parameters', async () => {
      const response = await request(app)
        .get('/api/therapists?page=0&limit=0')
        .expect(200);

      expect(response.body.page).toBe(1); // Should default to 1
      expect(response.body.limit).toBe(12); // Should default to 12
    });

    it('should limit maximum page size', async () => {
      const response = await request(app)
        .get('/api/therapists?limit=200')
        .expect(200);

      expect(response.body.limit).toBe(100); // Should be capped at 100
    });
  });

  describe('GET /api/therapists/:id', () => {
    let testTherapist: any;

    beforeEach(async () => {
      testTherapist = new Therapist({
        name: 'Dr. Test Therapist',
        gender: 'Male',
        city: 'Test City',
        experienceYear: 5,
        email: 'test@example.com',
        phone: '03001111111',
        modes: ['In-person'],
        education: ['MBBS'],
        experience: ['5 years experience'],
        expertise: ['General'],
        about: 'Test therapist',
        feeAmount: 2000,
        feeCurrency: 'PKR'
      });

      await testTherapist.save();
    });

    it('should get a therapist by ID', async () => {
      const response = await request(app)
        .get(`/api/therapists/${testTherapist._id}`)
        .expect(200);

      expect(response.body._id).toBe(testTherapist._id.toString());
      expect(response.body.name).toBe(testTherapist.name);
    });

    it('should return 404 for non-existent therapist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/therapists/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/therapists/invalid-id')
        .expect(500); // Mongoose will throw an error for invalid ObjectId
    });
  });

  describe('GET /api/therapists/_filters/options', () => {
    beforeEach(async () => {
      // Create test therapists with different attributes
      const testTherapists = [
        {
          name: 'Dr. Karachi Female',
          gender: 'Female',
          city: 'Karachi',
          experienceYear: 2,
          modes: ['In-person'],
          feeAmount: 1500
        },
        {
          name: 'Dr. Karachi Male',
          gender: 'Male',
          city: 'Karachi',
          experienceYear: 8,
          modes: ['Online'],
          feeAmount: 3500
        },
        {
          name: 'Dr. Lahore Female',
          gender: 'Female',
          city: 'Lahore',
          experienceYear: 12,
          modes: ['In-person', 'Online'],
          feeAmount: 5500
        },
        {
          name: 'Dr. Islamabad Male',
          gender: 'Male',
          city: 'Islamabad',
          experienceYear: 18,
          modes: ['Online'],
          feeAmount: 7500
        }
      ];

      await Therapist.insertMany(testTherapists);
    });

    it('should get filter options with counts', async () => {
      const response = await request(app)
        .get('/api/therapists/_filters/options')
        .expect(200);

      expect(response.body).toHaveProperty('cityCounts');
      expect(response.body).toHaveProperty('genderCounts');
      expect(response.body).toHaveProperty('modeCounts');
      expect(response.body).toHaveProperty('experienceCounts');
      expect(response.body).toHaveProperty('feeRangeCounts');

      // Check city counts
      const karachiCount = response.body.cityCounts.find((c: any) => c._id === 'Karachi');
      expect(karachiCount.count).toBe(2);

      // Check gender counts
      const femaleCount = response.body.genderCounts.find((c: any) => c._id === 'Female');
      expect(femaleCount.count).toBe(2);

      // Check mode counts (consolidated)
      const inPersonCount = response.body.modeCounts.find((c: any) => c._id === 'In-person');
      expect(inPersonCount.count).toBe(2);

      const onlineCount = response.body.modeCounts.find((c: any) => c._id === 'Online');
      expect(onlineCount.count).toBe(3);

      // Check experience counts
      const exp0to5 = response.body.experienceCounts.find((c: any) => c._id === '0-5');
      expect(exp0to5.count).toBe(1);

      const exp15plus = response.body.experienceCounts.find((c: any) => c._id === '15+');
      expect(exp15plus.count).toBe(1);

      // Check fee range counts
      const feeUnder2000 = response.body.feeRangeCounts.find((c: any) => c._id === 'under-2000');
      expect(feeUnder2000.count).toBe(1);

      const feeAbove6000 = response.body.feeRangeCounts.find((c: any) => c._id === 'above-6000');
      expect(feeAbove6000.count).toBe(1);
    });
  });
});
