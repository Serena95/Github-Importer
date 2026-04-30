import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { toast } from 'sonner';
import { Loader2, ClipboardCheck, Sparkles } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, "Il nome è troppo breve"),
  email: z.string().email("Email non valida"),
  phone: z.string().min(8, "Numero non valido"),
  company: z.string().min(2, "Nome azienda obbligatorio"),
  vat: z.string().optional(),
  type: z.string().min(2, "Tipo richiesta obbligatorio"),
  expectedValue: z.number().min(1, "Valore minimo 1€"),
  description: z.string().optional(),
});

interface NexusCRMFormProps {
  structureSlug: string;
  onSuccess?: () => void;
}

export const NexusCRMForm: React.FC<NexusCRMFormProps> = ({ structureSlug, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      vat: '',
      type: '',
      expectedValue: 50000,
      description: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await supabaseCRMService.processFormSubmission(values, structureSlug);
      toast.success('Form inviato con successo! Il lead è in preanalisi.');
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Errore durante l\'invio del form');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-w-2xl mx-auto">
      <div className="bg-blue-600 p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <ClipboardCheck size={24} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Form Qualificazione Lead</h2>
        </div>
        <p className="text-blue-100 font-medium">Inserisci i dati per avviare la preanalisi automatica nel CRM.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Azienda</FormLabel>
                  <FormControl>
                    <Input placeholder="Ragione sociale" className="h-11 rounded-lg border-slate-200" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">P.IVA / CF</FormLabel>
                  <FormControl>
                    <Input placeholder="01234567890" className="h-11 rounded-lg border-slate-200" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Referente</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome e Cognome" className="h-11 rounded-lg border-slate-200" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@azienda.it" className="h-11 rounded-lg border-slate-200" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo Richiesta</FormLabel>
                  <FormControl>
                    <Input placeholder="es. Bonus Ricerca e Sviluppo" className="h-11 rounded-lg border-slate-200" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="expectedValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Importo Stimato (€)</FormLabel>
                  <FormControl>
                    <Input 
                        type="number" 
                        className="h-11 rounded-lg border-slate-200" 
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value))} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

           <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Note Aggiuntive</FormLabel>
                <FormControl>
                  <Textarea placeholder="Descrivi brevemente l'esigenza..." className="rounded-lg border-slate-200" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-blue-100 transition-all hover:scale-[1.02] active:scale-95"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles size={18} />
                INVIA E AVVIA PREANALISI
              </div>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};
