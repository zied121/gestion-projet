export interface User {
  _id?: string;
  nom: string;
  email: string;
  role: string;
  motDePasse?: string;
  teams: string[];
  Status?: string;
  image?: string;
}
