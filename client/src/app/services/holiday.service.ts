import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HolidayModel } from '../models/holiday.model';

@Injectable({ providedIn: 'root' })
export class HolidayService {
  private baseUrl = 'http://localhost:5000/api/holiday';

  constructor(private http: HttpClient) {}

  getHolidays(): Observable<{ holidays: HolidayModel[] }> {
    return this.http.get<{ holidays: HolidayModel[] }>(`${this.baseUrl}`);
  }
}
