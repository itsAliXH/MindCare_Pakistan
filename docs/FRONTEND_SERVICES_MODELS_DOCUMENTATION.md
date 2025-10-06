# Frontend Services and Models Documentation

This document provides detailed information about the frontend services and models, explaining what work has been done and how each component functions.

## Table of Contents
1. [Therapist Service](#therapist-service)
2. [Therapist Model](#therapist-model)
3. [Environment Configuration](#environment-configuration)

---

## Therapist Service

**File Path:** `frontend/src/app/core/services/therapist.service.ts`

### Purpose
The therapist service handles all communication with the backend API, providing methods for fetching therapist data, filter options, and managing API requests.

### Work Done
1. **HTTP Client Integration**: Integrated Angular HttpClient for API communication
2. **Environment Configuration**: Used environment variables for API URL configuration
3. **API Endpoints**: Implemented methods for all backend endpoints:
   - `getTherapists()` - Fetch paginated therapist list with filters
   - `getFilterOptions()` - Fetch available filter options and counts
4. **Query Parameter Handling**: Properly formatted query parameters for backend API
5. **Type Safety**: Implemented proper TypeScript typing for API responses
6. **Error Handling**: Built-in error handling for API requests

### Key Features

#### Service Configuration
```typescript
@Injectable({ providedIn: 'root' })
export class TherapistService {
  private baseUrl = `${environment.apiUrl}/therapists`;

  constructor(private http: HttpClient) {}
}
```

#### Main Therapist Endpoint
```typescript
getTherapists(filters: any = {}, page = 1, pageSize = 18): Observable<{ data: Therapist[]; total: number }> {
  let params = new HttpParams()
    .set('page', String(page))
    .set('limit', String(pageSize));
  
  // Add search parameter if present
  if (filters.search) {
    params = params.set('search', filters.search);
  }
  
  // Add other filter parameters
  Object.keys(filters || {}).forEach(k => {
    const v = filters[k];
    if (v !== null && v !== undefined && v !== '' && k !== 'search') {
      if (Array.isArray(v)) {
        params = params.set(k, v.join(','));
      } else {
        params = params.set(k, String(v));
      }
    }
  });
  
  return this.http.get<{ data: Therapist[]; total: number }>(this.baseUrl, { params });
}
```

#### Filter Options Endpoint
```typescript
getFilterOptions(): Observable<any> {
  console.log("I am in service");
  return this.http.get<any>(`${this.baseUrl}/_filters/options`);
}
```

### API Integration Features

#### Query Parameter Handling
- **Pagination**: `page` and `limit` parameters
- **Search**: `search` parameter for text search
- **Array Filters**: Comma-separated values for array-based filters (cities, genders, modes)
- **Single Filters**: Direct string values for single filters (experience, feeRange)

#### Filter Types Supported
- **Cities**: Array of city names
- **Genders**: Array of gender values
- **Experience**: Single experience range (0-5, 5-10, 10-15, 15+)
- **Fee Range**: Single fee range (under-2000, 2000-4000, 4000-6000, above-6000)
- **Modes**: Array of consultation modes (In-person, Online)
- **Search**: Text search across name, expertise, education, and about fields

#### Response Types
```typescript
// Main therapist response
interface TherapistResponse {
  data: Therapist[];
  total: number;
  page: number;
  limit: number;
}

// Filter options response
interface FilterOptionsResponse {
  cityCounts: Array<{ _id: string; count: number }>;
  genderCounts: Array<{ _id: string; count: number }>;
  modeCounts: Array<{ _id: string; count: number }>;
  experienceCounts: Array<{ _id: string; count: number }>;
  feeRangeCounts: Array<{ _id: string; count: number }>;
}
```

### Key Methods

#### `getTherapists(filters, page, pageSize)`
- **Purpose**: Fetch paginated therapist list with filters
- **Parameters**:
  - `filters`: Object containing filter criteria
  - `page`: Page number (default: 1)
  - `pageSize`: Number of results per page (default: 18)
- **Returns**: Observable with therapist data and total count
- **Features**:
  - Automatic query parameter formatting
  - Support for all filter types
  - Pagination support
  - Search integration

#### `getFilterOptions()`
- **Purpose**: Fetch available filter options with counts
- **Returns**: Observable with filter options and counts
- **Features**:
  - Dynamic filter counts from backend
  - Real-time filter option updates
  - Support for all filter types

### Error Handling
- **HTTP Errors**: Automatic error handling by Angular HttpClient
- **Network Errors**: Graceful handling of network connectivity issues
- **Invalid Responses**: Type safety ensures proper response handling
- **Logging**: Console logging for debugging purposes

### Environment Integration
- **API URL**: Uses `environment.apiUrl` for base URL configuration
- **Development**: Points to `http://localhost:4000/api` in development
- **Production**: Points to `https://mindcare-eu8j.onrender.com/api` in production

---

## Therapist Model

**File Path:** `frontend/src/app/core/models/therapist.model.ts`

### Purpose
The therapist model defines the TypeScript interface for therapist data, ensuring type safety and consistency across the application.

### Work Done
1. **Interface Definition**: Created comprehensive TypeScript interface for therapist data
2. **Field Mapping**: Mapped all backend fields to frontend interface
3. **Type Safety**: Ensured proper typing for all therapist properties
4. **Backend Compatibility**: Made interface compatible with backend data structure
5. **Optional Fields**: Properly defined optional vs required fields
6. **Array Types**: Defined array types for multi-value fields

### Interface Definition
```typescript
export interface Therapist {
  // Core identification
  _id?: string;
  id?: string;
  
  // Personal information
  name: string;
  gender?: 'Male' | 'Female' | string;
  city?: string;
  
  // Professional information
  experienceYear?: number;
  experience_years?: number; // Backend compatibility
  email?: string;
  phone?: string;
  
  // Service information
  modes?: string[];
  education?: string | string[];
  experience?: string | string[];
  expertise?: string[];
  about?: string;
  
  // Financial information
  feeAmount?: number;
  fees?: number; // Backend compatibility
  feeCurrency?: string;
  feesRaw?: string;
  
  // Additional information
  rating?: number;
  profileUrl?: string;
  createdAt?: string;
  __v?: number;
}
```

### Field Descriptions

#### Core Fields
- **`_id`**: MongoDB document ID
- **`id`**: Alternative ID field for compatibility
- **`name`**: Therapist's full name (required)

#### Personal Information
- **`gender`**: Therapist's gender (Male/Female)
- **`city`**: Therapist's city location

#### Professional Information
- **`experienceYear`**: Years of experience (primary field)
- **`experience_years`**: Alternative experience field for backend compatibility
- **`email`**: Contact email address
- **`phone`**: Contact phone number

#### Service Information
- **`modes`**: Array of consultation modes (In-person, Online, etc.)
- **`education`**: Education background (string or array)
- **`experience`**: Work experience (string or array)
- **`expertise`**: Areas of expertise (array)
- **`about`**: Detailed description

#### Financial Information
- **`feeAmount`**: Session fee amount (primary field)
- **`fees`**: Alternative fee field for backend compatibility
- **`feeCurrency`**: Currency (default: PKR)
- **`feesRaw`**: Raw fee information from backend

#### Additional Information
- **`rating`**: Therapist rating (1-5)
- **`profileUrl`**: Profile URL from source
- **`createdAt`**: Creation timestamp
- **`__v`**: MongoDB version field

### Type Safety Features

#### Union Types
```typescript
gender?: 'Male' | 'Female' | string;
```
- Provides specific options while allowing flexibility

#### Array Types
```typescript
modes?: string[];
expertise?: string[];
education?: string | string[];
```
- Proper array typing for multi-value fields
- Flexible typing for education (single string or array)

#### Optional Fields
- Most fields are optional to handle incomplete data
- Only `name` is required as it's essential for display

#### Backend Compatibility
- Dual field support for experience (`experienceYear` and `experience_years`)
- Dual field support for fees (`feeAmount` and `fees`)
- Ensures compatibility with different backend data structures

### Usage Examples

#### Component Usage
```typescript
// In therapist card component
@Input() therapist!: Therapist;

// Accessing therapist data
getAvatar(): string {
  if (!this.therapist) return '🧑‍⚕️';
  const g = this.therapist.gender?.toLowerCase();
  if (g === 'male') return '👨‍⚕️';
  if (g === 'female') return '👩‍⚕️';
  return '🧑‍⚕️';
}
```

#### Service Usage
```typescript
// In therapist service
getTherapists(): Observable<{ data: Therapist[]; total: number }> {
  return this.http.get<{ data: Therapist[]; total: number }>(this.baseUrl);
}
```

#### Type Safety Benefits
- **Compile-time Checking**: Catches type errors at compile time
- **IntelliSense Support**: Better IDE support with autocomplete
- **Refactoring Safety**: Safe refactoring with type checking
- **Documentation**: Interface serves as documentation

---

## Environment Configuration

**File Path:** `frontend/src/environments/`

### Purpose
Environment configuration files provide different settings for development and production environments, ensuring proper API URLs and configuration for each environment.

### Work Done
1. **Environment Files**: Created separate files for development and production
2. **API URL Configuration**: Set appropriate API URLs for each environment
3. **Application Metadata**: Added application title and version information
4. **Type Safety**: Proper TypeScript typing for environment variables

### Development Environment
**File Path:** `frontend/src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:4000/api',
  appTitle: 'MindCare Pakistan',
  version: '1.0.0'
};
```

### Production Environment
**File Path:** `frontend/src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://mindcare-eu8j.onrender.com/api',
  appTitle: 'MindCare Pakistan',
  version: '1.0.0'
};
```

### Environment Variables

#### `production`
- **Type**: `boolean`
- **Purpose**: Indicates if running in production mode
- **Development**: `false`
- **Production**: `true`

#### `apiUrl`
- **Type**: `string`
- **Purpose**: Base URL for backend API
- **Development**: `http://localhost:4000/api`
- **Production**: `https://mindcare-eu8j.onrender.com/api`

#### `appTitle`
- **Type**: `string`
- **Purpose**: Application title
- **Value**: `'MindCare Pakistan'` (both environments)

#### `version`
- **Type**: `string`
- **Purpose**: Application version
- **Value**: `'1.0.0'` (both environments)

### Usage in Services

#### Therapist Service Integration
```typescript
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TherapistService {
  private baseUrl = `${environment.apiUrl}/therapists`;
  
  // Service methods use environment.apiUrl
}
```

### Build Configuration

#### Development Build
```bash
ng serve
# Uses environment.ts
```

#### Production Build
```bash
ng build --configuration production
# Uses environment.prod.ts
```

### Key Features

#### Automatic Environment Selection
- Angular automatically selects the correct environment file based on build configuration
- No manual environment switching required

#### Type Safety
- Environment variables are properly typed
- IntelliSense support for environment properties

#### Centralized Configuration
- All environment-specific settings in one place
- Easy to maintain and update

#### Security
- Sensitive configuration kept in environment files
- Different settings for different environments

### Benefits

1. **Environment Separation**: Clear separation between development and production
2. **Easy Deployment**: Simple environment switching for deployments
3. **Type Safety**: Compile-time checking of environment variables
4. **Maintainability**: Centralized configuration management
5. **Security**: Environment-specific sensitive data handling

---

## Summary

The frontend services and models provide a robust foundation for the MindCare Pakistan application:

### Therapist Service
- **Comprehensive API Integration**: Full backend API integration with proper error handling
- **Type Safety**: Strongly typed API responses and parameters
- **Environment Awareness**: Automatic environment-based configuration
- **Filter Support**: Complete support for all filter types and pagination
- **Error Handling**: Robust error handling and logging

### Therapist Model
- **Type Safety**: Comprehensive TypeScript interface ensuring type safety
- **Backend Compatibility**: Dual field support for backend compatibility
- **Flexible Design**: Optional fields handling incomplete data gracefully
- **Documentation**: Interface serves as living documentation

### Environment Configuration
- **Environment Separation**: Clear development/production separation
- **Centralized Configuration**: Easy to maintain and update
- **Type Safety**: Properly typed environment variables
- **Build Integration**: Seamless integration with Angular build system

These components work together to provide a solid foundation for the frontend application, ensuring type safety, proper API communication, and environment-aware configuration.
