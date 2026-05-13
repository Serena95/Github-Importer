import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Grid, Store, Layers, Plus, Search, Star, Download, ExternalLink,
  Check, X, Settings, Zap, ChevronRight, Globe, Mail, Calendar,
  Slack, BarChart2, Shield, Smartphone, MessageSquare, CreditCard,
  RefreshCw, ToggleLeft, ToggleRight, AlertCircle, Package,
  Code, ArrowUpRight, Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
type Section = 'marketplace' | 'installed' | 'integrations' | 'developer';

const PATH_MAP: Record<string, Section> = {
  '/apps':                'marketplace',
  '/apps/marketplace':    'marketplace',
  '/apps/installed':      'installed',
  '/apps/integrations':   'integrations',
  '/apps/developer':      'developer',
};

type AppCategory = 'Tutti' | 'CRM' | 'Comunicazione' | 'Pagamenti' | 'Produttività' | 'Marketing' | 'Analytics' | 'Sicurezza';

interface AppDef {
  id: string;
  name: string;
  provider: string;
  description: string;
  category: Exclude<AppCategory, 'Tutti'>;
  rating: number;
  installs: string;
  icon: string;
  color: string;
  installed: boolean;
  featured?: boolean;
  free?: boolean;
  price?: string;
  badge?: string;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  connected: boolean;
  category: string;
  scopes?: string[];
  lastSync?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const INITIAL_APPS: AppDef[] = [
  // Installed
  { id: 'google-calendar', name: 'Google Calendar Sync', provider: 'Google', description: 'Sincronizza eventi, riunioni e promemoria con il tuo Google Calendar.', category: 'Produttività', rating: 4.8, installs: '50k+', icon: '📅', color: 'bg-blue-50', installed: true, free: true },
  { id: 'zoom', name: 'Zoom Video Meetings', provider: 'Zoom Video', description: 'Avvia e pianifica videochiamate Zoom direttamente dai tuoi deal e contatti.', category: 'Comunicazione', rating: 4.5, installs: '120k+', icon: '🎥', color: 'bg-sky-50', installed: true, free: false, price: '9€/mese' },
  { id: 'stripe', name: 'Stripe Payments', provider: 'Stripe', description: 'Accetta pagamenti, gestisci fatture e monitora incassi collegati ai deal.', category: 'Pagamenti', rating: 4.9, installs: '30k+', icon: '💳', color: 'bg-purple-50', installed: true, free: false, price: '0% + Stripe fee', badge: 'Consigliato' },
  { id: 'gemini-ai', name: 'Gemini AI CoPilot', provider: 'Google · Nexus', description: 'Assistente AI integrato per riassumere, scrivere email e fare lead scoring.', category: 'CRM', rating: 4.9, installs: '8k+', icon: '✨', color: 'bg-violet-50', installed: true, free: true, badge: 'Built-in', featured: true },
  // Marketplace
  { id: 'slack', name: 'Slack Notifiche', provider: 'Slack', description: 'Ricevi notifiche CRM su canali Slack: nuovi lead, deal chiusi, task assegnati.', category: 'Comunicazione', rating: 4.7, installs: '85k+', icon: '💬', color: 'bg-yellow-50', installed: false, free: true },
  { id: 'mailchimp', name: 'Mailchimp Email', provider: 'Mailchimp', description: 'Sincronizza contatti e liste, lancia campagne email dai segmenti CRM.', category: 'Marketing', rating: 4.4, installs: '60k+', icon: '📧', color: 'bg-amber-50', installed: false, free: true },
  { id: 'hubspot', name: 'HubSpot Bridge', provider: 'HubSpot', description: 'Importa lead e contatti da HubSpot e mantieni i dati sincronizzati.', category: 'CRM', rating: 4.2, installs: '15k+', icon: '🔶', color: 'bg-orange-50', installed: false, free: false, price: '19€/mese' },
  { id: 'zapier', name: 'Zapier Automation', provider: 'Zapier', description: 'Connetti Nexus CRM con 5000+ app tramite Zap senza scrivere codice.', category: 'Produttività', rating: 4.6, installs: '200k+', icon: '⚡', color: 'bg-amber-50', installed: false, free: false, price: '29€/mese', badge: 'Popolare' },
  { id: 'twilio', name: 'Twilio VoIP', provider: 'Twilio', description: 'Effettua e ricevi chiamate VoIP dal CRM con registrazione automatica.', category: 'Comunicazione', rating: 4.3, installs: '22k+', icon: '📞', color: 'bg-red-50', installed: false, free: false, price: 'Pay-per-use' },
  { id: 'google-analytics', name: 'Google Analytics', provider: 'Google', description: 'Collega le sorgenti di traffico ai lead per tracciare il ROI delle campagne.', category: 'Analytics', rating: 4.5, installs: '40k+', icon: '📊', color: 'bg-orange-50', installed: false, free: true },
  { id: 'docusign', name: 'DocuSign Firma', provider: 'DocuSign', description: 'Invia documenti da firmare elettronicamente direttamente dai deal.', category: 'Produttività', rating: 4.7, installs: '18k+', icon: '✍️', color: 'bg-blue-50', installed: false, free: false, price: '25€/mese', badge: 'Nuovo' },
  { id: 'typeform', name: 'Typeform Lead Capture', provider: 'Typeform', description: 'Crea form di lead capture e importa risposte automaticamente nel CRM.', category: 'Marketing', rating: 4.5, installs: '35k+', icon: '📋', color: 'bg-pink-50', installed: false, free: true },
  { id: '2fa', name: 'Autenticazione 2FA', provider: 'Nexus Security', description: 'Aggiungi un secondo fattore di autenticazione TOTP/SMS al tuo workspace.', category: 'Sicurezza', rating: 4.8, installs: '25k+', icon: '🔒', color: 'bg-emerald-50', installed: false, free: true },
  { id: 'powerbi', name: 'Power BI Reports', provider: 'Microsoft', description: 'Esporta dati CRM in Power BI per report avanzati e dashboard executive.', category: 'Analytics', rating: 4.4, installs: '12k+', icon: '📈', color: 'bg-yellow-50', installed: false, free: false, price: '15€/mese' },
  { id: 'whatsapp-business', name: 'WhatsApp Business API', provider: 'Meta', description: 'API WhatsApp Business ufficiale con template approvati e inbox condivisa.', category: 'Comunicazione', rating: 4.6, installs: '45k+', icon: '💚', color: 'bg-emerald-50', installed: false, free: false, price: 'Pay-per-message', badge: 'Popolare' },
];

const INITIAL_INTEGRATIONS: Integration[] = [
  { id: 'google-workspace', name: 'Google Workspace', description: 'Gmail, Calendar, Drive e Meet integrati nel CRM', icon: '🌐', color: 'bg-blue-50', connected: true, category: 'Produttività', scopes: ['Gmail', 'Calendar', 'Drive'], lastSync: '5 min fa' },
  { id: 'microsoft-365', name: 'Microsoft 365', description: 'Outlook, Teams, OneDrive e SharePoint', icon: '🪟', color: 'bg-sky-50', connected: false, category: 'Produttività' },
  { id: 'stripe-connect', name: 'Stripe', description: 'Pagamenti, fatture, abbonamenti e webhook', icon: '💳', color: 'bg-purple-50', connected: true, category: 'Pagamenti', scopes: ['Pagamenti', 'Fatture', 'Clienti'], lastSync: '1 ora fa' },
  { id: 'slack-connect', name: 'Slack', description: 'Notifiche real-time su canali e DM', icon: '💬', color: 'bg-yellow-50', connected: false, category: 'Comunicazione' },
  { id: 'zapier-connect', name: 'Zapier', description: 'Automazioni con 5000+ applicazioni', icon: '⚡', color: 'bg-amber-50', connected: false, category: 'Automazione' },
  { id: 'mailchimp-connect', name: 'Mailchimp', description: 'Campagne email e gestione liste', icon: '📧', color: 'bg-amber-50', connected: true, category: 'Marketing', scopes: ['Liste', 'Campagne'], lastSync: '3 ore fa' },
  { id: 'hubspot-connect', name: 'HubSpot', description: 'Sincronizzazione bidirezionale contatti e deal', icon: '🔶', color: 'bg-orange-50', connected: false, category: 'CRM' },
  { id: 'twilio-connect', name: 'Twilio', description: 'SMS, chiamate VoIP e WhatsApp API', icon: '📱', color: 'bg-red-50', connected: false, category: 'Comunicazione' },
  { id: 'firebase-connect', name: 'Firebase', description: 'Database real-time e autenticazione', icon: '🔥', color: 'bg-amber-50', connected: true, category: 'Infrastruttura', scopes: ['Firestore', 'Auth'], lastSync: 'Attivo' },
  { id: 'gemini-connect', name: 'Google Gemini AI', description: 'Modelli AI per CoPilot e lead scoring', icon: '✨', color: 'bg-violet-50', connected: true, category: 'AI', scopes: ['gemini-2.5-flash'], lastSync: 'Attivo' },
];

// ─── Marketplace ──────────────────────────────────────────────────────────────
const Marketplace: React.FC<{ apps: AppDef[]; onInstall: (id: string) => void }> = ({ apps, onInstall }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<AppCategory>('Tutti');

  const categories: AppCategory[] = ['Tutti', 'CRM', 'Comunicazione', 'Pagamenti', 'Produttività', 'Marketing', 'Analytics', 'Sicurezza'];

  const filtered = useMemo(() => {
    return apps.filter(a => {
      const matchCat = category === 'Tutti' || a.category === category;
      const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.provider.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [apps, search, category]);

  const featured = filtered.filter(a => a.featured && !a.installed);
  const regular = filtered.filter(a => !a.featured || a.installed);

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      {/* Search + filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca app per nome, provider o funzione…"
            className="pl-9 h-9 rounded-xl bg-white border-slate-200 text-sm"/>
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={cn("px-3 h-7 rounded-full text-[11px] font-black uppercase tracking-wider transition-all",
              category === cat ? "bg-blue-500 text-white shadow-md shadow-blue-100" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}>
            {cat}
          </button>
        ))}
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <div>
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">In evidenza</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {featured.map(app => (
              <AppCard key={app.id} app={app} onInstall={onInstall} featured />
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      <div>
        {featured.length > 0 && <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Tutte le app</h3>}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Package size={32} className="text-slate-300 mb-3"/>
            <p className="font-bold text-slate-500">Nessuna app trovata</p>
            <p className="text-sm text-slate-400">Prova con un termine diverso o cambia categoria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {regular.map(app => (
              <AppCard key={app.id} app={app} onInstall={onInstall} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AppCard: React.FC<{ app: AppDef; onInstall: (id: string) => void; featured?: boolean }> = ({ app, onInstall, featured }) => (
  <div className={cn("bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-lg transition-all group", featured && "border-violet-100 shadow-md shadow-violet-50")}>
    <div className="flex items-start gap-4">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 border border-slate-100", app.color)}>
        {app.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <h3 className="font-black text-slate-800 text-sm">{app.name}</h3>
          {app.badge && (
            <span className={cn("px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider",
              app.badge === 'Built-in' ? "bg-violet-100 text-violet-700" :
              app.badge === 'Nuovo' ? "bg-emerald-100 text-emerald-700" :
              "bg-amber-100 text-amber-700")}>
              {app.badge}
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 font-medium">{app.provider}</p>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(s => (
              <span key={s} className={cn("text-[10px]", s <= Math.round(app.rating) ? "text-amber-400" : "text-slate-200")}>★</span>
            ))}
            <span className="text-[10px] text-slate-400 ml-0.5 font-bold">{app.rating}</span>
          </div>
          <span className="text-[10px] text-slate-300">·</span>
          <span className="text-[10px] text-slate-400">{app.installs} installazioni</span>
        </div>
      </div>
    </div>

    <p className="text-xs text-slate-500 mt-3 leading-relaxed line-clamp-2">{app.description}</p>

    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
      <span className={cn("text-[11px] font-black", app.free || !app.price ? "text-emerald-600" : "text-slate-600")}>
        {app.free || !app.price ? 'Gratuita' : app.price}
      </span>
      {app.installed ? (
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
            <Check size={11}/> Installata
          </span>
          <button className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors">Gestisci</button>
        </div>
      ) : (
        <button onClick={() => onInstall(app.id)}
          className="flex items-center gap-1.5 px-3 h-7 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-blue-100 transition-all">
          <Plus size={12}/> Installa
        </button>
      )}
    </div>
  </div>
);

// ─── Installed Apps ───────────────────────────────────────────────────────────
const InstalledApps: React.FC<{ apps: AppDef[]; onUninstall: (id: string) => void; onToggle: (id: string) => void; enabled: Record<string, boolean> }> = ({ apps, onUninstall, onToggle, enabled }) => {
  const installed = apps.filter(a => a.installed);

  return (
    <div className="flex-1 overflow-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{installed.length} app installate</p>
        <button className="flex items-center gap-1.5 text-[11px] font-bold text-blue-500 hover:text-blue-700">
          <RefreshCw size={12}/> Controlla aggiornamenti
        </button>
      </div>

      {installed.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Package size={36} className="text-slate-300 mb-4"/>
          <p className="font-bold text-slate-600 mb-1">Nessuna app installata</p>
          <p className="text-sm text-slate-400">Vai al Marketplace per scoprire e installare app.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {installed.map(app => {
            const isEnabled = enabled[app.id] !== false;
            return (
              <div key={app.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-all">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0", app.color)}>
                  {app.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800 text-sm">{app.name}</p>
                    {app.badge && (
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-violet-100 text-violet-700">{app.badge}</span>
                    )}
                    <div className={cn("w-1.5 h-1.5 rounded-full", isEnabled ? "bg-emerald-500" : "bg-slate-300")}/>
                  </div>
                  <p className="text-[11px] text-slate-400">{app.provider} · {app.category}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{app.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => onToggle(app.id)} className="text-slate-400 hover:text-blue-500 transition-colors">
                    {isEnabled
                      ? <ToggleRight size={22} className="text-blue-500"/>
                      : <ToggleLeft size={22}/>}
                  </button>
                  <button className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                    <Settings size={15}/>
                  </button>
                  {app.badge !== 'Built-in' && (
                    <button onClick={() => onUninstall(app.id)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                      <X size={15}/>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Integrations ─────────────────────────────────────────────────────────────
const Integrations: React.FC<{ integrations: Integration[]; onConnect: (id: string) => void; onDisconnect: (id: string) => void }> = ({ integrations, onConnect, onDisconnect }) => {
  const [search, setSearch] = useState('');
  const categories = [...new Set(integrations.map(i => i.category))];
  const [cat, setCat] = useState('Tutti');

  const filtered = integrations.filter(i => {
    const matchCat = cat === 'Tutti' || i.category === cat;
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const connected = filtered.filter(i => i.connected);
  const notConnected = filtered.filter(i => !i.connected);

  return (
    <div className="flex-1 overflow-auto p-6 space-y-5">
      {/* Search + filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca integrazioni…"
            className="pl-9 h-9 rounded-xl bg-white border-slate-200 text-sm"/>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {['Tutti', ...categories].map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={cn("px-3 h-7 rounded-full text-[11px] font-black uppercase tracking-wider transition-all",
              cat === c ? "bg-blue-500 text-white shadow-md shadow-blue-100" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}>
            {c}
          </button>
        ))}
      </div>

      {/* Connected */}
      {connected.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Connesse ({connected.length})</h3>
          {connected.map(intg => (
            <IntegrationRow key={intg.id} intg={intg} onConnect={onConnect} onDisconnect={onDisconnect}/>
          ))}
        </div>
      )}

      {/* Not connected */}
      {notConnected.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Disponibili ({notConnected.length})</h3>
          {notConnected.map(intg => (
            <IntegrationRow key={intg.id} intg={intg} onConnect={onConnect} onDisconnect={onDisconnect}/>
          ))}
        </div>
      )}
    </div>
  );
};

const IntegrationRow: React.FC<{ intg: Integration; onConnect: (id: string) => void; onDisconnect: (id: string) => void }> = ({ intg, onConnect, onDisconnect }) => (
  <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-all">
    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0", intg.color)}>
      {intg.icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-0.5">
        <p className="font-bold text-slate-800 text-sm">{intg.name}</p>
        <span className={cn("text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md",
          intg.connected ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>
          {intg.connected ? 'Connessa' : 'Non connessa'}
        </span>
      </div>
      <p className="text-xs text-slate-400">{intg.description}</p>
      {intg.connected && intg.scopes && (
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {intg.scopes.map(s => (
            <span key={s} className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">{s}</span>
          ))}
          {intg.lastSync && <span className="text-[9px] text-slate-300">· Sync: {intg.lastSync}</span>}
        </div>
      )}
    </div>
    <div className="flex items-center gap-2 shrink-0">
      {intg.connected ? (
        <>
          <button className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors">
            <Settings size={13}/> Config
          </button>
          {intg.id !== 'firebase-connect' && intg.id !== 'gemini-connect' && (
            <button onClick={() => onDisconnect(intg.id)}
              className="flex items-center gap-1 text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors">
              <X size={13}/> Disconnetti
            </button>
          )}
        </>
      ) : (
        <button onClick={() => onConnect(intg.id)}
          className="flex items-center gap-1.5 px-3 h-7 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-blue-100 transition-all">
          <Zap size={12}/> Connetti
        </button>
      )}
    </div>
  </div>
);

// ─── Developer ────────────────────────────────────────────────────────────────
const Developer: React.FC = () => (
  <div className="flex-1 overflow-auto p-6 space-y-6">
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><Code size={20}/></div>
        <div>
          <h2 className="font-black text-lg">Nexus Developer Platform</h2>
          <p className="text-slate-400 text-sm">Crea e pubblica app per il marketplace Nexus</p>
        </div>
      </div>
      <p className="text-slate-300 text-sm leading-relaxed mb-6">
        Usa le Nexus API per integrare i tuoi sistemi, automatizzare flussi di lavoro o costruire app che potrai condividere con altri utenti nel marketplace.
      </p>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 font-black text-sm hover:bg-slate-100 transition-all">
          <ArrowUpRight size={16}/> Documentazione API
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-sm transition-all">
          <Plus size={16}/> Nuova app
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        { icon: '🔑', title: 'API Key', desc: 'Genera chiavi API per autenticare le tue integrazioni.', action: 'Genera chiave' },
        { icon: '🪝', title: 'Webhook', desc: 'Ricevi notifiche real-time sugli eventi del CRM.', action: 'Configura webhook' },
        { icon: '📦', title: 'SDK', desc: 'Scarica l\'SDK ufficiale per JS, Python o PHP.', action: 'Scarica SDK' },
      ].map(item => (
        <div key={item.title} className="bg-white border border-slate-100 rounded-2xl p-5">
          <div className="text-3xl mb-3">{item.icon}</div>
          <h3 className="font-black text-slate-800 mb-1">{item.title}</h3>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">{item.desc}</p>
          <button className="text-[11px] font-black text-blue-500 hover:text-blue-700 uppercase tracking-wider transition-colors">
            {item.action} →
          </button>
        </div>
      ))}
    </div>

    <div className="bg-white border border-slate-100 rounded-2xl p-5">
      <h3 className="font-black text-slate-800 mb-4">Le mie app in sviluppo</h3>
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3"><Code size={22} className="text-slate-400"/></div>
        <p className="font-bold text-slate-500 mb-1">Nessuna app in sviluppo</p>
        <p className="text-xs text-slate-400">Crea la tua prima app per il marketplace Nexus</p>
        <button className="mt-4 flex items-center gap-1.5 px-4 h-8 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-blue-100 transition-all">
          <Plus size={12}/> Crea app
        </button>
      </div>
    </div>
  </div>
);

// ─── Sidebar nav ──────────────────────────────────────────────────────────────
interface NavItem { id: Section; label: string; icon: React.ElementType; path: string; badge?: number }

const NAV: NavItem[] = [
  { id: 'marketplace',   label: 'Marketplace',    icon: Store,   path: '/apps/marketplace' },
  { id: 'installed',     label: 'Installate',      icon: Package, path: '/apps/installed',   badge: 4 },
  { id: 'integrations',  label: 'Integrazioni',    icon: Layers,  path: '/apps/integrations', badge: 4 },
  { id: 'developer',     label: 'Sviluppatori',    icon: Code,    path: '/apps/developer' },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
const Applications: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const section: Section = PATH_MAP[location.pathname] ?? 'marketplace';

  const [apps, setApps] = useState<AppDef[]>(INITIAL_APPS);
  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});

