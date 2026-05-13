import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Mail, Inbox, Send, FileSignature, Search, Plus, Star, Trash2,
  Archive, MoreVertical, ChevronDown, Paperclip, Bold, Italic,
  Link, Image as ImageIcon, X, RefreshCw, Reply, ReplyAll,
  Forward, Flag, Tag, ArrowLeft, Check,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format, subHours, subDays } from 'date-fns';
import { it } from 'date-fns/locale';

type FolderKey = 'inbox' | 'sent' | 'starred' | 'drafts' | 'archive' | 'trash';

interface Email {
  id: string; from: string; fromEmail: string; subject: string; preview: string;
  body: string; time: Date; read: boolean; starred: boolean; hasAttachment: boolean;
  folder: FolderKey; tags?: string[];
}

const now = new Date();
const EMAILS: Email[] = [
  { id: 'e1', from: 'Mario Rossi', fromEmail: 'mario.rossi@example.com', subject: 'Richiesta preventivo piano Enterprise', preview: 'Buongiorno, sarei interessato a ricevere un preventivo dettagliato per 50 utenti con tutte le funzionalità...', body: 'Buongiorno,\n\nSarei interessato a ricevere un preventivo dettagliato per un piano Enterprise con 50 utenti.\n\nIn particolare vorrei sapere:\n- Costi per utente/mese\n- Funzionalità incluse\n- SLA di supporto\n- Possibilità di personalizzazione\n\nRimango in attesa di un vostro riscontro.\n\nCordiali saluti,\nMario Rossi\nDirettore IT — Rossi & Partners SpA', time: subHours(now, 2), read: false, starred: true, hasAttachment: false, folder: 'inbox', tags: ['Urgente'] },
  { id: 'e2', from: 'Giulia Bianchi', fromEmail: 'g.bianchi@corp.it', subject: 'Re: Rinnovo contratto annuale', preview: 'Grazie per la sua risposta rapida. Avrei alcune domande aggiuntive prima di procedere con il rinnovo...', body: 'Grazie per la risposta rapida.\n\nAvrei alcune domande prima di procedere:\n1. È possibile aumentare il numero di utenti da 10 a 20 mantenendo il prezzo bloccato?\n2. Il contratto include anche il supporto premium?\n3. Ci sono novità previste per il Q1?\n\nGrazie,\nGiulia', time: subHours(now, 5), read: false, starred: false, hasAttachment: false, folder: 'inbox', tags: [] },
  { id: 'e3', from: 'info@startup.io', fromEmail: 'info@startup.io', subject: 'Integrazione API — documentazione', preview: 'Avete una documentazione pubblica per le API REST? Stiamo valutando di integrare il vostro CRM nel nostro...', body: 'Buongiorno,\n\nSiamo una startup che sviluppa software HR e vorremmo integrare Nexus CRM con la nostra piattaforma.\n\nAvete documentazione API REST disponibile? In particolare ci serve accesso a:\n- Lead management\n- Deal pipeline\n- Webhook events\n\nGrazie,\nTeam startup.io', time: subDays(now, 1), read: true, starred: false, hasAttachment: false, folder: 'inbox' },
  { id: 'e4', from: 'Anna Ferrari', fromEmail: 'anna.ferrari@clienteabc.it', subject: 'Conferma appuntamento demo', preview: 'Confermo la nostra demo di domani alle 15:00. Ho invitato anche il mio collega responsabile IT...', body: 'Buongiorno,\n\nConfermo la demo di domani alle 15:00.\n\nParteciperanno:\n- Anna Ferrari (Responsabile acquisti)\n- Roberto Neri (IT Manager)\n- Carla Russo (CFO)\n\nCi vediamo su Zoom al link che ci ha inviato.\n\nAnna', time: subDays(now, 1), read: true, starred: true, hasAttachment: true, folder: 'inbox' },
  { id: 'e5', from: 'newsletter@nexuscrm.io', fromEmail: 'newsletter@nexuscrm.io', subject: 'Novità Nexus CRM — Maggio 2025', preview: 'Scopri le nuove funzionalità rilasciate questo mese: CoPilot AI, Contact Center omnicanale, e molto altro...', body: 'Le novità di maggio:\n\n• CoPilot AI: assistente intelligente per ogni record\n• Contact Center omnicanale\n• Lead scoring automatico\n• Miglioramenti al calendario team\n\nScopri di più sul blog.', time: subDays(now, 2), read: true, starred: false, hasAttachment: false, folder: 'inbox' },
  { id: 'e6', from: 'Tu', fromEmail: 'me@nexuscrm.io', subject: 'Proposta commerciale — Cliente XYZ', preview: 'In allegato la proposta commerciale come da accordi. La ringrazio per l\'interesse dimostrato...', body: 'In allegato la proposta come da accordi.\n\nLa proposta include:\n- Piano Professional 12 mesi\n- Onboarding dedicato 4h\n- Supporto premium\n\nRimango a disposizione per qualsiasi chiarimento.', time: subDays(now, 2), read: true, starred: false, hasAttachment: true, folder: 'sent' },
  { id: 'e7', from: 'Tu', fromEmail: 'me@nexuscrm.io', subject: 'BOZZA: Newsletter Q2 clienti', preview: 'Cari clienti, è con piacere che condividiamo gli aggiornamenti del secondo trimestre...', body: 'Bozza in lavorazione...', time: subDays(now, 3), read: true, starred: false, hasAttachment: false, folder: 'drafts' },
];

