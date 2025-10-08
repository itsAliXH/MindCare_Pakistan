import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TherapistCard } from './therapist-card';
import { Therapist } from '../../core/models/therapist.model';

describe('TherapistCard', () => {
  let component: TherapistCard;
  let fixture: ComponentFixture<TherapistCard>;
  let mockRouter: jest.Mocked<Router>;

  const mockTherapist: Therapist = {
    _id: '1',
    name: 'Dr. Test Therapist',
    gender: 'Male',
    city: 'Karachi',
    experienceYear: 5,
    email: 'test@example.com',
    phone: '03001234567',
    modes: ['In-person', 'Online'],
    education: ['MBBS', 'MD Psychiatry'],
    experience: ['5 years at Aga Khan Hospital'],
    expertise: ['Depression', 'Anxiety'],
    about: 'Experienced psychiatrist specializing in mood disorders',
    feeAmount: 3000,
    feeCurrency: 'PKR',
    rating: 4.5
  };

  beforeEach(async () => {
    const routerSpy = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [TherapistCard],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TherapistCard);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router) as jest.Mocked<Router>;
    
    component.therapist = mockTherapist;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display therapist information correctly', () => {
    const compiled = fixture.nativeElement;
    
    expect(compiled.querySelector('h3').textContent).toContain('Dr. Test Therapist');
    expect(compiled.querySelector('.city').textContent).toContain('Karachi');
    expect(compiled.querySelector('.experience').textContent).toContain('5 years');
    expect(compiled.querySelector('.fee').textContent).toContain('Rs. 3000');
  });

  it('should display correct avatar for male therapist', () => {
    component.therapist = { ...mockTherapist, gender: 'Male' };
    fixture.detectChanges();
    
    expect(component.getAvatar()).toBe('👨‍⚕️');
  });

  it('should display correct avatar for female therapist', () => {
    component.therapist = { ...mockTherapist, gender: 'Female' };
    fixture.detectChanges();
    
    expect(component.getAvatar()).toBe('👩‍⚕️');
  });

  it('should display default avatar for unknown gender', () => {
    component.therapist = { ...mockTherapist, gender: 'Other' };
    fixture.detectChanges();
    
    expect(component.getAvatar()).toBe('🧑‍⚕️');
  });

  it('should display default avatar when gender is not provided', () => {
    component.therapist = { ...mockTherapist, gender: undefined };
    fixture.detectChanges();
    
    expect(component.getAvatar()).toBe('🧑‍⚕️');
  });

  it('should generate correct star rating', () => {
    component.therapist = { ...mockTherapist, rating: 4.5 };
    const stars = component.getStars();
    
    expect(stars).toEqual(['full', 'full', 'full', 'full', 'half']);
  });

  it('should generate correct star rating for whole number', () => {
    component.therapist = { ...mockTherapist, rating: 4 };
    const stars = component.getStars();
    
    expect(stars).toEqual(['full', 'full', 'full', 'full', 'empty']);
  });

  it('should generate correct star rating for zero rating', () => {
    component.therapist = { ...mockTherapist, rating: 0 };
    const stars = component.getStars();
    
    expect(stars).toEqual(['empty', 'empty', 'empty', 'empty', 'empty']);
  });

  it('should use default rating when not provided', () => {
    component.therapist = { ...mockTherapist, rating: undefined };
    const stars = component.getStars();
    
    expect(stars).toEqual(['full', 'full', 'full', 'full', 'half']); // Default 4.5
  });

    it('should emit viewDetails event when View Details button is clicked', () => {
      jest.spyOn(component.viewDetails, 'emit');
      
      const button = fixture.nativeElement.querySelector('button');
      button.click();
      
      expect(component.viewDetails.emit).toHaveBeenCalledWith(mockTherapist);
    });

    it('should call onViewDetails method when View Details button is clicked', () => {
      jest.spyOn(component, 'onViewDetails');
      
      const button = fixture.nativeElement.querySelector('button');
      button.click();
      
      expect(component.onViewDetails).toHaveBeenCalled();
    });

  it('should handle missing therapist data gracefully', () => {
    component.therapist = {} as Therapist;
    fixture.detectChanges();
    
    expect(component.getAvatar()).toBe('🧑‍⚕️');
    expect(component.getStars()).toEqual(['full', 'full', 'full', 'full', 'half']); // Default rating
  });

  it('should display experience from experienceYear field', () => {
    component.therapist = { ...mockTherapist, experienceYear: 3 };
    fixture.detectChanges();
    
    const experienceElement = fixture.nativeElement.querySelector('.experience');
    expect(experienceElement.textContent).toContain('3 years');
  });

  it('should display experience from experience_years field when experienceYear is not available', () => {
    component.therapist = { 
      ...mockTherapist, 
      experienceYear: undefined, 
      experience_years: 7 
    };
    fixture.detectChanges();
    
    const experienceElement = fixture.nativeElement.querySelector('.experience');
    expect(experienceElement.textContent).toContain('7 years');
  });

  it('should display fee from feeAmount field', () => {
    component.therapist = { ...mockTherapist, feeAmount: 2500 };
    fixture.detectChanges();
    
    const feeElement = fixture.nativeElement.querySelector('.fee');
    expect(feeElement.textContent).toContain('Rs. 2500');
  });

  it('should display fee from fees field when feeAmount is not available', () => {
    component.therapist = { 
      ...mockTherapist, 
      feeAmount: undefined, 
      fees: 4000 
    };
    fixture.detectChanges();
    
    const feeElement = fixture.nativeElement.querySelector('.fee');
    expect(feeElement.textContent).toContain('Rs. 4000');
  });

  it('should display "Contact" when no fee information is available', () => {
    component.therapist = { 
      ...mockTherapist, 
      feeAmount: undefined, 
      fees: undefined 
    };
    fixture.detectChanges();
    
    const feeElement = fixture.nativeElement.querySelector('.fee');
    expect(feeElement.textContent).toContain('Contact');
  });

  it('should display zero years when no experience information is available', () => {
    component.therapist = { 
      ...mockTherapist, 
      experienceYear: undefined, 
      experience_years: undefined 
    };
    fixture.detectChanges();
    
    const experienceElement = fixture.nativeElement.querySelector('.experience');
    expect(experienceElement.textContent).toContain('0 years');
  });

  it('should have proper accessibility attributes', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('View Details');
  });

  it('should render all required elements', () => {
    const compiled = fixture.nativeElement;
    
    expect(compiled.querySelector('.avatar')).toBeTruthy();
    expect(compiled.querySelector('h3')).toBeTruthy();
    expect(compiled.querySelector('.rating')).toBeTruthy();
    expect(compiled.querySelector('.city')).toBeTruthy();
    expect(compiled.querySelector('.experience')).toBeTruthy();
    expect(compiled.querySelector('.fee')).toBeTruthy();
    expect(compiled.querySelector('button')).toBeTruthy();
  });
});