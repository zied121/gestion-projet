// calendar-grid.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EventModel } from '../../../models/event.model';
import { CommonModule } from '@angular/common';
import {
  CalendarBackofficeDetailComponent
} from '../calendar-backoffice-detail/calendar-backoffice-detail.component';
import {EventService} from '../../../services/event.service';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-calendar-grid',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './calendar-grid.component.html',
})
export class CalendarGridComponent {
  @Input() currentMonth!: Date;
  @Input() events: EventModel[] = [];
  @Output() editEvent = new EventEmitter<EventModel>();
  @Output() deleteEvent = new EventEmitter<string>();
  @Output() createEventForDay = new EventEmitter<Date>();

  daysInMonth: Date[][] = [];
  constructor(private eventService: EventService, private dialog: MatDialog) {}
  ngOnChanges(): void {
    this.generateCalendar(this.currentMonth);
  }

  generateCalendar(date: Date): void {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    const days: Date[][] = [];
    let week: Date[] = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      week.push(new Date(d));
      if (week.length === 7) {
        days.push(week);
        week = [];
      }
    }

    this.daysInMonth = days;
  }

  getEventsForDay(day: Date): EventModel[] {
    return this.events.filter((e) => new Date(e.date_debut).toDateString() === day.toDateString());
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return today.toDateString() === date.toDateString();
  }

  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentMonth.getMonth();
  }
  openEventDetails(event: any): void {
    this.dialog.open(CalendarBackofficeDetailComponent, {
      width: '500px',
      data: { event }
    });
  }
}
