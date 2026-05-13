import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Headphones, MessageSquare, Send, Mail, Smartphone, Globe, Search,
  Plus, MoreVertical, Circle, Check, CheckCheck, Clock, AlertCircle,
  Phone, Video, Paperclip, Smile, X, ChevronRight, ExternalLink,
  Zap, BarChart2, Users, ArrowUp, ArrowDown, Wifi, WifiOff,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { it } from 'date-fns/locale';
import { whatsappService } from '@/services/whatsappService';
import { WhatsAppMessage } from '@/types/crm';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ─── types ────────────────────────────────────────────────────────────────────
type ChannelId = 'overview' | 'livechat' | 'whatsapp' | 'telegram' | 'email' | 'instagram' | 'facebook';

const PATH_MAP: Record<string, ChannelId> = {
  '/contact-center':           'overview',
  '/contact-center/overview':  'overview',
  '/contact-center/livechat':  'livechat',
  '/contact-center/whatsapp':  'whatsapp',
  '/contact-center/telegram':  'telegram',
  '/contact-center/email':     'email',
  '/contact-center/instagram': 'instagram',
  '/contact-center/facebook':  'facebook',
};

interface Conversation {
  id: string;
  contact: string;
  avatar: string;
  preview: string;
  time: string;
  unread: number;
  channel: ChannelId;
  status: 'open' | 'pending' | 'closed';
  online: boolean;
  phone?: string;
}

// ─── demo conversations ───────────────────────────────────────────────────────
const LIVE_CONVOS: Conversation[] = [
  { id: 'lc1', contact: 'Marco Bianchi', avatar: 'M', preview: 'Salve, vorrei sapere di più sui vostri piani...', time: '2 min fa', unread: 3, channel: 'livechat', status: 'open', online: true, phone: '' },
  { id: 'lc2', contact: 'Visitatore #4821', avatar: 'V', preview: 'Come funziona il periodo di prova?', time: '8 min fa', unread: 1, channel: 'livechat', status: 'open', online: true, phone: '' },
  { id: 'lc3', contact: 'Laura Verdi', avatar: 'L', preview: 'Grazie per l\'aiuto!', time: '15 min fa', unread: 0, channel: 'livechat', status: 'closed', online: false, phone: '' },
  { id: 'lc4', contact: 'Visitatore #4820', avatar: 'V', preview: 'Ho un problema con l\'accesso al portale', time: '32 min fa', unread: 0, channel: 'livechat', status: 'pending', online: false, phone: '' },
];

const WA_CONVOS: Conversation[] = [
  { id: 'wa1', contact: '+39 333 123 4567', avatar: 'A', preview: 'Ciao, ho ricevuto la vostra offerta', time: '5 min fa', unread: 2, channel: 'whatsapp', status: 'open', online: true, phone: '+39 333 123 4567' },
  { id: 'wa2', contact: '+39 347 987 6543', avatar: 'G', preview: 'Quando possiamo fissare una demo?', time: '1 ora fa', unread: 0, channel: 'whatsapp', status: 'open', online: false, phone: '+39 347 987 6543' },
  { id: 'wa3', contact: '+39 320 456 7890', avatar: 'F', preview: 'Perfetto, a presto!', time: 'Ieri', unread: 0, channel: 'whatsapp', status: 'closed', online: false, phone: '+39 320 456 7890' },
];

interface ChatMessage { id: string; from: 'me' | 'them'; text: string; time: string; }

const DEMO_MSGS: Record<string, ChatMessage[]> = {
  lc1: [
    { id: '1', from: 'them', text: 'Salve, vorrei sapere di più sui vostri piani aziendali.', time: '10:32' },
    { id: '2', from: 'me', text: 'Certo! Abbiamo tre piani: Starter, Professional ed Enterprise. Quale si adatta meglio alle tue esigenze?', time: '10:33' },
    { id: '3', from: 'them', text: 'Siamo una piccola azienda di 10 persone. Usiamo già un CRM ma vogliamo qualcosa di più moderno.', time: '10:34' },
  ],
  lc2: [
    { id: '1', from: 'them', text: 'Come funziona il periodo di prova?', time: '10:40' },
  ],
  wa1: [
    { id: '1', from: 'them', text: 'Ciao, ho ricevuto la vostra offerta per il piano Professional.', time: '11:05' },
    { id: '2', from: 'me', text: 'Ottimo! Hai avuto modo di visionarla? Posso rispondere a eventuali domande.', time: '11:06' },
    { id: '3', from: 'them', text: 'Sì, mi sembra interessante. Possiamo scendere un po\' sul prezzo?', time: '11:08' },
  ],
  wa2: [
    { id: '1', from: 'me', text: 'Buongiorno! Le mando il materiale sulla demo come da accordi.', time: '09:15' },
    { id: '2', from: 'them', text: 'Grazie! Quando possiamo fissare una demo live?', time: '09:45' },
  ],
};

