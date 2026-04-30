export type NotificationType = 
  | 'new_form' 
  | 'assignment' 
  | 'stage_change' 
  | 'new_comment' 
  | 'task_created' 
  | 'deal_won' 
  | 'deal_lost';

export interface CRMNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  dealId: string;
  dealTitle: string;
  structureId?: string;
  structureSlug?: string;
  userId: string; // Recipient user ID (or 'all' for system-wide)
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  read: boolean;
  createdAt: any; // Firestore Timestamp
}
