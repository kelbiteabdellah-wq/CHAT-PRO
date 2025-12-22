
export type MessageType = 'text' | 'image' | 'video' | 'file';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  status: string;
  isTyping?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  type: MessageType;
  fileName?: string;
  replyTo?: string; 
  liked?: boolean;
}

export interface UnreadState {
  [userId: string]: number;
}
