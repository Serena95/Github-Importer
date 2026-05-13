import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FileText, Folder, Share2, Upload, Plus, Search, MoreHorizontal,
  FolderPlus, Clock, Star, Eye, Edit2, Trash2, Download, Copy,
  ChevronRight, Home, Users, Lock, Globe, File, FileSpreadsheet,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Section = 'manager' | 'folders' | 'sharing';
const PATH_MAP: Record<string, Section> = {
  '/docs': 'manager', '/docs/manager': 'manager',
  '/docs/folders': 'folders', '/docs/sharing': 'sharing',
};
const NAV = [
  { id: 'manager', label: 'File manager',  icon: FileText,   path: '/docs/manager' },
  { id: 'folders', label: 'Cartelle',      icon: Folder,     path: '/docs/folders' },
  { id: 'sharing', label: 'Condivisione',  icon: Share2,     path: '/docs/sharing' },
];

interface DocFile {
  id: string; name: string; type: 'folder' | 'doc' | 'pdf' | 'sheet' | 'slide';
  size: string; date: string; author: string; starred: boolean; shared: 'private' | 'team' | 'public';
}

const DOCS: DocFile[] = [
  { id: '1', name: 'Contratti Clienti 2025',    type: 'folder', size: '23 file',  date: '1 ora fa',    author: 'Tu', starred: true,  shared: 'team' },
  { id: '2', name: 'Presentazione Aziendale',   type: 'slide',  size: '4.2 MB',  date: 'Ieri',        author: 'Tu', starred: true,  shared: 'public' },
  { id: '3', name: 'Piano Marketing Q1 2025',   type: 'doc',    size: '1.8 MB',  date: '2 giorni fa', author: 'Laura B.', starred: false, shared: 'team' },
  { id: '4', name: 'Listino Prezzi 2025',       type: 'sheet',  size: '980 KB',  date: '3 giorni fa', author: 'Marco R.', starred: false, shared: 'team' },
  { id: '5', name: 'Manuale Utente Nexus',      type: 'doc',    size: '3.1 MB',  date: '1 sett. fa',  author: 'Tu', starred: false, shared: 'public' },
  { id: '6', name: 'Budget Operativo 2025',     type: 'sheet',  size: '2.3 MB',  date: '2 sett. fa',  author: 'Tu', starred: false, shared: 'private' },
  { id: '7', name: 'Template Offerta Standard', type: 'doc',    size: '450 KB',  date: '1 mese fa',   author: 'Tu', starred: false, shared: 'team' },
  { id: '8', name: 'Verbali Riunioni 2025',     type: 'folder', size: '12 file', date: '3 giorni fa', author: 'Tu', starred: false, shared: 'team' },
];

const FOLDERS = [
  { id: 'f1', name: 'Contratti', count: 23, color: 'bg-amber-400', shared: true },
  { id: 'f2', name: 'Proposte Commerciali', count: 15, color: 'bg-blue-500', shared: true },
  { id: 'f3', name: 'Template', count: 8, color: 'bg-emerald-500', shared: true },
  { id: 'f4', name: 'Riunioni', count: 12, color: 'bg-violet-500', shared: false },
  { id: 'f5', name: 'Report Mensili', count: 36, color: 'bg-pink-500', shared: true },
  { id: 'f6', name: 'Archivio 2024', count: 145, color: 'bg-slate-500', shared: false },
];

const SHARED_DOCS = [
  { id: 's1', name: 'Contratto NDA — Cliente ABC', sharedWith: ['Marco R.', 'Laura B.'], access: 'Modifica', date: '1 ora fa' },
  { id: 's2', name: 'Presentazione Q2 2025', sharedWith: ['Team Vendite (8)'], access: 'Visualizza', date: 'Ieri' },
  { id: 's3', name: 'Listino Prezzi', sharedWith: ['Esterni (link pubblico)'], access: 'Visualizza', date: '3 giorni fa' },
  { id: 's4', name: 'Budget Operativo', sharedWith: ['Direzione (3)'], access: 'Modifica', date: '1 sett. fa' },
];

const typeIcon = (type: string) => {
  const icons: Record<string, JSX.Element> = {
    folder: <Folder size={20} className="text-amber-400 fill-amber-400 opacity-90"/>,
    doc:    <FileText size={20} className="text-blue-500"/>,
    pdf:    <FileText size={20} className="text-red-400"/>,
    sheet:  <FileSpreadsheet size={20} className="text-emerald-500"/>,
    slide:  <FileText size={20} className="text-orange-400"/>,
  };
  return icons[type] || <File size={20} className="text-slate-400"/>;
};

const typeColor: Record<string, string> = {
  folder: 'bg-amber-50', doc: 'bg-blue-50', pdf: 'bg-red-50',
  sheet: 'bg-emerald-50', slide: 'bg-orange-50',
};

const sharedBadge = (shared: string) => {
  const map: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
    private: { label: 'Privato', icon: Lock, cls: 'bg-slate-100 text-slate-500' },
    team:    { label: 'Team',    icon: Users, cls: 'bg-blue-100 text-blue-600' },
    public:  { label: 'Pubblico', icon: Globe, cls: 'bg-emerald-100 text-emerald-600' },
  };
  const { label, icon: Icon, cls } = map[shared] || map.private;
  return (
    <span className={cn("flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md", cls)}>
      <Icon size={9}/>{label}
    </span>
  );
};

