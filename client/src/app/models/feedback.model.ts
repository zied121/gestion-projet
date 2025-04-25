import { Author } from './blog.model'; 

export interface Feedback {
  id?: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
  author?: Author | string; // Optionnel si tu veux lier le feedback à un utilisateur
  blogId?: string; // Si le feedback est lié à un blog spécifique
  rating?: number; // Si tu veux noter le blog (ex: 1 à 5 étoiles)
}
