export interface Categorie {
    _id?: string;
    name: string;
    description?: string;
    image?: string;
    createdAt?: Date;
  }
  
  export interface Blog {
    _id?: string;
    title: string;
    content: string;
    categorie: string | Categorie;
    author: string;
 
  }