import { Component , OnInit} from '@angular/core';
import { Header } from '../../components/header/header';
import { FilterPanel } from '../../components/filter-panel/filter-panel'
import { TherapistService } from '../../core/services/therapist.service';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { TherapistCard } from '../../components/therapist-card/therapist-card';
import { TherapistDetail } from '../../components/therapist-detail/therapist-detail';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Therapist } from '../../core/models/therapist.model';
import { FormControl, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-home',
  imports: [Header, FilterPanel, TherapistCard, TherapistDetail, CommonModule, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home{

  filters: any = {};
  options: any = { cities: [], feesRanges: [] };
  therapists: any[] = [];
  total = 0;
  page = 1;
  pageSize = 18;
  loading = false;
  activeFilterCount = 0;
  error: string | null = null;
  
  // Popup state
  selectedTherapist: Therapist | null = null;
  isPopupOpen = false;
  
  // Mobile state
  isMobile = false;
  isMobileMenuOpen = false;
  
  // Search state
  searchQuery = '';
  searchInput = new FormControl('');
  
  // Pagination state
  loadingMore = false;

  private filter$ = new BehaviorSubject<any>({});

  // Hardcoded data - commented out for backend integration
  /*
  therapistss = [
    {
      id: "1",
      name: 'Ali',
      city: "Brw",
      experience_years: 2,
      expertise:[],
      fees: 2000,
      rating: 4.3,
      gender: 'male'
    },
    {
      id: "2",
      name: 'Ali 2',
      city: "Brw",
      experience_years: 2,
      expertise:[],
      fees: 2000,
      gender: "female"
    },
    {
      id: "3",
      name: 'Ali 3',
      city: "Brw",
      experience_years: 2,
      expertise:[],
      fees: 2000
    },
    {
      id: "4",
      name: 'Ali4',
      city: "Burewala",
      experience_years: 2,
      expertise:[],
      fees: 2000,
      rating: 2,
      gender: 'male'
    },
    {
      id: "5",
      name: 'Ali5',
      city: "Burewala",
      experience_years: 2,
      expertise:[],
      fees: 2000,
      rating: 2,
      gender: 'male'
    },
    {
      id: "6",
      name: 'Ali6',
      city: "Burewala",
      experience_years: 2,
      expertise:[],
      fees: 2000,
      rating: 2,
      gender: 'male'
    },
    {
      id: "7",
      name: 'Ali7',
      city: "Burewala",
      experience_years: 2,
      expertise:[],
      fees: 2000,
      rating: 2,
      gender: 'male'
    },
    {
      id: "8",
      name: 'Ali8',
      city: "Burewala",
      experience_years: 2,
      expertise:[],
      fees: 2000,
      rating: 2,
      gender: 'male'
    },
    {
      id: "9",
      name: 'Ali9',
      city: "Burewala",
      experience_years: 2,
      expertise:[],
      fees: 2000,
      rating: 2,
      gender: 'male'
    },
    {
      id: "10",
      name: 'Ali10',
      city: "Burewala",
      experience_years: 2,
      expertise:[],
      fees: 2000,
      rating: 2,
      gender: 'male'
    },
    {
      id: "11",
      name: 'Ali11',
      city: "Burewala",
      experience_years: 2,
      expertise:[],
      fees: 2000,
      rating: 2,
      gender: 'male'
    },
  ]
  */
  constructor(
    private svc: TherapistService, 
    private route: ActivatedRoute,
     private router: Router
    ) {

    }

    ngOnInit(){
      // Check screen size
      this.checkScreen();
      window.addEventListener('resize', () => this.checkScreen());
      
      // Set up search functionality
      this.setupSearch();
      
      // load filter options once (cities counts etc)
      this.loadFilters();
      
      // Set up real-time filtering
      this.setupFiltering();
      
      // Load initial therapist data from backend
      this.loadTherapists();
    }

    checkScreen() {
      this.isMobile = window.innerWidth <= 768;
    }

    setupSearch() {
      // Set up search input with debounce
      this.searchInput.valueChanges
        .pipe(
          debounceTime(300), // Wait 300ms after user stops typing
          distinctUntilChanged() // Only emit when value actually changes
        )
        .subscribe(searchTerm => {
          this.searchQuery = searchTerm || '';
          this.loadTherapists(); // Reload therapists with new search
        });
    }

    async loadFilters(){
      console.log("calling sservice")
      try {
        let res = await lastValueFrom(this.svc.getFilterOptions() as any);
        this.options = res;
      } catch (error) {
        console.error('Error loading filter options:', error);
      }
    }

    async loadTherapists(resetPagination = false) {
      this.loading = true;
      this.error = null;
      
      // Reset pagination when filters or search change
      if (resetPagination) {
        this.page = 1;
        this.therapists = [];
      }
      
      try {
        // Combine filters with search query
        const searchFilters = {
          ...this.filters,
          search: this.searchQuery
        };
        
        const response = await lastValueFrom(
          this.svc.getTherapists(searchFilters, this.page, this.pageSize)
        );
        
        if (resetPagination) {
          this.therapists = response.data;
        } else {
          // For pagination, replace existing data
          this.therapists = response.data;
        }
        
        this.total = response.total;
        console.log('Loaded therapists from backend:', response);
      } catch (error) {
        console.error('Error loading therapists:', error);
        this.error = 'Failed to load therapists. Please try again.';
        this.therapists = [];
        this.total = 0;
      } finally {
        this.loading = false;
      }
    }

    setupFiltering() {
      // Watch for filter changes and apply real-time filtering
      this.filter$.subscribe(filters => {
        this.filters = filters;
        this.updateFilterCount();
        this.loadTherapists(); // Fetch from backend with new filters
      });
    }

    onFiltersChange(newFilters: any) {
      this.filters = newFilters;
      this.filter$.next(this.filters);
    }

    updateFilterCount() {
      let count = 0;
      if (this.filters.cities?.length) count += this.filters.cities.length;
      if (this.filters.genders?.length) count += this.filters.genders.length;
      if (this.filters.modes?.length) count += this.filters.modes.length;
      if (this.filters.experience) count += 1;
      if (this.filters.feeRange) count += 1;
      if (this.filters.search?.trim()) count += 1;
      this.activeFilterCount = count;
    }

    // Client-side filtering removed - now using backend filtering
    // applyFilters() method is no longer needed as filtering is handled by the backend

    clearAllFilters() {
      this.filters = {};
      this.filter$.next(this.filters);
    }

    // Popup methods
    onViewTherapistDetails(therapist: Therapist) {
      this.selectedTherapist = therapist;
      this.isPopupOpen = true;
    }

    onClosePopup() {
      this.isPopupOpen = false;
      this.selectedTherapist = null;
    }

    // Mobile menu methods
    onMobileMenuToggle() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }

    onBackdropClick() {
      if (this.isMobileMenuOpen) {
        this.isMobileMenuOpen = false;
      }
    }

    // Search methods
    clearSearch() {
      this.searchInput.setValue('');
      this.searchQuery = '';
      this.loadTherapists();
    }

    // Pagination methods
    goToPage(pageNumber: number) {
      if (pageNumber >= 1 && pageNumber <= this.getTotalPages()) {
        this.page = pageNumber;
        this.loadTherapists();
        this.scrollToTop();
      }
    }

    loadMore() {
      if (this.therapists.length < this.total && !this.loadingMore) {
        this.loadingMore = true;
        this.page++;
        this.loadMoreTherapists();
      }
    }

    async loadMoreTherapists() {
      try {
        const searchFilters = {
          ...this.filters,
          search: this.searchQuery
        };
        
        const response = await lastValueFrom(
          this.svc.getTherapists(searchFilters, this.page, this.pageSize)
        );
        
        // Append new results to existing ones
        this.therapists = [...this.therapists, ...response.data];
        this.loadingMore = false;
      } catch (error) {
        console.error('Error loading more therapists:', error);
        this.loadingMore = false;
        this.page--; // Revert page increment on error
      }
    }

    getTotalPages(): number {
      return Math.ceil(this.total / this.pageSize);
    }

    getPageNumbers(): number[] {
      const totalPages = this.getTotalPages();
      const currentPage = this.page;
      const pages: number[] = [];
      
      // Show up to 5 page numbers
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + 4);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      return pages;
    }

    getStartIndex(): number {
      return (this.page - 1) * this.pageSize + 1;
    }

    getEndIndex(): number {
      return Math.min(this.page * this.pageSize, this.total);
    }

    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

  // ngOnInit() {
  //   // load filter options once (cities counts etc)
  //   this.svc.getFilterOptions().subscribe(opts => this.options = opts);

  //   // read query params for initial state
  //   this.route.queryParams.subscribe(q => {
  //     // map query params into filters (example: cities=Karachi,Lahore -> ['Karachi','Lahore'])
  //     const parsed: any = {};
  //     // if (q.cities) parsed.cities = (q.cities as string).split(',');
  //     // ['genders','modes'].forEach(k => { if (q[k]) parsed[k] = (q[k] as string).split(','); });
  //     // if (q.experience) parsed.experience = q.experience;
  //     // if (q.feeRange) parsed.feeRange = q.feeRange;
  //     // if (q.search) parsed.search = q.search;
  //     this.filters = parsed;
  //     this.filter$.next(this.filters);
  //   });

  //   // call backend whenever filter$ or page changes
  //   this.filter$.pipe(
  //     switchMap(f => {
  //       this.loading = true;
  //       return this.svc.getTherapists(f, this.page, this.pageSize);
  //     })
  //   ).subscribe(res => {
  //     this.therapists = res.data;
  //     this.total = res.total;
  //     this.loading = false;
  //   });
  // }

  // onFiltersChange(newFilters: any) {
  //   this.filters = newFilters;
  //   // update url query params (serialize arrays as comma separated)
  //   const q: any = {};
  //   if (newFilters.cities?.length) q.cities = newFilters.cities.join(',');
  //   if (newFilters.genders?.length) q.genders = newFilters.genders.join(',');
  //   if (newFilters.modes?.length) q.modes = newFilters.modes.join(',');
  //   if (newFilters.experience) q.experience = newFilters.experience;
  //   if (newFilters.feeRange) q.feeRange = newFilters.feeRange;
  //   if (newFilters.search) q.search = newFilters.search;
  //   // merge params (replace)
  //   this.router.navigate([], { relativeTo: this.route, queryParams: q, queryParamsHandling: 'merge' });
  //   this.page = 1; // reset page
  //   this.filter$.next(this.filters);
  // }

  // loadMore() {
  //   this.page++;
  //   this.svc.getTherapists(this.filters, this.page, this.pageSize).subscribe(res => {
  //     this.therapists = [...this.therapists, ...res.data];
  //     this.total = res.total;
  //   });
  // }

}
