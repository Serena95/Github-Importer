import React, { useState, useEffect } from 'react';
import { useCRMStore } from '@/stores/crmStore';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { SmartProcess, SmartRecord, CRMStage } from '@/types/crm';
import { KanbanBoard } from '@/components/crm/Kanban/KanbanBoard';
import { toast } from 'sonner';
import { 
  Settings, 
  Plus, 
  Search, 
  Filter,
  Layers,
  Activity,
  X,
  LayoutGrid,
  List as ListIcon,
  Calendar as CalendarIcon,
  Zap,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SmartCRMProps {
  activeTab?: string;
  setActiveTab: (tab: string) => void;
  slug: string;
}

import { SmartDetailDrawer } from '@/components/crm/SmartDetailDrawer';

export const SmartCRM: React.FC<SmartCRMProps> = ({ slug }) => {
  const [process, setProcess] = useState<SmartProcess | null>(null);
  const [records, setRecords] = useState<SmartRecord[]>([]);
  const [stages, setStages] = useState<CRMStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchRecordsAndStages = async (processId: string) => {
    try {
      const [recordsData, stagesData] = await Promise.all([
         supabaseCRMService.getSmartRecords(processId),
         supabaseCRMService.getStages(processId) // Hypothesizing process_id works as structure_id
      ]);
      setRecords(recordsData);
      setStages(stagesData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const initProcess = async () => {
      setIsLoading(true);
      try {
        const processes = await supabaseCRMService.getSmartProcesses();
        const current = processes.find(p => p.slug === slug);
        
        if (current) {
          setProcess(current);
          await fetchRecordsAndStages(current.id);
        }
      } catch (error) {
        toast.error('Errore nel caricamento del processo');
      } finally {
        setIsLoading(false);
      }
    };
    initProcess();
  }, [slug]);

  const handleOpenRecord = (recordId: string) => {
    setSelectedRecordId(recordId);
    setIsDrawerOpen(true);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Inizializzazione {slug}...</p>
        </div>
      </div>
    );
  }

  if (!process) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
         <X size={48} className="text-rose-500 mb-4" />
         <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Processo non trovato</h2>
         <p className="text-slate-500 mt-2">Il processo con slug "{slug}" non esiste o è stato rimosso.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col nexus-bg-gradient overflow-hidden">
      {/* HEADER INTEGRATED */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", process.color || 'bg-blue-500')}>
            <Layers size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">{process.name}</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Smart Process Pipeline</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex bg-slate-50 p-1 rounded-xl border border-slate-100">
             <button 
               onClick={() => setView('kanban')}
               className={cn("p-2 rounded-lg transition-all", view === 'kanban' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
             >
               <LayoutGrid size={18} />
             </button>
             <button 
               onClick={() => setView('list')}
               className={cn("p-2 rounded-lg transition-all", view === 'list' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
             >
               <ListIcon size={18} />
             </button>
          </div>
          
          <Button 
            onClick={async () => {
              try {
                const newRecord = await supabaseCRMService.saveSmartRecord({
                  process_id: process.id,
                  stage_id: stages[0]?.id,
                  title: 'Nuovo Record ' + (records.length + 1),
                  content: '',
                  value: 0,
                  custom_fields: {}
                });
                setRecords([...records, newRecord]);
                handleOpenRecord(newRecord.id);
              } catch (error) {
                toast.error('Errore nella creazione del record');
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[11px] tracking-widest px-6 h-11 rounded-xl shadow-lg shadow-blue-100"
          >
            <Plus size={18} className="mr-2" /> Nuovo Record
          </Button>
        </div>
      </div>

      {/* SEARCH AND FILTERS BAR */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-slate-100 px-6 py-3 flex items-center gap-4 shrink-0">
         <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input 
              placeholder="Cerca records..." 
              className="pl-10 h-10 border-slate-100 bg-white/50 focus:bg-white rounded-xl text-xs font-bold" 
            />
         </div>
         <Button variant="outline" className="h-10 border-slate-100 rounded-xl px-4 text-slate-500 font-bold text-xs">
            <Filter size={16} className="mr-2" /> Filtri
         </Button>
         <div className="h-6 w-[1px] bg-slate-200 mx-2 hidden md:block" />
         <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400">
            <Zap size={18} />
         </Button>
         <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 ml-auto">
            <Settings size={18} />
         </Button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-hidden p-6">
        {view === 'kanban' ? (
          <div className="h-full">
             <div className="flex gap-6 h-full overflow-x-auto nexus-scrollbar pb-4 items-start">
               {stages.length === 0 ? (
                 <div className="w-full h-full flex flex-col items-center justify-center bg-white/50 rounded-[40px] border-2 border-dashed border-slate-200">
                    <Activity size={48} className="text-slate-200 mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-widest">Nessuna fase definita per questo processo</p>
                    <Button variant="link" className="text-blue-500 font-bold mt-2 underline">Configura Pipeline</Button>
                 </div>
               ) : (
                 stages.map(stage => (
                   <div key={stage.id} className="w-[300px] shrink-0 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4 px-2">
                        <div className="flex items-center gap-2">
                           <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                           <h3 className="font-black text-slate-700 uppercase tracking-tight text-xs">{stage.name}</h3>
                           <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px] font-bold">
                             {records.filter(r => r.stage_id === stage.id).length}
                           </span>
                        </div>
                        <button className="text-slate-300 hover:text-slate-600 transition-colors">
                           <MoreHorizontal size={16} />
                        </button>
                      </div>
                      <div className="flex-1 bg-slate-50/50 rounded-[28px] p-3 space-y-3 overflow-y-auto nexus-scrollbar border border-slate-100/50">
                         {records.filter(r => r.stage_id === stage.id).map(record => (
                           <div 
                             key={record.id} 
                             onClick={() => handleOpenRecord(record.id)}
                             className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group"
                           >
                             <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-tight line-clamp-2 leading-tight mb-2">
                               {record.title}
                             </h4>
                             <p className="text-[10px] text-slate-500 font-medium line-clamp-2">
                               {record.content}
                             </p>
                             <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                               <div className="flex items-center gap-1.5">
                                 <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400">
                                   {record.assigned_to?.substring(0, 2).toUpperCase() || '??'}
                                 </div>
                               </div>
                               <span className="text-[10px] font-black text-blue-600">
                                 € {record.value?.toLocaleString()}
                               </span>
                             </div>
                           </div>
                         ))}
                      </div>
                   </div>
                 ))
               )}
             </div>
          </div>
        ) : (
          <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 h-full flex flex-col overflow-hidden">
             {/* List view placeholder */}
             <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                <ListIcon size={48} className="text-slate-100 mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest">Vista Lista Smart Records</p>
             </div>
          </div>
        )}
      </div>

      <SmartDetailDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        recordId={selectedRecordId}
        processId={process.id}
        onUpdate={() => fetchRecordsAndStages(process.id)}
      />
    </div>
  );
};
