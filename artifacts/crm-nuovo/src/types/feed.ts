export type FeedPostType = 'message' | 'task' | 'event' | 'poll' | 'file' | 'other' | 'crm_activity';

export interface FeedPost {
  id: string;
  tenant_id?: string;
  author_id: string;
  author_name?: string;
  author_photo?: string;
  type: FeedPostType;
  content: string;
  content_html?: string;
  targets: string[]; // ['all', 'user_id_1', etc.]
  entity_type?: string;
  entity_id?: string;
  attachments?: FeedAttachment[];
  task?: FeedTaskData;
  event?: FeedEventData;
  poll?: FeedPollData;
  metadata?: any;
  reactions: FeedReaction[];
  comments_count: number;
  is_pinned: boolean;
  created_at: string;
}

export interface FeedAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface FeedTaskData {
  title: string;
  responsible_id: string;
  participants?: string[];
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  checklist?: { id: string; text: string; completed: boolean }[];
  crm_entity?: { type: string; id: string; name: string };
}

export interface FeedEventData {
  title: string;
  start_date: string;
  end_date: string;
  location?: string;
  attendees?: string[];
}

export interface FeedPollData {
  question: string;
  options: { id: string; text: string; votes: number }[];
  is_anonymous: boolean;
  expires_at?: string;
  user_voted_id?: string;
}

export interface FeedComment {
  id: string;
  post_id: string;
  author_id: string;
  author_name?: string;
  author_photo?: string;
  content: string;
  parent_id?: string; // For nested comments
  created_at: string;
  replies?: FeedComment[];
}

export interface FeedReaction {
  id: string;
  post_id: string;
  user_id: string;
  emoji: string;
}