// ─── KPI Overview ─────────────────────────────────────────────────────────────
const Overview: React.FC<{ onNavigate: (ch: ChannelId) => void }> = ({ onNavigate }) => {
  const kpis = [
    { label: 'Conversazioni aperte', value: 7, delta: +2, icon: MessageSquare, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
    { label: 'In attesa di risposta', value: 3, delta: -1, icon: Clock, color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
    { label: 'Risolte oggi', value: 14, delta: +5, icon: Check, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
    { label: 'Tempo medio risposta', value: '4 min', delta: -1, icon: Zap, color: 'bg-purple-50 text-purple-600', border: 'border-purple-100', isDuration: true },
  ];

  const channels = [
    { id: 'livechat' as ChannelId, name: 'Live Chat', icon: MessageSquare, color: 'bg-blue-500', connected: true, open: 4 },
    { id: 'whatsapp' as ChannelId, name: 'WhatsApp', icon: MessageSquare, color: 'bg-emerald-500', connected: true, open: 3 },
    { id: 'email' as ChannelId, name: 'Email', icon: Mail, color: 'bg-purple-500', connected: true, open: 2 },
    { id: 'telegram' as ChannelId, name: 'Telegram', icon: Send, color: 'bg-sky-500', connected: false, open: 0 },
    { id: 'instagram' as ChannelId, name: 'Instagram', icon: Smartphone, color: 'bg-pink-500', connected: false, open: 0 },
    { id: 'facebook' as ChannelId, name: 'Facebook', icon: Globe, color: 'bg-blue-600', connected: true, open: 1 },
  ];

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className={cn("bg-white border rounded-2xl p-4", k.border)}>
            <div className="flex items-center justify-between mb-3">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", k.color)}>
                <k.icon size={17} />
              </div>
              <div className={cn("flex items-center gap-0.5 text-[10px] font-black", k.delta > 0 ? "text-emerald-600" : "text-red-500")}>
                {k.delta > 0 ? <ArrowUp size={10}/> : <ArrowDown size={10}/>}
                {Math.abs(k.delta)}{k.isDuration ? ' min' : ''}
              </div>
            </div>
            <p className="text-2xl font-black text-slate-800">{k.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Channels */}
      <div>
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Canali Connessi</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {channels.map(ch => (
            <button key={ch.id} onClick={() => onNavigate(ch.id)}
              className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-all text-left group">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0", ch.color)}>
                <ch.icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-800 text-sm">{ch.name}</p>
                  <div className={cn("w-1.5 h-1.5 rounded-full", ch.connected ? "bg-emerald-500" : "bg-slate-300")} />
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  {ch.connected ? (ch.open > 0 ? `${ch.open} aperte` : 'Nessuna') : 'Non collegato'}
                </p>
              </div>
              <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Attività Recente</h3>
        <div className="space-y-2">
          {[...LIVE_CONVOS, ...WA_CONVOS].slice(0,5).map(conv => (
            <div key={conv.id} className="bg-white border border-slate-100 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xs font-black text-slate-600 shrink-0">
                {conv.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-700 truncate">{conv.contact}</p>
                <p className="text-[11px] text-slate-400 truncate">{conv.preview}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[10px] text-slate-400">{conv.time}</p>
                {conv.unread > 0 && <span className="inline-block mt-0.5 w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-black flex items-center justify-center">{conv.unread}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Not Connected placeholder ────────────────────────────────────────────────
const NotConnected: React.FC<{ name: string; icon: React.ReactNode; color: string }> = ({ name, icon, color }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
    <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl", color)}>
      {icon}
    </div>
    <h2 className="text-xl font-black text-slate-800 mb-2">{name} non collegato</h2>
    <p className="text-slate-400 text-sm max-w-xs mb-8">Collega il canale {name} per ricevere e rispondere ai messaggi direttamente dal Contact Center.</p>
    <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-100 transition-all">
      <Zap size={16} /> Configura {name}
    </button>
    <p className="mt-4 text-[11px] text-slate-300">Richiede credenziali API — contatta il supporto per assistenza</p>
  </div>
);

// ─── Email inbox (demo) ────────────────────────────────────────────────────────
const DEMO_EMAILS = [
  { id: 'e1', from: 'mario.rossi@example.com', subject: 'Richiesta preventivo piano Enterprise', preview: 'Buongiorno, sarei interessato a un preventivo per 50 utenti...', time: '09:41', unread: true, status: 'open' },
  { id: 'e2', from: 'giulia.bianchi@corp.it', subject: 'Rinnovo contratto annuale', preview: 'Siamo prossimi alla scadenza, vorrei discutere le condizioni...', time: 'Ieri', unread: false, status: 'open' },
  { id: 'e3', from: 'info@startup.io', subject: 'Integrazione API', preview: 'Avete una documentazione per l\'integrazione con il vostro CRM?', time: 'Ieri', unread: false, status: 'closed' },
];

const EmailSection: React.FC = () => {
  const [selected, setSelected] = useState<typeof DEMO_EMAILS[0] | null>(null);
  const [reply, setReply] = useState('');

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-72 border-r border-slate-100 flex flex-col bg-slate-50/40">
        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <Input placeholder="Cerca email…" className="pl-8 h-7 rounded-full bg-white border-slate-200 text-xs"/>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-2 space-y-1">
          {DEMO_EMAILS.map(email => (
            <button key={email.id} onClick={() => setSelected(email)}
              className={cn("w-full text-left p-3 rounded-xl transition-all",
                selected?.id === email.id ? "bg-blue-500 text-white" : "hover:bg-white hover:shadow-sm")}>
              <div className="flex items-center justify-between mb-1">
                <p className={cn("text-xs font-black truncate", selected?.id === email.id ? "text-white" : email.unread ? "text-slate-800" : "text-slate-500")}>
                  {email.from.split('@')[0]}
                </p>
                <p className={cn("text-[9px] shrink-0", selected?.id === email.id ? "text-blue-200" : "text-slate-400")}>{email.time}</p>
              </div>
              <p className={cn("text-[11px] font-bold truncate mb-0.5", selected?.id === email.id ? "text-blue-100" : "text-slate-600")}>{email.subject}</p>
              <p className={cn("text-[10px] truncate", selected?.id === email.id ? "text-blue-200" : "text-slate-400")}>{email.preview}</p>
            </button>
          ))}
        </div>
      </div>

      {selected ? (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 mb-1">{selected.subject}</h3>
            <p className="text-[11px] text-slate-400">Da: {selected.from}</p>
          </div>
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-slate-50 rounded-2xl p-5 text-sm text-slate-700 leading-relaxed">
              {selected.preview}<br/><br/>
              <span className="text-slate-400 text-xs">— Messaggio demo generato automaticamente</span>
            </div>
          </div>
          <div className="p-4 border-t border-slate-100 bg-white">
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-3 space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Rispondi a {selected.from}</p>
              <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Scrivi la tua risposta…"
                className="w-full bg-transparent text-sm text-slate-700 outline-none resize-none min-h-[80px] placeholder:text-slate-400"/>
              <div className="flex justify-end">
                <button onClick={() => { toast.success('Email inviata'); setReply(''); }}
                  disabled={!reply.trim()}
                  className="flex items-center gap-1.5 px-4 h-8 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider disabled:opacity-50 transition-all">
                  <Send size={12}/> Invia
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-3"><Mail size={22} className="text-purple-400"/></div>
            <p className="font-bold text-slate-600">Seleziona un'email</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Inbox (Live Chat + WhatsApp) ─────────────────────────────────────────────
const InboxSection: React.FC<{ channelId: 'livechat' | 'whatsapp' }> = ({ channelId }) => {
  const { user } = useAuth();
  const convos = channelId === 'livechat' ? LIVE_CONVOS : WA_CONVOS;
  const [selected, setSelected] = useState<Conversation | null>(convos[0] ?? null);
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMsgs(selected ? (DEMO_MSGS[selected.id] ?? []) : []);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, [selected]);

  const send = () => {
    if (!text.trim() || !selected) return;
    const newMsg: ChatMessage = { id: Date.now().toString(), from: 'me', text, time: format(new Date(), 'HH:mm') };
    setMsgs(m => [...m, newMsg]);
    setText('');
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const filtered = convos.filter(c => c.contact.toLowerCase().includes(search.toLowerCase()));

  const statusColors: Record<string, string> = {
    open: 'bg-emerald-500',
    pending: 'bg-amber-500',
    closed: 'bg-slate-300',
  };

  const statusLabel: Record<string, string> = {
    open: 'Aperta',
    pending: 'In attesa',
    closed: 'Chiusa',
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Conversation list */}
      <div className="w-72 border-r border-slate-100 flex flex-col bg-slate-50/40 shrink-0">
        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca conversazioni…"
              className="pl-8 h-7 rounded-full bg-white border-slate-200 text-xs"/>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-2 space-y-1">
          {filtered.map(conv => (
            <button key={conv.id} onClick={() => setSelected(conv)}
              className={cn("w-full text-left p-3 rounded-xl transition-all",
                selected?.id === conv.id ? "bg-blue-500 text-white shadow-md shadow-blue-100" : "hover:bg-white hover:shadow-sm")}>
              <div className="flex items-center gap-2.5">
                <div className="relative shrink-0">
                  <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-sm font-black",
                    selected?.id === conv.id ? "bg-blue-400 text-white" : "bg-slate-200 text-slate-600")}>
                    {conv.avatar}
                  </div>
                  {conv.online && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"/>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={cn("text-xs font-black truncate", selected?.id === conv.id ? "text-white" : "text-slate-700")}>{conv.contact}</p>
                    <p className={cn("text-[9px] shrink-0 ml-1", selected?.id === conv.id ? "text-blue-200" : "text-slate-400")}>{conv.time}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={cn("text-[10px] truncate flex-1", selected?.id === conv.id ? "text-blue-100" : "text-slate-400")}>{conv.preview}</p>
                    {conv.unread > 0 && (
                      <span className={cn("ml-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center shrink-0",
                        selected?.id === conv.id ? "bg-white text-blue-600" : "bg-blue-500 text-white")}>
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat pane */}
      {selected ? (
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Header */}
          <div className="h-14 px-5 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-black text-slate-600">{selected.avatar}</div>
                {selected.online && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"/>}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{selected.contact}</p>
                <div className="flex items-center gap-1.5">
                  <div className={cn("w-1.5 h-1.5 rounded-full", statusColors[selected.status])}/>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{statusLabel[selected.status]}</p>
                  {selected.phone && <p className="text-[10px] text-slate-300">· {selected.phone}</p>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {selected.phone && (
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-emerald-500 hover:bg-emerald-50">
                  <Phone size={15}/>
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-600">
                <MoreVertical size={15}/>
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-5 space-y-3 bg-slate-50/30">
            {msgs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center mb-2"><MessageSquare size={18} className="text-slate-400"/></div>
                <p className="text-sm font-bold text-slate-500">Nessun messaggio ancora</p>
              </div>
            ) : msgs.map(msg => (
              <div key={msg.id} className={cn("flex items-end gap-2", msg.from === 'me' ? "flex-row-reverse" : "flex-row")}>
                {msg.from === 'them' && (
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600 shrink-0">
                    {selected.avatar}
                  </div>
                )}
                <div className={cn("max-w-[72%] space-y-0.5", msg.from === 'me' ? "items-end" : "items-start")}>
                  <div className={cn("px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm",
                    msg.from === 'me' ? "bg-blue-500 text-white rounded-br-sm" : "bg-white text-slate-700 rounded-bl-sm border border-slate-100")}>
                    {msg.text}
                  </div>
                  <p className={cn("text-[9px] text-slate-300 font-medium", msg.from === 'me' ? "text-right mr-1" : "ml-1")}>{msg.time}</p>
                </div>
              </div>
            ))}
            <div ref={endRef}/>
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            {selected.status === 'closed' ? (
              <div className="flex items-center justify-center gap-2 py-2 text-slate-400">
                <AlertCircle size={14}/>
                <p className="text-xs font-medium">Questa conversazione è chiusa</p>
                <button onClick={() => toast.success('Conversazione riaperta')} className="text-xs font-bold text-blue-500 hover:underline">Riapri</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-100 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-white shrink-0">
                  <Paperclip size={13}/>
                </Button>
                <input value={text} onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
                  placeholder={`Rispondi a ${selected.contact}…`}
                  className="flex-1 bg-transparent outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400"/>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-white shrink-0">
                  <Smile size={13}/>
                </Button>
                <button onClick={send} disabled={!text.trim()}
                  className="flex items-center gap-1 px-3 h-7 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider disabled:opacity-50 transition-all shrink-0">
                  <Send size={11}/> Invia
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center"><p className="text-slate-400 text-sm font-medium">Seleziona una conversazione</p></div>
      )}
    </div>
  );
};

// ─── Sidebar nav ──────────────────────────────────────────────────────────────
interface NavChannel {
  id: ChannelId;
  label: string;
  icon: React.ElementType;
  color: string;
  connected: boolean;
  badge?: number;
  path: string;
}

const NAV_CHANNELS: NavChannel[] = [
  { id: 'overview',   label: 'Panoramica',  icon: BarChart2,     color: 'text-slate-500',  connected: true,  path: '/contact-center' },
  { id: 'livechat',   label: 'Live Chat',   icon: MessageSquare, color: 'text-blue-500',   connected: true,  badge: 5, path: '/contact-center/livechat' },
  { id: 'whatsapp',   label: 'WhatsApp',    icon: MessageSquare, color: 'text-emerald-500',connected: true,  badge: 2, path: '/contact-center/whatsapp' },
  { id: 'email',      label: 'Email',       icon: Mail,          color: 'text-purple-500', connected: true,  badge: 3, path: '/contact-center/email' },
  { id: 'telegram',   label: 'Telegram',    icon: Send,          color: 'text-sky-500',    connected: false, path: '/contact-center/telegram' },
  { id: 'instagram',  label: 'Instagram',   icon: Smartphone,    color: 'text-pink-500',   connected: false, path: '/contact-center/instagram' },
  { id: 'facebook',   label: 'Facebook',    icon: Globe,         color: 'text-blue-600',   connected: true,  badge: 1, path: '/contact-center/facebook' },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
const ContactCenter: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const channel: ChannelId = PATH_MAP[location.pathname] ?? 'overview';

  const goTo = (id: ChannelId) => {
    const ch = NAV_CHANNELS.find(n => n.id === id);
    if (ch) navigate(ch.path);
  };

  const renderContent = () => {
    switch (channel) {
      case 'overview':  return <Overview onNavigate={goTo}/>;
      case 'livechat':  return <InboxSection channelId="livechat"/>;
      case 'whatsapp':  return <InboxSection channelId="whatsapp"/>;
      case 'email':     return <EmailSection/>;
      case 'telegram':  return <NotConnected name="Telegram" icon={<Send size={32}/>} color="bg-sky-500"/>;
      case 'instagram': return <NotConnected name="Instagram" icon={<Smartphone size={32}/>} color="bg-gradient-to-br from-pink-500 to-purple-600"/>;
      case 'facebook':  return <InboxSection channelId="livechat"/>;
      default:          return <Overview onNavigate={goTo}/>;
    }
  };

  return (
    <div className="h-full flex bg-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-56 border-r border-slate-100 flex flex-col bg-slate-50/60 shrink-0">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-sm font-black text-slate-800">Contact Center</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">Omnicanale</p>
        </div>

        <nav className="flex-1 overflow-auto p-3 space-y-0.5">
          {NAV_CHANNELS.map(ch => {
            const active = channel === ch.id;
            return (
              <button key={ch.id} onClick={() => navigate(ch.path)}
                className={cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-sm font-bold",
                  active ? "bg-blue-500 text-white shadow-md shadow-blue-100" : "text-slate-500 hover:bg-white hover:shadow-sm")}>
                <ch.icon size={15} className={active ? "text-blue-200" : ch.color}/>
                <span className="flex-1 text-left">{ch.label}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {ch.badge && ch.badge > 0 ? (
                    <span className={cn("w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center",
                      active ? "bg-white text-blue-600" : "bg-blue-500 text-white")}>
                      {ch.badge}
                    </span>
                  ) : null}
                  {!ch.connected && (
                    <WifiOff size={11} className={active ? "text-blue-200" : "text-slate-300"}/>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-black text-slate-400 hover:bg-white hover:text-blue-500 transition-all uppercase tracking-wider">
            <Plus size={13}/> Aggiungi canale
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="h-14 px-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            {NAV_CHANNELS.find(c => c.id === channel) && (() => {
              const ch = NAV_CHANNELS.find(c => c.id === channel)!;
              return (
                <>
                  <ch.icon size={16} className={ch.color}/>
                  <h2 className="font-black text-slate-800 text-sm">{ch.label}</h2>
                  <div className={cn("w-1.5 h-1.5 rounded-full ml-1", ch.connected ? "bg-emerald-500" : "bg-slate-300")}/>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{ch.connected ? 'Collegato' : 'Non collegato'}</span>
                </>
              );
            })()}
          </div>
          <div className="flex items-center gap-2">
            {channel !== 'overview' && (
              <button className="flex items-center gap-1.5 px-3 h-7 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md shadow-blue-100 transition-all">
                <Plus size={12}/> Nuova
              </button>
            )}
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default ContactCenter;
