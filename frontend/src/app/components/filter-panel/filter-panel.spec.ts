import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { FilterPanel } from './filter-panel';

describe('FilterPanel', () => {
  let component: FilterPanel;
  let fixture: ComponentFixture<FilterPanel>;

  const mockOptions = {
    cityCounts: [
      { _id: 'Karachi', count: 10 },
      { _id: 'Lahore', count: 5 },
      { _id: 'Islamabad', count: 3 }
    ],
    genderCounts: [
      { _id: 'Male', count: 8 },
      { _id: 'Female', count: 10 }
    ],
    modeCounts: [
      { _id: 'In-person', count: 12 },
      { _id: 'Online', count: 15 }
    ],
    experienceCounts: [
      { _id: '0-5', count: 6 },
      { _id: '5-10', count: 5 },
      { _id: '10-15', count: 3 },
      { _id: '15+', count: 4 }
    ],
    feeRangeCounts: [
      { _id: 'under-2000', count: 3 },
      { _id: '2000-4000', count: 7 },
      { _id: '4000-6000', count: 4 },
      { _id: 'above-6000', count: 4 }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterPanel, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(FilterPanel);
    component = fixture.componentInstance;
    component.options = mockOptions;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize local filters with empty values', () => {
      expect(component.localFilters.cities).toEqual([]);
      expect(component.localFilters.genders).toEqual([]);
      expect(component.localFilters.experience).toBe('');
      expect(component.localFilters.feeRange).toBe('');
      expect(component.localFilters.modes).toEqual([]);
      expect(component.localFilters.search).toBe('');
    });

    it('should set up search form control', () => {
      expect(component.search).toBeDefined();
    });
  });

  describe('ngOnChanges', () => {
    it('should update local filters when parent filters change', () => {
      const newFilters = {
        cities: ['Karachi'],
        genders: ['Female'],
        experience: '0-5',
        feeRange: '2000-4000',
        modes: ['In-person'],
        search: 'test search'
      };

      component.filters = newFilters;
      component.ngOnChanges();

      expect(component.localFilters.cities).toEqual(['Karachi']);
      expect(component.localFilters.genders).toEqual(['Female']);
      expect(component.localFilters.experience).toBe('0-5');
      expect(component.localFilters.feeRange).toBe('2000-4000');
      expect(component.localFilters.modes).toEqual(['In-person']);
      expect(component.search.value).toBe('test search');
    });

    it('should update filter options from backend data', () => {
      component.ngOnChanges();

      expect(component.cityOptions).toEqual(mockOptions.cityCounts);
      expect(component.genderOptions).toEqual(mockOptions.genderCounts);
    });

    it('should update experience options with counts', () => {
      component.ngOnChanges();

      const experienceOption = component.experienceOptions.find(exp => exp.name === '0-5');
      expect(experienceOption?.count).toBe(6);
    });

    it('should update fee range options with counts', () => {
      component.ngOnChanges();

      const feeRangeOption = component.feeRangeOptions.find(fee => fee.name === 'under-2000');
      expect(feeRangeOption?.count).toBe(3);
    });
  });

  describe('toggleArray', () => {
    it('should add value to array when not present', () => {
      component.toggleArray('cities', 'Karachi');
      expect(component.localFilters.cities).toContain('Karachi');
    });

    it('should remove value from array when present', () => {
      component.localFilters.cities = ['Karachi', 'Lahore'];
      component.toggleArray('cities', 'Karachi');
      expect(component.localFilters.cities).not.toContain('Karachi');
      expect(component.localFilters.cities).toContain('Lahore');
    });

    it('should work with genders array', () => {
      component.toggleArray('genders', 'Female');
      expect(component.localFilters.genders).toContain('Female');
    });

    it('should work with modes array', () => {
      component.toggleArray('modes', 'In-person');
      expect(component.localFilters.modes).toContain('In-person');
    });

    it('should emit change after toggling', () => {
      jest.spyOn(component, 'emitChange');
      component.toggleArray('cities', 'Karachi');
      expect(component.emitChange).toHaveBeenCalled();
    });
  });

  describe('setRadio', () => {
    it('should set experience value', () => {
      component.setRadio('experience', '5-10');
      expect(component.localFilters.experience).toBe('5-10');
    });

    it('should set fee range value', () => {
      component.setRadio('feeRange', '2000-4000');
      expect(component.localFilters.feeRange).toBe('2000-4000');
    });

    it('should emit change after setting radio', () => {
      jest.spyOn(component, 'emitChange');
      component.setRadio('experience', '0-5');
      expect(component.emitChange).toHaveBeenCalled();
    });
  });

  describe('clearAll', () => {
    it('should reset all filters to empty values', () => {
      component.localFilters = {
        cities: ['Karachi'],
        genders: ['Female'],
        experience: '0-5',
        feeRange: '2000-4000',
        modes: ['In-person'],
        search: 'test'
      };

      component.clearAll();

      expect(component.localFilters.cities).toEqual([]);
      expect(component.localFilters.genders).toEqual([]);
      expect(component.localFilters.experience).toBe('');
      expect(component.localFilters.feeRange).toBe('');
      expect(component.localFilters.modes).toEqual([]);
      expect(component.localFilters.search).toBe('');
    });

    it('should clear search form control', () => {
      component.search.setValue('test search');
      component.clearAll();
      expect(component.search.value).toBe('');
    });

    it('should emit change after clearing', () => {
      jest.spyOn(component, 'emitChange');
      component.clearAll();
      expect(component.emitChange).toHaveBeenCalled();
    });
  });

  describe('emitChange', () => {
    it('should emit filtersChange event with current local filters', () => {
      jest.spyOn(component.filtersChange, 'emit');
      component.localFilters = {
        cities: ['Karachi'],
        genders: ['Female'],
        experience: '0-5',
        feeRange: '2000-4000',
        modes: ['In-person'],
        search: 'test'
      };

      component.emitChange();

      expect(component.filtersChange.emit).toHaveBeenCalledWith({
        cities: ['Karachi'],
        genders: ['Female'],
        experience: '0-5',
        feeRange: '2000-4000',
        modes: ['In-person'],
        search: 'test'
      });
    });
  });

  describe('closeMobileMenuOption', () => {
    it('should emit closeMobileMenu event', () => {
      jest.spyOn(component.closeMobileMenu, 'emit');
      component.closeMobileMenuOption();
      expect(component.closeMobileMenu.emit).toHaveBeenCalled();
    });
  });

  describe('search functionality', () => {
    it('should update local filters search when search input changes', (done) => {
      component.search.setValue('test search');
      
      setTimeout(() => {
        expect(component.localFilters.search).toBe('test search');
        done();
      }, 350); // Wait for debounce
    });

    it('should emit change when search input changes', (done) => {
      jest.spyOn(component, 'emitChange');
      component.search.setValue('new search');
      
      setTimeout(() => {
        expect(component.emitChange).toHaveBeenCalled();
        done();
      }, 350); // Wait for debounce
    });
  });

  describe('template rendering', () => {
    it('should render city options with counts', () => {
      const compiled = fixture.nativeElement;
      const cityOptions = compiled.querySelectorAll('.option-item');
      expect(cityOptions.length).toBeGreaterThan(0);
    });

    it('should render experience options', () => {
      const compiled = fixture.nativeElement;
      const experienceInputs = compiled.querySelectorAll('input[name="experience"]');
      expect(experienceInputs.length).toBe(4); // 0-5, 5-10, 10-15, 15+
    });

    it('should render fee range options', () => {
      const compiled = fixture.nativeElement;
      const feeRangeInputs = compiled.querySelectorAll('input[name="feeRange"]');
      expect(feeRangeInputs.length).toBe(4); // under-2000, 2000-4000, 4000-6000, above-6000
    });

    it('should render consultation mode options', () => {
      const compiled = fixture.nativeElement;
      const modeInputs = compiled.querySelectorAll('input[type="checkbox"]');
      expect(modeInputs.length).toBeGreaterThan(0);
    });

    it('should show mobile close button when isMobile is true', () => {
      component.isMobile = true;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const closeButton = compiled.querySelector('.mobile-close-button');
      expect(closeButton).toBeTruthy();
    });

    it('should not show mobile close button when isMobile is false', () => {
      component.isMobile = false;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const closeButton = compiled.querySelector('.mobile-close-button');
      expect(closeButton).toBeFalsy();
    });
  });

  describe('filter state management', () => {
    it('should maintain filter state across multiple operations', () => {
      // Set some filters
      component.toggleArray('cities', 'Karachi');
      component.toggleArray('genders', 'Female');
      component.setRadio('experience', '0-5');
      
      expect(component.localFilters.cities).toContain('Karachi');
      expect(component.localFilters.genders).toContain('Female');
      expect(component.localFilters.experience).toBe('0-5');
      
      // Add more filters
      component.toggleArray('cities', 'Lahore');
      component.setRadio('feeRange', '2000-4000');
      
      expect(component.localFilters.cities).toContain('Karachi');
      expect(component.localFilters.cities).toContain('Lahore');
      expect(component.localFilters.feeRange).toBe('2000-4000');
    });

    it('should handle multiple selections in array filters', () => {
      component.toggleArray('cities', 'Karachi');
      component.toggleArray('cities', 'Lahore');
      component.toggleArray('cities', 'Islamabad');
      
      expect(component.localFilters.cities).toEqual(['Karachi', 'Lahore', 'Islamabad']);
    });
  });
});