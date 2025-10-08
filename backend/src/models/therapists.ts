// backend/src/models/Therapist.ts
import { Schema, model } from 'mongoose';

const TherapistSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    default: ""
  },
  profileUrl: { 
    type: String,
    default: ""
  },
  gender: { 
    type: String,
    default: ""
  },
  city: { 
    type: String,
    default: ""
  },
  experienceYear: { 
    type: Number,
    default: 0
  },
  email: { 
    type: String,
    default: ""
  },
  emailsAll: { 
    type: [String], 
    default: [] 
  }, 
  phone: { 
    type: String,
    default: ""
  },
  modes: { 
    type: [String], 
    default: [] 
  },
  education: { 
    type: [String], 
    default: [] 
  },
  experience: { 
    type: [String], 
    default: [] 
  },
  expertise: { 
    type: [String], 
    default: [] 
  },
  about: { 
    type: String,
    default: ""
  },
  feesRaw: { 
    type: String,
    default: ""
  },
  feeAmount: { 
    type: Number,
    default: 0
  }, 
  feeCurrency: { 
    type: String,
    default: ""
  },   
  createdAt: { type: Date, default: Date.now }
});

// Indexes for search & filters
TherapistSchema.index({ name: 'text', expertise: 'text', education: 'text', about: 'text' });
TherapistSchema.index({ city: 1 });
TherapistSchema.index({ gender: 1 });

export default model('Therapist', TherapistSchema);
