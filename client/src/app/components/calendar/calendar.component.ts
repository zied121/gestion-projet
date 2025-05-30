import { Component, OnInit } from '@angular/core';
import { EventService } from '../../services/event.service';
import { EventModel, EventType } from '../../models/event.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarHeaderComponent } from './calendar-header/calendar-header.component';
import { CalendarGridComponent } from './calendar-grid/calendar-grid.component';
import { EventFormDialogComponent } from './event-form-dialog/event-form-dialog.component';
import { ChatBotComponent } from './chat-bot/chat-bot.component';
import { MatDialog } from '@angular/material/dialog';
import { EventResponseComponent } from './event-response/event-response.component';

export type CalendarView = 'month' | 'week' | 'day';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalendarHeaderComponent,
    CalendarGridComponent,
    ChatBotComponent,
    EventFormDialogComponent
  ],
  templateUrl: './calendar.component.html',
})
export class CalendarComponent implements OnInit {
  events: EventModel[] = [];
  filteredEvents: EventModel[] = [];
  currentMonth = new Date();
  selectedTypes: string[] = [];
  selectedEvent: EventModel | null = null;
  showForm: boolean = false;
  
  // Nouvelle propriété pour la vue actuelle
  currentView: CalendarView = 'month';
  
  searchTitle = '';

  eventTypes = [
    { value: 'Réunion', label: 'Meeting' },
    { value: 'Tâche', label: 'Task' },
    { value: 'Deadline', label: 'Deadline' },
    { value: 'holiday', label: 'Holiday' },
    { value: 'Évenement', label: 'Event' }
  ];

  constructor(private eventService: EventService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadEvents();
  }
  
  loadEvents(): void {
    this.eventService.getEventsByUser().subscribe({
      next: (res) => {
        console.log('API Response:', res);
        this.events = Array.isArray(res) ? res : [];
        this.filteredEvents = [...this.events];
      },
      error: (err) => console.error('Error loading events:', err)
    });
  }

  // Nouvelle méthode pour changer la vue
  onViewChange(view: CalendarView): void {
    this.currentView = view;
  }

  applyFilters(): void {
    if (this.selectedTypes.length === 0 && !this.searchTitle) {
      this.filteredEvents = [...this.events];
      return;
    }

    this.eventService.searchEvents(this.selectedTypes, this.searchTitle).subscribe({
      next: (res) => {
        this.filteredEvents = res;
      },
      error: (err) => console.error(err)
    });
  }

  toggleTypeSelection(type: string): void {
    const index = this.selectedTypes.indexOf(type);
    if (index === -1) {
      this.selectedTypes.push(type);
    } else {
      this.selectedTypes.splice(index, 1);
    }
    this.applyFilters();
  }

  resetFilters(): void {
    this.selectedTypes = [];
    this.searchTitle = '';
    this.filteredEvents = [...this.events];
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
      date_fin: new Date(day.getTime() + 60 * 60 * 1000).toISOString(),
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

  getEventTypeLabel(typeValue: string): string {
    const type = this.eventTypes.find(t => t.value === typeValue);
    return type ? type.label : 'Unknown';
  }

  onParticipantResponse(event: EventModel): void {
    const dialogRef = this.dialog.open(EventResponseComponent, {
      width: '500px',
      data: {
        eventTitle: event.titre,
        eventDate: event.date_debut,
        responseStatus: this.getParticipantStatus(event)
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateParticipantResponse(event._id!, result.status, result.message);
      }
    });
  }

  private updateParticipantResponse(eventId: string, status: 'accepted' | 'declined', message?: string): void {
    const backendStatus = status === 'accepted' ? 'accepter' : 'refuser';
    
    const responseData = {
      response: backendStatus,
      message: message || ''
    };

    console.log('Sending to backend:', responseData);

    this.eventService.updateParticipantResponse(eventId, responseData).subscribe({
      next: () => {
        this.loadEvents();
      },
      error: (error) => {
        console.error('Error updating response:', error);
      }
    });
  }

  isOwnerEvent(event: EventModel): boolean {
    const userId = localStorage.getItem('userId');
    return event && event.organisateur_id?._id === userId;
  }

  getParticipantStatus(event: EventModel): 'accepted' | 'declined' | 'pending' | null {
    const userId = localStorage.getItem('userId');
    
    if (!userId || !event.participants || event.participants.length === 0) {
      return null;
    }

    const participant = event.participants.find(p => {
      if (!p || !p.participant_id) {
        return false;
      }

      if (typeof p.participant_id === 'string') {
        return p.participant_id === userId;
      } else if (p.participant_id && typeof p.participant_id === 'object') {
        return p.participant_id._id === userId;
      }
      
      return false;
    });

    if (!participant) return null;

    if (participant.accept) return 'accepted';
    if (participant.refuse) return 'declined';
    return 'pending';
  }
}