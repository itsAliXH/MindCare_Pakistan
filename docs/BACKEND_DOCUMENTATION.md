# Backend Documentation

This document provides detailed information about each backend file, explaining what work has been done and how each component functions.

## Table of Contents
1. [app.ts - Main Express Application](#appts---main-express-application)
2. [routes/therapists.ts - API Routes](#routestherapiststs---api-routes)
3. [models/therapists.ts - Database Schema](#modelstherapiststs---database-schema)
4. [utils/csvImport.ts - Data Import Utility](#utilscsvimportts---data-import-utility)
5. [index.ts - Server Entry Point](#indexts---server-entry-point)

---

## app.ts - Main Express Application

**File Path:** `backend/src/app.ts`

### Purpose
This is the main Express.js application configuration file that sets up the server, middleware, and routes.

### Work Done
1. **Express Server Setup**: Created the main Express application instance
2. **CORS Configuration**: Configured Cross-Origin Resource Sharing to allow requests from:
   - Development frontend: `http://localhost:4200`
   - Production frontend: `https://mindcare-therapist.netlify.app`
   - Environment variable: `process.env.CORS_ORIGIN`
3. **Request Logging**: Added middleware to log all incoming requests with timestamps
4. **JSON Parsing**: Configured Express to parse JSON request bodies
5. **Route Configuration**: Set up the main API routes
6. **Health Check**: Added a health check endpoint

### Key Features
```typescript
// CORS Configuration
app.use(cors({
  origin: [
    'http://localhost:4200', // Development
    'https://mindcare-therapist.netlify.app', // Production
    process.env.CORS_ORIGIN || 'http://localhost:4200' // Environment variable
  ],
  credentials: true
}));

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`, {
    query: req.query,
    body: req.body,
    headers: req.headers
  });
  next();
});
```

### API Endpoints
- `GET /api/health` - Health check endpoint
- `GET /api/therapists/*` - All therapist-related routes

---

## routes/therapists.ts - API Routes

**File Path:** `backend/src/routes/therapists.ts`

### Purpose
This file contains all the API routes for therapist-related operations including filtering, searching, and data retrieval.

### Work Done
1. **Main Therapist Endpoint**: Created `GET /therapists` with comprehensive filtering
2. **Individual Therapist Endpoint**: Created `GET /therapists/:id` for single therapist lookup
3. **Filter Options Endpoint**: Created `GET /therapists/_filters/options` for dynamic filter counts
4. **Advanced Filtering Logic**: Implemented complex filtering for:
   - Cities (array-based filtering)
   - Gender (array-based filtering)
   - Experience ranges (0-5, 5-10, 10-15, 15+ years)
   - Fee ranges (under-2000, 2000-4000, 4000-6000, above-6000)
   - Consultation modes (consolidated In-person/Online)
5. **Search Functionality**: Implemented dual search strategy:
   - Regex search for short queries (1-2 characters)
   - MongoDB text search for longer queries (3+ characters)
6. **Pagination**: Added pagination support with configurable page size
7. **MongoDB Aggregation**: Used aggregation pipelines for efficient data processing

### Key Features

#### Filtering Logic
```typescript
// Experience filtering
if (experience) {
  switch (experience) {
    case '0-5':
      match.experienceYear = { $gte: 0, $lte: 5 };
      break;
    case '5-10':
      match.experienceYear = { $gt: 5, $lte: 10 };
      break;
    // ... more cases
  }
}

// Fee range filtering
if (feeRange) {
  switch (feeRange) {
    case 'under-2000':
      match.feeAmount = { $lt: 2000 };
      break;
    case '2000-4000':
      match.feeAmount = { $gte: 2000, $lte: 4000 };
      break;
    // ... more cases
  }
}
```

#### Search Strategy
```typescript
// Dual search approach
if (search) {
  if (search.length < 3) {
    // Regex search for short queries
    const regex = new RegExp(search, 'i');
    pipeline.push({
      $match: {
        $or: [
          { name: regex },
          { expertise: { $in: [regex] } },
          { education: { $in: [regex] } },
          { about: regex }
        ]
      }
    });
  } else {
    // MongoDB text search for longer queries
    pipeline.push({ $match: { $text: { $search: search } } });
  }
}
```

#### Consultation Mode Consolidation
```typescript
// Consolidate fragmented mode data
if (modes.length) {
  const modeConditions: any[] = [];
  
  modes.forEach(mode => {
    if (mode === 'In-person') {
      modeConditions.push({
        modes: { 
          $in: [
            'In-person', 'In person', 'in-person', 
            'in person'
          ]
        }
      });
    } else if (mode === 'Online') {
      modeConditions.push({
        modes: { 
          $in: [
            'Virtual telephonic', 'Virtual video-based', 'Virtual telephoic',
            'Online', 'online', 'Virtual', 'virtual'
          ]
        }
      });
    }
  });
}
```

### API Endpoints
- `GET /therapists` - Get paginated therapist list with filters
- `GET /therapists/:id` - Get single therapist by ID
- `GET /therapists/_filters/options` - Get filter options with counts

---

## models/therapists.ts - Database Schema

**File Path:** `backend/src/models/therapists.ts`

### Purpose
This file defines the MongoDB schema for therapist documents using Mongoose ODM.

### Work Done
1. **Schema Definition**: Created comprehensive therapist schema with all required fields
2. **Data Types**: Defined appropriate data types for each field
3. **Indexes**: Added database indexes for efficient querying:
   - Text index for search functionality
   - Individual indexes for filtering fields
4. **Field Validation**: Added required field validation
5. **Default Values**: Set appropriate default values for optional fields

### Schema Structure
```typescript
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
```

### Database Indexes
```typescript
// Text search index
TherapistSchema.index({ name: 'text', expertise: 'text', education: 'text', about: 'text' });

// Filter indexes
TherapistSchema.index({ city: 1 });
TherapistSchema.index({ gender: 1 });
```

### Key Features
- **Text Search**: Full-text search across name, expertise, education, and about fields
- **Array Fields**: Support for multiple values in education, experience, expertise, and modes
- **Flexible Data**: Handles both structured and unstructured data from CSV import
- **Timestamps**: Automatic creation timestamp tracking

---

## utils/csvImport.ts - Data Import Utility

**File Path:** `backend/src/utils/csvImport.ts`

### Purpose
This utility handles importing therapist data from CSV files into MongoDB, with sophisticated parsing for complex data structures.

### Work Done
1. **CSV Reading**: Implemented CSV file reading using `csv-parser`
2. **Data Parsing**: Created custom parsers for different data types:
   - List parsing (comma, semicolon, pipe, newline separated)
   - Number parsing with currency symbol removal
   - Quoted field parsing for complex data
3. **Environment Configuration**: Integrated with environment variables for MongoDB connection
4. **Data Transformation**: Transformed raw CSV data into structured MongoDB documents
5. **Database Operations**: Implemented database clearing and bulk insertion
6. **Error Handling**: Added comprehensive error handling and logging

### Key Features

#### Custom Parsers
```typescript
// Parse quoted fields with semicolon separation
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

// Parse numbers with currency symbol removal
function parseNumber(raw?: string): number | undefined {
  if (!raw) return undefined;
  const num = parseFloat((raw || '').replace(/[^0-9.]/g, ''));
  return isNaN(num) ? undefined : num;
}
```

#### Data Transformation
```typescript
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
```

### Usage
```bash
# Run the import script
npm run seed
```

### Key Features
- **Complex Data Handling**: Properly parses quoted fields containing commas
- **Multiple Separators**: Handles various list separators (comma, semicolon, pipe, newline)
- **Data Validation**: Validates and cleans imported data
- **Bulk Operations**: Efficient bulk database operations
- **Environment Integration**: Uses environment variables for configuration

---

## index.ts - Server Entry Point

**File Path:** `backend/src/index.ts`

### Purpose
This is the main entry point for the backend server that handles database connection and server startup.

### Work Done
1. **Environment Configuration**: Integrated `dotenv` for environment variable loading
2. **Database Connection**: Implemented MongoDB connection with error handling
3. **Server Startup**: Configured server to start after successful database connection
4. **Error Handling**: Added comprehensive error handling for connection failures
5. **Environment Variables**: Used environment variables for configuration:
   - `MONGODB_URI` - MongoDB connection string
   - `PORT` - Server port (default: 4000)

### Key Features
```typescript
// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "default_connection_string";
const PORT = process.env.PORT || 4000;

// Database connection with error handling
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
```

### Environment Variables
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port number
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed CORS origin

### Key Features
- **Graceful Startup**: Server only starts after successful database connection
- **Error Recovery**: Proper error handling with process exit on connection failure
- **Environment Awareness**: Different behavior based on environment
- **Logging**: Comprehensive startup logging

---

## Summary

The backend implementation provides a robust, scalable API for the MindCare Pakistan therapist finder application. Key achievements include:

1. **Comprehensive Filtering**: Advanced filtering system supporting multiple criteria
2. **Efficient Search**: Dual search strategy for optimal performance
3. **Data Integrity**: Proper schema design with validation and indexing
4. **Scalability**: MongoDB aggregation pipelines for efficient data processing
5. **Environment Configuration**: Flexible configuration through environment variables
6. **Error Handling**: Comprehensive error handling and logging throughout
7. **CORS Support**: Proper cross-origin resource sharing configuration
8. **Data Import**: Sophisticated CSV import utility for initial data seeding

The backend is production-ready and deployed on Render with automatic deployments from GitHub.
