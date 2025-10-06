# Frontend Pages Documentation

This document provides detailed information about the frontend pages, explaining what work has been done and how each page component functions.

## Table of Contents
1. [Home Page Component](#home-page-component)

---

## Home Page Component

**File Path:** `frontend/src/app/pages/home/`

### Purpose
The home page is the main application page that orchestrates all the components and manages the overall application state, including filtering, searching, pagination, and data management.

### Work Done
1. **Component Orchestration**: Integrated all child components (header, filter panel, therapist cards, therapist detail)
2. **State Management**: Implemented comprehensive state management for:
   - Filter state and active filter count
   - Search functionality with debouncing
   - Pagination state and controls
   - Loading and error states
   - Mobile menu state
   - Popup modal state
3. **Backend Integration**: Connected to backend API for data fetching and filtering
4. **Real-time Filtering**: Implemented real-time filter updates with backend communication
5. **Search Functionality**: Added debounced search with backend integration
6. **Pagination**: Implemented both traditional pagination and "load more" functionality
7. **Mobile Responsiveness**: Added mobile-specific functionality and layout
8. **Error Handling**: Comprehensive error handling and user feedback

### Key Features

#### State Management
```typescript
export class Home implements OnInit {
  // Filter and data state
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
}
```

#### Backend Integration
```typescript
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
  } catch (error) {
    console.error('Error loading therapists:', error);
    this.error = 'Failed to load therapists. Please try again.';
    this.therapists = [];
    this.total = 0;
  } finally {
    this.loading = false;
  }
}
```

#### Real-time Filtering
```typescript
setupFiltering() {
  this.filter$.subscribe(filters => {
    this.filters = filters;
    this.updateFilterCount();
    this.loadTherapists(true); // Fetch from backend with new filters and reset pagination
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
```

#### Search Functionality
```typescript
setupSearch() {
  this.searchInput.valueChanges
    .pipe(
      debounceTime(300),
      distinctUntilChanged()
    )
    .subscribe(searchTerm => {
      this.searchQuery = searchTerm || '';
      this.loadTherapists(true); // Reload therapists with new search and reset pagination
    });
}

clearSearch() {
  this.searchInput.setValue('');
  this.searchQuery = '';
  this.loadTherapists(true);
}
```

#### Pagination System
```typescript
// Traditional pagination
goToPage(pageNumber: number) {
  if (pageNumber >= 1 && pageNumber <= this.getTotalPages()) {
    this.page = pageNumber;
    this.loadTherapists();
    this.scrollToTop();
  }
}

// Load more functionality
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
```

#### Mobile Functionality
```typescript
checkScreen() {
  this.isMobile = window.innerWidth <= 768;
}

onMobileMenuToggle() {
  this.isMobileMenuOpen = !this.isMobileMenuOpen;
}

onBackdropClick() {
  if (this.isMobileMenuOpen) {
    this.isMobileMenuOpen = false;
  }
}
```

#### Popup Management
```typescript
onViewTherapistDetails(therapist: Therapist) {
  this.selectedTherapist = therapist;
  this.isPopupOpen = true;
}

onClosePopup() {
  this.isPopupOpen = false;
  this.selectedTherapist = null;
}
```

### Template Structure

#### Main Layout
```html
<app-header 
  [searchInput]="searchInput"
  (mobileMenuToggled)="onMobileMenuToggle()">
</app-header>

<!-- Mobile Search Bar -->
<div class="mobile-search-container" *ngIf="isMobile">
  <div class="mobile-search-bar">
    <input 
      type="text" 
      placeholder="Search therapists..." 
      class="mobile-search-input"
      [formControl]="searchInput">
    <button 
      *ngIf="searchInput.value" 
      class="clear-search-btn"
      (click)="clearSearch()">
      ×
    </button>
  </div>
  <div class="mobile-filter-tag" *ngIf="activeFilterCount > 0">
    <span class="filter-tag-text">Filters Applied: {{ activeFilterCount }}</span>
  </div>
</div>

<!-- Mobile Menu Backdrop -->
<div class="mobile-backdrop" 
     *ngIf="isMobile && isMobileMenuOpen" 
     (click)="onBackdropClick()">
</div>

<div class="layout">
  <!-- Left Panel - Filters -->
  <aside class="left" 
         [class.mobile-hidden]="isMobile && !isMobileMenuOpen"
         [class.mobile-visible]="isMobile && isMobileMenuOpen">
    <app-filter-panel
      [options]="options"
      [filters]="filters"
      [isMobile]="isMobile"
      (filtersChange)="onFiltersChange($event)"
      (closeMobileMenu)="onMobileMenuToggle()">
    </app-filter-panel>
  </aside>

  <!-- Right Panel - Results -->
  <main class="right">
    <!-- Results header with filter info -->
    <div class="results-info">
      <div class="results-header">
        <span class="results-count">{{total}} therapists found</span>
        <div class="filter-info" *ngIf="activeFilterCount > 0">
          <span class="filter-count">{{activeFilterCount}} filters active</span>
          <button class="clear-filters-btn" (click)="clearAllFilters()">Clear All</button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading therapists...</p>
    </div>

    <!-- Error State -->
    <div *ngIf="error && !loading" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button class="retry-button" (click)="loadTherapists()">Retry</button>
    </div>

    <!-- Results Grid -->
    <section class="results-grid" *ngIf="!loading && !error">
      <app-therapist-card 
        *ngFor="let t of therapists" 
        [therapist]="t"
        (viewDetails)="onViewTherapistDetails($event)">
      </app-therapist-card>
    </section>

    <!-- No Results -->
    <div *ngIf="!loading && !error && therapists.length === 0" class="no-results">
      <p>No therapists found matching your criteria.</p>
      <button class="clear-filters-btn" (click)="clearAllFilters()">Clear Filters</button>
    </div>

    <!-- Pagination -->
    <div class="pagination-container" *ngIf="!loading && !error && therapists.length > 0">
      <!-- Pagination controls -->
    </div>
  </main>
</div>

<!-- Therapist Detail Popup -->
<app-therapist-detail
  [therapist]="selectedTherapist"
  [isOpen]="isPopupOpen"
  (close)="onClosePopup()">
</app-therapist-detail>
```

### Key Methods

#### Data Management
- `loadTherapists(resetPagination?: boolean)` - Load therapists from backend
- `loadFilters()` - Load filter options from backend
- `setupFiltering()` - Set up real-time filtering
- `setupSearch()` - Set up debounced search

#### Filter Management
- `onFiltersChange(newFilters: any)` - Handle filter changes
- `updateFilterCount()` - Update active filter count
- `clearAllFilters()` - Clear all filters
- `clearSearch()` - Clear search input

#### Pagination
- `goToPage(pageNumber: number)` - Navigate to specific page
- `loadMore()` - Load more results
- `loadMoreTherapists()` - Fetch additional results
- `getTotalPages()` - Calculate total pages
- `getPageNumbers()` - Get page numbers for display
- `getStartIndex()` - Get start index for current page
- `getEndIndex()` - Get end index for current page
- `scrollToTop()` - Scroll to top of page

#### Mobile Management
- `checkScreen()` - Check screen size
- `onMobileMenuToggle()` - Toggle mobile menu
- `onBackdropClick()` - Handle backdrop clicks

#### Popup Management
- `onViewTherapistDetails(therapist: Therapist)` - Open therapist detail popup
- `onClosePopup()` - Close therapist detail popup

### Styling Features

#### Layout System
- **Two-panel Layout**: Left panel for filters, right panel for results
- **Separate Scrollbars**: Independent scrolling for each panel
- **Fixed Heights**: Consistent layout with fixed panel heights
- **Responsive Design**: Adapts to different screen sizes

#### Mobile Optimization
- **Mobile Menu**: Hamburger menu for mobile navigation
- **Mobile Search**: Dedicated mobile search bar
- **Filter Tag**: Shows active filter count on mobile
- **Backdrop**: Clickable backdrop to close mobile menu

#### State Indicators
- **Loading States**: Spinner and loading messages
- **Error States**: Error messages with retry buttons
- **Empty States**: No results messages with clear filters option
- **Filter Counts**: Active filter count display

#### Pagination Styling
- **Page Numbers**: Clickable page numbers
- **Navigation Buttons**: Previous/Next buttons
- **Load More**: Load more button for infinite scroll
- **Page Info**: Shows current page range and total

### Component Dependencies
- **Header Component**: Navigation and search
- **Filter Panel Component**: Filtering options
- **Therapist Card Component**: Individual therapist display
- **Therapist Detail Component**: Detailed therapist information
- **Therapist Service**: Backend API communication
- **Common Module**: Angular common directives
- **Reactive Forms Module**: Form controls

### Key Features Summary

1. **Comprehensive State Management**: Manages all application state in one place
2. **Real-time Filtering**: Instant filter updates with backend communication
3. **Debounced Search**: Optimized search with 300ms debouncing
4. **Dual Pagination**: Both traditional and load-more pagination
5. **Mobile Responsive**: Full mobile optimization with dedicated mobile features
6. **Error Handling**: Comprehensive error handling and user feedback
7. **Loading States**: Proper loading indicators for all async operations
8. **Popup Management**: Modal popup for detailed therapist information
9. **Filter Persistence**: Maintains filter state across operations
10. **Backend Integration**: Seamless integration with backend API

The home page component serves as the central orchestrator for the entire application, providing a smooth, responsive, and feature-rich user experience for finding mental health professionals in Pakistan.
