import React, { useState } from 'react';
import { NexusCRMForm } from './NexusCRMForm';
import { Button } from '@/components/ui/button';
import { GoogleFormEmbed } from '@/components/ui/GoogleFormEmbed';
import { ClipboardCheck, Globe } from 'lucide-react';

const FinanzaAgevolataForm: React.FC = () => {
  const [useLegacy, setUseLegacy] = useState(false);
  const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSe8m7zAgapf8vIeuhQiJ_-OWIIT26IGQlatJCAlugticuLOVA/viewform?embedded=true";

  return (
    <div className="max-w-5xl mx-auto w-full p-4 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Finanza Agevolata</h1>
          <p className="text-sm text-slate-500 font-medium">Invia i dati per il controllo dei requisiti e dei contributi disponibili.</p>
        </div>
        <Button 
          variant="ghost" 
          onClick={() => setUseLegacy(!useLegacy)}
          className="text-[10px] font-black uppercase tracking-widest text-slate-400"
        >
          {useLegacy ? <ClipboardCheck size={14} className="mr-2" /> : <Globe size={14} className="mr-2" />}
          {useLegacy ? 'Usa Form Nexus' : 'Usa Google Form'}
        </Button>
      </div>

      {useLegacy ? (
        <GoogleFormEmbed 
          url={GOOGLE_FORM_URL} 
          title="Finanza Agevolata - Form di Qualificazione" 
        />
      ) : (
        <NexusCRMForm structureSlug="finanza-agevolata" />
      )}
    </div>
  );
};

export default FinanzaAgevolataForm;
