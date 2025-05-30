//calendar-backoffice-detail.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe, NgIf } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-calendar-backoffice-detail',
  templateUrl: './calendar-backoffice-detail.component.html',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogTitle,
    MatDialogActions,
    MatButtonModule,
    MatDialogClose,
    DatePipe,
    NgIf,
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatListModule,
    MatIconModule
  ],
  styleUrls: ['./calendar-backoffice-detail.component.css']
})
export class CalendarBackofficeDetailComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.normalizeParticipantsData();
  }

  /**
   * Normalise les données des participants pour une structure cohérente
   */
  private normalizeParticipantsData(): void {
    if (this.data?.event?.participants) {
      this.data.event.participants = this.data.event.participants.map((p: any) => {
        // Conversion depuis l'ancienne structure
        if (p.id && p.nom && p.email) {
          return {
            participant_id: {
              _id: p.id,
              nom: p.nom,
              email: p.email
            },
            accept: p.reponse === 'accepter',
            refuse: p.reponse === 'refuser',
            message: p.message
          };
        }
        return p;
      });
    }
  }

  /**
   * Formate l'affichage d'un participant
   */
  getParticipantDisplay(p: any): string {
    if (!p) return 'Participant inconnu';
    
    const participant = p.participant || p.participant_id || p;
    
    if (!participant) return 'Participant inconnu';

    // Si c'est une string (ID non peuplé)
    if (typeof participant === 'string') {
      return `Participant (ID: ${participant})`;
    }

    // Si c'est un objet peuplé
    const nom = participant.nom || '';
    const email = participant.email || '';
    
    return `${nom}${email ? ` <${email}>` : ''}`.trim() || 'Participant inconnu';
  }

  /**
   * Retourne le statut du participant avec une icône correspondante
   */
  getParticipantStatus(p: any): string {
    if (p?.accept || p?.reponse === 'accepter') return 'Accepté';
    if (p?.refuse || p?.reponse === 'refuser') return 'Refusé';
    return 'En attente';
  }
}