import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const eventSchema = z.object({
  title: z.string().min(1, 'Il titolo è richiesto'),
  description: z.string().optional(),
  date: z.string().min(1, 'La data è richiesta'),
  startTime: z.string().min(1, 'L\'ora di inizio è richiesta'),
  endTime: z.string().min(1, 'L\'ora di fine è richiesta'),
  type: z.enum(['meeting', 'call', 'internal', 'other']),
  color: z.string()
});

type EventFormValues = z.infer<typeof eventSchema>;

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ 
  isOpen, 
  onClose,
  selectedDate
}) => {
  const { tenant, user } = useAuth();
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      date: selectedDate || new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      type: 'meeting',
      color: 'bg-blue-500'
    }
  });

  const onSubmit = async (data: EventFormValues) => {
    if (!tenant || !user) return;

    try {
      await addDoc(collection(db, 'tenants', tenant.id, 'calendar_events'), {
        ...data,
        creatorId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success('Evento creato con successo');
      reset();
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Errore durante la creazione dell\'evento');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800">Crea Nuovo Evento</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Titolo</Label>
            <Input 
              {...register('title')}
              placeholder="E.g. Meeting con Cliente"
              className={cn(errors.title && "border-red-500")}
            />
            {errors.title && <p className="text-[10px] text-red-500 font-bold">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Data</Label>
              <Input type="date" {...register('date')} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Tipo</Label>
              <Select onValueChange={(val) => setValue('type', val as any)} defaultValue="meeting">
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="call">Chiamata</SelectItem>
                  <SelectItem value="internal">Interno</SelectItem>
                  <SelectItem value="other">Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Inizio</Label>
              <Input type="time" {...register('startTime')} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Fine</Label>
              <Input type="time" {...register('endTime')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Descrizione</Label>
            <Textarea 
              {...register('description')}
              placeholder="Dettagli dell'evento..."
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-full font-bold">ANNULLA</Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600 rounded-full font-bold">CREA EVENTO</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');
