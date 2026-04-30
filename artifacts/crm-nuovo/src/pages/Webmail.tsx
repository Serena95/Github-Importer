import React, { useState } from 'react';
import { Mail, Inbox, Send, FileSignature, Search, Plus, Star, Trash2, Archive, MoreVertical, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Webmail: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sidebarNavItems = [
    { icon: Inbox, label: 'Posta in arrivo', count: 12, active: true },
    { icon: Send, label: 'Inviati', count: 0 },
    { icon: Star, label: 'Speciali', count: 2 },
    { icon: FileSignature, label: 'Bozze', count: 5 },
    { icon: Archive, label: 'Archivio', count: 0 },
    { icon: Trash2, label: 'Cestino', count: 0 },
  ];

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4">
        <Button className="w-full bg-[#2FC6F6] hover:bg-[#1eb0e0] text-white rounded-full font-bold">
          <Plus size={18} className="mr-2" />
          SCRIVI
        </Button>
      </div>
      <nav className="flex-1 px-2 space-y-1">
        {sidebarNavItems.map((item, i) => (
          <button
            key={i}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              item.active ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={18} />
              {item.label}
            </div>
            {item.count > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-600 border-none">
                {item.count}
              </Badge>
            )}
          </button>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="flex h-full bg-white relative overflow-hidden">
      {/* Desktop Sidebar Mail */}
      <div className="hidden lg:flex w-64 border-r border-slate-100 flex-col shrink-0">
        <SidebarContent />
      </div>

      {/* Main Mail Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <div className="p-3 lg:p-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Mobile Sidebar Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden shrink-0">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input placeholder="Cerca email..." className="pl-9 h-9 bg-slate-50 border-none text-xs rounded-full focus-visible:ring-1 focus-visible:ring-blue-400" />
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 lg:h-9 lg:w-9"><Archive size={18} className="text-slate-500" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 lg:h-9 lg:w-9"><Trash2 size={18} className="text-slate-500" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 lg:h-9 lg:w-9 hidden sm:flex"><MoreVertical size={18} className="text-slate-500" /></Button>
          </div>
        </div>

        {/* Mail List */}
        <div className="flex-1 overflow-y-auto">
          {[
            { from: 'Mario Rossi', subject: 'Aggiornamento Progetto X', preview: 'Ciao, ti invio gli ultimi aggiornamenti riguardanti...', date: '10:30', unread: true },
            { from: 'Nexus Support', subject: 'Nuove funzionalità disponibili', preview: 'Scopri le ultime novità introdotte nella piattaforma...', date: '09:15', unread: true },
            { from: 'Google Cloud', subject: 'Fattura Aprile 2024', preview: 'La tua fattura per il mese di Aprile è ora disponibile...', date: 'Ieri', unread: false },
            { from: 'LinkedIn', subject: 'Nuove opportunità di lavoro', preview: 'Abbiamo trovato nuove posizioni che potrebbero interessarti...', date: 'Ieri', unread: false },
            { from: 'AWS Support', subject: 'Ticket #49201 Resolved', preview: 'Your recent support ticket has been marked as resolved...', date: 'Lun', unread: false },
            { from: 'Github', subject: 'Security alert: critical vulnerability', preview: 'A critical vulnerability has been found in...', date: 'Dom', unread: false },
          ].map((mail, i) => (
            <div 
              key={i} 
              className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 sm:px-6 py-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${
                mail.unread ? 'bg-blue-50/30' : ''
              }`}
            >
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${mail.unread ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                <div className="font-bold text-slate-800 truncate text-sm sm:w-48">{mail.from}</div>
                <div className="sm:hidden text-[10px] text-slate-400 font-medium">{mail.date}</div>
              </div>
              
              <div className="flex-1 min-w-0 pl-5 sm:pl-0">
                <div className="font-bold text-sm text-slate-800 truncate leading-tight mb-0.5">{mail.subject}</div>
                <div className="text-xs text-slate-500 truncate">{mail.preview}</div>
              </div>
              
              <div className="hidden sm:block w-16 text-right text-[10px] sm:text-xs text-slate-400 font-medium">{mail.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Webmail;
