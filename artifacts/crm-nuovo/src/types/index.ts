export type UserRole = 'admin' | 'manager' | 'commerciale' | 'operatore' | 'viewer';

export interface Tenant {
  id: string;
  name: string;
  createdAt: any;
  plan: 'free' | 'pro' | 'enterprise';
}

export interface UserProfile {
  id: string;
  uid: string;
  tenantId: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface Pipeline {
  id: string;
  tenantId: string;
  name: string;
  stages: PipelineStage[];
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
  probability?: number;
}

export interface Lead {
  id: string;
  tenantId: string;
  title: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  emails: string[];
  phones: string[];
  whatsapp?: string;
  telegram?: string;
  website?: string;
  source?: string;
  campaign?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  value: number;
  currency: string;
  pipelineId: string;
  stageId: string;
  assignedTo?: string;
  probability?: number;
  status: 'active' | 'converted' | 'junk';
  tags: string[];
  notes: string;
  attachments: string[];
  createdAt: any;
  updatedAt: any;
  lastActivityAt?: any;
  nextActivityAt?: any;
}

export interface Deal {
  id: string;
  tenantId: string;
  title: string;
  pipelineId: string;
  stageId: string;
  value: number;
  currency: string;
  probability: number;
  assignedTo?: string;
  contactId?: string;
  companyId?: string;
  products: ProductItem[];
  discount: number;
  tax: number;
  total: number;
  closingDate?: any;
  tags: string[];
  notes: string;
  attachments: string[];
  createdAt: any;
  updatedAt: any;
}

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Contact {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  companyId?: string;
  role?: string;
  emails: string[];
  phones: string[];
  whatsapp?: string;
  telegram?: string;
  linkedin?: string;
  address?: string;
  tags: string[];
  notes: string;
  createdAt: any;
  updatedAt: any;
}

export interface Company {
  id: string;
  tenantId: string;
  name: string;
  industry?: string;
  employees?: number;
  revenue?: number;
  phone?: string;
  email?: string;
  website?: string;
  vatNumber?: string;
  address?: string;
  tags: string[];
  notes: string;
  createdAt: any;
  updatedAt: any;
}

export interface Task {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  assignedTo: string;
  collaborators: string[];
  checklist: ChecklistItem[];
  subtasks: string[]; // IDs of subtasks
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: any;
  status: 'pending' | 'in-progress' | 'completed' | 'deferred';
  attachments: string[];
  comments: TaskComment[];
  creatorId: string;
  createdAt: any;
  updatedAt: any;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  userId: string;
  text: string;
  createdAt: any;
}

export interface Activity {
  id: string;
  tenantId: string;
  type: 'call' | 'email' | 'meeting' | 'task' | 'note';
  title: string;
  description: string;
  date: any;
  duration?: number; // in minutes
  assignedTo: string;
  status: 'planned' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  relatedTo: 'lead' | 'deal' | 'contact' | 'company';
  relatedId: string;
  createdAt: any;
}

export interface Message {
  id: string;
  tenantId: string;
  channelId: string;
  senderId: string;
  senderName?: string;
  senderPhoto?: string;
  content: string;
  createdAt: any;
}

export interface Automation {
  id: string;
  tenantId: string;
  name: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  active: boolean;
}

export interface Post {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  type: 'announcement' | 'question' | 'update' | 'poll';
  likes: string[]; // array of user IDs
  comments: PostComment[];
  createdAt: any;
}

export interface PostComment {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  createdAt: any;
}

export interface AutomationTrigger {
  type: 'lead_created' | 'deal_created' | 'stage_changed' | 'inactivity' | 'date_reached' | 'field_updated' | 'activity_completed';
  config: any;
}

export interface AutomationAction {
  type: 'create_task' | 'send_email' | 'notify' | 'assign_user' | 'change_stage' | 'update_field' | 'delay' | 'webhook';
  config: any;
}

export interface NexusClient {
  id: string;
  tenantId: string;
  name: string;
  code?: string;
  status?: string;
  createdAt: any;
}

export interface NexusRecord {
  id: string;
  tenantId: string;
  clientId: string;
  title: string;
  description?: string;
  value?: number;
  status?: string;
  date?: any;
  createdAt: any;
}

export interface Quote {
  id: string;
  tenantId: string;
  cliente_id: string;
  azienda_id?: string;
  deal_id?: string;
  titolo: string;
  descrizione?: string;
  stato: 'bozza' | 'inviato' | 'accettato' | 'rifiutato';
  totale: number;
  valuta: string;
  data_creazione: any;
  data_scadenza?: any;
  prodotti: QuoteItem[];
  servizi: QuoteItem[];
  note?: string;
  termini_pagamento?: string;
  iban?: string;
  validita?: string;
  allegati: string[];
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  price: number;
  discount: number;
  tax: number;
  total: number;
}

// --- Social Media Types (Skyline Social) ---

export type PostType = 'text' | 'image' | 'video' | 'poll' | 'ad';

export interface SocialUser {
  uid: string;
  username: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: any;
}

export interface SocialPost {
  id: string;
  userId: string;
  username: string;
  userPhoto?: string;
  type: PostType;
  content?: string;
  mediaUrls?: string[];
  link?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: any;
  isPinned?: boolean;
  isSponsored?: boolean;
  pollId?: string;
  pollData?: SocialPoll;
  score?: number;
}

export interface SocialPoll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  expiresAt: any;
  createdBy: string;
  userVotedId?: string; // ID of the option the current user voted for
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface SocialComment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  userPhoto?: string;
  text: string;
  parentId?: string; // For replies
  likesCount: number;
  createdAt: any;
  replies?: SocialComment[];
}

export interface SocialNotification {
  id: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  type: 'like' | 'comment' | 'reply' | 'follow' | 'poll_vote' | 'ad_update';
  targetId: string; // ID of post, comment, etc.
  isRead: boolean;
  createdAt: any;
}

export interface FeedPost {
  id: string;
  tenantId: string;
  authorId: string;
  authorName?: string;
  authorPhoto?: string;
  content: string;
  contentHtml?: string;
  type: 'post' | 'task' | 'crm_activity' | 'deal_update' | 'lead_created' | 'system' | 'announcement';
  entityType?: string;
  entityId?: string;
  mentions?: string[];
  attachments?: FeedAttachment[];
  reactions?: Record<string, string[]>; // emoji -> userIds
  likesCount: number;
  commentsCount: number;
  isPinned: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface FeedComment {
  id: string;
  postId: string;
  authorId: string;
  authorName?: string;
  authorPhoto?: string;
  content: string;
  contentHtml?: string;
  parentId?: string;
  mentions?: string[];
  createdAt: any;
  likesCount?: number;
}

export interface FeedAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface FeedItem {
  id: string;
  type: 'post' | 'ad' | 'poll' | 'suggested';
  data: any;
}
