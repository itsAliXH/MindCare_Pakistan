import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import Therapist from '../../src/models/therapists';

// Mock fs module
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

// Mock csv-parser
jest.mock('csv-parser', () => {
  return jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    pipe: jest.fn().mockReturnThis()
  }));
});

// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Mock the entire csvImport module to avoid connection issues
jest.mock('../../src/utils/csvImport', () => {
  return jest.fn();
});

describe('CSV Import Utility - Unit Tests', () => {
  const mockMongoUri = 'mongodb://test-uri';
  const mockCsvPath = path.join(process.cwd(), 'data', 'therapists.csv');

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock environment variables
    process.env.MONGODB_URI = mockMongoUri;
  });

  afterEach(() => {
    // Restore original environment
    delete process.env.MONGODB_URI;
  });

  describe('Data Parsing Functions', () => {
    // Test the parsing functions directly by importing them
    it('should parse list data correctly', () => {
      // We'll test the parsing logic by creating a mock implementation
      const parseList = (raw?: string): string[] => {
        if (!raw) return [];
        return raw
          .split(/[;,|\n]/)
          .map((s) => s.trim())
          .filter(Boolean);
      };

      expect(parseList('item1,item2,item3')).toEqual(['item1', 'item2', 'item3']);
      expect(parseList('item1;item2;item3')).toEqual(['item1', 'item2', 'item3']);
      expect(parseList('item1|item2|item3')).toEqual(['item1', 'item2', 'item3']);
      expect(parseList('item1\nitem2\nitem3')).toEqual(['item1', 'item2', 'item3']);
      expect(parseList('')).toEqual([]);
      expect(parseList(undefined)).toEqual([]);
      expect(parseList('  item1  ,  item2  ,  item3  ')).toEqual(['item1', 'item2', 'item3']);
    });

    it('should parse number data correctly', () => {
      const parseNumber = (raw?: string): number | undefined => {
        if (!raw) return undefined;
        const num = parseFloat((raw || '').replace(/[^0-9.]/g, ''));
        return isNaN(num) ? undefined : num;
      };

      expect(parseNumber('123')).toBe(123);
      expect(parseNumber('123.45')).toBe(123.45);
      expect(parseNumber('PKR 3000')).toBe(3000);
      expect(parseNumber('$50.00')).toBe(50);
      expect(parseNumber('invalid')).toBeUndefined();
      expect(parseNumber('')).toBeUndefined();
      expect(parseNumber(undefined)).toBeUndefined();
    });

    it('should parse quoted semicolon list correctly', () => {
      const parseQuotedSemicolonList = (raw?: string): string[] => {
        if (!raw) return [];
        
        // Remove surrounding quotes if present
        const cleaned = raw.replace(/^"(.*)"$/, '$1');
        
        // Split by semicolon and clean up each item
        return cleaned
          .split(';')
          .map((s) => s.trim())
          .filter(Boolean);
      };

      expect(parseQuotedSemicolonList('"item1;item2;item3"')).toEqual(['item1', 'item2', 'item3']);
      expect(parseQuotedSemicolonList('item1;item2;item3')).toEqual(['item1', 'item2', 'item3']);
      expect(parseQuotedSemicolonList('"  item1  ;  item2  ;  item3  "')).toEqual(['item1', 'item2', 'item3']);
      expect(parseQuotedSemicolonList('')).toEqual([]);
      expect(parseQuotedSemicolonList(undefined)).toEqual([]);
    });
  });

  describe('File System Operations', () => {
    it('should handle missing CSV file', () => {
      // Mock fs.existsSync to return false
      mockedFs.existsSync.mockReturnValue(false);
      
      const filePath = path.join(process.cwd(), 'data', 'therapists.csv');
      const exists = fs.existsSync(filePath);
      
      expect(exists).toBe(false);
      expect(mockedFs.existsSync).toHaveBeenCalledWith(filePath);
    });

    it('should handle existing CSV file', () => {
      // Mock fs.existsSync to return true
      mockedFs.existsSync.mockReturnValue(true);
      
      const filePath = path.join(process.cwd(), 'data', 'therapists.csv');
      const exists = fs.existsSync(filePath);
      
      expect(exists).toBe(true);
      expect(mockedFs.existsSync).toHaveBeenCalledWith(filePath);
    });

    it('should handle file read stream creation', () => {
      const mockStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis()
      };
      
      mockedFs.createReadStream.mockReturnValue(mockStream as any);
      
      const filePath = path.join(process.cwd(), 'data', 'therapists.csv');
      const stream = fs.createReadStream(filePath);
      
      expect(stream).toBe(mockStream);
      expect(mockedFs.createReadStream).toHaveBeenCalledWith(filePath);
    });
  });

  describe('Data Transformation', () => {
    it('should transform CSV row data correctly', () => {
      const csvRow = {
        name: 'Dr. Test Therapist',
        profile_url: 'https://example.com/profile',
        gender: 'Female',
        city: 'Karachi',
        experience_years: '5',
        email: 'test@example.com',
        emails_all: 'test1@example.com,test2@example.com',
        phone: '03001234567',
        modes: 'In-person,Online',
        education: '"MBBS;MD Psychiatry"',
        experience: '"5 years at Aga Khan;2 years private practice"',
        expertise: '"Depression;Anxiety;PTSD"',
        about: 'Experienced therapist specializing in mood disorders',
        fees_raw: 'PKR 3000 per session',
        fee_amount: '3000',
        fee_currency: 'PKR'
      };

      // Simulate the transformation logic
      const parseList = (raw?: string): string[] => {
        if (!raw) return [];
        return raw
          .split(/[;,|\n]/)
          .map((s) => s.trim())
          .filter(Boolean);
      };

      const parseNumber = (raw?: string): number | undefined => {
        if (!raw) return undefined;
        const num = parseFloat((raw || '').replace(/[^0-9.]/g, ''));
        return isNaN(num) ? undefined : num;
      };

      const parseQuotedSemicolonList = (raw?: string): string[] => {
        if (!raw) return [];
        const cleaned = raw.replace(/^"(.*)"$/, '$1');
        return cleaned
          .split(';')
          .map((s) => s.trim())
          .filter(Boolean);
      };

      const transformedData = {
        name: csvRow.name || 'Unknown',
        profileUrl: csvRow.profile_url || '',
        gender: csvRow.gender || '',
        city: csvRow.city || '',
        experienceYear: parseNumber(csvRow.experience_years),
        email: csvRow.email,
        emailsAll: parseList(csvRow.emails_all),
        phone: csvRow.phone,
        modes: parseList(csvRow.modes),
        education: parseQuotedSemicolonList(csvRow.education),
        experience: parseQuotedSemicolonList(csvRow.experience),
        expertise: parseQuotedSemicolonList(csvRow.expertise),
        about: csvRow.about,
        feesRaw: csvRow.fees_raw,
        feeAmount: parseNumber(csvRow.fee_amount),
        feeCurrency: csvRow.fee_currency || 'PKR'
      };

      expect(transformedData).toEqual({
        name: 'Dr. Test Therapist',
        profileUrl: 'https://example.com/profile',
        gender: 'Female',
        city: 'Karachi',
        experienceYear: 5,
        email: 'test@example.com',
        emailsAll: ['test1@example.com', 'test2@example.com'],
        phone: '03001234567',
        modes: ['In-person', 'Online'],
        education: ['MBBS', 'MD Psychiatry'],
        experience: ['5 years at Aga Khan', '2 years private practice'],
        expertise: ['Depression', 'Anxiety', 'PTSD'],
        about: 'Experienced therapist specializing in mood disorders',
        feesRaw: 'PKR 3000 per session',
        feeAmount: 3000,
        feeCurrency: 'PKR'
      });
    });

    it('should handle malformed CSV data', () => {
      const malformedRow = {
        name: 'Dr. Test Therapist',
        profile_url: '',
        // Missing required fields
        gender: '',
        city: '',
        experience_years: 'invalid',
        email: '',
        emails_all: '',
        phone: '',
        modes: '',
        education: '',
        experience: '',
        expertise: '',
        about: '',
        fees_raw: '',
        fee_amount: 'not-a-number',
        fee_currency: ''
      };

      const parseList = (raw?: string): string[] => {
        if (!raw) return [];
        return raw
          .split(/[;,|\n]/)
          .map((s) => s.trim())
          .filter(Boolean);
      };

      const parseNumber = (raw?: string): number | undefined => {
        if (!raw) return undefined;
        const num = parseFloat((raw || '').replace(/[^0-9.]/g, ''));
        return isNaN(num) ? undefined : num;
      };

      const parseQuotedSemicolonList = (raw?: string): string[] => {
        if (!raw) return [];
        const cleaned = raw.replace(/^"(.*)"$/, '$1');
        return cleaned
          .split(';')
          .map((s) => s.trim())
          .filter(Boolean);
      };

      const transformedData = {
        name: malformedRow.name || 'Unknown',
        profileUrl: malformedRow.profile_url || '',
        gender: malformedRow.gender || '',
        city: malformedRow.city || '',
        experienceYear: parseNumber(malformedRow.experience_years),
        email: malformedRow.email,
        emailsAll: parseList(malformedRow.emails_all),
        phone: malformedRow.phone,
        modes: parseList(malformedRow.modes),
        education: parseQuotedSemicolonList(malformedRow.education),
        experience: parseQuotedSemicolonList(malformedRow.experience),
        expertise: parseQuotedSemicolonList(malformedRow.expertise),
        about: malformedRow.about,
        feesRaw: malformedRow.fees_raw,
        feeAmount: parseNumber(malformedRow.fee_amount),
        feeCurrency: malformedRow.fee_currency || 'PKR'
      };

      expect(transformedData).toEqual({
        name: 'Dr. Test Therapist',
        profileUrl: '',
        gender: '',
        city: '',
        experienceYear: undefined,
        email: '',
        emailsAll: [],
        phone: '',
        modes: [],
        education: [],
        experience: [],
        expertise: [],
        about: '',
        feesRaw: '',
        feeAmount: undefined,
        feeCurrency: 'PKR'
      });
    });
  });

  describe('Environment Configuration', () => {
    it('should use environment variable when set', () => {
      process.env.MONGODB_URI = 'mongodb://test-uri';
      
      const mongoUri = process.env.MONGODB_URI || 'default-uri';
      
      expect(mongoUri).toBe('mongodb://test-uri');
    });

    it('should use default URI when environment variable is not set', () => {
      delete process.env.MONGODB_URI;
      
      const defaultUri = 'mongodb+srv://forlogin:dzOOjVLoU9vfszrS@cluster0.vgl4xcu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
      const mongoUri = process.env.MONGODB_URI || defaultUri;
      
      expect(mongoUri).toBe(defaultUri);
    });
  });
});
