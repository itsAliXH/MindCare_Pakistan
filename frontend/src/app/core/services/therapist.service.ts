import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Therapist } from '../models/therapist.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TherapistService {
  // adjust baseUrl to match your backend 

  private baseUrl = `${environment.apiUrl}/therapists`; 

  constructor(private http: HttpClient) {}

  // fetch list with filters and pagination
  getTherapists(filters: any = {}, page = 1, pageSize = 18): Observable<{ data: Therapist[]; total: number }> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(pageSize));

    Object.keys(filters || {}).forEach(k => {
      const v = filters[k];
      if (v !== null && v !== undefined && v !== '') {
        // arrays -> join by comma for backend to parse
        if (Array.isArray(v)) params = params.set(k, v.join(','));
        else params = params.set(k, String(v));
      }
    });

    return this.http.get<{ data: Therapist[]; total: number }>(this.baseUrl, { params });
  }

  getTherapist(id: string): Observable<Therapist> {
    return this.http.get<Therapist>(`${this.baseUrl}/${id}`);
  }

  // fetch filter options (city counts, genders, fees ranges) from backend endpoint
  getFilterOptions(): Observable<any> {
    console.log("I am in service")
    return this.http.get<any>(`${this.baseUrl}/_filters/options`);
  }
}
