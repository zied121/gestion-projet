// calendar.component.ts
import { Component, OnInit } from '@angular/core';
import { EventService } from '../../services/event.service';
import { EventModel, EventType } from '../../models/event.model';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarHeaderComponent } from './calendar-header/calendar-header.component';
import { CalendarGridComponent } from './calendar-grid/calendar-grid.component';
import { EventFormDialogComponent } from './event-form-dialog/event-form-dialog.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    CalendarHeaderComponent, 
    CalendarGridComponent,
    EventFormDialogComponent
  ],
  templateUrl: './calendar.component.html',
})
export class CalendarComponent implements OnInit {
  events: EventModel[] = [];
  currentMonth = new Date();
  users: any[] = [];
  showForm = false;
  selectedEvent: EventModel | null = null;

  constructor(
    private eventService: EventService,
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.eventService.getEventsByUser().subscribe({
      next: (res) => (this.events = res),
      error: (err) => console.error(err),
    });
  }

  onMonthChange(newMonth: Date): void {
    this.currentMonth = newMonth;
  }

  onCreateEvent(): void {
    this.selectedEvent = null;
    this.showForm = true;
  }

  onEditEvent(event: EventModel): void {
    this.selectedEvent = event;
    this.showForm = true;
  }

  onDeleteEvent(id: string): void {
    if (confirm('Are you sure you want to delete this event?')) {
      this.eventService.deleteEvent(id).subscribe(() => this.loadEvents());
    }
  }

  onSubmitSuccess(): void {
    this.loadEvents();
    this.showForm = false;
  }

  onCreateEventForDay(day: Date): void {
    this.selectedEvent = {
      date_debut: day.toISOString(),
      date_fin: new Date(day.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour later
      participants: [],
      rappel: [],
      type_recurrence: 'none',
      isRecurring: false,
      status: 'En_attente',
      type: EventType.EVENEMENT,
      titre: 'Default Title',
    };
    this.showForm = true;
  }
}