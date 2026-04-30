import React from 'react';
import { FileText, Folder, Share2, Upload, Plus, Search, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const Docs: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Documenti</h1>
          <p className="text-slate-500">Gestisci i tuoi documenti e file aziendali</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-[#2FC6F6] hover:bg-[#1eb0e0] text-white rounded-full px-6 font-bold">
            <Upload size={18} className="mr-2" />
            CARICA
          </Button>
          <Button variant="outline" className="rounded-full px-6 font-bold border-blue-200 text-blue-600 hover:bg-blue-50">
            <Plus size={18} className="mr-2" />
            CREA
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input placeholder="Cerca documenti..." className="pl-10 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-blue-200" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon"><Folder size={20} className="text-slate-500" /></Button>
          <Button variant="ghost" size="icon"><Share2 size={20} className="text-slate-500" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: 'Contratti 2024', type: 'folder', size: '--', date: '2 ore fa' },
          { name: 'Presentazione Aziendale', type: 'pdf', size: '4.2 MB', date: 'Ieri' },
          { name: 'Listino Prezzi', type: 'xlsx', size: '1.1 MB', date: '3 giorni fa' },
          { name: 'Manuale Utente', type: 'docx', size: '2.5 MB', date: '1 settimana fa' },
        ].map((file, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer group border-slate-100">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                {file.type === 'folder' ? <Folder size={32} /> : <FileText size={32} />}
              </div>
              <h3 className="font-semibold text-slate-800 truncate w-full">{file.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{file.size} • {file.date}</p>
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal size={16} />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Docs;
