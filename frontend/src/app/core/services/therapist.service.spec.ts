import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TherapistService } from './therapist.service';
import { environment } from '../../../environments/environment';

describe('TherapistService', () => {
  let service: TherapistService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TherapistService]
    });
    service = TestBed.inject(TherapistService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTherapists', () => {
    it('should fetch therapists with default parameters', () => {
      const mockResponse = {
        data: [
          {
            _id: '1',
            name: 'Dr. Test Therapist',
            gender: 'Male',
            city: 'Karachi',
            experienceYear: 5,
            email: 'test@example.com',
            phone: '03001234567',
            modes: ['In-person'],
            education: ['MBBS'],
            experience: ['5 years experience'],
            expertise: ['General'],
            about: 'Test therapist',
            feeAmount: 2000,
            feeCurrency: 'PKR'
          }
        ],
        total: 1,
        page: 1,
        limit: 18
      };

      service.getTherapists().subscribe(response => {
        expect(response.data).toEqual(mockResponse.data);
        expect(response.total).toBe(mockResponse.total);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/therapists?page=1&limit=18`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should fetch therapists with custom parameters', () => {
      const filters = {
        cities: ['Karachi', 'Lahore'],
        genders: ['Female'],
        experience: '0-5',
        feeRange: '2000-4000',
        modes: ['In-person'],
        search: 'psychology'
      };
      const page = 2;
      const pageSize = 10;

      const mockResponse = {
        data: [],
        total: 0,
        page: 2,
        limit: 10
      };

      service.getTherapists(filters, page, pageSize).subscribe(response => {
        expect(response.data).toEqual(mockResponse.data);
        expect(response.total).toBe(mockResponse.total);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/therapists?page=2&limit=10&cities=Karachi%2CLahore&genders=Female&experience=0-5&feeRange=2000-4000&modes=In-person&search=psychology`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle empty filters', () => {
      const emptyFilters = {};

      service.getTherapists(emptyFilters).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/therapists?page=1&limit=18`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], total: 0 });
    });

    it('should handle null and undefined filter values', () => {
      const filtersWithNulls = {
        cities: null,
        genders: undefined,
        experience: '',
        feeRange: null,
        modes: [],
        search: ''
      };

      service.getTherapists(filtersWithNulls).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/therapists?page=1&limit=18`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], total: 0 });
    });

    it('should handle array filters correctly', () => {
      const arrayFilters = {
        cities: ['Karachi', 'Lahore', 'Islamabad'],
        genders: ['Male', 'Female'],
        modes: ['In-person', 'Online']
      };

      service.getTherapists(arrayFilters).subscribe();

      const req = httpMock.expectOne(
        `${environment.apiUrl}/therapists?page=1&limit=18&cities=Karachi%2CLahore%2CIslamabad&genders=Male%2CFemale&modes=In-person%2COnline`
      );
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], total: 0 });
    });
  });

  describe('getFilterOptions', () => {
    it('should fetch filter options', () => {
      const mockFilterOptions = {
        cityCounts: [
          { _id: 'Karachi', count: 10 },
          { _id: 'Lahore', count: 5 }
        ],
        genderCounts: [
          { _id: 'Male', count: 8 },
          { _id: 'Female', count: 7 }
        ],
        modeCounts: [
          { _id: 'In-person', count: 12 },
          { _id: 'Online', count: 10 }
        ],
        experienceCounts: [
          { _id: '0-5', count: 6 },
          { _id: '5-10', count: 5 },
          { _id: '10-15', count: 3 },
          { _id: '15+', count: 1 }
        ],
        feeRangeCounts: [
          { _id: 'under-2000', count: 3 },
          { _id: '2000-4000', count: 7 },
          { _id: '4000-6000', count: 4 },
          { _id: 'above-6000', count: 1 }
        ]
      };

      service.getFilterOptions().subscribe(options => {
        expect(options.cityCounts).toEqual(mockFilterOptions.cityCounts);
        expect(options.genderCounts).toEqual(mockFilterOptions.genderCounts);
        expect(options.modeCounts).toEqual(mockFilterOptions.modeCounts);
        expect(options.experienceCounts).toEqual(mockFilterOptions.experienceCounts);
        expect(options.feeRangeCounts).toEqual(mockFilterOptions.feeRangeCounts);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/therapists/_filters/options`);
      expect(req.request.method).toBe('GET');
      req.flush(mockFilterOptions);
    });
  });

  describe('error handling', () => {
    it('should handle HTTP errors in getTherapists', () => {
      service.getTherapists().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/therapists?page=1&limit=18`);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle HTTP errors in getFilterOptions', () => {
      service.getFilterOptions().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/therapists/_filters/options`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle network errors', () => {
      service.getTherapists().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.name).toBe('HttpErrorResponse');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/therapists?page=1&limit=18`);
      req.error(new ErrorEvent('Network error'));
    });
  });
});
