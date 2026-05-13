import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Users, Briefcase, Plus, Search, MoreHorizontal, MessageSquare,
  CheckSquare, FileText, Calendar, Settings, ChevronRight, X,
  UserPlus, Target, BarChart2, Clock, Check, Circle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Section = 'list' | 'projects';
const PATH_MAP: Record<string, Section> = {
  '/groups': 'list', '/groups/list': 'list', '/groups/projects': 'projects',
};
const NAV = [
  { id: 'list',     label: 'Gruppi',   icon: Users,    path: '/groups/list' },
  { id: 'projects', label: 'Progetti', icon: Briefcase, path: '/groups/projects' },
];

const GRADIENTS = [
  'from-blue-500 to-indigo-600', 'from-violet-500 to-purple-600', 'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600', 'from-pink-500 to-rose-600', 'from-sky-500 to-blue-600',
];

interface Group {
  id: string; name: string; type: 'group' | 'project'; description: string;
  members: { name: string; avatar: string }[]; tasks: number; files: number;
  chat: number; gradient: string; progress?: number; dueDate?: string; status?: string;
}

const GROUPS: Group[] = [
  {
    id: 'g1', name: 'Team Marketing', type: 'group', description: 'Gestione campagne, contenuti e lead generation',
    members: [{ name: 'Laura B.', avatar: 'L' }, { name: 'Marco R.', avatar: 'M' }, { name: 'Sara C.', avatar: 'S' }, { name: 'Luca F.', avatar: 'Lu' }, { name: '+4', avatar: '+4' }],
    tasks: 12, files: 45, chat: 8, gradient: GRADIENTS[0],
  },
  {
    id: 'g2', name: 'Sviluppo App Mobile', type: 'project', description: 'App iOS/Android Q2 2025',
    members: [{ name: 'Gio V.', avatar: 'G' }, { name: 'An F.', avatar: 'A' }, { name: 'Ro N.', avatar: 'R' }, { name: 'El M.', avatar: 'E' }, { name: 'Pi C.', avatar: 'P' }],
    tasks: 24, files: 12, chat: 34, gradient: GRADIENTS[1], progress: 68, dueDate: '30 Giu 2025', status: 'In corso',
  },
  {
    id: 'g3', name: 'Risorse Umane', type: 'group', description: 'HR, selezione e formazione del personale',
    members: [{ name: 'Car M.', avatar: 'C' }, { name: 'Fra P.', avatar: 'F' }, { name: 'Val R.', avatar: 'V' }],
    tasks: 5, files: 89, chat: 3, gradient: GRADIENTS[2],
  },
  {
    id: 'g4', name: 'Lancio Prodotto Q2', type: 'project', description: 'Lancio Nexus Pro — Aprile 2025',
    members: [{ name: 'Marco R.', avatar: 'M' }, { name: 'Laura B.', avatar: 'L' }, { name: 'Sara C.', avatar: 'S' }, { name: 'Gio V.', avatar: 'G' }, { name: '+8', avatar: '+8' }],
    tasks: 45, files: 156, chat: 128, gradient: GRADIENTS[3], progress: 92, dueDate: '15 Apr 2025', status: 'Completato',
  },
  {
    id: 'g5', name: 'Customer Success', type: 'group', description: 'Onboarding, supporto e retention clienti',
    members: [{ name: 'El R.', avatar: 'E' }, { name: 'Mar P.', avatar: 'M' }, { name: 'Tom S.', avatar: 'T' }],
    tasks: 18, files: 23, chat: 42, gradient: GRADIENTS[4],
  },
  {
    id: 'g6', name: 'Migrazione Dati', type: 'project', description: 'Migrazione infrastruttura su cloud Q3',
    members: [{ name: 'Rob N.', avatar: 'R' }, { name: 'Gio V.', avatar: 'G' }, { name: 'Ale F.', avatar: 'A' }],
    tasks: 31, files: 8, chat: 17, gradient: GRADIENTS[5], progress: 24, dueDate: '31 Set 2025', status: 'In corso',
  },
];

const PROJECT_TASKS = [
  { id: 'pt1', title: 'Design mockup schermate principali', assignee: 'Laura B.', done: true, date: '10 Apr' },
  { id: 'pt2', title: 'Implementazione API autenticazione', assignee: 'Gio V.', done: true, date: '15 Apr' },
  { id: 'pt3', title: 'Test su dispositivi iOS', assignee: 'An F.', done: false, date: '22 Mag' },
  { id: 'pt4', title: 'Integrazione notifiche push', assignee: 'Ro N.', done: false, date: '1 Giu' },
  { id: 'pt5', title: 'Review e QA finale', assignee: 'Marco R.', done: false, date: '20 Giu' },
];

