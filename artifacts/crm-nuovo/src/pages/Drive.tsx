import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Folder, 
  File, 
  FileText, 
  Image as ImageIcon, 
  MoreHorizontal, 
  Search, 
  Upload, 
  Plus,
  Grid,
  List,
  Download,
  Share2,
  Trash2,
  Clock,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const Drive: React.FC = () => {
  const files = [
    { id: 1, name: 'Proposte Commerciali', type: 'folder', size: '12 items', date: '2 ore fa' },
    { id: 2, name: 'Contratti 2024', type: 'folder', size: '45 items', date: 'Ieri' },
    { id: 3, name: 'Logo_Aziendale.png', type: 'image', size: '2.4 MB', date: '3 giorni fa' },
    { id: 4, name: 'Presentazione_Q2.pdf', type: 'pdf', size: '5.1 MB', date: '1 settimana fa' },
    { id: 5, name: 'Budget_Marketing.xlsx', type: 'excel', size: '1.2 MB', date: '2 settimane fa' },
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'folder': return <Folder className="text-amber-400 fill-amber-400" size={24} />;
      case 'image': return <ImageIcon className="text-blue-400" size={24} />;
      case 'pdf': return <FileText className="text-rose-400" size={24} />;
      case 'excel': return <FileText className="text-emerald-400" size={24} />;
      default: return <File className="text-slate-400" size={24} />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#f5f7fb]">
      {/* Drive Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 shrink-0 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-slate-800">Nexus Drive</h1>
            <div className="flex items-center gap-4">
              {['Mio Drive', 'Drive Comune', 'Documenti Recenti', 'Cestino'].map((tab, i) => (
                <button
                  key={tab}
                  className={cn(
                    "text-xs font-bold transition-all uppercase tracking-widest",
                    i === 0 ? "text-blue-500" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
              <Input 
                placeholder="Cerca file o cartelle..." 
                className="pl-9 bg-slate-50 border-none shadow-sm h-9 rounded-full text-xs"
              />
            </div>
            <Button className="bg-[#2FC6F6] hover:bg-[#1eb0e0] text-white font-bold rounded-full px-6 text-xs shadow-lg shadow-blue-200">
              <Upload size={14} className="mr-2" />
              CARICA
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tutti i file</span>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">128 FILE</span>
            </div>
            <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border border-slate-100">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-500 bg-blue-50"><Grid size={14} /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400"><List size={14} /></Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {files.map((file) => (
              <Card key={file.id} className="border-none shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all group cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-white transition-colors">
                      {getFileIcon(file.type)}
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal size={18} />
                    </Button>
                  </div>
                  
                  <h3 className="text-sm font-bold text-slate-800 truncate mb-1">{file.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{file.size}</span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{file.date}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <button className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-slate-300 hover:border-blue-400 hover:text-blue-400 transition-all group">
              <Plus size={32} className="mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Nuovo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Drive;
