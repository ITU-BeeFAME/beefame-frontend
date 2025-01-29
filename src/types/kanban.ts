export interface Attachment {
  id: string;
  type: 'image' | 'file';
  url: string;
}

export interface CheckItem {
  id: string;
  name: string;
  state: 'incomplete' | 'complete';
}

export interface Checklist {
  id: string;
  checkItems: CheckItem[];
  name: string;
}

export interface Comment {
  id: string;
  authorId: string;
  createdAt: number;
  message: string;
}

export interface Task {
  id: string;
  assigneesIds: string[];
  attachments: Attachment[];
  authorId: string;
  checklists: Checklist[];
  columnId: string;
  comments: Comment[];
  description: string | null;
  due: number | null;
  isSubscribed: boolean;
  labels: string[];
  name: string;
}

export interface Column {
  id: string;
  taskIds: string[];
  name: string;
}

export interface Member {
  id: string;
  avatar: string | null;
  name: string;
}

export interface Board {
  members: Member[];
  columns: Column[];
  tasks: Task[];
}
