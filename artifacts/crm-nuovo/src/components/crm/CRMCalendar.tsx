import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import itLocale from '@fullcalendar/core/locales/it';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  LayoutGrid, 
  LayoutList, 
  Clock, 
  Search, 
  Filter, 
  Settings,
  MoreVertical,
  CalendarDays,
  CalendarRange,
  RefreshCw,
  Bell,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { CRMCalendarEvent, CRMDeal } from '@/types/crm';
import { CreateEventModal } from './CreateEventModal';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface CalendarProps {
  deals: CRMDeal[];
}

export const CRMCalendar: React.FC<CalendarProps> = ({ deals }) => {
  const [events, setEvents] = useState<CRMCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const calendarRef = useRef<FullCalendar>(null);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const [eventsData, tasksData] = await Promise.all([
        supabaseCRMService.getCalendarEvents(),
        supabaseCRMService.getTasks()
      ]);
      
      const combinedEvents = [
        ...eventsData.map(e => ({
          id: e.id,
          title: e.title,
          start: e.start_date,
          end: e.end_date,
          backgroundColor: getEventColor(e.type),
          borderColor: 'transparent',
          extendedProps: { ...e, isTask: false }
        })),
        ...tasksData.filter(t => t.due_date).map(t => ({
          id: t.id,
          title: `Task: ${t.title}`,
          start: t.due_date,
          allDay: false,
          backgroundColor: '#f59e0b', // Amber for tasks
          borderColor: 'transparent',
          extendedProps: { ...t, isTask: true }
        }))
      ];
      
      setEvents(combinedEvents as any);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const calendarEvents = events;

  function getEventColor(type: string) {
    switch (type) {
      case 'call': return '#3b82f6';
      case 'meeting': return '#10b981';
      case 'task': return '#f59e0b';
      case 'followup': return '#6366f1';
      case 'deadline': return '#ef4444';
      default: return '#94a3b8';
    }
  }

  const handlePrev = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.prev();
    setSelectedDate(calendarApi?.getDate() || new Date());
  };

  const handleNext = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.next();
    setSelectedDate(calendarApi?.getDate() || new Date());
  };

  const changeView = (view: string) => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.changeView(view);
    setCurrentView(view);
  };

  const handleDateClick = (arg: any) => {
    setIsModalOpen(true);
  };

  const handleEventClick = (info: any) => {
    // Show details or edit
    console.log('Event clicked:', info.event.extendedProps);
  };

  const handleSyncClick = () => {
    // Sincronizzazione simulata
    const promise = new Promise((resolve) => setTimeout(resolve, 2000));
    // toast.promise(promise, { loading: 'Sincronizzazione...', success: 'Calendari sincronizzati!', error: 'Errore sync' });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[40px] shadow-2xl border border-slate-100/50 overflow-hidden" id="crm-main-calendar">
      {/* Header Strategico */}
      <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-100">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Calendario CRM</h2>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(selectedDate, 'MMMM yyyy', { locale: it })}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Sincronizzato</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-100">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => changeView('dayGridMonth')}
              className={`rounded-xl px-4 font-bold uppercase text-[10px] tracking-widest ${currentView === 'dayGridMonth' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
            >
              Mese
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => changeView('timeGridWeek')}
              className={`rounded-xl px-4 font-bold uppercase text-[10px] tracking-widest ${currentView === 'timeGridWeek' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
            >
              Settimana
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => changeView('timeGridDay')}
              className={`rounded-xl px-4 font-bold uppercase text-[10px] tracking-widest ${currentView === 'timeGridDay' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
            >
              Giorno
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => changeView('listMonth')}
              className={`rounded-xl px-4 font-bold uppercase text-[10px] tracking-widest ${currentView === 'listMonth' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
            >
              Agenda
            </Button>
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            <Button variant="outline" size="icon" onClick={handlePrev} className="rounded-2xl border-slate-100 hover:bg-slate-50 shadow-sm"><ChevronLeft size={18} /></Button>
            <Button variant="outline" onClick={() => calendarRef.current?.getApi().today()} className="rounded-2xl border-slate-100 font-bold text-[10px] uppercase tracking-widest px-4 h-9 shadow-sm">Oggi</Button>
            <Button variant="outline" size="icon" onClick={handleNext} className="rounded-2xl border-slate-100 hover:bg-slate-50 shadow-sm"><ChevronRight size={18} /></Button>
          </div>

          <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block" />

          <Button 
            onClick={handleSyncClick}
            variant="outline" 
            className="rounded-2xl border-slate-100 text-slate-500 font-bold text-[10px] uppercase tracking-widest px-4 gap-2 h-9"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Sync
          </Button>

          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest px-6 gap-2 h-9 shadow-xl shadow-slate-200"
          >
            <Plus size={16} /> Nuova Scadenza
          </Button>
        </div>
      </div>

      {/* Main Calendar Content */}
      <div className="flex-1 bg-white p-6 relative">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView={currentView}
          headerToolbar={false}
          events={calendarEvents}
          locale={itLocale}
          height="100%"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          nowIndicator={true}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          themeSystem="standard"
          eventClassNames="rounded-lg shadow-sm border-none cursor-pointer hover:opacity-90 transition-opacity font-bold text-[10px] uppercase p-1"
          dayHeaderClassNames="bg-slate-50 border-none py-4 text-[10px] font-black uppercase tracking-widest text-slate-400"
        />
        
        {/* Mobile FAB Overlay */}
        <div className="absolute bottom-6 right-6 md:hidden z-50">
           <Button size="icon" className="w-14 h-14 rounded-full bg-blue-600 shadow-2xl text-white">
             <Plus size={24} />
           </Button>
        </div>
      </div>

      {/* Sync Status Sidebar (Technical Look) */}
      <div className="bg-slate-900 p-4 flex items-center justify-between text-white/50 text-[10px] font-bold uppercase tracking-widest">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
            <span>Google: Connected (S.Serena@gmail.com)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
            <span>Outlook: Synced</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2"><Smartphone size={12} /> Mobile Agenda Active</span>
          <span className="text-white/20">Build v1.0.4 - Nexus Calendar Engine</span>
        </div>
      </div>

      <CreateEventModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadEvents}
        deals={deals}
      />
    </div>
  );
};
