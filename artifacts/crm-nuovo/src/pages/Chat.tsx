import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where, getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Send, Paperclip, Smile, MoreVertical, Phone, Video, Search, Circle,
  Hash, MessageSquare, PhoneCall, PhoneIncoming, PhoneMissed, PhoneOutgoing,
  Plus, X, Users, Users2, AlertCircle, ChevronRight, Mic, MicOff,
  VideoOff, Monitor, Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { CRMActivity } from '@/types/crm';
import { toast } from 'sonner';

// ─── types ────────────────────────────────────────────────────────────────────
type Section = 'channel' | 'dm' | 'voip' | 'video';

const PATH_TO_SECTION: Record<string, Section> = {
  '/chat':          'channel',
  '/chat/channels': 'channel',
  '/chat/private':  'dm',
  '/chat/group':    'dm',
  '/chat/voip':     'voip',
  '/chat/video':    'video',
};

const CHANNELS = [
  { id: 'general',  name: 'Generale',  type: 'channel' },
  { id: 'sales',    name: 'Vendite',   type: 'channel' },
  { id: 'support',  name: 'Supporto',  type: 'channel' },
];

// ─── Dialer ───────────────────────────────────────────────────────────────────
const Dialer: React.FC<{ onCall: (n: string) => void; onClose: () => void }> = ({ onCall, onClose }) => {
  const [digits, setDigits] = useState('');
  const keys = ['1','2','3','4','5','6','7','8','9','*','0','#'];
  return (
    <div className="absolute bottom-6 right-6 z-50 bg-white rounded-3xl shadow-2xl border border-slate-100 w-64 overflow-hidden animate-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tastierino</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={15} /></button>
      </div>
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 mb-3">
          <input value={digits} onChange={e => setDigits(e.target.value)} placeholder="Numero..."
            className="flex-1 bg-transparent text-lg font-bold text-slate-800 outline-none tracking-widest" />
          {digits && <button onClick={() => setDigits(d => d.slice(0,-1))} className="text-slate-400"><X size={12} /></button>}
        </div>
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {keys.map(k => (
            <button key={k} onClick={() => setDigits(d => d + k)}
              className="h-12 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 font-bold text-base text-slate-700 transition-all active:scale-95">{k}</button>
          ))}
        </div>
        <button onClick={() => { if (digits) { onCall(digits); onClose(); } }}
          className="w-full h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
          <Phone size={16} /> Chiama
        </button>
      </div>
    </div>
  );
};

// ─── LogCallForm ──────────────────────────────────────────────────────────────
const LogCallForm: React.FC<{ onLogged: () => void; userName: string }> = ({ onLogged, userName }) => {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState<'outbound'|'inbound'>('outbound');
  const [outcome, setOutcome] = useState<'answered'|'no_answer'|'busy'>('answered');
  const [duration, setDuration] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!contact.trim()) { toast.error('Inserisci un contatto'); return; }
    setSaving(true);
    try {
      await supabaseCRMService.createActivity({
        entity_id: 'standalone', entity_type: 'contact', type: 'call',
        title: `${direction === 'outbound' ? 'Chiamata effettuata' : 'Chiamata ricevuta'} — ${contact}`,
        description: `Esito: ${outcome === 'answered' ? 'Risposta' : outcome === 'no_answer' ? 'Nessuna risposta' : 'Occupato'}${duration ? ` · Durata: ${duration} min` : ''}${notes ? `\nNote: ${notes}` : ''}`,
        author_name: userName,
      });
      toast.success('Chiamata registrata'); setContact(''); setNotes(''); setDuration(''); setOpen(false); onLogged();
    } catch { toast.error('Errore nel salvataggio'); } finally { setSaving(false); }
  };

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="flex items-center gap-1.5 px-4 h-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-emerald-100 transition-all shrink-0">
      <Plus size={13} /> Registra
    </button>
  );

  return (
    <div className="border border-slate-100 rounded-2xl p-4 space-y-3 bg-slate-50/50 animate-in slide-in-from-top-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-slate-700">Registra chiamata</span>
        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
      </div>
      <div className="flex gap-2">
        {(['outbound','inbound'] as const).map(d => (
          <button key={d} onClick={() => setDirection(d)} className={cn(
            "flex-1 flex items-center justify-center gap-1.5 h-8 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
            direction === d ? "bg-blue-500 text-white" : "bg-white text-slate-500 border border-slate-200"
          )}>
            {d === 'outbound' ? <PhoneOutgoing size={12}/> : <PhoneIncoming size={12}/>}
            {d === 'outbound' ? 'Effettuata' : 'Ricevuta'}
          </button>
        ))}
      </div>
      <div className="flex gap-1.5">
        {([['answered','Risposta','emerald'],['no_answer','No risposta','amber'],['busy','Occupato','red']] as const).map(([val,label,color]) => (
          <button key={val} onClick={() => setOutcome(val)} className={cn(
            "flex-1 h-7 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
            outcome === val
              ? color==='emerald' ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                : color==='amber' ? "bg-amber-100 text-amber-700 border border-amber-200"
                : "bg-red-100 text-red-700 border border-red-200"
              : "bg-white text-slate-400 border border-slate-200"
          )}>{label}</button>
        ))}
      </div>
      <Input value={contact} onChange={e => setContact(e.target.value)} placeholder="Contatto / Numero..." className="h-8 rounded-xl text-xs" />
      <div className="flex gap-2">
        <Input value={duration} onChange={e => setDuration(e.target.value)} placeholder="Min" type="number" min="0" className="h-8 rounded-xl text-xs w-20" />
        <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Note..." className="h-8 rounded-xl text-xs flex-1" />
      </div>
      <button onClick={save} disabled={saving}
        className="w-full h-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider disabled:opacity-60 transition-all">
        {saving ? 'Salvataggio...' : 'Salva'}
      </button>
    </div>
  );
};

