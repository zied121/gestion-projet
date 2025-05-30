export interface Feedback {
  _id?: string;
  blog: string; // ID du blog
  user: {
    _id: string;
    username: string;
  };
  comment: string;
  createdAt?: Date;
}