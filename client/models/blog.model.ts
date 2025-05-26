

export interface Author {
  _id: string;
  username: string;
  email?: string;
}

export interface Comment {
  _id: string;
  author: Author | string;
  text: string;
  createdAt?: Date;
}

export interface Blog {
  _id: string;
  title: string;
  content: string;
  author: Author | string;
  createdAt: Date;
  updatedAt?: Date;
  tags: string[];
  comments: Comment[];
  likeCount: number;
  likes: string[];
  categorie?: any;
  imageUrl?: string; 
  isLiked?: boolean;
  
}

interface BlogCreateData {
  title: string;
  content: string;
  categorie: string;
  tags?: string[];
}