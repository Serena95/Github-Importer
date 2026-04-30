import React, { useEffect, useState } from 'react';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { CRMCalendarEvent } from '@/types/crm';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { 
  Phone, 
  Video, 
  CheckSquare, 
  Calendar, 
  Clock, 
  MapPin, 
  User,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface DealCalendarEventsProps {
  dealId: string;
}

export const DealCalendarEvents: React.FC<DealCalendarEventsProps> = ({ dealId }) => {
  const [events, setEvents] = useState<CRMCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await supabaseCRMService.getDealCalendarEvents(dealId);
        setEvents(data.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dealId]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="text-blue-500" size={16} />;
      case 'meeting': return <Video className="text-emerald-500" size={16} />;
      case 'task': return <CheckSquare className="text-amber-500" size={16} />;
      case 'deadline': return <AlertCircle className="text-rose-500" size={16} />;
      default: return <Calendar className="text-slate-500" size={16} />;
    }
  };

  if (loading) return <div className="p-8 text-center text-[10px] font-black uppercase text-slate-400 animate-pulse">Caricamento scadenze...</div>;
  if (events.length === 0) return (
    <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-[32px] bg-slate-50/50">
      <Calendar size={40} className="mx-auto text-slate-200 mb-4" />
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-relaxed">Nessun appuntamento o scadenza<br/>pianificata per questo affare.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div 
          key={event.id}
          className="group relative bg-white border border-slate-100 rounded-3xl p-5 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl ${
              event.type === 'call' ? 'bg-blue-50' : 
              event.type === 'meeting' ? 'bg-emerald-50' : 
              event.type === 'task' ? 'bg-amber-50' : 
              'bg-rose-50'
            }`}>
              {getIcon(event.type)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                  {event.title}
                </h4>
                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                  <Clock size={10} className="text-slate-400" />
                  <span className="text-[10px] font-black text-slate-500">
                    {format(new Date(event.start_date), 'HH:mm')}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 mt-2">
                <div className="flex items-center gap-1.5">
                  <Calendar size={10} className="text-slate-300" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {format(new Date(event.start_date), 'dd MMM yyyy', { locale: it })}
                  </span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={10} className="text-slate-300" />
                    <span className="text-[10px] font-bold text-slate-400 truncate max-w-[150px] uppercase">
                      {event.location}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                   <div className={`w-1.5 h-1.5 rounded-full ${event.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{event.status === 'completed' ? 'Completato' : 'In Programma'}</span>
                </div>
              </div>
              
              {event.description && (
                <p className="mt-3 text-[11px] text-slate-500 font-medium leading-relaxed bg-slate-50/50 p-3 rounded-2xl border border-slate-50 italic">
                  "{event.description}"
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
