import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EventService } from '../../../services/event.service';
import { CalendarBackofficeDetailComponent } from '../calendar-backoffice-detail/calendar-backoffice-detail.component';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable
} from '@angular/material/table';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {NgForOf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {EventFormDialogComponent} from '../event-form-dialog/event-form-dialog.component';

@Component({
  selector: 'app-calendar-backoffice',
  templateUrl: './calendar-backoffice.component.html',
  imports: [
    // MatColumnDef,
    // MatButton,
    // MatTable,
    // MatHeaderCell,
    // MatCell,
    // MatCellDef,
    // MatHeaderRow,
    // MatHeaderCellDef,
    // MatRow,
    // MatRowDef,
    // MatHeaderRowDef,
    // MatIconButton,
    // MatIcon,
    NgForOf,
    FormsModule
  ],
  styleUrls: ['./calendar-backoffice.component.css']
})
export class CalendarBackofficeComponent implements OnInit {
  events: any[] = [];
  eventTypes = ['Évenement', 'Réunion', 'Tâche', 'Deadline', 'Holiday']
  selectedType = '';
  filteredEvents:any = [];
  constructor(private eventService: EventService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.eventService.getAllEvents().subscribe((data) => {
      this.events = data;
      this.filterEventsByType();
    });
  }

  openAddEventModal(): void {
    const dialogRef = this.dialog.open(EventFormDialogComponent, {
      width: '500px',
      data: { mode: 'add' }
    });

    dialogRef.afterClosed().subscribe(() => this.loadEvents());
  }

openEditEventModal(event: any): void {
  const dialogRef = this.dialog.open(EventFormDialogComponent, {
    width: '500px',
    data: { mode: 'edit', event }
  });

  dialogRef.afterClosed().subscribe(() => this.loadEvents());
}

  openEventDetails(event: any): void {
    this.dialog.open(CalendarBackofficeDetailComponent, {
      width: '500px',
      data: { event }
    });
  }

  deleteEvent(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      this.eventService.deleteEvent(id).subscribe(() => this.loadEvents());
    }
  }

  filterEventsByType() {
    if (!this.selectedType) {
      this.filteredEvents = this.events;
    } else {
      this.filteredEvents = this.events.filter(event => event.type === this.selectedType);
    }
  }

}
