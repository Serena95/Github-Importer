import React, { useEffect, useState } from 'react';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { CRMTask, TaskStatus, TaskPriority } from '@/types/crm';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Circle,
  Timer,
  MoreVertical,
  Plus,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateTaskModal } from './CreateTaskModal';
import { toast } from 'sonner';

interface DealTasksProps {
  dealId: string;
}

export const DealTasks: React.FC<DealTasksProps> = ({ dealId }) => {
  const [tasks, setTasks] = useState<CRMTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await supabaseCRMService.getTasks(dealId, 'deal');
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [dealId]);

  const toggleStatus = async (task: CRMTask) => {
    const newStatus: TaskStatus = task.status === 'completed' ? 'todo' : 'completed';
    
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    
    try {
      await supabaseCRMService.saveTask({ 
        id: task.id, 
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined
      });
    } catch (e) {
      load();
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm('Eliminare questo task?')) return;
    try {
      await supabaseCRMService.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      toast.success('Task eliminato');
    } catch (e) {
      toast.error('Errore eliminazione');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-rose-500';
      case 'high': return 'bg-amber-500';
      case 'medium': return 'bg-blue-500';
      default: return 'bg-slate-400';
    }
  };

  if (loading) return <div className="p-8 text-center text-[10px] font-black uppercase text-slate-400 animate-pulse">Caricamento task...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[32px] border border-slate-100">
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Task Affare</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Cose da fare per chiudere l'accordo</p>
        </div>
        <Button 
          size="sm" 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 hover:bg-black text-white rounded-2xl text-[10px] uppercase font-black tracking-widest h-10 px-6 shadow-lg shadow-slate-200 transition-all"
        >
          <Plus size={16} className="mr-2" /> Task
        </Button>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-[32px] bg-slate-50/50">
            <CheckSquare size={40} className="mx-auto text-slate-200 mb-4" />
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-relaxed">Nessun task attivo.<br/>Inizia a pianificare le attività.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div 
              key={task.id}
              className={`group flex items-center gap-4 bg-white border border-slate-100 rounded-[28px] p-4 transition-all hover:shadow-xl hover:shadow-slate-100 ${task.status === 'completed' ? 'opacity-60' : ''}`}
            >
              <button 
                onClick={() => toggleStatus(task)}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  task.status === 'completed' 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : 'border-slate-100 hover:border-amber-400 text-transparent'
                }`}
              >
                <CheckCircle2 size={16} />
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className={`text-xs font-black uppercase tracking-tight ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {task.title}
                  </h4>
                  <div className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(task.priority)}`} />
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    <Clock size={10} />
                    {task.due_date ? format(new Date(task.due_date), 'dd MMM HH:mm', { locale: it }) : 'Nessuna scadenza'}
                  </span>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">{task.priority}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   onClick={() => deleteTask(task.id)}
                   className="w-8 h-8 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50"
                 >
                   <Trash2 size={14} />
                 </Button>
                 <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-slate-300 hover:text-slate-600">
                   <MoreVertical size={14} />
                 </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <CreateTaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={load}
        deals={[]} // We don't need to select deal here since it's already bound
        initialData={{ related_to_id: dealId, related_to_type: 'deal' }}
      />
    </div>
  );
};