// ─── VoIP / Chiamate section ──────────────────────────────────────────────────
const SectionVoip: React.FC<{ userName: string }> = ({ userName }) => {
  const [calls, setCalls] = useState<CRMActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialer, setShowDialer] = useState(false);
  const [activeCall, setActiveCall] = useState<string|null>(null);
  const [callTimer, setCallTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const loadCalls = async () => {
    setLoading(true);
    try {
      const q = query(collection(db,'crm_activities'), where('type','==','call'), orderBy('created_at','desc'));
      const snap = await getDocs(q);
      setCalls(snap.docs.map(d => ({id:d.id,...d.data()} as CRMActivity)));
    } catch (e: any) {
      if (!e?.message?.includes('Missing or insufficient permissions') && e?.code !== 'permission-denied') console.error(e);
      setCalls([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadCalls(); }, []);
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const startCall = (number: string) => {
    setActiveCall(number); setCallTimer(0);
    timerRef.current = setInterval(() => setCallTimer(t => t+1), 1000);
    toast.success(`Chiamata a ${number} in corso…`);
  };
  const endCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const durMin = Math.max(1, Math.floor(callTimer/60));
    const num = activeCall;
    setActiveCall(null); setCallTimer(0);
    toast.success(`Chiamata terminata · ${fmt(callTimer)}`);
    supabaseCRMService.createActivity({
      entity_id:'standalone', entity_type:'contact', type:'call',
      title:`Chiamata effettuata — ${num}`,
      description:`Esito: Risposta · Durata: ${durMin} min`,
      author_name: userName,
    }).then(loadCalls).catch(()=>{});
  };

  const getCallMeta = (title: string) => {
    if (title.includes('Nessuna') || title.includes('no_answer') || title.includes('Occupato')) return { Icon: PhoneMissed, cls: 'text-red-500 bg-red-50' };
    if (title.includes('ricevuta') || title.includes('Ricevuta')) return { Icon: PhoneIncoming, cls: 'text-blue-500 bg-blue-50' };
    return { Icon: PhoneOutgoing, cls: 'text-emerald-600 bg-emerald-50' };
  };

  const today = calls.filter(c => { try { const d=new Date(c.created_at); const n=new Date(); return d.toDateString()===n.toDateString(); } catch{return false;} });

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Active call banner */}
      {activeCall && (
        <div className="bg-emerald-500 text-white px-6 py-3 flex items-center justify-between shrink-0 animate-in slide-in-from-top">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Phone size={15} className="animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">In chiamata</p>
              <p className="font-bold text-sm">{activeCall}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg font-bold">{fmt(callTimer)}</span>
            <button onClick={endCall} className="w-9 h-9 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all">
              <Phone size={16} className="rotate-[135deg]" />
            </button>
          </div>
        </div>
      )}

      {/* Header stats */}
      <div className="px-6 py-4 border-b border-slate-100 bg-white shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex gap-6">
            {[['Oggi', today.length,'text-blue-600'],['Totale',calls.length,'text-slate-700'],['Risposte',calls.filter(c=>!c.title.includes('Nessuna')&&!c.title.includes('Occupato')).length,'text-emerald-600']].map(([l,v,cls])=>(
              <div key={String(l)}>
                <p className={cn("text-2xl font-black", String(cls))}>{v}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{l}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <LogCallForm onLogged={loadCalls} userName={userName} />
            <button onClick={() => setShowDialer(v=>!v)}
              className="flex items-center gap-1.5 px-4 h-8 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-blue-100 transition-all shrink-0">
              <PhoneCall size={13}/> Chiama
            </button>
          </div>
        </div>
      </div>

      {/* Call log */}
      <div className="flex-1 overflow-auto p-5 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-slate-400">
            <div className="text-center">
              <div className="w-7 h-7 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs font-medium">Caricamento…</p>
            </div>
          </div>
        ) : calls.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-56 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-3xl flex items-center justify-center mb-3">
              <PhoneCall size={26} className="text-slate-400" />
            </div>
            <p className="text-slate-600 font-bold mb-1">Nessuna chiamata</p>
            <p className="text-sm text-slate-400 max-w-xs">Usa "Registra" per aggiungere chiamate manuali o "Chiama" per avviarne una simulata.</p>
          </div>
        ) : calls.map(call => {
          const { Icon, cls } = getCallMeta(call.title);
          let rel = ''; try { rel = formatDistanceToNow(new Date(call.created_at),{addSuffix:true,locale:it}); } catch{}
          return (
            <div key={call.id} className="bg-white border border-slate-100 rounded-2xl px-4 py-3 flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className={cn("w-9 h-9 rounded-2xl flex items-center justify-center shrink-0", cls)}>
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-sm truncate">{call.title}</p>
                <p className="text-[11px] text-slate-400 truncate">{call.description}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] font-semibold text-slate-400">{rel}</p>
                <p className="text-[9px] text-slate-300">{call.author_name}</p>
              </div>
            </div>
          );
        })}
      </div>

      {showDialer && <Dialer onCall={startCall} onClose={() => setShowDialer(false)} />}
    </div>
  );
};

