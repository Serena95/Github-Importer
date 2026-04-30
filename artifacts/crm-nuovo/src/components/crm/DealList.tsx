import React from 'react';
import { useCRMStore } from '@/stores/crmStore';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { TrendingUp, User, Building, Phone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

export const DealList: React.FC = () => {
  const { getFilteredDeals, stages } = useCRMStore();
  const deals = getFilteredDeals();

  const handleRowClick = (dealId: string) => {
    window.dispatchEvent(new CustomEvent('crm:openDeal', { detail: { dealId } }));
  };

  const getStageColor = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    return stage?.color || 'bg-slate-100 text-slate-600';
  };

  const getStageName = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    return stage?.name || 'Sconosciuto';
  };

  return (
    <div className="flex-1 overflow-auto bg-white m-4 md:m-6 rounded-2xl border border-slate-200 shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50/50 sticky top-0 z-10">
          <TableRow className="hover:bg-transparent border-slate-200">
            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-4 pl-6">Azienda</TableHead>
            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-4">Contatto</TableHead>
            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-4">Valore</TableHead>
            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-4">Stage</TableHead>
            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-4">Responsabile</TableHead>
            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-4">Data Creazione</TableHead>
            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-4 pr-6 text-right">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deals.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <Building size={40} className="mb-4 opacity-20" />
                  <p className="text-sm font-medium">Nessun affare trovato con i filtri attuali</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            deals.map((deal) => (
              <TableRow 
                key={deal.id} 
                className="cursor-pointer hover:bg-blue-50/30 transition-colors border-slate-100 group"
                onClick={() => handleRowClick(deal.id)}
              >
                <TableCell className="py-4 pl-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-200 transition-colors">
                      <Building size={14} />
                    </div>
                    <div>
                      <div className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{deal.company}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{deal.title}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-700">{deal.contact}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      {deal.email && <Mail size={10} className="text-slate-300" />}
                      {deal.phone && <Phone size={10} className="text-slate-300" />}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="text-[11px] font-black text-blue-600 uppercase">
                    {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(deal.value)}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge 
                    className={cn(
                      "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border-none shadow-none",
                      getStageColor(deal.stage_id)
                    )}
                  >
                    {getStageName(deal.stage_id)}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 border border-white shadow-sm">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${deal.assigned_to}`} />
                      <AvatarFallback className="bg-slate-100 text-[8px] font-bold">FX</AvatarFallback>
                    </Avatar>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Admin Nexus</span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="text-[10px] font-medium text-slate-500">
                    {format(new Date(deal.created_at), 'dd MMM yyyy', { locale: it })}
                  </div>
                </TableCell>
                <TableCell className="py-4 pr-6 text-right">
                  {deal.preanalysis_result?.score ? (
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-100">
                      <TrendingUp size={10} className="text-emerald-500" />
                      <span className="text-[10px] font-black text-emerald-600">{deal.preanalysis_result.score}%</span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-300 italic">N/D</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
