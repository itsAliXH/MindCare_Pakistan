export interface Therapist {
    _id?: string; // MongoDB ID from backend
    id?: string; 
    name: string;
    gender?: 'Male' | 'Female' | string;
    city?: string;
    experienceYear?: number;
    experience_years?: number; 
    email?: string;
    phone?: string;
    modes?: string[]; // e.g. ['Online','In-person']
    education?: string | string[];
    experience?: string | string[];
    expertise?: string[];
    about?: string;
    feeAmount?: number;
    fees?: number;
    rating?: number;
    feeCurrency?: string;
    profileUrl?: string; 
    feesRaw?: string; 
    createdAt?: string;
    __v?: number;
  }
  