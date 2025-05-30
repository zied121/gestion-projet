// calendar-grid.component.ts
import { Component, EventEmitter, Input, Output, OnInit, OnChanges } from '@angular/core';
import { EventModel } from '../../../models/event.model';
import { CommonModule } from '@angular/common';
import { CalendarBackofficeDetailComponent } from '../calendar-backoffice-detail/calendar-backoffice-detail.component';
import { EventService } from '../../../services/event.service';
import { MatDialog } from '@angular/material/dialog';
import { EventResponseComponent } from '../event-response/event-response.component';

export type CalendarView = 'month' | 'week' | 'day';


interface ParticipantStatus {
  statut: 'en_attente' | 'accepter' | 'refuser';
  message: string;
  participantDetails?: any;
}

@Component({
  selector: 'app-calendar-grid',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './calendar-grid.component.html',
})
export class CalendarGridComponent implements OnInit, OnChanges {
  @Input() currentMonth!: Date;
  @Input() currentView: CalendarView = 'month';
  @Input() events: EventModel[] = [];
  @Output() editEvent = new EventEmitter<EventModel>();
  @Output() deleteEvent = new EventEmitter<string>();
  @Output() createEventForDay = new EventEmitter<Date>();
  @Output() participantResponse = new EventEmitter<EventModel>();
  @Output() eventUpdated = new EventEmitter<void>();
  
  // Pour la vue mensuelle
  daysInMonth: Date[][] = [];
  
  // Pour la vue hebdomadaire
  weekDays: Date[] = [];
  timeSlots: string[] = [];
  
  // Pour la vue journalière
  currentDay!: Date;
  
  participantStatuses: Map<string, ParticipantStatus> = new Map();
  
  constructor(private eventService: EventService, private dialog: MatDialog) {
    this.generateTimeSlots();
  }
  
  ngOnInit(): void {
    this.loadParticipantStatuses();
    this.updateViewData();
  }

  ngOnChanges(): void {
    this.updateViewData();
    if (this.events.length > 0) {
      this.loadParticipantStatuses();
    }
  }

  private updateViewData(): void {
    switch (this.currentView) {
      case 'month':
        this.generateCalendar(this.currentMonth);
        break;
      case 'week':
        this.generateWeekDays(this.currentMonth);
        break;
      case 'day':
        this.currentDay = new Date(this.currentMonth);
        break;
    }
  }

  private generateTimeSlots(): void {
    this.timeSlots = [];
    for (let hour = 0; hour < 24; hour++) {
      const time = hour.toString().padStart(2, '0') + ':00';
      this.timeSlots.push(time);
    }
  }

  loadParticipantStatuses(): void {
    this.events.forEach(event => {
      if (!this.isOwnerEvent(event) && event._id) {
        this.eventService.getParticipantStatus(event._id).subscribe({
          next: (status: ParticipantStatus) => {
            this.participantStatuses.set(event._id!, status);
          },
          error: (error) => {
            console.error('Erreur lors du chargement du statut pour l\'événement', event._id, error);
            this.participantStatuses.set(event._id!, {
              statut: 'en_attente',
              message: '',
              participantDetails: null
            });
          }
        });
      }
    });
  }

  // Génération du calendrier mensuel
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

