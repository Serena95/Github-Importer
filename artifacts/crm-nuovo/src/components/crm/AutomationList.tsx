import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  Edit3, 
  MoreVertical,
  Search,
  Settings,
  ChevronRight,
  ChevronLeft,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CRMStructure, CRMStage, CRMAutomation } from '@/types/crm';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface AutomationListProps {
  pipeline: CRMStructure;
  stages: CRMStage[];
  onEdit: (automation: CRMAutomation) => void;
  onCreate: () => void;
}

export const AutomationList: React.FC<AutomationListProps> = ({ pipeline, stages, onEdit, onCreate }) => {
  const navigate = useNavigate();
  const [automations, setAutomations] = useState<CRMAutomation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (pipeline?.id && pipeline?.workspace_id) {
      loadAutomations();
    }
  }, [pipeline?.id, pipeline?.workspace_id]);

  const loadAutomations = async () => {
    setIsLoading(true);
    try {
      const data = await supabaseCRMService.getAutomations(pipeline.id, pipeline.workspace_id);
      setAutomations(data);
    } catch (e) {
      console.error('Error loading automations:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (automation: CRMAutomation) => {
    try {
      const newStatus = !automation.is_active;
      await supabaseCRMService.saveAutomation({
        ...automation,
        is_active: newStatus
      }, pipeline.workspace_id);
      setAutomations(automations.map(a => a.id === automation.id ? { ...a, is_active: newStatus } : a));
      toast.success(newStatus ? 'Automazione attivata' : 'Automazione disattivata');
    } catch (e) {
      toast.error('Errore durante l\'aggiornamento');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa automazione?')) return;
    try {
      await supabaseCRMService.deleteAutomation(id);
      setAutomations(automations.filter(a => a.id !== id));
      toast.success('Automazione eliminata');
    } catch (e) {
      toast.error('Errore durante l\'eliminazione');
    }
  };

  const filteredAutomations = automations.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-6xl mx-auto w-full">
      <div className="mb-6 flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/crm/affari')} 
          className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 gap-2"
        >
          <ChevronLeft size={14} /> Torna alla Pipeline
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Zap size={20} />
            </div>
            Workflow & Automazioni
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 ml-13">
            Gestisci i processi automatici per la pipeline <span className="text-blue-600">{pipeline.name}</span>
          </p>
        </div>

        <Button 
          onClick={onCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl px-6 h-11 gap-2 shadow-xl shadow-blue-100"
        >
          <Plus size={16} /> Nuova Automazione
        </Button>
      </div>

      <div className="bg-white border border-slate-100 rounded-[32px] shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <Input 
              placeholder="Cerca workflow..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 border-slate-200 rounded-xl text-xs bg-white"
            />
          </div>
          <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:block">
            {filteredAutomations.length} Automazioni
          </p>
        </div>

        <div className="flex-1 overflow-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Caricamento...</p>
            </div>
          ) : filteredAutomations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center">
              <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                <Zap size={40} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">Nessuna automazione trovata</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 max-w-xs">
                Crea il tuo primo workflow per automatizzare i task ripetitivi e aumentare la produttività.
              </p>
              <Button 
                variant="outline" 
                onClick={onCreate}
                className="mt-8 rounded-xl border-2 border-slate-100 font-black text-[10px] uppercase tracking-widest"
              >
                Inizia ora
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredAutomations.map((auto) => (
                <div 
                  key={auto.id} 
                  className="group hover:bg-slate-50/50 transition-all p-5 flex items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-5 flex-1 min-w-0">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                      auto.is_active ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400 grayscale"
                    )}>
                      <Zap size={22} className={auto.is_active ? "animate-pulse" : ""} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className={cn(
                          "text-[13px] font-black uppercase truncate",
                          auto.is_active ? "text-slate-900" : "text-slate-400"
                        )}>
                          {auto.name}
                        </h4>
                        <span className={cn(
                          "text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border",
                          auto.is_active 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                            : "bg-slate-50 text-slate-400 border-slate-100"
                        )}>
                          {auto.is_active ? 'Attiva' : 'Pausa'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1">
                          <Settings size={12} /> {auto.trigger.type.replace(/_/g, ' ')}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <ArrowRight size={12} /> {auto.actions.length} Azioni
                        </span>
                        {auto.updated_at && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} /> {new Date(auto.updated_at).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleStatus(auto)}
                      className={cn(
                        "h-9 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest border transition-all",
                        auto.is_active 
                          ? "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100" 
                          : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                      )}
                    >
                      {auto.is_active ? <Pause size={14} className="mr-2" /> : <Play size={14} className="mr-2" />}
                      {auto.is_active ? 'Sospendi' : 'Attiva'}
                    </Button>

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEdit(auto)}
                      className="h-9 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest border border-slate-100 hover:bg-slate-100"
                    >
                      <Edit3 size={14} className="mr-2" /> Modifica
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-slate-100">
                          <MoreVertical size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl border-slate-100">
                        <DropdownMenuItem 
                          onClick={() => handleDelete(auto.id)}
                          className="text-rose-600 font-bold text-xs focus:text-rose-600 focus:bg-rose-50"
                        >
                          <Trash2 size={14} className="mr-2" /> Elimina
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <button 
                      onClick={() => onEdit(auto)} 
                      className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
