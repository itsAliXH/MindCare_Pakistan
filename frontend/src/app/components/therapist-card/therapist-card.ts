import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Therapist } from '../../core/models/therapist.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-therapist-card',
  imports: [CommonModule],
  templateUrl: './therapist-card.html',
  styleUrl: './therapist-card.css'
})
export class TherapistCard {
  @Input() therapist!: Therapist;
  @Output() viewDetails = new EventEmitter<Therapist>();
  
  constructor(private router: Router) {
    console.log(this.therapist)
  }

  onViewDetails() {
    this.viewDetails.emit(this.therapist);
  }

  getStars(): ('full' | 'half' | 'empty')[] {
    const stars: ('full' | 'half' | 'empty')[] = [];
    const rating = this.therapist.rating || 0;
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) stars.push('full');
      else if (rating >= i - 0.5) stars.push('half');
      else stars.push('empty');
    }
    return stars;
  }

  getAvatar(): string {
    const g = (this.therapist.gender || '').toLowerCase();
    if (g === 'male') return '👨‍⚕️';
    if (g === 'female') return '👩‍⚕️';
    return '🧑‍⚕️';
  }
}