const FOLDERS_CONFIG = [
  { key: 'inbox' as FolderKey,   label: 'Posta in arrivo', icon: Inbox,        count: EMAILS.filter(e => e.folder === 'inbox' && !e.read).length },
  { key: 'sent' as FolderKey,    label: 'Inviati',         icon: Send,         count: 0 },
  { key: 'starred' as FolderKey, label: 'Speciali',        icon: Star,         count: EMAILS.filter(e => e.starred).length },
  { key: 'drafts' as FolderKey,  label: 'Bozze',           icon: FileSignature, count: EMAILS.filter(e => e.folder === 'drafts').length },
  { key: 'archive' as FolderKey, label: 'Archivio',        icon: Archive,      count: 0 },
  { key: 'trash' as FolderKey,   label: 'Cestino',         icon: Trash2,       count: 0 },
];

const Webmail: React.FC = () => {
  const [folder, setFolder] = useState<FolderKey>('inbox');
  const [emails, setEmails] = useState<Email[]>(EMAILS);
  const [selected, setSelected] = useState<Email | null>(null);
  const [search, setSearch] = useState('');
  const [composing, setComposing] = useState(false);
  const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' });

  const folderEmails = emails.filter(e => {
    if (folder === 'starred') return e.starred;
    return e.folder === folder;
  }).filter(e => !search || e.subject.toLowerCase().includes(search.toLowerCase()) || e.from.toLowerCase().includes(search.toLowerCase()));

  const toggleStar = (id: string, ev: React.MouseEvent) => {
    ev.stopPropagation();
    setEmails(prev => prev.map(e => e.id === id ? { ...e, starred: !e.starred } : e));
  };
  const markRead = (email: Email) => {
    setSelected(email);
    setEmails(prev => prev.map(e => e.id === email.id ? { ...e, read: true } : e));
  };
  const sendEmail = () => {
    if (!composeData.to || !composeData.subject) { toast.error('Compila destinatario e oggetto'); return; }
    toast.success(`Email inviata a ${composeData.to}`);
    setComposing(false);
    setComposeData({ to: '', subject: '', body: '' });
  };

  const formatTime = (t: Date) => {
    const diff = Date.now() - t.getTime();
    if (diff < 86400000) return format(t, 'HH:mm');
    if (diff < 604800000) return format(t, 'EEE', { locale: it });
    return format(t, 'dd MMM', { locale: it });
  };

  return (
    <div className="h-full flex bg-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-52 border-r border-slate-100 flex flex-col bg-slate-50/60 shrink-0">
        <div className="p-3 border-b border-slate-100">
          <button onClick={() => setComposing(true)}
            className="w-full flex items-center justify-center gap-2 h-9 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-blue-100 transition-all">
            <Plus size={13}/> Scrivi
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {FOLDERS_CONFIG.map(f => (
            <button key={f.key} onClick={() => { setFolder(f.key); setSelected(null); }}
              className={cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-sm font-bold",
                folder === f.key ? "bg-blue-500 text-white shadow-md shadow-blue-100" : "text-slate-500 hover:bg-white hover:shadow-sm")}>
              <f.icon size={15} className={folder === f.key ? "text-blue-200" : "text-slate-400"}/>
              <span className="flex-1 text-left">{f.label}</span>
              {f.count > 0 && (
                <span className={cn("w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center",
                  folder === f.key ? "bg-white text-blue-600" : "bg-blue-500 text-white")}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-100">
          <button onClick={() => toast.info('Aggiornamento posta')} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold text-slate-400 hover:bg-white hover:text-blue-500 transition-all">
            <RefreshCw size={13}/> Aggiorna
          </button>
        </div>
      </div>

      {/* Email list */}
      <div className={cn("border-r border-slate-100 flex flex-col bg-slate-50/20 shrink-0 transition-all", selected ? "w-64" : "flex-1 max-w-sm")}>
        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca email…" className="pl-8 h-8 text-xs rounded-xl bg-white border-slate-200"/>
          </div>
        </div>
        <div className="flex-1 overflow-auto divide-y divide-slate-50">
          {folderEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <Mail size={24} className="text-slate-300 mb-2"/>
              <p className="text-sm font-bold text-slate-400">Nessuna email</p>
            </div>
          ) : folderEmails.map(email => (
            <button key={email.id} onClick={() => markRead(email)}
              className={cn("w-full text-left p-4 hover:bg-white transition-colors",
                selected?.id === email.id ? "bg-blue-50 border-l-2 border-blue-500" : !email.read ? "bg-white" : "")}>
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={cn("text-xs truncate", !email.read ? "font-black text-slate-800" : "font-medium text-slate-600")}>{email.from}</p>
                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      {email.hasAttachment && <Paperclip size={9} className="text-slate-400"/>}
                      <p className="text-[10px] text-slate-400">{formatTime(email.time)}</p>
                    </div>
                  </div>
                  <p className={cn("text-[11px] truncate mb-0.5", !email.read ? "font-bold text-slate-700" : "font-medium text-slate-500")}>{email.subject}</p>
                  <p className="text-[10px] text-slate-400 truncate">{email.preview}</p>
                  {email.tags && email.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {email.tags.map(tag => <span key={tag} className="text-[9px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md uppercase tracking-wider">{tag}</span>)}
                    </div>
                  )}
                </div>
                <button onClick={e => toggleStar(email.id, e)} className="shrink-0 mt-0.5">
                  <Star size={12} className={cn("transition-colors", email.starred ? "fill-amber-400 text-amber-400" : "text-slate-200 hover:text-amber-300")}/>
                </button>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Email viewer */}
      {selected ? (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="h-14 px-5 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-all">
                <ArrowLeft size={16}/>
              </button>
              <h3 className="font-bold text-slate-800 text-sm truncate max-w-xs">{selected.subject}</h3>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => { setComposing(true); setComposeData({ to: selected.fromEmail, subject: `Re: ${selected.subject}`, body: '' }); }}
                className="flex items-center gap-1.5 px-3 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold transition-all">
                <Reply size={13}/> Rispondi
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-all"><ReplyAll size={15}/></button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-all"><Forward size={15}/></button>
              <button onClick={() => { setEmails(prev => prev.filter(e => e.id !== selected.id)); setSelected(null); toast.success('Email eliminata'); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={15}/></button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-black text-slate-800 mb-3">{selected.subject}</h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-sm font-black text-blue-700">
                      {selected.from.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{selected.from}</p>
                      <p className="text-[11px] text-slate-400">{selected.fromEmail}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">{format(selected.time, "d MMMM yyyy 'alle' HH:mm", { locale: it })}</p>
                </div>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{selected.body}</div>
              {selected.hasAttachment && (
                <div className="border border-slate-100 rounded-xl p-4">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3">Allegati</p>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center"><FileSignature size={16} className="text-red-400"/></div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-700">Proposta_Commerciale.pdf</p>
                      <p className="text-[10px] text-slate-400">3.4 MB</p>
                    </div>
                    <button onClick={() => toast.success('Download avviato')} className="text-[11px] font-bold text-blue-500 hover:text-blue-700">Scarica</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : !composing ? (
        <div className="flex-1 flex items-center justify-center text-center bg-slate-50/30">
          <div>
            <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4"><Mail size={28} className="text-slate-400"/></div>
            <p className="font-bold text-slate-600 mb-1">Nessuna email selezionata</p>
            <p className="text-sm text-slate-400">Clicca su un'email per leggerla</p>
          </div>
        </div>
      ) : null}

      {/* Compose panel */}
      {composing && (
        <div className="absolute bottom-0 right-6 w-[520px] bg-white border border-slate-200 rounded-t-2xl shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-3 bg-slate-800 flex items-center justify-between">
            <p className="text-sm font-black text-white">Nuovo messaggio</p>
            <button onClick={() => setComposing(false)} className="text-slate-400 hover:text-white transition-colors"><X size={16}/></button>
          </div>
          <div className="divide-y divide-slate-100">
            <Input value={composeData.to} onChange={e => setComposeData(p => ({ ...p, to: e.target.value }))} placeholder="A:" className="border-0 rounded-none px-4 h-10 text-sm focus-visible:ring-0"/>
            <Input value={composeData.subject} onChange={e => setComposeData(p => ({ ...p, subject: e.target.value }))} placeholder="Oggetto" className="border-0 rounded-none px-4 h-10 text-sm focus-visible:ring-0"/>
          </div>
          <textarea value={composeData.body} onChange={e => setComposeData(p => ({ ...p, body: e.target.value }))}
            className="w-full h-48 px-4 py-3 text-sm text-slate-700 resize-none outline-none placeholder:text-slate-400"
            placeholder="Scrivi il messaggio…"/>
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"><Paperclip size={15}/></button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"><ImageIcon size={15}/></button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"><Link size={15}/></button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toast.success('Bozza salvata')} className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors">Salva bozza</button>
              <button onClick={sendEmail} className="flex items-center gap-1.5 px-4 h-8 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-blue-100 transition-all">
                <Send size={12}/> Invia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Webmail;
