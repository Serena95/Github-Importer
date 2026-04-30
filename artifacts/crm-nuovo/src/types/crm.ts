export interface CRMWorkspace {
  id: string;
  name: string;
  owner_id: string;
  logo_url?: string;
  settings: {
    currency: string;
    timezone: string;
    primary_color?: string;
  };
  created_at: string;
}

export interface CRMActivity {
  id: string;
  entity_id: string;
  entity_type: 'contact' | 'company' | 'deal';
  type: 'note' | 'call' | 'email' | 'meeting' | 'system';
  title: string;
  description: string;
  author_name: string;
  created_at: string;
}

export interface CRMWorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  user_email?: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

export interface CRMStructure {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  color: string;
  created_at: string;
}

export interface CRMStage {
  id: string;
  structure_id: string | null; // null if it's a shared stage
  name: string;
  position: number;
  is_won: boolean;
  is_lost: boolean;
  color?: string;
  has_automations?: boolean;
}

export type CRMAutomationType = 'task' | 'email' | 'assignee' | 'note' | 'webhook' | 'notification' | 'timer' | 'whatsapp' | 'wait' | 'change_stage';

export type CRMAutomationTriggerType = 
  | 'stage_changed' 
  | 'deal_created' 
  | 'timer' 
  | 'field_updated' 
  | 'quote_accepted';

export interface CRMAutomationAction {
  id: string;
  type: CRMAutomationType;
  config: {
    title?: string;
    description?: string;
    recipient?: string;
    subject?: string;
    body?: string;
    assignee_id?: string;
    url?: string;
    delay_minutes?: number;
    message?: string;
    wait_duration?: number;
    wait_unit?: 'minutes' | 'hours' | 'days';
    content?: string;
    stage_id?: string;
  };
}

export type CRMCustomFieldType = 
  | 'text' 
  | 'number' 
  | 'select' 
  | 'multi_select' 
  | 'date' 
  | 'checkbox' 
  | 'url' 
  | 'email' 
  | 'phone' 
  | 'currency' 
  | 'textarea';

export interface SmartProcess {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  created_at: string;
}

export interface SmartRecord {
  id: string;
  process_id: string;
  stage_id: string;
  title: string;
  content: string;
  value: number;
  assigned_to?: string;
  contact_id?: string;
  company_id?: string;
  custom_fields: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SmartFieldDefinition {
  id: string;
  process_id: string;
  name: string;
  label: string;
  type: CRMCustomFieldType;
  options?: string[];
  required: boolean;
  show_in_kanban: boolean;
  order: number;
}

export interface CRMCustomFieldDefinition {
  id: string;
  tenant_id: string;
  entity_type: 'deal' | 'contact' | 'company' | 'lead';
  name: string;
  label: string;
  type: CRMCustomFieldType;
  options?: string[]; // For select/multi_select
  required: boolean;
  show_in_kanban: boolean;
  show_in_list: boolean;
  order: number;
  created_at: string;
}

export interface CRMAutomation {
  id: string;
  workspace_id: string;
  pipeline_id: string;
  stage_id: string;
  name: string;
  trigger: {
    type: CRMAutomationTriggerType;
    config: any;
  };
  actions: CRMAutomationAction[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

import { UserRole } from './index';

export interface CRMUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  team?: string;
}

export interface CRMDeal {
  id: string;
  workspace_id: string;
  structure_id: string;
  stage_id: string;
  title: string;
  company: string;
  company_id?: string;
  contact: string;
  contact_id?: string;
  phone: string;
  email: string;
  value: number;
  assigned_to: string; // Responsible User ID or Name
  assistants?: string[]; // Array of User IDs
  team?: string;
  preanalysis_result: PreanalysisResult | null;
  custom_fields: Record<string, any>;
  form_source?: string;
  created_at: string;
  updated_at?: string;
}

export interface PreanalysisResult {
  score: number;
  result: string;
  company_data: {
    name: string;
    vat?: string;
    industry?: string;
    size?: string;
    email?: string;
    phone?: string;
  };
  contact_data: {
    name: string;
    phone: string;
    email: string;
  };
  request_type: string;
  budget: number;
  service_requested: string;
  notes: string;
  estimated_amount: number;
  auto_notes: string[];
  submission_date: string;
}

export interface CRMFormResult {
  id: string;
  structure_slug: string;
  form_url: string;
  payload: Record<string, any>;
  score: number;
  result: string;
  created_at: string;
}

export type WhatsAppMessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface WhatsAppMessage {
  id: string;
  deal_id: string;
  sender_id: string;
  sender_name: string;
  recipient_phone: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'document' | 'template';
  file_url?: string;
  file_name?: string;
  status: WhatsAppMessageStatus;
  template_id?: string;
  created_at: string;
  delivered_at?: string;
  read_at?: string;
  error?: string;
  direction: 'inbound' | 'outbound';
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: string;
  language: string;
  body: string;
  header?: string;
  footer?: string;
  components?: any[];
  status: 'approved' | 'pending' | 'rejected';
  created_at: string;
}

export type CalendarEventType = 'call' | 'meeting' | 'task' | 'followup' | 'deadline';

export interface CRMCalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  start_date: string;
  end_date: string;
  deal_id?: string;
  deal_title?: string;
  assigned_to: string;
  assigned_to_name?: string;
  description?: string;
  location?: string;
  is_all_day?: boolean;
  status: 'scheduled' | 'completed' | 'cancelled';
  sync_id?: string;
  sync_provider?: 'google' | 'outlook';
  created_at: string;
  updated_at: string;
}

export interface CRMFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  path: string;
  related_to_id: string;
  related_to_type: 'deal' | 'contact' | 'company';
  uploaded_by: string;
  uploaded_by_name?: string;
  created_at: string;
  category?: 'contract' | 'quote' | 'invoice' | 'document' | 'other';
}

export interface ClientPortalAccess {
  id: string;
  deal_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export type SignatureStatus = 'draft' | 'sent' | 'signed' | 'rejected';
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected';

export interface CRMProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  created_at: string;
}

export interface QuoteItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  tax_rate: number;
  total: number;
}

export interface CRMQuote {
  id: string;
  deal_id: string;
  title: string;
  items: QuoteItem[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: QuoteStatus;
  valid_until?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CRMSignature {
  id: string;
  deal_id: string;
  document_name: string;
  document_url: string;
  status: SignatureStatus;
  requested_at: string;
  signed_at?: string;
  signature_data_url?: string; // Base64 of the signature
  client_email?: string;
  client_name?: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface CRMTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  assigned_to: string;
  assigned_to_name?: string;
  related_to_id: string; // Deal, Contact, or Company ID
  related_to_type: 'deal' | 'contact' | 'company';
  related_to_name?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  completed_at?: string;
}

export interface CRMContact {
  id: string;
  workspace_id: string;
  name: string;
  email: string;
  phone: string;
  company_id?: string;
  company_name?: string;
  position?: string;
  source?: string;
  assigned_to: string;
  status: 'lead' | 'customer' | 'prospect';
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CRMCompany {
  id: string;
  workspace_id: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  size?: string;
  address?: string;
  vat?: string;
  assigned_to: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}
