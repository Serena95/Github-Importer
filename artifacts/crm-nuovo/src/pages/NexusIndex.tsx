import React, { useState } from 'react';
import PageClienti from './PageClienti';
import PageCompila from './PageCompila';
import PageArchivio from './PageArchivio';
import { ClientePreload } from '@/types/nexus';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Users, FileEdit, Archive } from 'lucide-react';

const NexusIndex: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState('clienti');
  const [preloadCliente, setPreloadCliente] = useState<ClientePreload | null>(null);

  const handleSelectCliente = (cliente: ClientePreload) => {
    setPreloadCliente(cliente);
    setActiveSubTab('compila');
  };

  const handleClienteConsumed = () => {
    setPreloadCliente(null);
  };

  return (
    <div className="bg-[#f0f2f5] p-1.5 sm:p-4 md:p-8 w-full overflow-x-hidden min-h-full">
      <div className="max-w-6xl mx-auto w-full">
        <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="space-y-3 sm:space-y-8 w-full">
          <div className="flex justify-start sm:justify-center overflow-x-auto no-scrollbar py-1 w-full px-1">
            <TabsList className="bg-white p-0.5 rounded-full border border-slate-200 shadow-sm h-10 sm:h-14 flex-nowrap min-w-max">
              <TabsTrigger 
                value="clienti" 
                className="rounded-full px-3 sm:px-8 data-[state=active]:bg-[#004a99] data-[state=active]:text-white font-bold text-[8.5px] sm:text-[10px] uppercase tracking-widest transition-all h-full"
              >
                <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> <span className="whitespace-nowrap">Clienti</span>
              </TabsTrigger>
              <TabsTrigger 
                value="compila" 
                className="rounded-full px-3 sm:px-8 data-[state=active]:bg-[#004a99] data-[state=active]:text-white font-bold text-[8.5px] sm:text-[10px] uppercase tracking-widest transition-all h-full"
              >
                <FileEdit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> <span className="whitespace-nowrap">Compila</span>
              </TabsTrigger>
              <TabsTrigger 
                value="archivio" 
                className="rounded-full px-3 sm:px-8 data-[state=active]:bg-[#004a99] data-[state=active]:text-white font-bold text-[8.5px] sm:text-[10px] uppercase tracking-widest transition-all h-full"
              >
                <Archive className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> <span className="whitespace-nowrap">Archivio</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="clienti" className="mt-0 focus-visible:outline-none">
            <PageClienti onSelectCliente={handleSelectCliente} />
          </TabsContent>
          
          <TabsContent value="compila" className="mt-0 focus-visible:outline-none">
            <PageCompila 
              preloadCliente={preloadCliente} 
              onClienteConsumed={handleClienteConsumed} 
            />
          </TabsContent>
          
          <TabsContent value="archivio" className="mt-0 focus-visible:outline-none">
            <PageArchivio />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NexusIndex;