const ManagerView = () => {
  const [search, setSearch] = useState('');
  const [starred, setStarred] = useState<Record<string, boolean>>({});
  const filtered = DOCS.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
  const recent = filtered.slice(0, 4);
  const all = filtered;

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca documenti…" className="pl-8 h-9 rounded-xl text-sm border-slate-200"/>
        </div>
        <button onClick={() => toast.info('Nuovo documento')} className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-blue-100 transition-all">
          <Plus size={12}/> Nuovo
        </button>
        <button onClick={() => toast.info('Carica file')} className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold transition-all">
          <Upload size={12}/> Carica
        </button>
      </div>

      {!search && (
        <div>
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Recenti</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {recent.map(doc => (
              <div key={doc.id} className="bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-lg transition-all cursor-pointer group">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", typeColor[doc.type])}>
                  {typeIcon(doc.type)}
                </div>
                <p className="text-[11px] font-bold text-slate-700 truncate">{doc.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{doc.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Tutti i documenti</h3>
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50">
                {['Nome', 'Autore', 'Accesso', 'Dimensione', 'Data', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {all.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", typeColor[doc.type])}>
                        {typeIcon(doc.type)}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-700">{doc.name}</p>
                      </div>
                      {(starred[doc.id] || doc.starred) && <Star size={11} className="fill-amber-400 text-amber-400 shrink-0"/>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-slate-400">{doc.author}</td>
                  <td className="px-4 py-3">{sharedBadge(doc.shared)}</td>
                  <td className="px-4 py-3 text-[11px] text-slate-400">{doc.size}</td>
                  <td className="px-4 py-3 text-[11px] text-slate-400">{doc.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => toast.info('Apri documento')} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"><Eye size={12}/></button>
                      <button onClick={() => toast.info('Modifica')} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"><Edit2 size={12}/></button>
                      <button onClick={() => toast.success('Download avviato')} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"><Download size={12}/></button>
                      <button onClick={() => toast.info('Condividi')} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"><Share2 size={12}/></button>
                      <button onClick={() => toast.success('Eliminato')} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={12}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const FoldersView = () => (
  <div className="flex-1 overflow-auto p-6 space-y-4">
    <div className="flex items-center justify-between">
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{FOLDERS.length} cartelle</p>
      <button onClick={() => toast.info('Nuova cartella')} className="flex items-center gap-1.5 px-3 h-8 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-blue-100 transition-all">
        <FolderPlus size={12}/> Nuova cartella
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {FOLDERS.map(folder => (
        <div key={folder.id} className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-lg transition-all cursor-pointer group">
          <div className="flex items-start gap-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", folder.color)}>
              <Folder size={22} className="text-white fill-white opacity-90"/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800">{folder.name}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{folder.count} file</p>
              {folder.shared && (
                <div className="flex items-center gap-1 mt-2 text-[10px] text-blue-500 font-bold">
                  <Users size={10}/> Condivisa con il team
                </div>
              )}
            </div>
            <button onClick={e => { e.stopPropagation(); toast.info('Opzioni cartella'); }} className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-100 text-slate-400 transition-all">
              <MoreHorizontal size={14}/>
            </button>
          </div>
        </div>
      ))}
      <button onClick={() => toast.info('Nuova cartella')} className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-slate-300 hover:border-blue-300 hover:text-blue-400 transition-all min-h-[100px]">
        <FolderPlus size={24} className="mb-2"/>
        <p className="text-[11px] font-black uppercase tracking-wider">Nuova cartella</p>
      </button>
    </div>
  </div>
);

const SharingView = () => (
  <div className="flex-1 overflow-auto p-6 space-y-4">
    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Documenti condivisi da te</p>
    <div className="space-y-3">
      {SHARED_DOCS.map(doc => (
        <div key={doc.id} className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-all">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
            <FileText size={18} className="text-blue-500"/>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 text-sm">{doc.name}</p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
              <span>Con: {doc.sharedWith.join(', ')}</span>
              <span>·</span>
              <span className={cn("font-bold", doc.access === 'Modifica' ? "text-blue-500" : "text-slate-400")}>{doc.access}</span>
              <span>·</span>
              <span>{doc.date}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => toast.info('Copia link')} className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-blue-500 transition-colors">
              <Copy size={12}/> Copia link
            </button>
            <button onClick={() => toast.success('Condivisione revocata')} className="flex items-center gap-1 text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors">
              <Lock size={12}/> Revoca
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Docs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const section: Section = PATH_MAP[location.pathname] ?? 'manager';
  const cur = NAV.find(n => n.id === section);

  return (
    <div className="h-full flex bg-white overflow-hidden">
      <div className="w-52 border-r border-slate-100 flex flex-col bg-slate-50/60 shrink-0">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-sm font-black text-slate-800">Documenti</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">Gestione file aziendali</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(item => (
            <button key={item.id} onClick={() => navigate(item.path)}
              className={cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-sm font-bold",
                section === item.id ? "bg-blue-500 text-white shadow-md shadow-blue-100" : "text-slate-500 hover:bg-white hover:shadow-sm")}>
              <item.icon size={15} className={section === item.id ? "text-blue-200" : "text-slate-400"}/>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-100 space-y-1">
          <button onClick={() => toast.info('Nuovo documento')} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold text-slate-400 hover:bg-white hover:text-blue-500 transition-all">
            <Plus size={13}/> Nuovo documento
          </button>
          <button onClick={() => toast.info('Carica file')} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold text-slate-400 hover:bg-white hover:text-blue-500 transition-all">
            <Upload size={13}/> Carica file
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-14 px-5 border-b border-slate-100 flex items-center gap-2 bg-white shrink-0">
          {cur && <><cur.icon size={16} className="text-slate-400"/><h2 className="font-black text-slate-800 text-sm">{cur.label}</h2></>}
        </div>
        {section === 'manager' && <ManagerView/>}
        {section === 'folders' && <FoldersView/>}
        {section === 'sharing' && <SharingView/>}
      </div>
    </div>
  );
};

export default Docs;
