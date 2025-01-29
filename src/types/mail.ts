export interface Attachment {
  id: string;
  name?: string;
  size?: string;
  type: 'file' | 'image';
  url?: string;
}

export interface EmailParticipant {
  name: string;
  email: string;
  avatar: string | null;
}

export interface Email {
  id: string;
  attachments?: Attachment[];
  createdAt: number;
  folder: string;
  from: EmailParticipant;
  isImportant: boolean;
  isStarred: boolean;
  isUnread: boolean;
  labelIds: string[];
  message: string;
  subject: string;
  to: EmailParticipant[];
}

export type LabelType = 'system' | 'custom';

export interface Label {
  id: string;
  color?: string;
  name: string;
  totalCount?: number;
  type: LabelType;
  unreadCount?: number;
}
