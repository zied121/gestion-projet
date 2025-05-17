export interface ParticipantModel {
    id: string;
    nom: string;
    email: string;
    reponse: 'accepter' | 'refuser' | 'en_attente';
  }
  