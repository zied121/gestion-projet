export interface Project {
  _id?: string;
  name: string;
  description: string;
  owner: string;
  members: any[];
  tasks: string[];
  start_date: Date;
  end_date: Date;
  tags: string[];
  status: string;
}
