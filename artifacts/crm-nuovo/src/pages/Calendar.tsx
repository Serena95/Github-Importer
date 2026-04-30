import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  MoreHorizontal,
  Filter,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import { CreateEventModal } from '@/components/calendar/CreateEventModal';
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

const Calendar: React.FC = () => {
  const { tenant } = useAuth();
  const [view, setView] = useState('month');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();

  useEffect(() => {
    if (!tenant) return;
    const q = query(collection(db, 'tenants', tenant.id, 'calendar_events'), orderBy('date', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `tenants/${tenant.id}/calendar_events`));
    return () => unsub();
  }, [tenant]);

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

  return (
    <div className="h-full flex flex-col bg-[#f5f7fb] overflow-hidden">
      {/* Calendar Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 shrink-0 shadow-sm z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <h1 className="text-xl font-bold text-slate-800">Calendario</h1>
            <div className="flex items-center bg-slate-100 rounded-full p-1 self-start">
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("rounded-full px-3 sm:px-4 text-[10px] sm:text-xs font-bold h-7", view === 'day' ? "bg-white shadow-sm text-blue-500" : "text-slate-500")}
                onClick={() => setView('day')}
              >
                GIORNO
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("rounded-full px-3 sm:px-4 text-[10px] sm:text-xs font-bold h-7", view === 'week' ? "bg-white shadow-sm text-blue-500" : "text-slate-500")}
                onClick={() => setView('week')}
              >
                SETTIMANA
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("rounded-full px-3 sm:px-4 text-[10px] sm:text-xs font-bold h-7", view === 'month' ? "bg-white shadow-sm text-blue-500" : "text-slate-500")}
                onClick={() => setView('month')}
              >
                MESE
              </Button>
            </div>
          </div>

          <div className="flex flex-col xs:flex-row items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full px-3 py-1 w-full xs:w-auto justify-between xs:justify-start">
              <Button variant="ghost" size="icon" onClick={prevMonth} className="h-6 w-6 text-slate-400 shrink-0"><ChevronLeft size={16} /></Button>
              <span className="text-[11px] sm:text-sm font-bold text-slate-700 min-w-[100px] sm:min-w-[120px] text-center uppercase tracking-wider truncate">
                {format(currentMonth, 'MMMM yyyy', { locale: it })}
              </span>
              <Button variant="ghost" size="icon" onClick={nextMonth} className="h-6 w-6 text-slate-400 shrink-0"><ChevronRight size={16} /></Button>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="bg-[#2FC6F6] hover:bg-[#1eb0e0] text-white font-bold rounded-full px-4 sm:px-6 h-9 sm:h-auto text-[10px] sm:text-xs shadow-lg shadow-blue-200 w-full xs:w-auto">
              <Plus size={14} className="mr-2 sm:hidden" /> NUOVO EVENTO
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-8 overflow-auto">
        <div className="min-w-[700px] lg:min-w-0">
          <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {weekDays.map(day => (
              <div key={day} className="bg-slate-50 p-3 sm:p-4 text-center text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest uppercase">
                {day}
              </div>
            ))}
            
            {calendarDays.map((day, i) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const dayEvents = events.filter(e => e.date === dayStr);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, monthStart);
              
              return (
                <div key={day.toString()} className={cn(
                  "bg-white min-h-[100px] sm:min-h-[120px] p-2 transition-colors hover:bg-slate-50/50 group",
                  !isCurrentMonth ? "bg-slate-50/30 opacity-50" : ""
                )}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={cn(
                      "w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-[10px] sm:text-xs font-bold",
                      isToday ? "bg-blue-500 text-white shadow-md" : (isCurrentMonth ? "text-slate-700" : "text-slate-400")
                    )}>
                      {format(day, 'd')}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 sm:h-6 sm:w-6 opacity-0 group-hover:opacity-100 text-slate-300"
                      onClick={() => {
                        setSelectedDate(dayStr);
                        setIsModalOpen(true);
                      }}
                    >
                      <Plus size={12} />
                    </Button>
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.map(event => (
                      <div 
                        key={event.id} 
                        className={cn(
                          "px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[9px] sm:text-[10px] font-bold text-white truncate cursor-pointer hover:opacity-90 transition-opacity",
                          event.color || 'bg-blue-500'
                        )}
                      >
                        {event.startTime} {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <CreateEventModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default Calendar;