const GroupCard: React.FC<{ group: Group; onClick: () => void }> = ({ group, onClick }) => (
  <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all cursor-pointer group" onClick={onClick}>
    <div className={cn("h-20 bg-gradient-to-r", group.gradient, "relative")}>
      <div className="absolute inset-0 bg-black/10"/>
      <div className="absolute top-3 right-3">
        <span className={cn("text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg text-white",
          group.type === 'project' ? "bg-white/20 backdrop-blur-sm" : "bg-white/20 backdrop-blur-sm")}>
          {group.type === 'project' ? 'Progetto' : 'Gruppo'}
        </span>
      </div>
    </div>
    <div className="px-5 -mt-8 pb-5 relative">
      <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-2xl font-black mb-3 border-4 border-white">
        <div className={cn("w-full h-full rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-xl font-black", group.gradient)}>
          {group.name.charAt(0)}
        </div>
      </div>
      <h3 className="font-black text-slate-800 text-base mb-0.5">{group.name}</h3>
      <p className="text-[11px] text-slate-400 mb-3 line-clamp-1">{group.description}</p>

      {group.progress !== undefined && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Avanzamento</span>
            <span className="text-[11px] font-black text-slate-700">{group.progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full bg-gradient-to-r", group.gradient)} style={{ width: `${group.progress}%` }}/>
          </div>
          {group.status && (
            <p className="text-[10px] font-bold text-slate-400 mt-1">
              {group.status === 'Completato' ? '✓ ' : '⟳ '}{group.status}{group.dueDate ? ` · Scadenza: ${group.dueDate}` : ''}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {group.members.map((m, i) => (
            <div key={i} className={cn("w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white shrink-0",
              i === group.members.length - 1 && m.avatar.startsWith('+') ? "bg-slate-400" : `bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]}`)}>
              {m.avatar.length <= 2 ? m.avatar : m.avatar.charAt(0)}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
          <span className="flex items-center gap-1"><CheckSquare size={11}/>{group.tasks}</span>
          <span className="flex items-center gap-1"><FileText size={11}/>{group.files}</span>
          <span className="flex items-center gap-1"><MessageSquare size={11}/>{group.chat}</span>
        </div>
      </div>
    </div>
  </div>
);

const GroupDetail: React.FC<{ group: Group; onBack: () => void }> = ({ group, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'files' | 'members'>('overview');
  const tabs = [
    { id: 'overview', label: 'Panoramica', icon: BarChart2 },
    { id: 'tasks',    label: 'Task',       icon: CheckSquare, badge: group.tasks },
    { id: 'files',    label: 'File',       icon: FileText,    badge: group.files },
    { id: 'members',  label: 'Membri',     icon: Users,       badge: group.members.length },
  ] as const;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="h-14 px-5 border-b border-slate-100 flex items-center gap-3 bg-white shrink-0">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-all">
          <ChevronRight size={16} className="rotate-180"/>
        </button>
        <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-sm font-black", group.gradient)}>{group.name.charAt(0)}</div>
        <div className="flex-1">
          <p className="font-black text-slate-800 text-sm">{group.name}</p>
          <p className="text-[10px] text-slate-400">{group.members.length} membri · {group.type === 'project' ? 'Progetto' : 'Gruppo'}</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => toast.info('Invita membro')} className="flex items-center gap-1.5 px-3 h-8 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-blue-100 transition-all">
            <UserPlus size={12}/> Invita
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-all"><Settings size={14}/></button>
        </div>
      </div>

      <div className="border-b border-slate-100 px-5 flex items-center gap-1 bg-white shrink-0">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn("flex items-center gap-1.5 px-3 py-3 text-[11px] font-black uppercase tracking-wider border-b-2 transition-all",
              activeTab === tab.id ? "border-blue-500 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600")}>
            <tab.icon size={13}/>
            {tab.label}
            {'badge' in tab && tab.badge ? <span className={cn("w-4 h-4 rounded-full text-[9px] flex items-center justify-center", activeTab === tab.id ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500")}>{tab.badge}</span> : null}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-5">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Task totali', value: group.tasks, icon: CheckSquare, color: 'text-blue-500 bg-blue-50' },
                { label: 'File condivisi', value: group.files, icon: FileText, color: 'text-violet-500 bg-violet-50' },
                { label: 'Messaggi', value: group.chat, icon: MessageSquare, color: 'text-emerald-500 bg-emerald-50' },
              ].map(k => (
                <div key={k.label} className="bg-white border border-slate-100 rounded-2xl p-4">
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-2", k.color)}><k.icon size={15}/></div>
                  <p className="text-2xl font-black text-slate-800">{k.value}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{k.label}</p>
                </div>
              ))}
            </div>
            {group.progress !== undefined && (
              <div className="bg-white border border-slate-100 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-black text-slate-800 text-sm">Avanzamento progetto</h4>
                  <span className="text-2xl font-black text-slate-800">{group.progress}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
                  <div className={cn("h-full rounded-full bg-gradient-to-r transition-all", group.gradient)} style={{ width: `${group.progress}%` }}/>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{group.status}</span>
                  {group.dueDate && <span className="flex items-center gap-1"><Clock size={11}/> Scadenza: {group.dueDate}</span>}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-2">
            {PROJECT_TASKS.map(task => (
              <div key={task.id} className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-3">
                <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                  task.done ? "bg-emerald-500 border-emerald-500" : "border-slate-300")}>
                  {task.done && <Check size={11} className="text-white"/>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-bold", task.done ? "line-through text-slate-400" : "text-slate-700")}>{task.title}</p>
                  <p className="text-[10px] text-slate-400">Assegnato a: {task.assignee}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Clock size={11} className="text-slate-300"/>
                  <span className="text-[10px] text-slate-400">{task.date}</span>
                </div>
              </div>
            ))}
            <button onClick={() => toast.info('Nuovo task')} className="w-full border-2 border-dashed border-slate-200 rounded-xl py-3 text-[11px] font-black text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-all flex items-center justify-center gap-2">
              <Plus size={13}/> Aggiungi task
            </button>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="text-center py-12">
            <FileText size={36} className="text-slate-300 mx-auto mb-3"/>
            <p className="font-bold text-slate-500 mb-1">{group.files} file nel gruppo</p>
            <p className="text-sm text-slate-400 mb-4">Gestisci i file su Nexus Drive</p>
            <button onClick={() => toast.info('Apri Drive')} className="px-4 py-2 rounded-xl bg-blue-500 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-blue-100 transition-all hover:bg-blue-600">
              Apri Drive
            </button>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-2">
            {group.members.map((m, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-black shrink-0", GRADIENTS[i % GRADIENTS.length])}>
                  {m.avatar.startsWith('+') ? m.avatar : m.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-700 text-sm">{m.name.startsWith('+') ? `${m.name} altri` : m.name}</p>
                  <p className="text-[10px] text-slate-400">{i === 0 ? 'Admin' : 'Membro'}</p>
                </div>
                {!m.name.startsWith('+') && (
                  <button onClick={() => toast.info('Invia messaggio')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-all">
                    <MessageSquare size={14}/>
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => toast.info('Invita membro')} className="w-full border-2 border-dashed border-slate-200 rounded-xl py-3 text-[11px] font-black text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-all flex items-center justify-center gap-2">
              <UserPlus size={13}/> Invita membro
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Groups: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const section: Section = PATH_MAP[location.pathname] ?? 'list';
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Group | null>(null);

  const filtered = GROUPS.filter(g => {
    const matchSection = section === 'list' ? g.type === 'group' : g.type === 'project';
    const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase());
    return matchSection && matchSearch;
  });

  return (
    <div className="h-full flex bg-white overflow-hidden">
      <div className="w-52 border-r border-slate-100 flex flex-col bg-slate-50/60 shrink-0">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-sm font-black text-slate-800">Gruppi di lavoro</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">Team & progetti</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(item => {
            const count = GROUPS.filter(g => g.type === (item.id === 'list' ? 'group' : 'project')).length;
            return (
              <button key={item.id} onClick={() => { navigate(item.path); setSelected(null); }}
                className={cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-sm font-bold",
                  section === item.id ? "bg-blue-500 text-white shadow-md shadow-blue-100" : "text-slate-500 hover:bg-white hover:shadow-sm")}>
                <item.icon size={15} className={section === item.id ? "text-blue-200" : "text-slate-400"}/>
                <span className="flex-1 text-left">{item.label}</span>
                <span className={cn("w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center", section === item.id ? "bg-white text-blue-600" : "bg-slate-200 text-slate-600")}>{count}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-100">
          <button onClick={() => toast.info(section === 'list' ? 'Nuovo gruppo' : 'Nuovo progetto')} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold text-slate-400 hover:bg-white hover:text-blue-500 transition-all">
            <Plus size={13}/> {section === 'list' ? 'Nuovo gruppo' : 'Nuovo progetto'}
          </button>
        </div>
      </div>

      {selected ? (
        <GroupDetail group={selected} onBack={() => setSelected(null)}/>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-14 px-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div className="relative flex-1 max-w-xs">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca…" className="pl-8 h-8 text-xs rounded-xl border-slate-200"/>
            </div>
            <button onClick={() => toast.info(section === 'list' ? 'Nuovo gruppo' : 'Nuovo progetto')} className="flex items-center gap-1.5 px-3 h-8 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-blue-100 transition-all">
              <Plus size={12}/> {section === 'list' ? 'Nuovo gruppo' : 'Nuovo progetto'}
            </button>
          </div>
          <div className="flex-1 overflow-auto p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(group => (
                <GroupCard key={group.id} group={group} onClick={() => setSelected(group)}/>
              ))}
              <button onClick={() => toast.info(section === 'list' ? 'Nuovo gruppo' : 'Nuovo progetto')}
                className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-12 text-slate-300 hover:border-blue-300 hover:text-blue-400 transition-all min-h-[200px]">
                <Plus size={28} className="mb-2"/>
                <p className="text-[11px] font-black uppercase tracking-wider">{section === 'list' ? 'Nuovo gruppo' : 'Nuovo progetto'}</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
