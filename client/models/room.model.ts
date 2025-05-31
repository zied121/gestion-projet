export interface Room {
  name: string;
  image?: string;
  owner?: {
    _id: string;
    nom: string;
  };
  projectID?: string;
  members?: string[];
  project?: {
    _id: string;
    name: string;
  };
}
