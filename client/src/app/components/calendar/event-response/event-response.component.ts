// event-response.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface EventResponseData {
  eventId?: string;
  eventTitle: string;
  eventDate: Date | string;
  responseStatus: 'accepted' | 'declined' | 'pending' | null;
  currentMessage?: string;
}

@Component({
  selector: 'app-event-response',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule],
  templateUrl: './event-response.component.html',
})
export class EventResponseComponent {
  message: string = '';
  selectedStatus: 'accepted' | 'declined' | 'pending' = 'pending';

  constructor(
    public dialogRef: MatDialogRef<EventResponseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EventResponseData
  ) {
    // Initialiser avec les valeurs actuelles
    this.selectedStatus = data.responseStatus || 'pending';
    this.message = data.currentMessage || '';
    
    // Debug pour vérifier le statut reçu
    console.log('Statut actuel reçu:', data.responseStatus);
    console.log('Message actuel:', data.currentMessage);
  }

  onAccept() {
    this.selectedStatus = 'accepted';
    this.dialogRef.close({
      status: 'accepted',
      message: this.message
    });
  }

  onDecline() {
    this.selectedStatus = 'declined';
    this.dialogRef.close({
      status: 'declined',
      message: this.message
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'accepted':
        return '✅';
      case 'declined':
        return '❌';
      default:
        return '📝';
    }
  }

  getStatusText(status: string | null): string {
    switch (status) {
      case 'accepted':
        return 'Invitation acceptée';
      case 'declined':
        return 'Invitation refusée';
      case 'pending':
      case null:
      default:
        return 'Votre réponse est attendue';
    }
  }
}