# Frontend Components Documentation

This document provides detailed information about each frontend component, explaining what work has been done and how each component functions.

## Table of Contents
1. [Header Component](#header-component)
2. [Filter Panel Component](#filter-panel-component)
3. [Therapist Card Component](#therapist-card-component)
4. [Therapist Detail Component](#therapist-detail-component)

---

## Header Component

**File Path:** `frontend/src/app/components/header/`

### Purpose
The header component provides the main navigation and branding for the application, with responsive design for both desktop and mobile views.

### Work Done
1. **Responsive Design**: Created separate layouts for desktop and mobile
2. **Desktop Header**: Implemented clean header with branding and search functionality
3. **Mobile Header**: Created mobile-specific header with hamburger menu
4. **Search Integration**: Connected search input to parent component via FormControl
5. **Mobile Menu Toggle**: Implemented hamburger menu functionality
6. **Branding**: Added "MindCare Pakistan" branding with brain emoji icon

### Key Features

#### Desktop Header
```typescript
// Desktop header with search
<div *ngIf="!isMobile" class="header">
  <div class="header-left">
    <span class="mind-icon">🧠</span>
    <span>MindCare Pakistan</span>
  </div>
  <div class="header-right">
    <input 
      type="text" 
      placeholder="Search by name, expertise, education..." 
      [formControl]="searchInput" />
  </div>
</div>
```

#### Mobile Header
```typescript
// Mobile header with hamburger menu
<div *ngIf="isMobile" class="mobile-header">
  <div class="mobile-header-content">
    <button class="hamburger-menu" (click)="toggleMobileMenu()">
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>
    <div class="mobile-logo">
      <span class="mobile-mind-icon">🧠</span>
      <span class="mobile-brand">MindCare</span>
    </div>
  </div>
</div>
```

### Component Properties
- `@Input() searchInput: FormControl` - Search input control from parent
- `@Output() mobileMenuToggled: EventEmitter<void>` - Mobile menu toggle event
- `isMobile: boolean` - Screen size detection
- `isMobileMenuOpen: boolean` - Mobile menu state

### Key Methods
- `checkScreen()` - Detects screen size and updates mobile state
- `toggleMobileMenu()` - Toggles mobile menu and emits event

### Styling Features
- **Dark Theme**: Dark background with white text
- **Responsive**: Adapts to different screen sizes
- **Hamburger Animation**: Smooth hamburger menu animation
- **Brand Consistency**: Consistent branding across desktop and mobile

---

## Filter Panel Component

**File Path:** `frontend/src/app/components/filter-panel/`

### Purpose
The filter panel component provides comprehensive filtering options for therapists, with real-time filtering and dynamic data from the backend.

### Work Done
1. **Dynamic Filter Options**: Integrated with backend to show real-time filter counts
2. **Multiple Filter Types**: Implemented different filter types:
   - Cities (checkbox array)
   - Gender (checkbox array)
   - Experience (radio buttons with ranges)
   - Fee Range (radio buttons with ranges)
   - Consultation Modes (checkbox array)
3. **Real-time Updates**: Filters apply immediately when changed
4. **Mobile Support**: Added mobile-specific functionality with close button
5. **Filter Counts**: Display actual counts from backend data
6. **Clear All**: Implemented clear all filters functionality

### Key Features

#### Filter Types Implementation
```typescript
// Array-based filters (cities, genders, modes)
toggleArray(field: 'cities'|'genders'|'modes', value: string) {
  const arr = this.localFilters[field];
  const idx = arr.indexOf(value);
  if (idx >= 0) arr.splice(idx, 1);
  else arr.push(value);
  this.emitChange();
}

// Radio-based filters (experience, fee range)
setRadio(field: 'experience'|'feeRange', value: string) {
  this.localFilters[field] = value;
  this.emitChange();
}
```

#### Dynamic Data Integration
```typescript
// Update filter options from backend data
ngOnChanges() {
  if (this.options) {
    this.cityOptions = this.options.cityCounts || [];
    this.genderOptions = this.options.genderCounts || [];
    
    // Update experience options with counts
    if (this.options.experienceCounts) {
      this.experienceOptions = this.experienceOptions.map(exp => {
        const backendCount = this.options.experienceCounts.find((c: any) => c._id === exp.name);
        return { ...exp, count: backendCount?.count || 0 };
      });
    }
  }
}
```

### Component Properties
- `@Input() options: any` - Filter options from backend
- `@Input() filters: any` - Current filter state
- `@Input() isMobile: boolean` - Mobile state
- `@Output() filtersChange: EventEmitter<any>` - Filter change events
- `@Output() closeMobileMenu: EventEmitter<void>` - Mobile menu close event

### Filter Options
- **Cities**: Dynamic list with counts from backend
- **Gender**: Male/Female with counts
- **Experience**: 0-5, 5-10, 10-15, 15+ years with counts
- **Fee Range**: Under Rs. 2,000, Rs. 2,000-4,000, Rs. 4,000-6,000, Above Rs. 6,000 with counts
- **Consultation Modes**: In-person, Online (consolidated from backend)

### Key Methods
- `toggleArray()` - Toggle array-based filters
- `setRadio()` - Set radio-based filters
- `clearAll()` - Clear all filters
- `closeMobileMenuOption()` - Close mobile menu
- `emitChange()` - Emit filter changes to parent

### Styling Features
- **Clean Design**: Modern, clean filter interface
- **Count Display**: Shows actual counts for each filter option
- **Mobile Responsive**: Adapts to mobile screens
- **Visual Feedback**: Clear visual indication of selected filters

---

## Therapist Card Component

**File Path:** `frontend/src/app/components/therapist-card/`

### Purpose
The therapist card component displays individual therapist information in a card format, with consistent sizing and responsive design.

### Work Done
1. **Consistent Card Layout**: Implemented uniform card sizing and layout
2. **Responsive Design**: Created mobile-optimized card layout
3. **Data Display**: Shows key therapist information:
   - Avatar (emoji-based)
   - Name and rating
   - City and experience
   - Fee information
4. **Interactive Elements**: Added "View Details" button
5. **Event Handling**: Emits therapist selection events
6. **Avatar System**: Implemented emoji-based avatar system

### Key Features

#### Card Structure
```typescript
// Therapist card with consistent layout
<article class="card">
  <div class="info">
    <div class="avatar">{{ getAvatar() }}</div>
    <h3>{{ therapist.name }}</h3>
    <div class="rating">
      <span *ngFor="let star of getStars()" class="star">{{ star === 'full' ? '★' : star === 'half' ? '☆' : '☆' }}</span>
      <span class="rating-number">{{ therapist.rating || 4.5 }}</span>
    </div>
    <p class="city">📍 {{ therapist.city }}</p>
    <p class="experience">💼 {{ therapist.experienceYear || therapist.experience_years || 0 }} years</p>
    <p class="fee">💰 Rs. {{ therapist.feeAmount || therapist.fees || 'Contact' }}</p>
    <div class="bottom">
      <button (click)="onViewDetails()">View Details</button>
    </div>
  </div>
</article>
```

#### Avatar System
```typescript
getAvatar(): string {
  if (!this.therapist) return '🧑‍⚕️';
  const g = this.therapist.gender?.toLowerCase();
  if (g === 'male') return '👨‍⚕️';
  if (g === 'female') return '👩‍⚕️';
  return '🧑‍⚕️';
}
```

#### Star Rating System
```typescript
getStars(): ('full' | 'half' | 'empty')[] {
  const rating = this.therapist.rating || 4.5;
  const stars: ('full' | 'half' | 'empty')[] = [];
  
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push('full');
    } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
      stars.push('half');
    } else {
      stars.push('empty');
    }
  }
  
  return stars;
}
```

### Component Properties
- `@Input() therapist: Therapist` - Therapist data object
- `@Output() viewDetails: EventEmitter<Therapist>` - View details event

### Key Methods
- `onViewDetails()` - Emit therapist selection event
- `getAvatar()` - Get appropriate avatar emoji
- `getStars()` - Generate star rating display

### Styling Features
- **Consistent Height**: All cards have uniform height
- **Responsive**: Adapts to different screen sizes
- **Modern Design**: Clean, modern card design
- **Interactive**: Hover effects and button interactions
- **Mobile Optimized**: Optimized layout for mobile devices

---

## Therapist Detail Component

**File Path:** `frontend/src/app/components/therapist-detail/`

### Purpose
The therapist detail component displays comprehensive therapist information in a modal popup with clickable contact information.

### Work Done
1. **Modal Implementation**: Created full-screen modal overlay
2. **Comprehensive Data Display**: Shows all therapist information:
   - Personal details (name, gender, experience)
   - Contact information (phone, email)
   - Professional details (education, expertise, experience)
   - About section
   - Fee information
3. **Interactive Elements**: Made phone and email clickable
4. **Responsive Design**: Optimized for both desktop and mobile
5. **Accessibility**: Added proper ARIA labels and keyboard navigation
6. **Animation**: Smooth modal animations

### Key Features

#### Modal Structure
```typescript
// Modal overlay with click-to-close
<div class="modal-overlay" (click)="onClose()">
  <div class="modal-content" (click)="$event.stopPropagation()">
    <button class="close-button" (click)="onClose()">×</button>
    
    <!-- Header section with avatar and basic info -->
    <div class="header-section">
      <div class="avatar">{{ getAvatarEmoji() }}</div>
      <h2 class="name">{{ therapist.name }}</h2>
      <p class="therapist-title">
        {{ therapist.gender }} • {{ getExperienceText() }} • 
        <span *ngIf="therapist.expertise?.length">{{ therapist?.expertise?.[0] }}</span>
      </p>
      <p class="city">{{ therapist.city }}</p>
    </div>
    
    <!-- Detailed information grid -->
    <div class="details-grid">
      <!-- Multiple detail items -->
    </div>
    
    <!-- About section -->
    <div class="about-section">
      <h3>About</h3>
      <p>{{ therapist.about }}</p>
    </div>
    
    <!-- Contact section with clickable links -->
    <div class="contact-section">
      <h3>Contact</h3>
      <p *ngIf="therapist.phone">
        <strong>Phone:</strong> <a [href]="getPhoneLink()">{{ getFormattedPhone() }}</a>
      </p>
      <p *ngIf="therapist.email">
        <strong>Email:</strong> <a [href]="getEmailLink()">{{ therapist.email }}</a>
      </p>
    </div>
  </div>
</div>
```

#### Contact Link Generation
```typescript
getPhoneLink(): string {
  return `tel:${this.therapist.phone}`;
}

getEmailLink(): string {
  return `mailto:${this.therapist.email}`;
}

getFormattedPhone(): string {
  if (!this.therapist?.phone) return 'Phone not available';
  return this.therapist.phone;
}
```

#### Experience Text Formatting
```typescript
getExperienceText(): string {
  if (!this.therapist) return '';
  const years = this.therapist.experienceYear || this.therapist.experience_years || 0;
  if (years === 0) return 'New therapist';
  if (years === 1) return '1 year experience';
  return `${years} years experience`;
}
```

#### Fee Formatting
```typescript
getFormattedFee(): string {
  if (!this.therapist) return 'Contact for pricing';
  const fee = this.therapist.feeAmount || this.therapist.fees;
  if (!fee) return 'Contact for pricing';
  const currency = this.therapist.feeCurrency || 'PKR';
  return `Rs. ${fee.toLocaleString()} per session`;
}
```

### Component Properties
- `@Input() therapist: Therapist` - Therapist data object
- `@Input() isOpen: boolean` - Modal open state
- `@Output() close: EventEmitter<void>` - Close modal event

### Key Methods
- `onClose()` - Close modal and emit event
- `getPhoneLink()` - Generate tel: link for phone
- `getEmailLink()` - Generate mailto: link for email
- `getAvatarEmoji()` - Get appropriate avatar emoji
- `getExperienceText()` - Format experience text
- `getFormattedFee()` - Format fee information
- `getFormattedPhone()` - Format phone number

### Styling Features
- **Modal Overlay**: Full-screen overlay with backdrop
- **Responsive Design**: Adapts to different screen sizes
- **Smooth Animations**: Fade-in and slide-in animations
- **Click-to-Close**: Click outside modal to close
- **Accessible**: Proper focus management and keyboard navigation
- **Modern Design**: Clean, professional modal design

---

## Summary

The frontend components provide a comprehensive, responsive, and user-friendly interface for the MindCare Pakistan therapist finder application. Key achievements include:

1. **Responsive Design**: All components adapt seamlessly to desktop and mobile
2. **Real-time Filtering**: Dynamic filtering with backend integration
3. **Consistent UI**: Uniform design language across all components
4. **Interactive Elements**: Clickable contact information and smooth animations
5. **Accessibility**: Proper ARIA labels and keyboard navigation
6. **Data Integration**: Seamless integration with backend API
7. **Mobile Optimization**: Mobile-first design approach
8. **User Experience**: Intuitive navigation and clear information display

The components work together to create a cohesive, professional application that effectively helps users find mental health professionals in Pakistan.
