export interface Task {
  _id?: string;
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Done';
  project: string;
  assignee?: any[];
  priority?: 'Lowest' | 'Low' | 'Medium' | 'High' | 'Highest' | 'Critical' | 'Blocker';
  dueDate?: Date;

}
