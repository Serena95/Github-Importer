import React, { useState } from 'react';
import { NexusCRMForm } from './NexusCRMForm';
import { Button } from '@/components/ui/button';
import { GoogleFormEmbed } from '@/components/ui/GoogleFormEmbed';
import { ClipboardCheck, Globe } from 'lucide-react';

const ServiziDigitaliForm: React.FC = () => {
  const [useLegacy, setUseLegacy] = useState(false);
  const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSedPZc4Yty97jNnt5U_VUMl2zMR7FosrD8SBS5fAtUNfl2sew/viewform";

  return (
    <div className="max-w-5xl mx-auto w-full p-4 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Servizi Digitali</h1>
          <p className="text-sm text-slate-500 font-medium">Richiedi una consulenza per digital branding, siti web ed e-commerce.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button 
            variant="ghost" 
            onClick={() => setUseLegacy(!useLegacy)}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400"
          >
            {useLegacy ? <ClipboardCheck size={14} className="mr-2" /> : <Globe size={14} className="mr-2" />}
            {useLegacy ? 'Usa Form Nexus' : 'Usa Google Form'}
          </Button>
        </div>
      </div>

      {useLegacy ? (
        <GoogleFormEmbed 
          url={GOOGLE_FORM_URL} 
          title="Servizi Digitali - Richiesta Consulenza" 
        />
      ) : (
        <NexusCRMForm structureSlug="servizi-digitali" />
      )}
    </div>
  );
};

export default ServiziDigitaliForm;
