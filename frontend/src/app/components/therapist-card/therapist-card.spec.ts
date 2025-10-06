import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TherapistCard } from './therapist-card';

describe('TherapistCard', () => {
  let component: TherapistCard;
  let fixture: ComponentFixture<TherapistCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TherapistCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TherapistCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
