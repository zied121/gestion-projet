import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { EventModel } from '../../models/event.model';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.component.html',
})
export class CalendarComponent implements OnInit {
  events: EventModel[] = [];
  daysInMonth: Date[][] = [];
  currentMonth = new Date();
  selectedMonthLabel = '';

  selectedEvent: EventModel | null = null;
  showForm = false;
  formData: Partial<EventModel> = {};

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
    this.generateCalendar(this.currentMonth);
  }

  loadEvents(): void {
    this.eventService.getEventsByUser().subscribe({
      next: (res) => this.events = res,
      error: (err) => console.error(err)
    });
  }

  generateCalendar(date: Date): void {
    const year = date.getFullYear();
    const month = date.getMonth();
    this.selectedMonthLabel = date.toLocaleString('default', { month: 'long', year: 'numeric' });

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
    return this.events.filter(e =>
      new Date(e.date_debut).toDateString() === day.toDateString()
    );
  }

  prevMonth(): void {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() - 1));
    this.generateCalendar(this.currentMonth);
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() + 1));
    this.generateCalendar(this.currentMonth);
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return today.toDateString() === date.toDateString();
  }

  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentMonth.getMonth();
  }

  onCreateEventClick(): void {
    this.selectedEvent = null;
    this.formData = {
      titre: '',
      description: '',
      type: 'Évenement',
      date_debut: new Date().toISOString().slice(0, 16),
      date_fin: new Date().toISOString().slice(0, 16),
      emplacement: '',
      lien: '',
      type_recurrence: 'none',
      isRecurring: false,
      status: 'En_attente'
    };
    this.showForm = true;
  }

  onEditEvent(event: EventModel): void {
    this.selectedEvent = event;
    this.formData = { ...event };
    this.showForm = true;
  }

  onDeleteEvent(id: string): void {
    if (confirm('Are you sure you want to delete this event?')) {
      this.eventService.deleteEvent(id).subscribe(() => this.loadEvents());
    }
  }

  submitForm(): void {
    if (!this.formData.titre || !this.formData.date_debut || !this.formData.date_fin || !this.formData.type) {
      return alert('Please fill all required fields.');
    }

    if (this.selectedEvent) {
      this.eventService.updateEvent(this.selectedEvent._id!, this.formData).subscribe(() => {
        this.loadEvents();
        this.showForm = false;
      });
    } else {
      const form = new FormData();
      (Object.keys(this.formData) as Array<keyof EventModel>).forEach((key) => {
        const value = this.formData[key];
        if (value !== null && value !== undefined) {
          form.append(key as string, String(value));
        }
      });

      this.eventService.createEvent(form).subscribe(() => {
        this.loadEvents();
        this.showForm = false;
      });
    }
  }
  
}
