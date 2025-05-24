
export enum EventType {
    EVENEMENT = 'Évenement',
    REUNION = 'Réunion',
    TACHE = 'Tâche',
    DEADLINE = 'Deadline',
    HOLIDAY = 'Holiday',
}

export interface EventModel {
    _id?: string;
    type: EventType;
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
    participants?: {
      participant_id: string;
      accept: boolean;
      refuse: boolean;
      message?: string;
    }[];
    updatedAt?: string;
    createdAt?: string;
  }

  export interface CreateEventModel {
    _id?: string;
    type: 'Évenement' | 'Réunion' | 'Tâche' | 'Deadline' | 'Holiday';
    titre: string;
    description?: string;
    date_debut: string;
    date_fin: string;
    emplacement?: string;
    lien?: string;
    projet_id?: string;
    isRecurring?: boolean;
    type_recurrence?: 'daily' | 'weekly' | 'monthly' | 'personnalise' | 'none';
    rappel?: { time: number; unit: 'minutes' | 'hours' | 'days'; sent: boolean }[];
    status?: string;
    file?: string;
    participants?: string[];
  }

  export interface UpdateEventModel {
    _id: string;
    type?: EventType;
    titre?: string;
    description?: string;
    date_debut?: string;
    date_fin?: string;
    emplacement?: string;
    lien?: string;
    projet_id?: string;
    isRecurring?: boolean;
    type_recurrence?: 'daily' | 'weekly' | 'monthly' | 'personnalise' | 'none';
    rappel?: { time: number; unit: 'minutes' | 'hours' | 'days'; sent: boolean }[];
    status?: string;
    file?: string;
    participants?: string[] | {  
        participant_id: string;
        accept: boolean;
        refuse: boolean;
        message?: string;
    }[];
}

  