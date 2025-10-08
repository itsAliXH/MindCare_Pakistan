import mongoose from 'mongoose';
import Therapist from '../../src/models/therapists';

describe('Therapist Model', () => {
  describe('Schema Validation', () => {
    it('should create a therapist with valid data', async () => {
      const therapistData = {
        name: 'Dr. John Doe',
        gender: 'Male',
        city: 'Karachi',
        experienceYear: 5,
        email: 'john.doe@example.com',
        phone: '03001234567',
        modes: ['In-person', 'Online'],
        education: ['MBBS', 'MD Psychiatry'],
        experience: ['5 years at Aga Khan Hospital'],
        expertise: ['Depression', 'Anxiety'],
        about: 'Experienced psychiatrist specializing in mood disorders',
        feeAmount: 3000,
        feeCurrency: 'PKR'
      };

      const therapist = new Therapist(therapistData);
      const savedTherapist = await therapist.save();

      expect(savedTherapist._id).toBeDefined();
      expect(savedTherapist.name).toBe(therapistData.name);
      expect(savedTherapist.gender).toBe(therapistData.gender);
      expect(savedTherapist.city).toBe(therapistData.city);
      expect(savedTherapist.experienceYear).toBe(therapistData.experienceYear);
      expect(savedTherapist.email).toBe(therapistData.email);
      expect(savedTherapist.phone).toBe(therapistData.phone);
      expect(savedTherapist.modes).toEqual(therapistData.modes);
      expect(savedTherapist.education).toEqual(therapistData.education);
      expect(savedTherapist.experience).toEqual(therapistData.experience);
      expect(savedTherapist.expertise).toEqual(therapistData.expertise);
      expect(savedTherapist.about).toBe(therapistData.about);
      expect(savedTherapist.feeAmount).toBe(therapistData.feeAmount);
      expect(savedTherapist.feeCurrency).toBe(therapistData.feeCurrency);
      expect(savedTherapist.createdAt).toBeDefined();
    });

    it('should require name field', async () => {
      const therapistData = {
        gender: 'Female',
        city: 'Lahore'
      };

      const therapist = new Therapist(therapistData);
      
      await expect(therapist.save()).rejects.toThrow();
    });

    it('should set default values for optional fields', async () => {
      const therapistData = {
        name: 'Dr. Jane Smith'
      };

      const therapist = new Therapist(therapistData);
      const savedTherapist = await therapist.save();

      expect(savedTherapist.modes).toEqual([]);
      expect(savedTherapist.education).toEqual([]);
      expect(savedTherapist.experience).toEqual([]);
      expect(savedTherapist.expertise).toEqual([]);
      expect(savedTherapist.createdAt).toBeDefined();
    });

    it('should handle array fields correctly', async () => {
      const therapistData = {
        name: 'Dr. Array Test',
        modes: ['In-person', 'Virtual telephonic', 'Virtual video-based'],
        education: ['MBBS', 'MD', 'Diploma in Clinical Psychology'],
        experience: ['Hospital A', 'Clinic B', 'Private Practice'],
        expertise: ['Depression', 'Anxiety', 'PTSD', 'Bipolar Disorder']
      };

      const therapist = new Therapist(therapistData);
      const savedTherapist = await therapist.save();

      expect(savedTherapist.modes).toHaveLength(3);
      expect(savedTherapist.education).toHaveLength(3);
      expect(savedTherapist.experience).toHaveLength(3);
      expect(savedTherapist.expertise).toHaveLength(4);
    });
  });

  describe('Indexes', () => {
    it('should have text search index', async () => {
      const indexes = await Therapist.collection.getIndexes();
      
      // Look for text index by checking for the compound text index name
      const textIndexName = Object.keys(indexes).find(indexName => 
        indexName.includes('name_text_expertise_text_education_text_about_text')
      );
      
      expect(textIndexName).toBeDefined();
      
      // Also verify the index structure contains the expected text index fields
      if (textIndexName) {
        const textIndex = indexes[textIndexName];
        expect(Array.isArray(textIndex)).toBe(true);
        
        // Check for the presence of _fts and _ftsx fields which are characteristic of text indexes
        const fieldNames = textIndex.map(([field]) => field);
        expect(fieldNames).toContain('_fts');
        expect(fieldNames).toContain('_ftsx');
      }
    });

    it('should have city index', async () => {
      const indexes = await Therapist.collection.getIndexes();
      const cityIndex = Object.values(indexes).find(index => 
        Array.isArray(index) && index.some(([field]) => field === 'city')
      );
      
      expect(cityIndex).toBeDefined();
    });

    it('should have gender index', async () => {
      const indexes = await Therapist.collection.getIndexes();
      const genderIndex = Object.values(indexes).find(index => 
        Array.isArray(index) && index.some(([field]) => field === 'gender')
      );
      
      expect(genderIndex).toBeDefined();
    });
  });

  describe('Text Search', () => {
    beforeEach(async () => {
      // Create test therapists for search testing
      const therapists = [
        {
          name: 'Dr. Psychology Expert',
          expertise: ['Depression', 'Anxiety'],
          education: ['PhD Psychology'],
          about: 'Specializes in cognitive behavioral therapy'
        },
        {
          name: 'Dr. Medical Doctor',
          expertise: ['General Medicine'],
          education: ['MBBS', 'MD'],
          about: 'General practitioner with mental health focus'
        },
        {
          name: 'Dr. Therapy Specialist',
          expertise: ['Family Therapy', 'Marriage Counseling'],
          education: ['MS Clinical Psychology'],
          about: 'Family and marriage therapy expert'
        }
      ];

      await Therapist.insertMany(therapists);
    });

    it('should perform text search on name', async () => {
      const results = await Therapist.find({ $text: { $search: 'Psychology' } });
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.name.includes('Psychology'))).toBe(true);
    });

    it('should perform text search on expertise', async () => {
      const results = await Therapist.find({ $text: { $search: 'Depression' } });
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.expertise?.includes('Depression'))).toBe(true);
    });

    it('should perform text search on education', async () => {
      const results = await Therapist.find({ $text: { $search: 'PhD' } });
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.education?.includes('PhD Psychology'))).toBe(true);
    });

    it('should perform text search on about field', async () => {
      const results = await Therapist.find({ $text: { $search: 'therapy' } });
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.about?.toLowerCase().includes('therapy'))).toBe(true);
    });
  });
});
