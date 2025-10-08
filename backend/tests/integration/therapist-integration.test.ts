import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import Therapist from '../../src/models/therapists';
import therapistRouter from '../../src/routes/therapists';
import importCSV from '../../src/utils/csvImport';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/therapists', therapistRouter);

describe('Therapist Integration Tests', () => {
  describe('Complete API Workflow', () => {
    beforeEach(async () => {
      await Therapist.deleteMany({});
    });

    it('should handle complete therapist search and filter workflow', async () => {
      // Create diverse test data
      const testTherapists = [
        {
          name: 'Dr. Sarah Ahmed',
          gender: 'Female',
          city: 'Karachi',
          experienceYear: 3,
          email: 'sarah@example.com',
          phone: '03001234567',
          modes: ['In-person', 'Virtual telephonic'],
          education: ['MBBS', 'MD Psychiatry'],
          experience: ['3 years at Aga Khan Hospital'],
          expertise: ['Depression', 'Anxiety', 'PTSD'],
          about: 'Experienced psychiatrist specializing in mood disorders and trauma',
          feeAmount: 2500,
          feeCurrency: 'PKR'
        },
        {
          name: 'Dr. Ali Khan',
          gender: 'Male',
          city: 'Lahore',
          experienceYear: 8,
          email: 'ali@example.com',
          phone: '03007654321',
          modes: ['Online', 'Virtual video-based'],
          education: ['PhD Psychology', 'Diploma in CBT'],
          experience: ['8 years private practice', '2 years at Mayo Hospital'],
          expertise: ['Cognitive Behavioral Therapy', 'Anxiety', 'OCD'],
          about: 'Cognitive behavioral therapy specialist with extensive experience',
          feeAmount: 4000,
          feeCurrency: 'PKR'
        },
        {
          name: 'Dr. Fatima Sheikh',
          gender: 'Female',
          city: 'Islamabad',
          experienceYear: 1,
          email: 'fatima@example.com',
          phone: '03009876543',
          modes: ['In-person'],
          education: ['MS Clinical Psychology'],
          experience: ['1 year at PIMS'],
          expertise: ['Child Psychology', 'Developmental Disorders'],
          about: 'Child psychology specialist focusing on developmental issues',
          feeAmount: 1500,
          feeCurrency: 'PKR'
        },
        {
          name: 'Dr. Hassan Raza',
          gender: 'Male',
          city: 'Karachi',
          experienceYear: 15,
          email: 'hassan@example.com',
          phone: '03005555555',
          modes: ['In-person', 'Online'],
          education: ['MBBS', 'MD Psychiatry', 'Diploma in Addiction Medicine'],
          experience: ['15 years at Jinnah Hospital', '5 years private practice'],
          expertise: ['Addiction Medicine', 'Substance Abuse', 'Family Therapy'],
          about: 'Senior psychiatrist specializing in addiction and family therapy',
          feeAmount: 6000,
          feeCurrency: 'PKR'
        }
      ];

      await Therapist.insertMany(testTherapists);

      // Test 1: Get all therapists
      let response = await request(app)
        .get('/api/therapists')
        .expect(200);

      expect(response.body.data).toHaveLength(4);
      expect(response.body.total).toBe(4);

      // Test 2: Filter by city
      response = await request(app)
        .get('/api/therapists?cities=Karachi')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((t: any) => t.city === 'Karachi')).toBe(true);

      // Test 3: Filter by gender
      response = await request(app)
        .get('/api/therapists?genders=Female')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((t: any) => t.gender === 'Female')).toBe(true);

      // Test 4: Filter by experience range
      response = await request(app)
        .get('/api/therapists?experience=0-5')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((t: any) => t.experienceYear >= 0 && t.experienceYear <= 5)).toBe(true);

      // Test 5: Filter by fee range
      response = await request(app)
        .get('/api/therapists?feeRange=2000-4000')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((t: any) => t.feeAmount >= 2000 && t.feeAmount <= 4000)).toBe(true);

      // Test 6: Filter by consultation mode
      response = await request(app)
        .get('/api/therapists?modes=Online')
        .expect(200);

      expect(response.body.data).toHaveLength(3);
      // Check that all results have at least one online-related mode
      expect(response.body.data.every((t: any) => 
        t.modes.some((mode: string) => 
          mode.toLowerCase().includes('online') || 
          mode.toLowerCase().includes('virtual') ||
          mode === 'Online'
        )
      )).toBe(true);

      // Test 7: Search by name
      response = await request(app)
        .get('/api/therapists?search=Sarah')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toContain('Sarah');

      // Test 8: Search by expertise
      response = await request(app)
        .get('/api/therapists?search=Anxiety')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((t: any) => t.expertise.includes('Anxiety'))).toBe(true);

      // Test 9: Search by education
      response = await request(app)
        .get('/api/therapists?search=PhD')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].education).toContain('PhD Psychology');

      // Test 10: Search by about field
      response = await request(app)
        .get('/api/therapists?search=therapy')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.some((t: any) => t.about.toLowerCase().includes('therapy'))).toBe(true);

      // Test 11: Combine multiple filters
      response = await request(app)
        .get('/api/therapists?cities=Karachi&genders=Female&experience=0-5')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].city).toBe('Karachi');
      expect(response.body.data[0].gender).toBe('Female');
      expect(response.body.data[0].experienceYear).toBeLessThanOrEqual(5);

      // Test 12: Complex search with filters
      response = await request(app)
        .get('/api/therapists?search=psychiatry&cities=Karachi&modes=In-person')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.every((t: any) => 
        t.city === 'Karachi' && 
        t.modes.includes('In-person') &&
        (t.education.some((edu: string) => edu.toLowerCase().includes('psychiatry')) ||
         t.about.toLowerCase().includes('psychiatry'))
      )).toBe(true);

      // Test 13: Pagination with filters
      response = await request(app)
        .get('/api/therapists?cities=Karachi&page=1&limit=1')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.total).toBe(2);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(1);

      // Test 14: Get individual therapist
      const therapist = response.body.data[0];
      const individualResponse = await request(app)
        .get(`/api/therapists/${therapist._id}`)
        .expect(200);

      expect(individualResponse.body._id).toBe(therapist._id);
      expect(individualResponse.body.name).toBe(therapist.name);

      // Test 15: Get filter options
      const filterResponse = await request(app)
        .get('/api/therapists/_filters/options')
        .expect(200);

      expect(filterResponse.body).toHaveProperty('cityCounts');
      expect(filterResponse.body).toHaveProperty('genderCounts');
      expect(filterResponse.body).toHaveProperty('modeCounts');
      expect(filterResponse.body).toHaveProperty('experienceCounts');
      expect(filterResponse.body).toHaveProperty('feeRangeCounts');

      // Verify counts match our test data
      const karachiCount = filterResponse.body.cityCounts.find((c: any) => c._id === 'Karachi');
      expect(karachiCount.count).toBe(2);

      const femaleCount = filterResponse.body.genderCounts.find((c: any) => c._id === 'Female');
      expect(femaleCount.count).toBe(2);

      const onlineCount = filterResponse.body.modeCounts.find((c: any) => c._id === 'Online');
      expect(onlineCount.count).toBe(3);
    });

    it('should handle edge cases and error scenarios', async () => {
      // Test with no data
      let response = await request(app)
        .get('/api/therapists')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.total).toBe(0);

      // Test with invalid filters
      response = await request(app)
        .get('/api/therapists?cities=NonExistentCity')
        .expect(200);

      expect(response.body.data).toHaveLength(0);

      // Test with invalid experience range
      response = await request(app)
        .get('/api/therapists?experience=invalid')
        .expect(200);

      expect(response.body.data).toHaveLength(0);

      // Test with invalid fee range
      response = await request(app)
        .get('/api/therapists?feeRange=invalid')
        .expect(200);

      expect(response.body.data).toHaveLength(0);

      // Test with very long search query
      const longSearch = 'a'.repeat(1000);
      response = await request(app)
        .get(`/api/therapists?search=${longSearch}`)
        .expect(200);

      expect(response.body.data).toHaveLength(0);

      // Test with special characters in search
      response = await request(app)
        .get('/api/therapists?search=!@#$%^&*()')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });

    it('should handle performance with large datasets', async () => {
      // Create a larger dataset for performance testing
      const largeDataset = [];
      for (let i = 0; i < 100; i++) {
        largeDataset.push({
          name: `Dr. Therapist ${i}`,
          gender: i % 2 === 0 ? 'Male' : 'Female',
          city: ['Karachi', 'Lahore', 'Islamabad'][i % 3],
          experienceYear: Math.floor(Math.random() * 20) + 1,
          email: `therapist${i}@example.com`,
          phone: `0300${i.toString().padStart(7, '0')}`,
          modes: i % 2 === 0 ? ['In-person'] : ['Online'],
          education: [`Education ${i}`],
          experience: [`Experience ${i}`],
          expertise: [`Expertise ${i}`],
          about: `About therapist ${i}`,
          feeAmount: Math.floor(Math.random() * 5000) + 1000,
          feeCurrency: 'PKR'
        });
      }

      await Therapist.insertMany(largeDataset);

      // Test pagination performance
      const startTime = Date.now();
      const response = await request(app)
        .get('/api/therapists?page=1&limit=20')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.data).toHaveLength(20);
      expect(response.body.total).toBe(100);
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second

      // Test filtering performance
      const filterStartTime = Date.now();
      const filterResponse = await request(app)
        .get('/api/therapists?cities=Karachi&genders=Female')
        .expect(200);

      const filterEndTime = Date.now();
      const filterResponseTime = filterEndTime - filterStartTime;

      expect(filterResponseTime).toBeLessThan(1000); // Should respond within 1 second

      // Test search performance
      const searchStartTime = Date.now();
      const searchResponse = await request(app)
        .get('/api/therapists?search=Therapist')
        .expect(200);

      const searchEndTime = Date.now();
      const searchResponseTime = searchEndTime - searchStartTime;

      expect(searchResponseTime).toBeLessThan(1000); // Should respond within 1 second
    });
  });
});
