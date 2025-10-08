import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Home } from './home';
import { TherapistService } from '../../core/services/therapist.service';
import { Therapist } from '../../core/models/therapist.model';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let therapistService: jest.Mocked<TherapistService>;

  const mockTherapists: Therapist[] = [
    {
      _id: '1',
      name: 'Dr. Test Therapist 1',
      gender: 'Male',
      city: 'Karachi',
      experienceYear: 5,
      email: 'test1@example.com',
      phone: '03001234567',
      modes: ['In-person'],
      education: ['MBBS'],
      experience: ['5 years experience'],
      expertise: ['General'],
      about: 'Test therapist 1',
      feeAmount: 2000,
      feeCurrency: 'PKR'
    },
    {
      _id: '2',
      name: 'Dr. Test Therapist 2',
      gender: 'Female',
      city: 'Lahore',
      experienceYear: 3,
      email: 'test2@example.com',
      phone: '03007654321',
      modes: ['Online'],
      education: ['MS Psychology'],
      experience: ['3 years experience'],
      expertise: ['Anxiety'],
      about: 'Test therapist 2',
      feeAmount: 3000,
      feeCurrency: 'PKR'
    }
  ];

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
      { _id: '5-10', count: 5 }
    ],
    feeRangeCounts: [
      { _id: 'under-2000', count: 3 },
      { _id: '2000-4000', count: 7 }
    ]
  };

  beforeEach(async () => {
    const therapistServiceSpy = {
      getTherapists: jest.fn(),
      getFilterOptions: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        Home,
        HttpClientTestingModule,
        RouterTestingModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: TherapistService, useValue: therapistServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    therapistService = TestBed.inject(TherapistService) as jest.Mocked<TherapistService>;
  });

  beforeEach(() => {
    therapistService.getTherapists.mockReturnValue(of({
      data: mockTherapists,
      total: 2
    }));
    therapistService.getFilterOptions.mockReturnValue(of(mockFilterOptions));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize component and load data', () => {
      jest.spyOn(component, 'checkScreen');
      jest.spyOn(component, 'setupSearch');
      jest.spyOn(component, 'loadFilters');
      jest.spyOn(component, 'setupFiltering');
      jest.spyOn(component, 'loadTherapists');

      component.ngOnInit();

      expect(component.checkScreen).toHaveBeenCalled();
      expect(component.setupSearch).toHaveBeenCalled();
      expect(component.loadFilters).toHaveBeenCalled();
      expect(component.setupFiltering).toHaveBeenCalled();
      expect(component.loadTherapists).toHaveBeenCalled();
    });
  });

  describe('loadTherapists', () => {
    it('should load therapists successfully', async () => {
      await component.loadTherapists();

      expect(therapistService.getTherapists).toHaveBeenCalledWith({}, 1, 18);
      expect(component.therapists).toEqual(mockTherapists);
      expect(component.total).toBe(2);
      expect(component.loading).toBe(false);
      expect(component.error).toBeNull();
    });

    it('should load therapists with filters', async () => {
      component.filters = { cities: ['Karachi'], genders: ['Male'] };
      component.searchQuery = 'test';

      await component.loadTherapists();

      expect(therapistService.getTherapists).toHaveBeenCalledWith({
        cities: ['Karachi'],
        genders: ['Male'],
        search: 'test'
      }, 1, 18);
    });

    it('should reset pagination when resetPagination is true', async () => {
      component.page = 3;
      component.therapists = [mockTherapists[0]];

      await component.loadTherapists(true);

      expect(component.page).toBe(1);
      expect(component.therapists).toEqual(mockTherapists);
    });

    it('should handle loading state', async () => {
      const loadPromise = component.loadTherapists();
      expect(component.loading).toBe(true);

      await loadPromise;
      expect(component.loading).toBe(false);
    });

    it('should handle errors', async () => {
      therapistService.getTherapists.mockReturnValue(throwError(() => new Error('API Error')));

      await component.loadTherapists();

      expect(component.error).toBe('Failed to load therapists. Please try again.');
      expect(component.therapists).toEqual([]);
      expect(component.total).toBe(0);
      expect(component.loading).toBe(false);
    });
  });

  describe('loadFilters', () => {
    it('should load filter options successfully', async () => {
      await component.loadFilters();

      expect(therapistService.getFilterOptions).toHaveBeenCalled();
      expect(component.options).toEqual(mockFilterOptions);
    });

    it('should handle filter loading errors', async () => {
      therapistService.getFilterOptions.mockReturnValue(throwError(() => new Error('API Error')));

      await component.loadFilters();

      expect(component.options).toEqual({ cities: [], feesRanges: [] });
    });
  });

  describe('onFiltersChange', () => {
    it('should update filters and trigger filter subject', () => {
      jest.spyOn(component.filter$, 'next');
      const newFilters = { cities: ['Karachi'], genders: ['Female'] };

      component.onFiltersChange(newFilters);

      expect(component.filters).toEqual(newFilters);
      expect(component.filter$.next).toHaveBeenCalledWith(newFilters);
    });
  });

  describe('updateFilterCount', () => {
    it('should count active filters correctly', () => {
      component.filters = {
        cities: ['Karachi', 'Lahore'],
        genders: ['Female'],
        modes: ['In-person'],
        experience: '0-5',
        feeRange: '2000-4000',
        search: 'test'
      };

      component.updateFilterCount();

      expect(component.activeFilterCount).toBe(6);
    });

    it('should handle empty filters', () => {
      component.filters = {};
      component.updateFilterCount();
      expect(component.activeFilterCount).toBe(0);
    });

    it('should handle null and undefined filter values', () => {
      component.filters = {
        cities: null,
        genders: undefined,
        modes: [],
        experience: '',
        feeRange: null,
        search: ''
      };

      component.updateFilterCount();
      expect(component.activeFilterCount).toBe(0);
    });
  });

  describe('clearAllFilters', () => {
    it('should clear all filters and search', () => {
      jest.spyOn(component, 'clearSearch');
      jest.spyOn(component.filter$, 'next');
      
      component.filters = { cities: ['Karachi'], genders: ['Female'] };
      component.clearAllFilters();

      expect(component.filters).toEqual({});
      expect(component.filter$.next).toHaveBeenCalledWith({});
      expect(component.clearSearch).toHaveBeenCalled();
    });
  });

  describe('search functionality', () => {
    it('should setup search with debouncing', (done) => {
      component.setupSearch();
      component.searchInput.setValue('test search');

      setTimeout(() => {
        expect(component.searchQuery).toBe('test search');
        done();
      }, 350);
    });

    it('should clear search', () => {
      component.searchInput.setValue('test search');
      component.searchQuery = 'test search';

      component.clearSearch();

      expect(component.searchInput.value).toBe('');
      expect(component.searchQuery).toBe('');
    });
  });

  describe('pagination', () => {
    beforeEach(() => {
      component.total = 50;
      component.pageSize = 10;
    });

    it('should calculate total pages correctly', () => {
      expect(component.getTotalPages()).toBe(5);
    });

    it('should get page numbers for display', () => {
      component.page = 3;
      const pageNumbers = component.getPageNumbers();
      expect(pageNumbers).toEqual([1, 2, 3, 4, 5]);
    });

    it('should get start index correctly', () => {
      component.page = 3;
      expect(component.getStartIndex()).toBe(21);
    });

    it('should get end index correctly', () => {
      component.page = 3;
      expect(component.getEndIndex()).toBe(30);
    });

    it('should navigate to page', () => {
      jest.spyOn(component, 'loadTherapists');
      jest.spyOn(component, 'scrollToTop');

      component.goToPage(2);

      expect(component.page).toBe(2);
      expect(component.loadTherapists).toHaveBeenCalled();
      expect(component.scrollToTop).toHaveBeenCalled();
    });

    it('should not navigate to invalid page', () => {
      jest.spyOn(component, 'loadTherapists');
      component.page = 1;

      component.goToPage(0);
      expect(component.page).toBe(1);
      expect(component.loadTherapists).not.toHaveBeenCalled();

      component.goToPage(10);
      expect(component.page).toBe(1);
      expect(component.loadTherapists).not.toHaveBeenCalled();
    });
  });

  describe('mobile functionality', () => {
    it('should check screen size', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      component.checkScreen();
      expect(component.isMobile).toBe(true);

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1000,
      });
      component.checkScreen();
      expect(component.isMobile).toBe(false);
    });

    it('should toggle mobile menu', () => {
      component.isMobileMenuOpen = false;
      component.onMobileMenuToggle();
      expect(component.isMobileMenuOpen).toBe(true);

      component.onMobileMenuToggle();
      expect(component.isMobileMenuOpen).toBe(false);
    });

    it('should close mobile menu on backdrop click', () => {
      component.isMobileMenuOpen = true;
      component.onBackdropClick();
      expect(component.isMobileMenuOpen).toBe(false);
    });
  });

  describe('popup functionality', () => {
    it('should open therapist detail popup', () => {
      const therapist = mockTherapists[0];
      component.onViewTherapistDetails(therapist);

      expect(component.selectedTherapist).toBe(therapist);
      expect(component.isPopupOpen).toBe(true);
    });

    it('should close therapist detail popup', () => {
      component.selectedTherapist = mockTherapists[0];
      component.isPopupOpen = true;

      component.onClosePopup();

      expect(component.selectedTherapist).toBeNull();
      expect(component.isPopupOpen).toBe(false);
    });
  });

  describe('scrollToTop', () => {
    it('should scroll to top', () => {
      jest.spyOn(window, 'scrollTo');
      component.scrollToTop();
      expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });
  });

  describe('template rendering', () => {
    it('should render loading state', () => {
      component.loading = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const loadingElement = compiled.querySelector('.loading-state');
      expect(loadingElement).toBeTruthy();
    });

    it('should render error state', () => {
      component.error = 'Test error';
      component.loading = false;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const errorElement = compiled.querySelector('.error-state');
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent).toContain('Test error');
    });

    it('should render therapist cards', () => {
      component.therapists = mockTherapists;
      component.loading = false;
      component.error = null;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const therapistCards = compiled.querySelectorAll('app-therapist-card');
      expect(therapistCards.length).toBe(2);
    });

    it('should render no results state', () => {
      component.therapists = [];
      component.loading = false;
      component.error = null;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const noResultsElement = compiled.querySelector('.no-results');
      expect(noResultsElement).toBeTruthy();
    });

    it('should render filter count when filters are active', () => {
      component.activeFilterCount = 3;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const filterCountElement = compiled.querySelector('.filter-count');
      expect(filterCountElement).toBeTruthy();
      expect(filterCountElement.textContent).toContain('3 filters active');
    });
  });
});