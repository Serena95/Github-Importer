export const CRM_STRUCTURES = [
  { name: 'Leads', slug: 'leads', color: '#6133FF' },
  { name: 'Finanza agevolata', slug: 'finanza-agevolata', color: '#2FC6F6' },
  { name: 'Servizi digitali', slug: 'servizi-digitali', color: '#FF5722' },
  { name: 'Consulenze', slug: 'consulenze', color: '#4CAF50' },
  { name: 'Economie', slug: 'economie', color: '#9C27B0' },
  { name: 'Organizzazione eventi', slug: 'organizzazione-eventi', color: '#E91E63' },
  { name: 'Prodotti e servizi', slug: 'prodotti-e-servizi', color: '#795548' },
  { name: 'Formazione', slug: 'formazione', color: '#FFC107' },
  { name: 'Coworking', slug: 'coworking', color: '#607D8B' },
  { name: 'Prenotazione online', slug: 'prenotazione-online', color: '#3F51B5' },
];

export const LEADS_STAGES = [
  { name: 'Nuovo Lead', position: 1, is_won: false, is_lost: false, color: '#f1f5f9' },
  { name: 'Contattato', position: 2, is_won: false, is_lost: false, color: '#e0f2fe' },
  { name: 'In Qualifica', position: 3, is_won: false, is_lost: false, color: '#fef3c7' },
  { name: 'Qualificato', position: 4, is_won: true, is_lost: false, color: '#dcfce7' },
  { name: 'Lead Perso', position: 5, is_won: false, is_lost: true, color: '#fee2e2' },
];

export const CRM_PIPELINE_STAGES = [
  { name: 'Form preanalisi', position: 1, is_won: false, is_lost: false, color: '#f1f5f9' },
  { name: 'Non ha risposto', position: 2, is_won: false, is_lost: false, color: '#fee2e2' },
  { name: 'Verifica telefonica', position: 3, is_won: false, is_lost: false, color: '#e0f2fe' },
  { name: 'Verifica requisiti', position: 4, is_won: false, is_lost: false, color: '#fef3c7' },
  { name: 'Invio piano d\'investimento', position: 5, is_won: false, is_lost: false, color: '#f0fdf4' },
  { name: 'Invio call fattibilità', position: 6, is_won: false, is_lost: false, color: '#ecfeff' },
  { name: 'Call effettuata', position: 7, is_won: false, is_lost: false, color: '#fdf4ff' },
  { name: 'Invio preventivo', position: 8, is_won: false, is_lost: false, color: '#e0f2fe' },
  { name: 'Contratto', position: 9, is_won: false, is_lost: false, color: '#f5f3ff' },
  { name: 'Pagamento', position: 10, is_won: false, is_lost: false, color: '#eff6ff' },
  { name: 'Si fa sentire il cliente', position: 11, is_won: false, is_lost: false, color: '#fff7ed' },
  { name: 'In attesa di definire il progetto', position: 12, is_won: false, is_lost: false, color: '#f8fafc' },
  { name: 'Affare vinto', position: 13, is_won: true, is_lost: false, color: '#dcfce7' },
  { name: 'Affare perso', position: 14, is_won: false, is_lost: true, color: '#fee2e2' },
];

export const CRM_PIPELINES = CRM_STRUCTURES.map(s => ({
  id: s.slug.toUpperCase().replace(/-/g, '_'),
  name: s.name,
  color: s.color
}));

export const DEFAULT_STAGES = CRM_PIPELINE_STAGES.map(s => ({
  id: s.name.toLowerCase().replace(/\s+/g, '-'),
  name: s.name,
  color: s.color
}));

export const CRM_USERS = [
  { id: 'user-1', name: 'Marco Rossini', role: 'commerciale', team: 'Sales Team', email: 'marco@nexus.it', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marco' },
  { id: 'user-2', name: 'Laura Bianchi', role: 'commerciale', team: 'Sales Team', email: 'laura@nexus.it', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura' },
  { id: 'user-3', name: 'Giuseppe Verdi', role: 'consulente', team: 'Consulting', email: 'giuseppe@nexus.it', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Giuseppe' },
  { id: 'user-4', name: 'Elena Neri', role: 'consulente', team: 'Consulting', email: 'elena@nexus.it', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' },
  { id: 'user-5', name: 'Nexus AI Bot', role: 'admin', team: 'Nexus System', email: 'bot@nexus.it', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zap' },
];

export const CRM_TEAMS = ['Sales Team', 'Consulting', 'Nexus System', 'Management'];
