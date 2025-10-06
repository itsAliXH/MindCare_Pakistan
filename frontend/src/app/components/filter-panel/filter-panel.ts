import { Component, EventEmitter, Input, OnInit, Output, OnChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ReactiveFormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-filter-panel',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './filter-panel.html',
  styleUrl: './filter-panel.css'
})
export class FilterPanel implements OnInit, OnChanges {
  @Input() isMobile: boolean = false;
  @Output() closeMobileMenu = new EventEmitter<void>();

  // Dynamic Data Arrays - will be populated from backend
  cityOptions: any[] = [];
  experienceOptions = [
    { name: '0-5', label: '0-5 years' },
    { name: '5-10', label: '5-10 years' },
    { name: '10-15', label: '10-15 years' },
    { name: '15+', label: '15+ years' },
  ];
  genderOptions: any[] = [];
  feeRangeOptions = [
    { name: 'under-2000', label: 'Under Rs. 2,000' },
    { name: '2000-4000', label: 'Rs. 2,000 - 4,000' },
    { name: '4000-6000', label: 'Rs. 4,000 - 6,000' },
    { name: 'above-6000', label: 'Above Rs. 6,000' },
  ];

  consultationModeOptions = [
    { name: 'Virtual telephonic' },
    { name: 'In-person' },
    { name: 'Virtual video-based' },
  ]; 

  @Input() options: any; // { cities: [...], genders: [...], feesRanges: [...] }
  @Input() filters: any = {}; // current filters
  @Output() filtersChange = new EventEmitter<any>();

  search = new FormControl('');

  // keep a local copy to mutate easily
  localFilters = {
    cities: [] as string[],
    genders: [] as string[],
    experience: '',
    feeRange: '',
    modes: [] as string[],
    search:  '' as string | null
  };

  ngOnInit(): void {
    // seed localFilters from @Input filters
    this.localFilters = { ...this.localFilters, ...this.filters };
    this.search.setValue(this.localFilters.search || '');

    this.search.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.localFilters.search = value;
      this.emitChange();
    });
  }

  ngOnChanges() {
    // Update local filters when parent component changes them
    if (this.filters) {
      this.localFilters = { ...this.localFilters, ...this.filters };
      this.search.setValue(this.localFilters.search || '');
    }
    
    // Update filter options from backend data
    if (this.options) {
      this.cityOptions = this.options.cityCounts || [];
      this.genderOptions = this.options.genderCounts || [];
      
      // Update experience options with counts from backend
      if (this.options.experienceCounts) {
        this.experienceOptions = this.experienceOptions.map(exp => {
          const backendCount = this.options.experienceCounts.find((c: any) => c._id === exp.name);
          return { ...exp, count: backendCount?.count || 0 };
        });
      }
      
      // Update fee range options with counts from backend
      if (this.options.feeRangeCounts) {
        this.feeRangeOptions = this.feeRangeOptions.map(fee => {
          const backendCount = this.options.feeRangeCounts.find((c: any) => c._id === fee.name);
          return { ...fee, count: backendCount?.count || 0 };
        });
      }
    }
  }

  toggleArray(field: 'cities'|'genders'|'modes', value: string) {
    const arr = this.localFilters[field];
    const idx = arr.indexOf(value);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(value);
    this.emitChange();
  }

  setRadio(field: 'experience'|'feeRange', value: string) {
    this.localFilters[field] = value;
    this.emitChange();
  }

  clearAll() {
    this.localFilters = { cities: [], genders: [], experience: '', feeRange: '', modes: [], search: '' };
    this.search.setValue('');
    this.emitChange();
  }

  closeMobileMenuOption() {
    this.closeMobileMenu.emit();
  }

  emitChange() {
    this.filtersChange.emit({ ...this.localFilters });
  }


}
