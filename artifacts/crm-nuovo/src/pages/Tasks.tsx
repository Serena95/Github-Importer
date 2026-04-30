import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List as ListIcon, 
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  User,
  MoreHorizontal,
  MessageSquare,
  Paperclip,
  Flag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';

const Tasks: React.FC<{ activeTab?: string }> = ({ activeTab: propActiveTab }) => {
  const { user, tenant } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [activeTab, setActiveTab] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (propActiveTab) {
      const tab = propActiveTab === 'tasks' ? 'all' : propActiveTab.replace('tasks-', '');
      setActiveTab(tab);
      if (tab === 'kanban') {
        setViewMode('kanban');
      } else if (tab === 'all' || tab === 'ongoing' || tab === 'completed') {
        setViewMode('list');
      }
    }
  }, [propActiveTab]);

  useEffect(() => {
    if (!tenant) return;

    const unsub = onSnapshot(collection(db, 'tenants', tenant.id, 'tasks'), (snap) => {
      setTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `tenants/${tenant.id}/tasks`));

    return () => unsub();
  }, [tenant]);

  useEffect(() => {
    const handleOpenCreate = () => {
      setIsCreateModalOpen(true);
    };
    window.addEventListener('tasks:openCreate', handleOpenCreate);
    return () => window.removeEventListener('tasks:openCreate', handleOpenCreate);
  }, []);

  const addTask = async () => {
    if (!tenant || !user) return;
    await addDoc(collection(db, 'tenants', tenant.id, 'tasks'), {
      tenantId: tenant.id,
      title: 'Nuovo Task',
      status: 'pending',
      priority: 'medium',
      creatorId: user.uid,
      responsibleId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  };

  const tabs = [
    { id: 'all', label: 'Tutti', badge: tasks.length },
    { id: 'in-progress', label: 'In corso', badge: tasks.filter(t => t.status === 'in-progress').length },
    { id: 'assisting', label: 'Assisto' },
    { id: 'set_by_me', label: 'Impostati da me' },
    { id: 'following', label: 'Osservo' },
    { id: 'completed', label: 'Completati' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#f5f7fb] overflow-hidden">
      {/* Tasks Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 pt-4 shrink-0 shadow-sm z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 uppercase tracking-tight">Task e Progetti</h1>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest uppercase self-start sm:self-auto">
              <Plus size={10} className="text-blue-500" />
              <span>PROGETTO PRINCIPALE</span>
            </div>
          </div>
          <div className="flex flex-col xs:flex-row gap-2">
            <div className="relative group w-full xs:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors" size={13} />
              <Input 
                placeholder="Cerca task..." 
                className="pl-9 bg-slate-50 border-none shadow-sm h-9 rounded-full text-xs focus-visible:ring-2 focus-visible:ring-brand-blue/30 w-full"
              />
            </div>
            <Button className="bg-brand-blue hover:bg-brand-blue/90 text-white font-bold rounded-full px-6 h-9 text-[10px] uppercase tracking-widest shadow-lg shadow-blue-200 w-full xs:w-auto" onClick={() => setIsCreateModalOpen(true)}>
              NUOVO TASK
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-4 overflow-hidden">
          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar pb-0.5 relative flex-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "pb-3 text-[10px] sm:text-xs font-black transition-all relative whitespace-nowrap uppercase tracking-[0.12em] sm:tracking-[0.15em]",
                  activeTab === tab.id 
                    ? "text-blue-500" 
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {tab.label}
                {tab.badge !== undefined && (
                  <span className="ml-1.5 bg-slate-100 text-slate-500 text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full font-black">
                    {tab.badge}
                  </span>
                )}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 mb-3 bg-slate-50 p-1 rounded-lg border border-slate-100 shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-7 w-7 rounded-md", viewMode === 'list' ? "bg-white shadow-sm text-brand-blue" : "text-slate-400")}
              onClick={() => setViewMode('list')}
            >
              <ListIcon size={13} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-7 w-7 rounded-md", viewMode === 'kanban' ? "bg-white shadow-sm text-brand-blue" : "text-slate-400")}
              onClick={() => setViewMode('kanban')}
            >
              <Grid size={13} />
            </Button>
          </div>
        </div>
      </div>

      {/* Tasks Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {/* Filters Bar */}
        <div className="px-4 sm:px-8 py-2.5 bg-white/50 border-b border-slate-100 flex items-center justify-between overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Button variant="ghost" size="sm" className="h-7 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:bg-white px-2">
              <Filter size={10} className="mr-2" /> FILTRI
            </Button>
            <div className="h-3 w-px bg-slate-200"></div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
              Visualizzati: {tasks.length} task
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="sm" className="h-7 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:bg-white px-2">
              <CalendarIcon size={10} className="mr-2" /> SCADENZA
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-white">
              <MoreHorizontal size={14} />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-8">
          {viewMode === 'list' ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto max-w-full">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="w-12 px-6 py-4"></th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Titolo Task</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Responsabile</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Scadenza</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priorità</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stato</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <button className="text-slate-200 hover:text-emerald-500 transition-colors">
                          <CheckCircle2 size={20} />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700 group-hover:text-blue-500 transition-colors cursor-pointer">{task.title}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Progetto: Principale</span>
                            {task.comments && task.comments.length > 0 && (
                              <div className="flex items-center gap-1 text-[9px] font-bold text-blue-400">
                                <MessageSquare size={10} />
                                <span>{task.comments.length}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px] bg-slate-100 text-slate-500">US</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-bold text-slate-600">Team Sales</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                          <Clock size={14} className="text-slate-300" />
                          <span>{task.dueDate ? format(task.dueDate.toDate(), 'dd MMM', { locale: it }) : 'Nessuna'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={cn(
                          "text-[9px] font-black uppercase tracking-widest border-none",
                          task.priority === 'high' ? "bg-rose-50 text-rose-600" : 
                          task.priority === 'medium' ? "bg-amber-50 text-amber-600" : 
                          "bg-blue-50 text-blue-600"
                        )}>
                          {task.priority}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-slate-200 text-slate-400">
                          {task.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tasks.map((task) => (
                <Card key={task.id} className="border-none shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <Badge className={cn(
                        "text-[9px] font-black uppercase tracking-widest border-none",
                        task.priority === 'high' ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                      )}>
                        {task.priority}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 group-hover:text-slate-600">
                        <MoreHorizontal size={14} />
                      </Button>
                    </div>
                    <h4 className="font-bold text-slate-800 mb-4 group-hover:text-blue-500 transition-colors">{task.title}</h4>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px] bg-slate-100 text-slate-500">US</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Responsabile</span>
                          <span className="text-[10px] text-slate-600 font-bold -mt-0.5">Team Sales</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                        <div className="flex items-center gap-1">
                          <MessageSquare size={12} />
                          <span className="text-[10px] font-bold">2</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Paperclip size={12} />
                          <span className="text-[10px] font-bold">1</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-slate-300 hover:border-blue-400 hover:text-blue-400 transition-all group bg-white/30 min-h-[160px]"
              >
                <Plus size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Nuovo Task</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <CreateTaskModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default Tasks;
