import React, { useState } from 'react';
import {
  Folder, File, FileText, Image as ImageIcon, MoreHorizontal, Search,
  Upload, Plus, Grid, List, Download, Share2, Trash2, Clock, Star,
  ChevronRight, Home, HardDrive, Users, ArrowUpRight, Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type ViewMode = 'grid' | 'list';
type DriveSection = 'personal' | 'team' | 'shared' | 'trash';

interface FileItem {
  id: string; name: string; type: 'folder' | 'pdf' | 'image' | 'excel' | 'doc' | 'video' | 'file';
  size: string; date: string; starred: boolean; shared: boolean; owner?: string;
}

const SECTIONS: { id: DriveSection; label: string; icon: React.ElementType }[] = [
  { id: 'personal', label: 'Mio Drive',        icon: HardDrive },
  { id: 'team',     label: 'Drive Team',        icon: Users },
  { id: 'shared',   label: 'Condivisi con me',  icon: Share2 },
  { id: 'trash',    label: 'Cestino',           icon: Trash2 },
];

const ALL_FILES: Record<DriveSection, FileItem[]> = {
  personal: [
    { id: '1', name: 'Proposte Commerciali',    type: 'folder', size: '12 elementi', date: '2 ore fa',     starred: true,  shared: false },
    { id: '2', name: 'Contratti 2025',          type: 'folder', size: '45 elementi', date: 'Ieri',         starred: false, shared: true },
    { id: '3', name: 'Logo_Aziendale.png',      type: 'image',  size: '2.4 MB',     date: '3 giorni fa',  starred: false, shared: false },
    { id: '4', name: 'Presentazione_Q2.pdf',    type: 'pdf',    size: '5.1 MB',     date: '1 sett. fa',   starred: true,  shared: true },
    { id: '5', name: 'Budget_Marketing.xlsx',   type: 'excel',  size: '1.2 MB',     date: '2 sett. fa',   starred: false, shared: false },
    { id: '6', name: 'Manuale_Nexus.pdf',       type: 'pdf',    size: '3.8 MB',     date: '1 mese fa',    starred: false, shared: true },
    { id: '7', name: 'Foto_Team_2025.zip',      type: 'file',   size: '48 MB',      date: '2 mesi fa',    starred: false, shared: false },
  ],
  team: [
    { id: 't1', name: 'Risorse Marketing',      type: 'folder', size: '89 elementi', date: '1 ora fa',     starred: false, shared: true, owner: 'Laura B.' },
    { id: 't2', name: 'Template Offerte',       type: 'folder', size: '23 elementi', date: 'Ieri',         starred: true,  shared: true, owner: 'Marco R.' },
    { id: 't3', name: 'Brand Guidelines.pdf',   type: 'pdf',    size: '12 MB',      date: '3 giorni fa',  starred: false, shared: true, owner: 'Sara C.' },
    { id: 't4', name: 'Video_Demo_v2.mp4',      type: 'video',  size: '234 MB',     date: '1 sett. fa',   starred: false, shared: true, owner: 'Luca F.' },
  ],
  shared: [
    { id: 's1', name: 'Report Cliente ABC.pdf', type: 'pdf',    size: '2.1 MB',     date: 'Ieri',         starred: false, shared: true, owner: 'Cliente ABC' },
    { id: 's2', name: 'Dati Migrazione.xlsx',   type: 'excel',  size: '4.5 MB',     date: '2 giorni fa',  starred: false, shared: true, owner: 'Partner XY' },
  ],
  trash: [
    { id: 'tr1', name: 'Vecchio Logo.png',      type: 'image',  size: '1.2 MB',     date: '5 giorni fa',  starred: false, shared: false },
    { id: 'tr2', name: 'Bozza_Contratto.docx',  type: 'doc',    size: '845 KB',     date: '1 sett. fa',   starred: false, shared: false },
  ],
};

const FILE_COLORS: Record<string, string> = {
  folder: 'text-amber-400', pdf: 'text-red-400', image: 'text-blue-400',
  excel: 'text-emerald-500', doc: 'text-blue-600', video: 'text-violet-500', file: 'text-slate-400',
};
const FILE_BG: Record<string, string> = {
  folder: 'bg-amber-50', pdf: 'bg-red-50', image: 'bg-blue-50',
  excel: 'bg-emerald-50', doc: 'bg-blue-50', video: 'bg-violet-50', file: 'bg-slate-50',
};

const FileIcon = ({ type, size = 24 }: { type: string; size?: number }) => {
  const cls = FILE_COLORS[type] || 'text-slate-400';
  if (type === 'folder')  return <Folder size={size} className={cls + ' fill-current opacity-90'}/>;
  if (type === 'image')   return <ImageIcon size={size} className={cls}/>;
  if (type === 'pdf')     return <FileText size={size} className={cls}/>;
  if (type === 'excel')   return <FileText size={size} className={cls}/>;
  if (type === 'doc')     return <FileText size={size} className={cls}/>;
  if (type === 'video')   return <FileText size={size} className={cls}/>;
  return <File size={size} className={cls}/>;
};

const Drive: React.FC = () => {
  const [section, setSection] = useState<DriveSection>('personal');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [starred, setStarred] = useState<Record<string, boolean>>({});

  const files = ALL_FILES[section];
  const filtered = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStarred(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const usedGB = 4.8;
  const totalGB = 50;

  return (
    <div className="h-full flex bg-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-52 border-r border-slate-100 flex flex-col bg-slate-50/60 shrink-0">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-sm font-black text-slate-800">Nexus Drive</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">Archiviazione file</p>
        </div>

        <div className="p-3">
          <button onClick={() => toast.info('Carica file')} className="w-full flex items-center justify-center gap-2 h-9 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-blue-100 transition-all">
            <Plus size={13}/> Nuovo
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setSection(s.id)}
              className={cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-sm font-bold",
                section === s.id ? "bg-blue-500 text-white shadow-md shadow-blue-100" : "text-slate-500 hover:bg-white hover:shadow-sm")}>
              <s.icon size={15} className={section === s.id ? "text-blue-200" : "text-slate-400"}/>
              {s.label}
            </button>
          ))}
        </nav>

        {/* Storage meter */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-black text-slate-500">Spazio utilizzato</p>
            <p className="text-[10px] font-black text-slate-400">{usedGB}/{totalGB} GB</p>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all" style={{ width: `${(usedGB/totalGB)*100}%` }}/>
          </div>
          <p className="text-[9px] text-slate-400 mt-1">{totalGB - usedGB} GB disponibili</p>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="h-14 px-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <Home size={14} className="text-slate-400"/>
            <ChevronRight size={12} className="text-slate-300"/>
            <span className="font-bold text-slate-600">{SECTIONS.find(s => s.id === section)?.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca file…" className="pl-8 h-8 w-48 text-xs rounded-xl border-slate-200"/>
            </div>
            <button onClick={() => setViewMode('grid')} className={cn("w-8 h-8 flex items-center justify-center rounded-lg transition-all", viewMode === 'grid' ? "bg-blue-100 text-blue-600" : "text-slate-400 hover:bg-slate-100")}>
              <Grid size={15}/>
            </button>
            <button onClick={() => setViewMode('list')} className={cn("w-8 h-8 flex items-center justify-center rounded-lg transition-all", viewMode === 'list' ? "bg-blue-100 text-blue-600" : "text-slate-400 hover:bg-slate-100")}>
              <List size={15}/>
            </button>
            <button onClick={() => toast.info('Carica file')} className="flex items-center gap-1.5 px-3 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold transition-all">
              <Upload size={12}/> Carica
            </button>
          </div>
        </div>

        {/* Files */}
        <div className="flex-1 overflow-auto p-5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <HardDrive size={36} className="text-slate-300 mb-3"/>
              <p className="font-bold text-slate-500">Nessun file trovato</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filtered.map(file => (
                <div key={file.id} className="group bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-lg transition-all cursor-pointer relative">
                  <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={e => toggleStar(file.id, e)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-all">
                      <Star size={11} className={cn(starred[file.id] || file.starred ? "fill-amber-400 text-amber-400" : "text-slate-300")}/>
                    </button>
                    <button onClick={e => { e.stopPropagation(); toast.info('Opzioni file'); }} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-all">
                      <MoreHorizontal size={11} className="text-slate-400"/>
                    </button>
                  </div>
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-3 mx-auto", FILE_BG[file.type])}>
                    <FileIcon type={file.type} size={26}/>
                  </div>
                  <p className="text-[11px] font-bold text-slate-700 text-center truncate">{file.name}</p>
                  <p className="text-[10px] text-slate-400 text-center mt-0.5">{file.size}</p>
                  {file.shared && <div className="absolute bottom-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"><Share2 size={8} className="text-white"/></div>}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-50">
                    {['Nome', 'Proprietario', 'Dimensione', 'Ultima modifica', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(file => (
                    <tr key={file.id} className="hover:bg-slate-50/50 cursor-pointer group transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", FILE_BG[file.type])}>
                            <FileIcon type={file.type} size={16}/>
                          </div>
                          <p className="font-bold text-slate-700 text-sm">{file.name}</p>
                          {file.shared && <Share2 size={11} className="text-blue-400 shrink-0"/>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-400">{file.owner || 'Tu'}</td>
                      <td className="px-4 py-3 text-[11px] text-slate-400">{file.size}</td>
                      <td className="px-4 py-3 text-[11px] text-slate-400">{file.date}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => toast.info('Anteprima')} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-all"><Eye size={13}/></button>
                          <button onClick={() => toast.success('Download avviato')} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-all"><Download size={13}/></button>
                          <button onClick={() => toast.info('Condividi')} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-all"><Share2 size={13}/></button>
                          {section === 'trash'
                            ? <button onClick={() => toast.success('File ripristinato')} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-100 text-slate-400 hover:text-blue-500 transition-all"><ArrowUpRight size={13}/></button>
                            : <button onClick={() => toast.success('File eliminato')} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={13}/></button>
                          }
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Drive;
