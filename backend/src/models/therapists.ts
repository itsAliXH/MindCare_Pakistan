// backend/src/models/Therapist.ts
import { Schema, model } from 'mongoose';

const TherapistSchema = new Schema({
  name: { type: String, required: true },
  profileUrl: { type: String },
  gender: { type: String },
  city: { type: String },
  experienceYear: { type: Number },
  email: { type: String },       
  emailsAll: { type: [String], default: [] }, 
  phone: { type: String },
  modes: { type: [String], default: [] },
  education: { type: [String], default: [] },
  experience: { type: [String], default: [] },
  expertise: { type: [String], default: [] },
  about: { type: String },
  feesRaw: { type: String },
  feeAmount: { type: Number }, 
  feeCurrency: { type: String },   
  createdAt: { type: Date, default: Date.now }
});

// Indexes for search & filters
TherapistSchema.index({ name: 'text', expertise: 'text', education: 'text', about: 'text' });
TherapistSchema.index({ city: 1 });
TherapistSchema.index({ gender: 1 });

export default model('Therapist', TherapistSchema);