  const handleInstall = (id: string) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, installed: true } : a));
    const app = apps.find(a => a.id === id);
    toast.success(`${app?.name} installata con successo`);
  };

  const handleUninstall = (id: string) => {
    if (!confirm('Vuoi disinstallare questa app?')) return;
    setApps(prev => prev.map(a => a.id === id ? { ...a, installed: false } : a));
    toast.success('App disinstallata');
  };

  const handleToggle = (id: string) => {
    setEnabled(prev => ({ ...prev, [id]: prev[id] === false ? true : false }));
    const app = apps.find(a => a.id === id);
    const wasEnabled = enabled[id] !== false;
    toast.success(`${app?.name} ${wasEnabled ? 'disattivata' : 'attivata'}`);
  };

  const handleConnect = (id: string) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: true, lastSync: 'Adesso' } : i));
    const intg = integrations.find(i => i.id === id);
    toast.success(`${intg?.name} connessa con successo`);
  };

  const handleDisconnect = (id: string) => {
    if (!confirm('Vuoi disconnettere questa integrazione?')) return;
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: false, lastSync: undefined } : i));
    toast.success('Integrazione disconnessa');
  };

  const installedCount = apps.filter(a => a.installed).length;
  const connectedCount = integrations.filter(i => i.connected).length;

  const navWithBadges: NavItem[] = [
    { id: 'marketplace',  label: 'Marketplace',   icon: Store,   path: '/apps/marketplace' },
    { id: 'installed',    label: 'Installate',     icon: Package, path: '/apps/installed',   badge: installedCount },
    { id: 'integrations', label: 'Integrazioni',   icon: Layers,  path: '/apps/integrations', badge: connectedCount },
    { id: 'developer',    label: 'Sviluppatori',   icon: Code,    path: '/apps/developer' },
  ];

  return (
    <div className="h-full flex bg-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-52 border-r border-slate-100 flex flex-col bg-slate-50/60 shrink-0">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-sm font-black text-slate-800">Applicazioni</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">Marketplace & integrazioni</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navWithBadges.map(item => {
            const active = section === item.id;
            return (
              <button key={item.id} onClick={() => navigate(item.path)}
                className={cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-sm font-bold",
                  active ? "bg-blue-500 text-white shadow-md shadow-blue-100" : "text-slate-500 hover:bg-white hover:shadow-sm")}>
                <item.icon size={15} className={active ? "text-blue-200" : "text-slate-400"}/>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge ? (
                  <span className={cn("w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0",
                    active ? "bg-white text-blue-600" : "bg-slate-200 text-slate-600")}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <div className="bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-100 rounded-xl p-3 text-center">
            <Sparkles size={18} className="text-violet-500 mx-auto mb-1.5"/>
            <p className="text-[10px] font-black text-slate-700 mb-1">Nexus Pro</p>
            <p className="text-[9px] text-slate-400 mb-2">Sblocca tutte le integrazioni premium</p>
            <button className="w-full h-6 rounded-lg bg-violet-500 hover:bg-violet-600 text-white text-[9px] font-black uppercase tracking-wider transition-all">
              Upgrade
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="h-14 px-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            {navWithBadges.find(n => n.id === section) && (() => {
              const item = navWithBadges.find(n => n.id === section)!;
              return (
                <>
                  <item.icon size={16} className="text-slate-400"/>
                  <h2 className="font-black text-slate-800 text-sm">{item.label}</h2>
                </>
              );
            })()}
          </div>
          {section === 'marketplace' && (
            <button className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-blue-500 transition-colors">
              <ArrowUpRight size={13}/> Richiedi un'app
            </button>
          )}
        </div>

        {section === 'marketplace'  && <Marketplace apps={apps} onInstall={handleInstall}/>}
        {section === 'installed'    && <InstalledApps apps={apps} onUninstall={handleUninstall} onToggle={handleToggle} enabled={enabled}/>}
        {section === 'integrations' && <Integrations integrations={integrations} onConnect={handleConnect} onDisconnect={handleDisconnect}/>}
        {section === 'developer'    && <Developer/>}
      </div>
    </div>
  );
};

export default Applications;
