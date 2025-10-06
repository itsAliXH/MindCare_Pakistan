import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Therapist } from '../../core/models/therapist.model';

@Component({
  selector: 'app-therapist-detail',
  imports: [CommonModule],
  templateUrl: './therapist-detail.html',
  styleUrl: './therapist-detail.css'
})
export class TherapistDetail {
  @Input() therapist: Therapist | null = null;
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  constructor() {}

  onClose() {
    this.close.emit();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  getAvatar(): string {
    if (!this.therapist) return '🧑‍⚕️';
    const g = (this.therapist.gender || '').toLowerCase();
    if (g === 'male') return '👨‍⚕️';
    if (g === 'female') return '👩‍⚕️';
    return '🧑‍⚕️';
  }

  getExperienceText(): string {
    if (!this.therapist) return '';
    const years = this.therapist.experienceYear || this.therapist.experience_years || 0;
    if (years === 0) return 'New therapist';
    if (years === 1) return '1 year experience';
    return `${years} years experience`;
  }

  getFormattedFee(): string {
    if (!this.therapist) return 'Contact for pricing';
    const fee = this.therapist.feeAmount || this.therapist.fees;
    if (!fee) return 'Contact for pricing';
    const currency = this.therapist.feeCurrency || 'PKR';
    return `Rs. ${fee.toLocaleString()} per session`;
  }

  getFormattedPhone(): string {
    if (!this.therapist?.phone) return 'Phone not available';
    return this.therapist.phone;
  }

  getFormattedEmail(): string {
    if (!this.therapist?.email) return 'Email not available';
    return this.therapist.email;
  }

  onCallClick() {
    if (this.therapist?.phone) {
      window.open(`tel:${this.therapist.phone}`, '_self');
    }
  }

  onEmailClick() {
    if (this.therapist?.email) {
      window.open(`mailto:${this.therapist.email}`, '_self');
    }
  }

  onVisitProfileClick() {
    if (this.therapist?.profileUrl) {
      window.open(this.therapist.profileUrl, '_blank');
    }
  }

  getEducationList(): string[] {
    if (!this.therapist?.education) return [];
    return Array.isArray(this.therapist.education) 
      ? this.therapist.education 
      : [this.therapist.education];
  }

  getExperienceList(): string[] {
    if (!this.therapist?.experience) return [];
    return Array.isArray(this.therapist.experience) 
      ? this.therapist.experience 
      : [this.therapist.experience];
  }

  getExpertiseList(): string[] {
    if (!this.therapist?.expertise) return [];
    return Array.isArray(this.therapist.expertise) 
      ? this.therapist.expertise 
      : [this.therapist.expertise];
  }

  getConsultationModes(): string[] {
    if (!this.therapist?.modes) return [];
    return this.therapist.modes;
  }

  hasInPersonMode(): boolean {
    const modes = this.getConsultationModes();
    return modes.some(mode => 
      mode.toLowerCase().includes('person') || 
      mode.toLowerCase().includes('perso') ||
      mode === 'I' ||
      mode === '-perso'
    );
  }

  hasOnlineMode(): boolean {
    const modes = this.getConsultationModes();
    return modes.some(mode => 
      mode.toLowerCase().includes('virtual') || 
      mode.toLowerCase().includes('telepho') ||
      mode.toLowerCase().includes('video') ||
      mode.toLowerCase().includes('ic')
    );
  }
}
