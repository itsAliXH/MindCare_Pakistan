// backend/src/utils/csvImport.ts
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import csv from 'csv-parser';
import Therapist from '../models/therapists'; 

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://forlogin:dzOOjVLoU9vfszrS@cluster0.vgl4xcu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// ---------- Utility Parsers ----------
function parseList(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[;,|\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseNumber(raw?: string): number | undefined {
  if (!raw) return undefined;
  const num = parseFloat((raw || '').replace(/[^0-9.]/g, ''));
  return isNaN(num) ? undefined : num;
}

// Parse quoted fields that contain commas, then split by semicolons
function parseQuotedSemicolonList(raw?: string): string[] {
  if (!raw) return [];
  
  // Remove surrounding quotes if present
  const cleaned = raw.replace(/^"(.*)"$/, '$1');
  
  // Split by semicolon and clean up each item
  return cleaned
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
}

// ---------- CSV Reader (Promise wrapper) ----------
async function readCSV(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const rows: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (r) => rows.push(r))
      .on('end', () => resolve(rows))
      .on('error', (err) => reject(err));
  });
}

// ---------- Main Importer ----------
async function importCSV() {
  const filePath = path.join(process.cwd(), 'data', 'therapists.csv');
  if (!fs.existsSync(filePath)) {
    console.error('❌ CSV not found at:', filePath);
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB.');

  console.log('📂 Reading CSV...');
  const rows = await readCSV(filePath);
  console.log(`Loaded ${rows.length} rows.`);

  const docs = rows.map((r) => ({
    name: r.name || 'Unknown',
    profileUrl: r.profile_url || '',
    gender: r.gender || '',
    city: r.city || '',
    experienceYear: parseNumber(r.experience_years),
    email: r.email,
    emailsAll: parseList(r.emails_all),
    phone: r.phone,
    modes: parseList(r.modes),
    education: parseQuotedSemicolonList(r.education),
    experience: parseQuotedSemicolonList(r.experience),
    expertise: parseQuotedSemicolonList(r.expertise),
    about: r.about,
    feesRaw: r.fees_raw,
    feeAmount: parseNumber(r.fee_amount),
    feeCurrency: r.fee_currency || 'PKR',
  }));

  console.log('Clearing old records...');
  await Therapist.deleteMany({});

  console.log('Inserting new documents...');
  await Therapist.insertMany(docs);
  console.log(`✅ Import complete. Inserted ${docs.length} therapists.`);

  await mongoose.disconnect();
  console.log(' Disconnected from MongoDB.');
  process.exit(0);
}

// ---------- Run if executed directly ----------
if (require.main === module) {
  importCSV().catch((err) => {
    console.error('❌ Import failed:', err);
    process.exit(1);
  });
}

export default importCSV;