  // Géneration des jours de la semaine
  generateWeekDays(date: Date): void {
    const startOfWeek = this.getStartOfWeek(date);
    this.weekDays = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      this.weekDays.push(day);
    }
  }

  private getStartOfWeek(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day;
    return new Date(result.setDate(diff));
  }

  getEventsForDay(day: Date): EventModel[] {
    return this.events.filter((e) => new Date(e.date_debut).toDateString() === day.toDateString());
  }

  // Obtenir les événements pour un créneau horaire spécifique
  getEventsForTimeSlot(day: Date, timeSlot: string): EventModel[] {
    const dayEvents = this.getEventsForDay(day);
    const [hour] = timeSlot.split(':').map(Number);
    
    return dayEvents.filter(event => {
      const eventStart = new Date(event.date_debut);
      const eventHour = eventStart.getHours();
      return eventHour === hour;
    });
  }

  // Obtenir les événements pour la journée entière (vue day)
  getEventsForCurrentDay(): EventModel[] {
    return this.getEventsForDay(this.currentDay);
  }

  // Créer un événement pour un créneau horaire spécifique
  createEventForTimeSlot(day: Date, timeSlot: string): void {
    const [hour, minute] = timeSlot.split(':').map(Number);
    const eventDate = new Date(day);
    eventDate.setHours(hour, minute, 0, 0);
    
    this.createEventForDay.emit(eventDate);
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return today.toDateString() === date.toDateString();
  }

  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentMonth.getMonth();
  }

  // Nouvelle méthode pour vérifier si c'est l'heure actuelle
  isCurrentHour(day: Date, timeSlot: string): boolean {
    if (!this.isToday(day)) return false;
    
    const now = new Date();
    const [hour] = timeSlot.split(':').map(Number);
    return now.getHours() === hour;
  }

  // Nouvelle méthode pour obtenir la couleur selon le type d'événement
  getEventColor(eventType: string): string {
    const colors: { [key: string]: string } = {
      'Réunion': '#3B82F6',      // Blue
      'Tâche': '#10B981',        // Green
      'Deadline': '#EF4444',     // Red
      'holiday': '#F59E0B',      // Yellow
      'Évenement': '#8B5CF6'     // Purple
    };
    return colors[eventType] || '#6B7280'; // Gray par défaut
  }
  
  openEventDetails(event: any): void {
    this.dialog.open(CalendarBackofficeDetailComponent, {
      width: '500px',
      data: { event }
    });
  }

  isOwnerEvent(event: EventModel): boolean {
    const userId = localStorage.getItem('userId');
    return !!userId && !!event?.organisateur_id?._id && event.organisateur_id._id === userId;
  }

  getParticipantStatusFromMap(event: EventModel): ParticipantStatus | null {
    if (!event._id) return null;
    return this.participantStatuses.get(event._id) || null;
  }

  getParticipantStatus(event: EventModel): 'accepted' | 'declined' | 'pending' | null {
    const status = this.getParticipantStatusFromMap(event);
    if (!status) return null;
    
    switch(status.statut) {
      case 'accepter':
        return 'accepted';
      case 'refuser':
        return 'declined';
      case 'en_attente':
      default:
        return 'pending';
    }
  }

  hasParticipantMessage(event: EventModel): boolean {
    const status = this.getParticipantStatusFromMap(event);
    return !!status?.message;
  }

  getStatusTooltip(status: string | null): string {
    switch (status) {
      case 'accepted':
        return 'Vous avez accepté cet événement - Cliquez pour modifier';
      case 'declined':
        return 'Vous avez refusé cet événement - Cliquez pour modifier';
      case 'pending':
      default:
        return 'En attente de votre réponse - Cliquez pour répondre';
    }
  }

  getStatusIcon(status: string | null): string {
    switch (status) {
      case 'accepted':
        return '✅';
      case 'declined':
        return '❌';
      case 'pending':
      default:
        return '📅';
    }
  }

  openResponseDialog(event: EventModel): void {
    const currentStatus = this.getParticipantStatusFromMap(event);
    
    const dialogRef = this.dialog.open(EventResponseComponent, {
      width: '400px',
      data: {
        eventId: event._id,
        eventTitle: event.titre,
        eventDate: event.date_debut,
        responseStatus: this.getParticipantStatus(event),
        currentMessage: currentStatus?.message || ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.status) {
        this.updateParticipantStatus(event, result.status, result.message);
      }
    });
  }

  updateParticipantStatus(event: EventModel, status: 'accepted' | 'declined', message: string): void {
    const backendStatus = status === 'accepted' ? 'accepter' : 'refuser';
    
    const payload = {
      response: backendStatus,
      message: message
    };

    this.eventService.updateParticipantResponse(event._id!, payload).subscribe({
      next: () => {
        if (event._id) {
          this.participantStatuses.set(event._id, {
            statut: backendStatus as 'accepter' | 'refuser',
            message: message,
            participantDetails: this.participantStatuses.get(event._id)?.participantDetails || null
          });
        }
        
        this.participantResponse.emit(event);
        this.eventUpdated.emit();
      },
      error: (error) => {
        console.error('Error updating participant response', error);
      }
    });
  }

  // Méthodes utilitaires pour le formatage
  formatTime(date: string): string {
    return new Date(date).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  getDayName(date: Date): string {
    return date.toLocaleDateString('fr-FR', { weekday: 'short' });
  }

  getDayNumber(date: Date): number {
    return date.getDate();
  }

}