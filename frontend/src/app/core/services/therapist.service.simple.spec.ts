import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TherapistService } from './therapist.service';
import { environment } from '../../../environments/environment';

describe('TherapistService (Simple)', () => {
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

  it('should fetch therapists with default parameters', () => {
    const mockResponse = {
      data: [
        {
          _id: '1',
          name: 'Dr. Test Therapist',
          city: 'Karachi',
          gender: 'Female',
          experienceYear: 5,
          feeAmount: 3000,
          expertise: ['Depression', 'Anxiety']
        }
      ],
      total: 1
    };

    service.getTherapists().subscribe(response => {
      expect(response.data).toEqual(mockResponse.data);
      expect(response.total).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/therapists?page=1&limit=18`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch therapists with filters', () => {
    const filters = { cities: ['Karachi'], genders: ['Female'] };
    const mockResponse = { data: [], total: 0 };

    service.getTherapists(filters).subscribe(response => {
      expect(response.data).toEqual([]);
      expect(response.total).toBe(0);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/therapists?page=1&limit=18&cities=Karachi&genders=Female`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch filter options', () => {
    const mockResponse = {
      cityCounts: [{ _id: 'Karachi', count: 5 }],
      genderCounts: [{ _id: 'Female', count: 3 }],
      modeCounts: [{ _id: 'In-person', count: 4 }],
      experienceCounts: [{ _id: '0-5', count: 2 }],
      feeRangeCounts: [{ _id: '2000-4000', count: 3 }]
    };

    service.getFilterOptions().subscribe(response => {
      expect(response.cityCounts).toEqual(mockResponse.cityCounts);
      expect(response.genderCounts).toEqual(mockResponse.genderCounts);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/therapists/_filters/options`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
