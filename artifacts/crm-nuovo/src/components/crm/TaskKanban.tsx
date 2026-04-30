import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckSquare, 
  Plus, 
  MoreHorizontal, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Circle,
  Timer,
  Flag,
  User,
  ExternalLink,
  ChevronRight,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CRMTask, TaskStatus, CRMDeal } from '@/types/crm';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { CreateTaskModal } from './CreateTaskModal';

const COLUMNS: { id: TaskStatus; label: string; color: string; icon: any }[] = [
  { id: 'todo', label: 'Da Fare', color: 'bg-slate-100', icon: Circle },
  { id: 'in_progress', label: 'In Corso', color: 'bg-blue-50', icon: Timer },
  { id: 'completed', label: 'Completati', color: 'bg-emerald-50', icon: CheckCircle2 },
  { id: 'blocked', label: 'Bloccati', color: 'bg-rose-50', icon: AlertCircle },
];

export const TaskKanban: React.FC<{ deals: CRMDeal[] }> = ({ deals }) => {
  const [tasks, setTasks] = useState<CRMTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewType, setViewType] = useState<'kanban' | 'list'>('kanban');

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await supabaseCRMService.getTasks();
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const moveTask = async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    
    try {
      await supabaseCRMService.saveTask({ id: taskId, status: newStatus });
    } catch (e) {
      // Revert if failed
      loadTasks();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-rose-600 bg-rose-50';
      case 'high': return 'text-amber-600 bg-amber-50';
      case 'medium': return 'text-blue-600 bg-blue-50';
      default: return 'text-slate-500 bg-slate-50';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-[40px] shadow-2xl border border-slate-100/50">
      <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-5">
           <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-xl shadow-amber-100">
             <CheckSquare size={24} />
           </div>
           <div>
             <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Bacheca Task</h2>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workflow Operativo</span>
           </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex bg-slate-50 p-1 rounded-xl border border-slate-100">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewType('kanban')}
              className={`rounded-lg h-8 px-3 text-[10px] font-black uppercase tracking-widest transition-all ${viewType === 'kanban' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
            >
              Kanban
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewType('list')}
              className={`rounded-lg h-8 px-3 text-[10px] font-black uppercase tracking-widest transition-all ${viewType === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
            >
              Lista
            </Button>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest px-6 h-11 shadow-xl shadow-slate-200 gap-2"
          >
            <Plus size={18} /> <span className="hidden sm:inline">Nuovo Task</span>
          </Button>
        </div>
      </div>

      {/* Desktop Kanban / Mobile List Toggle View */}
      <div className="flex-1 overflow-hidden bg-slate-50/30">
        {/* MOBILE LIST VIEW OR DESKTOP LIST VIEW */}
        <div className={`${viewType === 'list' ? 'block' : 'md:hidden'} h-full overflow-y-auto p-6 md:p-8 space-y-8`}>
           <div className="max-w-5xl mx-auto space-y-8">
             {COLUMNS.map(col => {
               const colTasks = tasks.filter(t => t.status === col.id);
               if (colTasks.length === 0) return null;
               return (
                 <div key={col.id} className="space-y-4">
                   <div className="flex items-center gap-3 mb-2">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${col.color}`}>
                        <col.icon size={16} className="text-slate-600" />
                     </div>
                     <h3 className="text-xs font-black uppercase text-slate-900 tracking-widest">{col.label}</h3>
                     <span className="text-[10px] font-bold text-slate-400">({colTasks.length})</span>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {colTasks.map(task => (
                       <motion.div 
                        key={task.id} 
                        layoutId={`list-${task.id}`}
                        className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group flex items-start justify-between gap-4"
                       >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                              <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400">
                                <Clock size={12} />
                                <span>{task.due_date ? format(new Date(task.due_date), 'dd MMM HH:mm', { locale: it }) : ''}</span>
                              </div>
                            </div>
                            <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight mb-2">
                              {task.title}
                            </h4>
                            {task.related_to_name && (
                              <div className="flex items-center gap-1.5 text-[9px] font-black text-blue-500 uppercase tracking-widest">
                                <Target size={10} />
                                {task.related_to_name}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                               <User size={14} className="text-slate-400" />
                             </div>
                             <div className="flex gap-1">
                               {COLUMNS.filter(c => c.id !== col.id).slice(0, 1).map(targetCol => (
                                 <Button 
                                  key={targetCol.id}
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => moveTask(task.id, targetCol.id)}
                                  className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-300"
                                 >
                                   <ChevronRight size={14} />
                                 </Button>
                               ))}
                             </div>
                          </div>
                       </motion.div>
                     ))}
                   </div>
                 </div>
               )
             })}
           </div>
        </div>

        {/* DESKTOP KANBAN VIEW */}
        <div className={`${viewType === 'kanban' ? 'hidden md:flex' : 'hidden'} gap-6 h-full p-8 overflow-x-auto`}>
          {COLUMNS.map(col => (
            <div key={col.id} className="w-80 flex flex-col">
              <div className="flex items-center justify-between mb-6 px-2">
                 <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${col.color}`}>
                      <col.icon size={14} className="text-slate-600" />
                    </div>
                    <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest">{col.label}</h3>
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                      {tasks.filter(t => t.status === col.id).length}
                    </span>
                 </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar pb-10">
                {tasks.filter(t => t.status === col.id).map(task => (
                  <motion.div
                    key={task.id}
                    layoutId={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-grab active:cursor-grabbing hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <button className="text-slate-300 hover:text-slate-600">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>

                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2 group-hover:text-blue-600 transition-colors">
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-[11px] text-slate-400 font-medium mb-4 line-clamp-2 italic leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-col gap-3 pt-4 border-t border-slate-50">
                      {task.related_to_name && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                          <ExternalLink size={12} />
                          <span className="truncate">{task.related_to_name}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                           <Clock size={12} />
                           <span>{task.due_date ? format(new Date(task.due_date), 'dd MMM', { locale: it }) : 'No data'}</span>
                         </div>
                         <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white">
                           <User size={12} className="text-slate-400" />
                         </div>
                      </div>
                    </div>

                    {/* Move Actions (Simulate Drag-n-Drop behavior for accessibility) */}
                    <div className="mt-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {COLUMNS.filter(c => c.id !== col.id).map(targetCol => (
                        <button
                          key={targetCol.id}
                          onClick={() => moveTask(task.id, targetCol.id)}
                          className={`flex-1 py-1 rounded-lg text-[8px] font-bold uppercase transition-colors ${targetCol.color} text-slate-500 hover:text-slate-900`}
                        >
                          {targetCol.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ))}
                
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-4 rounded-[28px] border-2 border-dashed border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-amber-200 hover:text-amber-500 hover:bg-amber-50/30 transition-all group"
                >
                  <Plus size={14} className="inline mr-2 group-hover:scale-125 transition-transform" />
                  Aggiungi Task
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateTaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadTasks}
        deals={deals}
      />
    </div>
  );
};
