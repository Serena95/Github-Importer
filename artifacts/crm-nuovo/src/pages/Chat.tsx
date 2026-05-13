import React, { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Search,
  Circle,
  Hash,
  MessageSquare,
  PhoneCall,
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  Clock,
  Plus,
  X,
  Check,
  CheckCheck,
  Mic,
  MicOff,
  Users,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { CRMActivity } from '@/types/crm';
import { toast } from 'sonner';
import { useAuth as useAuthCtx } from '@/contexts/AuthContext';

type Tab = 'chat' | 'chiamate';

const CHANNELS = [
  { id: 'general', name: 'Generale', type: 'channel' },
  { id: 'sales', name: 'Vendite', type: 'channel' },
  { id: 'support', name: 'Supporto', type: 'channel' },
];

// ─── DIALER ──────────────────────────────────────────────────────────────────
const Dialer: React.FC<{ onCall: (number: string) => void; onClose: () => void }> = ({ onCall, onClose }) => {
  const [digits, setDigits] = useState('');
  const keys = ['1','2','3','4','5','6','7','8','9','*','0','#'];

  const press = (k: string) => setDigits(d => d + k);
  const del = () => setDigits(d => d.slice(0, -1));

  return (
    <div className="absolute bottom-24 right-6 z-50 bg-white rounded-3xl shadow-2xl border border-slate-100 w-72 overflow-hidden animate-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tastierino</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
      </div>
      <div className="px-5 pb-3">
        <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-3 mb-4">
          <input
            value={digits}
            onChange={e => setDigits(e.target.value)}
            placeholder="Numero..."
            className="flex-1 bg-transparent text-xl font-bold text-slate-800 outline-none tracking-widest"
          />
          {digits && <button onClick={del} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>}
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {keys.map(k => (
            <button
              key={k}
              onClick={() => press(k)}
              className="h-14 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 font-bold text-lg text-slate-700 transition-all active:scale-95"
            >
              {k}
            </button>
          ))}
        </div>
        <button
          onClick={() => { if (digits) { onCall(digits); onClose(); } }}
          className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-100"
        >
          <Phone size={18} />
          Chiama
        </button>
      </div>
    </div>
  );
};

// ─── LOG CALL FORM ────────────────────────────────────────────────────────────
const LogCallForm: React.FC<{ onLogged: () => void; userName: string }> = ({ onLogged, userName }) => {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState<'outbound' | 'inbound'>('outbound');
  const [outcome, setOutcome] = useState<'answered' | 'no_answer' | 'busy'>('answered');
  const [duration, setDuration] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!contact.trim()) { toast.error('Inserisci un contatto'); return; }
    setSaving(true);
    try {
      await supabaseCRMService.createActivity({
        entity_id: 'standalone',
        entity_type: 'contact',
        type: 'call',
        title: `${direction === 'outbound' ? 'Chiamata effettuata' : 'Chiamata ricevuta'} — ${contact}`,
        description: `Esito: ${outcome === 'answered' ? 'Risposta' : outcome === 'no_answer' ? 'Nessuna risposta' : 'Occupato'}${duration ? ` · Durata: ${duration} min` : ''}${notes ? `\nNote: ${notes}` : ''}`,
        author_name: userName,
      });
      toast.success('Chiamata registrata');
      setContact(''); setNotes(''); setDuration('');
      setOpen(false);
      onLogged();
    } catch {
      toast.error('Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-emerald-100 transition-all"
      >
        <Plus size={14} />
        Registra chiamata
      </button>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-3xl shadow-xl p-6 space-y-4 animate-in slide-in-from-top-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-black text-slate-800">Registra chiamata</span>
        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
      </div>
      {/* Direction */}
      <div className="flex gap-2">
        {(['outbound','inbound'] as const).map(d => (
          <button key={d} onClick={() => setDirection(d)} className={cn(
            "flex-1 flex items-center justify-center gap-2 h-9 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all",
            direction === d ? "bg-blue-500 text-white shadow-md shadow-blue-100" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
          )}>
            {d === 'outbound' ? <PhoneOutgoing size={13} /> : <PhoneIncoming size={13} />}
            {d === 'outbound' ? 'Effettuata' : 'Ricevuta'}
          </button>
        ))}
      </div>
      {/* Outcome */}
      <div className="flex gap-2">
        {([['answered','Risposta','emerald'],['no_answer','No risposta','amber'],['busy','Occupato','red']] as const).map(([val, label, color]) => (
          <button key={val} onClick={() => setOutcome(val)} className={cn(
            "flex-1 h-8 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
            outcome === val
              ? color === 'emerald' ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                : color === 'amber' ? "bg-amber-100 text-amber-700 border border-amber-200"
                : "bg-red-100 text-red-700 border border-red-200"
              : "bg-slate-50 text-slate-400 hover:bg-slate-100"
          )}>{label}</button>
        ))}
      </div>
      <Input value={contact} onChange={e => setContact(e.target.value)} placeholder="Nome contatto / Numero..." className="rounded-xl text-sm" />
      <div className="flex gap-2">
        <Input value={duration} onChange={e => setDuration(e.target.value)} placeholder="Durata (min)" type="number" min="0" className="rounded-xl text-sm w-32" />
        <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Note (opzionale)..." className="rounded-xl text-sm flex-1 min-h-0 h-9 resize-none" />
      </div>
      <button onClick={save} disabled={saving} className="w-full h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider disabled:opacity-60 transition-all">
        {saving ? 'Salvataggio...' : 'Salva'}
      </button>
    </div>
  );
};

// ─── CHIAMATE TAB ─────────────────────────────────────────────────────────────
const ChiamateTab: React.FC<{ userName: string }> = ({ userName }) => {
  const [calls, setCalls] = useState<CRMActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialer, setShowDialer] = useState(false);
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [callTimer, setCallTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadCalls = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'crm_activities'),
        where('type', '==', 'call'),
        orderBy('created_at', 'desc')
      );
      const snap = await getDocs(q);
      setCalls(snap.docs.map(d => ({ id: d.id, ...d.data() } as CRMActivity)));
    } catch (e: any) {
      if (!e?.message?.includes('Missing or insufficient permissions') && e?.code !== 'permission-denied') {
        console.error('Error loading calls:', e);
      }
      setCalls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCalls(); }, []);

  const startSimulatedCall = (number: string) => {
    setActiveCall(number);
    setCallTimer(0);
    timerRef.current = setInterval(() => setCallTimer(t => t + 1), 1000);
    toast.success(`Chiamata a ${number} in corso...`);
  };

  const endCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const duration = Math.floor(callTimer / 60);
    setActiveCall(null);
    setCallTimer(0);
    toast.success(`Chiamata terminata · ${formatTimer(callTimer)}`);
    if (duration > 0 || callTimer > 10) {
      supabaseCRMService.createActivity({
        entity_id: 'standalone',
        entity_type: 'contact',
        type: 'call',
        title: `Chiamata effettuata — ${activeCall}`,
        description: `Esito: Risposta · Durata: ${duration || 1} min`,
        author_name: userName,
      }).then(loadCalls).catch(() => {});
    }
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const formatTimer = (s: number) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;

  const todayCalls = calls.filter(c => {
    try {
      const d = new Date(c.created_at);
      const now = new Date();
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth();
    } catch { return false; }
  });

  const getCallIcon = (title: string) => {
    if (title.includes('ricevuta') || title.includes('Ricevuta') || title.includes('Inbound') || title.includes('inbound')) return PhoneIncoming;
    if (title.includes('Nessuna') || title.includes('no_answer') || title.includes('Mancata') || title.includes('mancata')) return PhoneMissed;
    return PhoneOutgoing;
  };
  const getCallColor = (title: string) => {
    if (title.includes('Mancata') || title.includes('nessuna') || title.includes('Nessuna') || title.includes('Occupato')) return 'text-red-500 bg-red-50';
    if (title.includes('ricevuta') || title.includes('Ricevuta')) return 'text-blue-500 bg-blue-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Active call banner */}
      {activeCall && (
        <div className="bg-emerald-500 text-white px-6 py-3 flex items-center justify-between animate-in slide-in-from-top">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Phone size={16} className="animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest opacity-80">Chiamata in corso</p>
              <p className="font-bold">{activeCall}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xl font-bold">{formatTimer(callTimer)}</span>
            <button onClick={endCall} className="w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all">
              <Phone size={18} className="rotate-[135deg]" />
            </button>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="px-6 py-4 border-b border-slate-100 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-6">
            {[
              { label: 'Oggi', value: todayCalls.length, color: 'text-blue-600' },
              { label: 'Totale', value: calls.length, color: 'text-slate-700' },
              { label: 'Risposte', value: calls.filter(c => !c.title.includes('Nessuna') && !c.title.includes('Occupato')).length, color: 'text-emerald-600' },
            ].map(s => (
              <div key={s.label}>
                <p className={cn("text-2xl font-black", s.color)}>{s.value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <LogCallForm onLogged={loadCalls} userName={userName} />
            <button
              onClick={() => setShowDialer(v => !v)}
              className="flex items-center gap-2 px-4 h-9 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-blue-100 transition-all"
            >
              <PhoneCall size={14} />
              Chiama
            </button>
          </div>
        </div>
      </div>

      {/* Call log */}
      <div className="flex-1 overflow-auto p-6 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-slate-400">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium">Caricamento...</p>
            </div>
          </div>
        ) : calls.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mb-4">
              <PhoneCall size={28} className="text-slate-400" />
            </div>
            <p className="text-slate-600 font-bold mb-1">Nessuna chiamata registrata</p>
            <p className="text-slate-400 text-sm">Usa "Registra chiamata" per aggiungere chiamate manuali o il tastierino per effettuare una chiamata simulata.</p>
          </div>
        ) : (
          calls.map(call => {
            const Icon = getCallIcon(call.title);
            const colorClass = getCallColor(call.title);
            let dateLabel = '';
            try { dateLabel = formatDistanceToNow(new Date(call.created_at), { addSuffix: true, locale: it }); } catch {}
            return (
              <div key={call.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow group">
                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0", colorClass)}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{call.title}</p>
                  <p className="text-[11px] text-slate-500 truncate">{call.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{dateLabel}</p>
                  <p className="text-[10px] text-slate-300">{call.author_name}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dialer */}
      {showDialer && (
        <Dialer onCall={startSimulatedCall} onClose={() => setShowDialer(false)} />
      )}
    </div>
  );
};

// ─── CHAT TAB ─────────────────────────────────────────────────────────────────
const ChatTab: React.FC = () => {
  const { user, tenant } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChat, setActiveChat] = useState<any>(CHANNELS[0]);
  const [directMessages, setDirectMessages] = useState<any[]>([]);
  const [permissionError, setPermissionError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    if (!tenant || !activeChat) return;
    setPermissionError(false);
    setMessages([]);

    const q = query(
      collection(db, 'tenants', tenant.id, 'messages'),
      where('channelId', '==', activeChat.id),
      orderBy('createdAt', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
      setTimeout(scrollToBottom, 100);
    }, (error: any) => {
      if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
        setPermissionError(true);
      }
    });
    return () => unsub();
  }, [tenant, activeChat]);

  useEffect(() => {
    if (!tenant) return;
    const q = query(collection(db, 'tenants', tenant.id, 'users'));
    const unsub = onSnapshot(q, (snap) => {
      setDirectMessages(snap.docs.map(d => ({
        id: d.id,
        name: d.data().displayName || 'Utente',
        status: d.data().status === 'active' ? 'online' : 'offline',
      })));
    }, () => { /* silently ignore DM user list errors */ });
    return () => unsub();
  }, [tenant]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !tenant) return;
    try {
      await addDoc(collection(db, 'tenants', tenant.id, 'messages'), {
        tenantId: tenant.id,
        channelId: activeChat.id,
        senderId: user.uid,
        senderName: user.displayName || 'Utente',
        content: newMessage,
        type: 'text',
        createdAt: serverTimestamp(),
      });
      setNewMessage('');
    } catch (e: any) {
      if (e?.code === 'permission-denied') {
        toast.error('Permessi insufficienti per inviare messaggi');
      }
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 border-r border-slate-100 flex flex-col bg-slate-50/50 shrink-0">
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <Input placeholder="Cerca..." className="pl-9 bg-slate-100 border-none h-8 rounded-full text-xs" />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-6">
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-2 px-2">Canali</h3>
            <div className="space-y-0.5">
              {CHANNELS.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChat(ch)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-sm font-bold",
                    activeChat.id === ch.id
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-100"
                      : "text-slate-500 hover:bg-white hover:shadow-sm"
                  )}
                >
                  <Hash size={14} className={activeChat.id === ch.id ? "text-blue-200" : "text-slate-300"} />
                  {ch.name}
                </button>
              ))}
            </div>
          </div>

          {directMessages.length > 0 && (
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-2 px-2">Messaggi Diretti</h3>
              <div className="space-y-0.5">
                {directMessages.map(dm => (
                  <button
                    key={dm.id}
                    onClick={() => setActiveChat(dm)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-sm font-bold",
                      activeChat.id === dm.id
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-100"
                        : "text-slate-500 hover:bg-white hover:shadow-sm"
                    )}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className={cn("text-[10px]", activeChat.id === dm.id ? "bg-blue-400 text-white" : "bg-slate-200 text-slate-500")}>
                          {dm.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn("absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-white", dm.status === 'online' ? "bg-emerald-500" : "bg-slate-300")} />
                    </div>
                    <span className="flex-1 text-left truncate">{dm.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat pane */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 font-bold">
              {activeChat.type === 'channel' ? <Hash size={17} /> : activeChat.name?.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">{activeChat.name}</h3>
              <div className="flex items-center gap-1">
                <Circle size={6} className="fill-emerald-500 text-emerald-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-blue-500 hover:bg-blue-50 h-8 w-8">
              <Phone size={16} />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-blue-500 hover:bg-blue-50 h-8 w-8">
              <Video size={16} />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-slate-400 h-8 w-8">
              <MoreVertical size={16} />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto p-6 space-y-4 bg-slate-50/30">
          {permissionError ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-14 h-14 bg-amber-50 rounded-3xl flex items-center justify-center mb-3">
                <AlertCircle size={24} className="text-amber-500" />
              </div>
              <p className="font-bold text-slate-700 mb-1">Permessi non configurati</p>
              <p className="text-sm text-slate-400 max-w-xs">
                La chat richiede l'aggiornamento delle Firestore Security Rules per la collezione <code className="bg-slate-100 px-1 rounded text-xs">tenants/{'{id}'}/messages</code>.
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-14 h-14 bg-blue-50 rounded-3xl flex items-center justify-center mb-3">
                <MessageSquare size={24} className="text-blue-400" />
              </div>
              <p className="font-bold text-slate-600 mb-1">Nessun messaggio ancora</p>
              <p className="text-sm text-slate-400">Inizia la conversazione nel canale <strong>{activeChat.name}</strong>.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === user?.uid;
              return (
                <div key={msg.id} className={cn("flex items-end gap-2.5", isMe ? "flex-row-reverse" : "flex-row")}>
                  {!isMe && (
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="bg-slate-200 text-slate-500 text-[10px] font-bold">
                        {msg.senderName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn("max-w-[68%] space-y-1", isMe ? "items-end" : "items-start")}>
                    {!isMe && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{msg.senderName}</p>}
                    <div className={cn(
                      "px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm",
                      isMe ? "bg-blue-500 text-white rounded-br-sm" : "bg-white text-slate-700 rounded-bl-sm border border-slate-100"
                    )}>
                      {msg.content}
                    </div>
                    <p className={cn("text-[9px] font-bold text-slate-300 uppercase tracking-tighter", isMe ? "text-right mr-1" : "ml-1")}>
                      {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'HH:mm') : '...'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={sendMessage} className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
            <Button type="button" variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-blue-500 hover:bg-white h-8 w-8">
              <Paperclip size={16} />
            </Button>
            <input
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder={`Messaggio in #${activeChat.name}...`}
              className="flex-1 bg-transparent outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400"
            />
            <Button type="button" variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-amber-500 hover:bg-white h-8 w-8">
              <Smile size={16} />
            </Button>
            <Button type="submit" disabled={!newMessage.trim()} className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4 h-8 text-[11px] font-black uppercase tracking-wider shadow-md shadow-blue-100 disabled:opacity-50">
              <Send size={14} className="mr-1.5" />
              Invia
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const Chat: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('chat');

  const userName = user?.displayName || user?.email?.split('@')[0] || 'Utente';

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Tab switcher */}
      <div className="flex items-center gap-1 px-6 pt-4 pb-0 border-b border-slate-100 shrink-0">
        {([
          { id: 'chat', label: 'Chat', icon: MessageSquare },
          { id: 'chiamate', label: 'Chiamate', icon: PhoneCall },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-3 text-[11px] font-black uppercase tracking-widest border-b-2 -mb-px transition-all",
              tab === t.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'chat' ? <ChatTab /> : <ChiamateTab userName={userName} />}
    </div>
  );
};

export default Chat;
