// Auteur d'un commentaire ou d'un blog
export interface Author {
  _id: string;
  username: string;
  email?: string; // optionnel si besoin
}

// Un commentaire associé à un blog
export interface Comment {
  _id: string;
  author: Author | string; // peut être juste un nom ou un objet complet
  text: string;
  createdAt?: Date;
  content: string;
}

// Blog principal
export interface Blog {
  _id: string;
  title: string;
  content: string;
  author: Author | string; // parfois on a juste un nom ou un id
  createdAt: Date;
  updatedAt: Date;
  comments: Comment[];
  likes: number;
  likedByUser: boolean;  

}