// ─── Video section ────────────────────────────────────────────────────────────
const MOCK_ROOMS = [
  { id: '1', name: 'Sala Riunioni — Team Vendite', participants: 3, scheduled: '14:00', active: true },
  { id: '2', name: 'Daily Stand-up', participants: 0, scheduled: '09:30', active: false },
  { id: '3', name: 'Demo Cliente', participants: 0, scheduled: 'Domani 10:00', active: false },
];

const SectionVideo: React.FC = () => {
  const [inCall, setInCall] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [activeRoom, setActiveRoom] = useState<string|null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const fmt = (s:number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const join = (room: typeof MOCK_ROOMS[0]) => {
    setInCall(true); setActiveRoom(room.name); setElapsed(0);
    timerRef.current = setInterval(() => setElapsed(t=>t+1), 1000);
  };
  const leave = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setInCall(false); setActiveRoom(null); setElapsed(0);
  };
  useEffect(() => () => { if(timerRef.current) clearInterval(timerRef.current); }, []);

  if (inCall) return (
    <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
      {/* Video grid */}
      <div className="flex-1 p-6 grid grid-cols-2 gap-4">
        {['Tu', 'Marco R.', 'Giulia B.'].map((name, i) => (
          <div key={i} className={cn("rounded-3xl bg-slate-800 flex flex-col items-center justify-center relative overflow-hidden", i===0 && "col-span-2 row-span-1")}>
            <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mb-2">
              <span className="text-2xl font-black text-slate-400">{name.charAt(0)}</span>
            </div>
            <p className="text-white font-bold text-sm">{name}</p>
            {i===0 && !camOn && <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center"><VideoOff size={28} className="text-slate-500"/></div>}
            <div className="absolute bottom-3 right-3 flex gap-1.5">
              <div className="w-6 h-6 rounded-full bg-slate-700/80 flex items-center justify-center">
                {micOn || i>0 ? <Mic size={11} className="text-emerald-400"/> : <MicOff size={11} className="text-red-400"/>}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Controls */}
      <div className="bg-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Circle size={8} className="fill-emerald-500 text-emerald-500" />
          <span className="font-mono font-bold text-white">{fmt(elapsed)}</span>
          <span className="text-slate-500 text-xs">· {activeRoom}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setMicOn(v=>!v)} className={cn("w-11 h-11 rounded-full flex items-center justify-center transition-all", micOn?"bg-slate-700 text-white":"bg-red-500 text-white")}>
            {micOn ? <Mic size={18}/> : <MicOff size={18}/>}
          </button>
          <button onClick={() => setCamOn(v=>!v)} className={cn("w-11 h-11 rounded-full flex items-center justify-center transition-all", camOn?"bg-slate-700 text-white":"bg-red-500 text-white")}>
            {camOn ? <Video size={18}/> : <VideoOff size={18}/>}
          </button>
          <button className="w-11 h-11 rounded-full bg-slate-700 text-white flex items-center justify-center">
            <Monitor size={18}/>
          </button>
          <button onClick={leave} className="w-11 h-11 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all">
            <Phone size={18} className="rotate-[135deg]"/>
          </button>
        </div>
        <div className="w-32" />
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-black text-slate-800">Video Call</h2>
          <p className="text-sm text-slate-400">Sale riunioni e video conferenze</p>
        </div>
        <button className="flex items-center gap-2 px-4 h-9 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-blue-100 transition-all">
          <Plus size={14}/> Nuova sala
        </button>
      </div>
      <div className="space-y-3">
        {MOCK_ROOMS.map(room => (
          <div key={room.id} className="bg-white border border-slate-100 rounded-2xl px-5 py-4 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0", room.active ? "bg-blue-500" : "bg-slate-100")}>
              <Video size={18} className={room.active ? "text-white" : "text-slate-400"} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-bold text-slate-800 text-sm truncate">{room.name}</p>
                {room.active && <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider"><Circle size={5} className="fill-emerald-500 text-emerald-500"/> Live</span>}
              </div>
              <p className="text-[11px] text-slate-400">
                {room.active ? `${room.participants} partecipanti` : `Pianificata: ${room.scheduled}`}
              </p>
            </div>
            <button
              onClick={() => join(room)}
              className={cn("px-4 h-8 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all shrink-0",
                room.active
                  ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-100"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              )}
            >
              {room.active ? 'Partecipa' : 'Entra'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Chat section ─────────────────────────────────────────────────────────────
const SectionChat: React.FC<{ activeItem: any; onSelectItem: (item:any)=>void; dmList: any[] }> = ({ activeItem, onSelectItem, dmList }) => {
  const { user, tenant } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [permissionError, setPermissionError] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const scroll = () => endRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    if (!tenant || !activeItem) return;
    setPermissionError(false); setMessages([]);
    const q = query(collection(db,'tenants',tenant.id,'messages'), where('channelId','==',activeItem.id), orderBy('createdAt','asc'));
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({id:d.id,...d.data()} as Message)));
      setTimeout(scroll, 80);
    }, (err: any) => {
      if (err?.code==='permission-denied' || err?.message?.includes('Missing or insufficient permissions')) setPermissionError(true);
    });
    return () => unsub();
  }, [tenant, activeItem]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !tenant) return;
    try {
      await addDoc(collection(db,'tenants',tenant.id,'messages'), {
        tenantId: tenant.id, channelId: activeItem.id,
        senderId: user.uid, senderName: user.displayName||'Utente',
        content: newMessage, type:'text', createdAt: serverTimestamp(),
      });
      setNewMessage('');
    } catch (e:any) {
      if (e?.code==='permission-denied') toast.error('Permessi insufficienti');
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="h-14 px-5 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
            {activeItem?.type==='channel' ? <Hash size={15}/> : <span className="text-xs font-black">{activeItem?.name?.charAt(0)}</span>}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">{activeItem?.name}</p>
            <div className="flex items-center gap-1"><Circle size={6} className="fill-emerald-500 text-emerald-500"/><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Online</span></div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-blue-500 hover:bg-blue-50"><Phone size={15}/></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-blue-500 hover:bg-blue-50"><Video size={15}/></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400"><MoreVertical size={15}/></Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-5 space-y-4 bg-slate-50/30">
        {permissionError ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-13 h-13 bg-amber-50 rounded-2xl flex items-center justify-center mb-3 p-3"><AlertCircle size={22} className="text-amber-500"/></div>
            <p className="font-bold text-slate-700 mb-1">Permessi non configurati</p>
            <p className="text-xs text-slate-400 max-w-xs">Le Firestore Security Rules non consentono l'accesso a <code className="bg-slate-100 px-1 rounded">tenants/{'{id}'}/messages</code>.</p>
          </div>
        ) : messages.length===0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-3"><MessageSquare size={20} className="text-blue-400"/></div>
            <p className="font-bold text-slate-600 mb-1">Nessun messaggio ancora</p>
            <p className="text-xs text-slate-400">Inizia la conversazione in <strong>{activeItem?.name}</strong>.</p>
          </div>
        ) : messages.map(msg => {
          const isMe = msg.senderId === user?.uid;
          return (
            <div key={msg.id} className={cn("flex items-end gap-2", isMe?"flex-row-reverse":"flex-row")}>
              {!isMe && <Avatar className="h-7 w-7 shrink-0"><AvatarFallback className="bg-slate-200 text-slate-500 text-[10px] font-bold">{msg.senderName?.charAt(0)}</AvatarFallback></Avatar>}
              <div className={cn("max-w-[68%] space-y-0.5", isMe?"items-end":"items-start")}>
                {!isMe && <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{msg.senderName}</p>}
                <div className={cn("px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm", isMe?"bg-blue-500 text-white rounded-br-sm":"bg-white text-slate-700 rounded-bl-sm border border-slate-100")}>
                  {msg.content}
                </div>
                <p className={cn("text-[9px] font-bold text-slate-300 uppercase tracking-tighter", isMe?"text-right mr-1":"ml-1")}>
                  {msg.createdAt?.toDate ? format(msg.createdAt.toDate(),'HH:mm') : '…'}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef}/>
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        <form onSubmit={send} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-100 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-white shrink-0"><Paperclip size={14}/></Button>
          <input value={newMessage} onChange={e=>setNewMessage(e.target.value)} placeholder={`Messaggio in ${activeItem?.type==='channel'?'#':''}${activeItem?.name}…`}
            className="flex-1 bg-transparent outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400"/>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-white shrink-0"><Smile size={14}/></Button>
          <Button type="submit" disabled={!newMessage.trim()} className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-3 h-7 text-[10px] font-black uppercase tracking-wider shadow-md shadow-blue-100 disabled:opacity-50 shrink-0">
            <Send size={12} className="mr-1"/>Invia
          </Button>
        </form>
      </div>
    </div>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
interface SidebarItem {
  id: string;
  label: string;
  section: Section;
  icon?: React.ReactNode;
  badge?: number;
  sub?: boolean;
  status?: 'online'|'offline';
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const Chat: React.FC = () => {
  const { user, tenant } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Utente';

  const section: Section = PATH_TO_SECTION[location.pathname] ?? 'channel';

  const [activeChat, setActiveChat] = useState<any>(CHANNELS[0]);
  const [dmList, setDmList] = useState<any[]>([]);

  useEffect(() => {
    if (!tenant) return;
    const q = query(collection(db,'tenants',tenant.id,'users'));
    const unsub = onSnapshot(q, snap => {
      setDmList(snap.docs.map(d => ({id:d.id, name:d.data().displayName||'Utente', status:d.data().status==='active'?'online':'offline', type:'dm'})));
    }, ()=>{});
    return () => unsub();
  }, [tenant]);

  // When section changes, reset to sensible defaults
  useEffect(() => {
    if (section==='channel') setActiveChat(CHANNELS[0]);
    if (section==='dm' && dmList.length>0) setActiveChat(dmList[0]);
  }, [section]);

  // Nav items
  const navChannels: SidebarItem[] = CHANNELS.map(ch => ({ id: ch.id, label: ch.name, section:'channel', icon:<Hash size={13}/>, sub:true }));
  const navDMs: SidebarItem[] = dmList.map(dm => ({ id:dm.id, label:dm.name, section:'dm', sub:true, status:dm.status }));

  const selectNav = (item: SidebarItem) => {
    navigate(item.section==='channel'?'/chat/channels':item.section==='dm'?'/chat/private':item.section==='voip'?'/chat/voip':'/chat/video');
    if (item.section==='channel') setActiveChat(CHANNELS.find(c=>c.id===item.id)||CHANNELS[0]);
    if (item.section==='dm') setActiveChat(dmList.find(d=>d.id===item.id));
  };

  const isActive = (item: SidebarItem) => {
    if (item.section!==section) return false;
    if (item.section==='channel') return activeChat?.id===item.id;
    if (item.section==='dm') return activeChat?.id===item.id;
    return true;
  };

  return (
    <div className="h-full flex bg-white overflow-hidden">
      {/* ── Sidebar ── */}
      <div className="w-64 border-r border-slate-100 flex flex-col bg-slate-50/60 shrink-0">
        <div className="p-4 border-b border-slate-100 bg-white">
          <h2 className="text-base font-black text-slate-800 mb-3">Comunicazioni</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12}/>
            <Input placeholder="Cerca…" className="pl-8 bg-slate-100 border-none h-7 rounded-full text-xs"/>
          </div>
        </div>

        <nav className="flex-1 overflow-auto p-3 space-y-5">
          {/* Canali */}
          <div>
            <button onClick={() => navigate('/chat/channels')}
              className="w-full flex items-center justify-between px-2 py-1 group mb-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] group-hover:text-slate-600 transition-colors">Canali</span>
              <Plus size={12} className="text-slate-300 group-hover:text-slate-500 transition-colors"/>
            </button>
            {navChannels.map(item => (
              <button key={item.id} onClick={() => selectNav(item)}
                className={cn("w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold transition-all",
                  isActive(item) ? "bg-blue-500 text-white shadow-md shadow-blue-100" : "text-slate-500 hover:bg-white hover:shadow-sm")}>
                <span className={isActive(item)?"text-blue-200":"text-slate-300"}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* DM */}
          <div>
            <button onClick={() => navigate('/chat/private')}
              className="w-full flex items-center justify-between px-2 py-1 group mb-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] group-hover:text-slate-600 transition-colors">Messaggi Diretti</span>
              <Plus size={12} className="text-slate-300 group-hover:text-slate-500 transition-colors"/>
            </button>
            {navDMs.length === 0 ? (
              <p className="text-[11px] text-slate-300 px-3 py-1">Nessun membro</p>
            ) : navDMs.map(item => (
              <button key={item.id} onClick={() => selectNav(item)}
                className={cn("w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold transition-all",
                  isActive(item) ? "bg-blue-500 text-white shadow-md shadow-blue-100" : "text-slate-500 hover:bg-white hover:shadow-sm")}>
                <div className="relative shrink-0">
                  <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black", isActive(item)?"bg-blue-400 text-white":"bg-slate-200 text-slate-500")}>
                    {item.label.charAt(0)}
                  </div>
                  <div className={cn("absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white", item.status==='online'?"bg-emerald-500":"bg-slate-300")}/>
                </div>
                <span className="flex-1 text-left truncate">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100"/>

          {/* Chiamate VoIP */}
          <button onClick={() => navigate('/chat/voip')}
            className={cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold transition-all",
              section==='voip' ? "bg-blue-500 text-white shadow-md shadow-blue-100" : "text-slate-500 hover:bg-white hover:shadow-sm")}>
            <PhoneCall size={15} className={section==='voip'?"text-blue-200":"text-slate-400"}/>
            Chiamate
          </button>

          {/* Video call */}
          <button onClick={() => navigate('/chat/video')}
            className={cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold transition-all -mt-3",
              section==='video' ? "bg-blue-500 text-white shadow-md shadow-blue-100" : "text-slate-500 hover:bg-white hover:shadow-sm")}>
            <Video size={15} className={section==='video'?"text-blue-200":"text-slate-400"}/>
            Video Call
          </button>
        </nav>
      </div>

      {/* ── Content ── */}
      {section==='voip'  && <SectionVoip userName={userName}/>}
      {section==='video' && <SectionVideo/>}
      {(section==='channel'||section==='dm') && (
        <SectionChat activeItem={activeChat} onSelectItem={setActiveChat} dmList={dmList}/>
      )}
    </div>
  );
};

export default Chat;
