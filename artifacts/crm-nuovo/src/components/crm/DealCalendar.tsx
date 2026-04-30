import React, { useState, useEffect } from 'react';
import { useCRMStore } from '@/stores/crmStore';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { 
  ChevronLeft, 
  ChevronRight, 
  Phone, 
  CheckSquare, 
  StickyNote, 
  Clock, 
  Calendar as CalendarIcon,
  MessageCircle,
  Mail,
  Zap,
  AlertCircle
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export const DealCalendar: React.FC = () => {
  const { activeStructure, activeWorkspace } = useCRMStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeStructure || !activeWorkspace) return;
    
    setLoading(true);
    supabaseCRMService.getStructureActivities(activeStructure.id, activeWorkspace.id)
      .then(data => setActivities(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeStructure, activeWorkspace?.id]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'];

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const getIcon = (type: string, title?: string) => {
    const lowerTitle = title?.toLowerCase() || '';
    if (type === 'system') return <Zap size={10} />;
    switch (type) {
      case 'call': return <Phone size={10} />;
      case 'task': return <CheckSquare size={10} />;
      case 'note': return <StickyNote size={10} />;
      case 'comment': return <MessageCircle size={10} />;
      case 'email': return <Mail size={10} />;
      default: return <Clock size={10} />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'call': return 'bg-blue-500 hover:bg-blue-600';
      case 'task': return 'bg-purple-500 hover:bg-purple-600';
      case 'note': return 'bg-amber-500 hover:bg-amber-600';
      case 'comment': return 'bg-blue-600 hover:bg-blue-700';
      case 'email': return 'bg-orange-500 hover:bg-orange-600';
      case 'system': return 'bg-emerald-500 hover:bg-emerald-600';
      default: return 'bg-slate-500 hover:bg-slate-600';
    }
  };

  const handleActivityClick = (dealId: string) => {
    window.dispatchEvent(new CustomEvent('crm:openDeal', { detail: { dealId } }));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white m-4 md:m-6 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Calendar Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-4">
          <CalendarIcon className="text-blue-500" size={20} />
          <h2 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">
            Agenda Attività: {activeStructure?.name}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 shadow-sm">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-6 w-6 text-slate-400"><ChevronLeft size={16} /></Button>
            <span className="text-[11px] font-black text-slate-700 min-w-[140px] text-center uppercase tracking-widest">
              {format(currentMonth, 'MMMM yyyy', { locale: it })}
            </span>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-6 w-6 text-slate-400"><ChevronRight size={16} /></Button>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentMonth(new Date())}
            className="text-[9px] font-black uppercase tracking-widest rounded-full border-slate-200"
          >
            Oggi
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto p-4 md:p-6 bg-slate-50/30">
        <div className="min-w-[800px] h-full flex flex-col">
          <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex-1">
            {weekDays.map(day => (
              <div key={day} className="bg-white p-3 text-center text-[9px] font-black text-slate-400 tracking-widest uppercase border-b border-slate-100">
                {day}
              </div>
            ))}
            
            {calendarDays.map((day, i) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const dayActivities = activities.filter(a => format(new Date(a.created_at), 'yyyy-MM-dd') === dayStr);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, monthStart);
              
              return (
                <div key={day.toString()} className={cn(
                  "bg-white min-h-[120px] p-2 transition-colors hover:bg-blue-50/10 group flex flex-col",
                  !isCurrentMonth ? "bg-slate-50/30 grayscale-[0.5] opacity-40" : ""
                )}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={cn(
                      "w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-black",
                      isToday ? "bg-blue-500 text-white shadow-lg shadow-blue-200" : (isCurrentMonth ? "text-slate-700" : "text-slate-400")
                    )}>
                      {format(day, 'd')}
                    </span>
                  </div>
                  
                  <div className="space-y-1 flex-1 overflow-y-auto no-scrollbar">
                    {dayActivities.map(activity => (
                      <motion.div 
                        initial={{ opacity: 0, y: 2 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={activity.id} 
                        onClick={() => handleActivityClick(activity.deal_id)}
                        className={cn(
                          "px-2 py-1 rounded-lg text-[9px] font-black text-white truncate cursor-pointer transition-all flex items-center gap-1.5 shadow-sm active:scale-95",
                          getActivityColor(activity.type)
                        )}
                        title={`${activity.title}: ${activity.crm_deals?.company}`}
                      >
                        {getIcon(activity.type, activity.title)}
                        <span className="truncate flex-1">{activity.crm_deals?.company || 'Nexus'}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-center gap-6 bg-white shrink-0">
        {[
          { label: 'Chiamate', type: 'call' },
          { label: 'Task', type: 'task' },
          { label: 'Email', type: 'email' },
          { label: 'Sistema', type: 'system' }
        ].map(item => (
          <div key={item.type} className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", getActivityColor(item.type))} />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
