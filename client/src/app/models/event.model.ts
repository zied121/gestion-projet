 import { ParticipantModel } from './participant.model';
export interface EventModel {
    _id?: string;
    type: 'Évenement' | 'Réunion' | 'Tâche' | 'Deadline' | 'Holiday';
    titre: string;
    description?: string;
    date_debut: string;
    date_fin: string;
    emplacement?: string;
    lien?: string;
    organisateur_id?: {
      _id: string;
      nom: string;
      prenom: string;
      email: string;
    };
    projet_id?: string;
    isRecurring?: boolean;
    type_recurrence?: 'daily' | 'weekly' | 'monthly' | 'personnalise' | 'none';
    rappel?: { time: number; unit: 'minutes' | 'hours' | 'days'; sent: boolean }[];
    status?: string;
    file?: string;
    participants?: ParticipantModel[];
    updatedAt?: string;
    createdAt?: string;
  }
  