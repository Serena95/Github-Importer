import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CRMDeal, CRMUser } from '@/types/crm';
import { useCRMStore } from '@/stores/crmStore';
import { CRM_USERS } from '@/constants/crm';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { toast } from 'sonner';
import { 
  Building2, 
  Phone, 
  Mail, 
  TrendingUp, 
  Target,
  Briefcase,
  User,
  AlertCircle,
  CheckCircle2,
  Calendar,
  UserPlus,
  AlertTriangle
} from 'lucide-react';
import { getInactivityData } from '@/lib/reminderUtils';
import LeadScoreBadge from '../LeadScoreBadge';

interface DealCardProps {
  deal: CRMDeal;
  isPreanalysis?: boolean;
}

import { useCRMPermissions } from '@/hooks/useCRMPermissions';
import { Lock } from 'lucide-react';

export const DealCard: React.FC<DealCardProps> = ({ deal, isPreanalysis }) => {
  const { structures, stages, fetchInitialData, activeStructure, customFields } = useCRMStore();
  const { canModifyDeal, canAssignUsers } = useCRMPermissions();

  const kanbanFields = customFields.filter(f => f.entity_type === 'deal' && f.show_in_kanban);
  const isReadOnly = !canModifyDeal(deal);
  const structure = structures.find(s => s.id === deal.structure_id);
  const currentStage = stages.find(s => s.id === deal.stage_id);
  const stageName = currentStage?.name || '';

  // Handle automatic reminders
  React.useEffect(() => {
    if (deal.id && stageName) {
      // Small delay to ensure DB isn't hammered on initial massive load
      const timer = setTimeout(() => {
        supabaseCRMService.checkAndTriggerReminders(deal, stageName);
      }, 2000 + Math.random() * 3000); // Random delay 2-5s to distribute triggers
      return () => clearTimeout(timer);
    }
  }, [deal.id, stageName, deal.updated_at]);

  // Get assigned user data
  const assignedTo = CRM_USERS.find(u => u.id === deal.assigned_to || u.name === deal.assigned_to) || CRM_USERS[0];

  const handleAssignChange = async (userId: string) => {
    try {
      await supabaseCRMService.updateDeal(deal.id, { assigned_to: userId });
      toast.success("Responsabile aggiornato");
      fetchInitialData(activeStructure?.slug);
    } catch (e) {
      toast.error("Errore aggiornamento responsabile");
    }
  };

  const UserAvatar = ({ className }: { className?: string }) => (
    <DropdownMenu>
       <DropdownMenuTrigger asChild disabled={!canAssignUsers}>
        <Avatar className={cn(
          "transition-all shadow-sm", 
          canAssignUsers ? "cursor-pointer hover:ring-2 hover:ring-blue-400" : "cursor-default opacity-80",
          className
        )}>
          <AvatarImage src={assignedTo.avatar} />
          <AvatarFallback className="bg-blue-100 text-blue-600 font-black text-[8px] xl:text-[9px]">
            {assignedTo.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
       </DropdownMenuTrigger>
       <DropdownMenuContent align="end" className="w-[200px] rounded-xl shadow-2xl p-1 border-slate-100">
         <DropdownMenuLabel className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-3 py-2">Cambia Responsabile</DropdownMenuLabel>
         <DropdownMenuSeparator />
         {CRM_USERS.map(user => (
           <DropdownMenuItem 
            key={user.id} 
            onClick={(e) => {
              e.stopPropagation();
              handleAssignChange(user.id);
            }}
            className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-blue-50"
           >
             <Avatar className="h-6 w-6">
               <AvatarImage src={user.avatar} />
               <AvatarFallback className="text-[8px]">{user.name.substring(0,1)}</AvatarFallback>
             </Avatar>
             <div className="flex flex-col">
               <span className="text-[11px] font-bold text-slate-700">{user.name}</span>
               <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">{user.role}</span>
             </div>
           </DropdownMenuItem>
         ))}
       </DropdownMenuContent>
    </DropdownMenu>
  );

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
    data: { deal }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : {};

  const isLead = structure?.slug === 'leads';

  const cardStyle = {
    ...style,
    borderLeftColor: structure?.color || '#cbd5e1'
  };

  const getScoreBadgeStyles = (score: number) => {
    if (score >= 80) return "bg-rose-100 text-rose-700 border-rose-200 ring-rose-500/20";
    if (score >= 60) return "bg-orange-100 text-orange-700 border-orange-200 ring-orange-500/20";
    if (score >= 30) return "bg-amber-100 text-amber-700 border-amber-200 ring-amber-500/20";
    return "bg-slate-100 text-slate-600 border-slate-200 ring-slate-500/10";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "HOT 🔥";
    if (score >= 60) return "CALDO";
    if (score >= 30) return "MEDIO";
    return "FREDDO";
  };

  const getBadgeColor = () => {
    const s = stageName.toLowerCase();
    if (s.includes('vinto')) return "bg-emerald-50 text-emerald-600";
    if (s.includes('perso')) return "bg-rose-50 text-rose-600";
    return "bg-blue-50 text-blue-600";
  };

  // PREANALYSIS CARD
  if (isPreanalysis && deal.preanalysis_result) {
    const res = deal.preanalysis_result;
    return (
      <div
        ref={setNodeRef}
        style={cardStyle}
        {...listeners}
        {...attributes}
        className={cn(
          "bg-white rounded-lg shadow-sm border-l-4 cursor-grab active:cursor-grabbing transition-all",
          "p-2.5 md:p-[10px] xl:p-3", // Responsive padding
          "xl:hover:shadow-md", // No hover shadow on mobile
          isDragging && "opacity-50 grayscale scale-95 z-50",
          "flex flex-col gap-2 md:gap-3"
        )}
      >
        <div className="flex justify-between items-start gap-2">
          <div className="flex flex-col min-w-0">
            <h3 className="font-black text-slate-800 text-[11px] md:text-[12px] xl:text-[13px] leading-tight uppercase tracking-tight truncate">
              {res.company_data.name}
            </h3>
            <div className="flex items-center gap-1 mt-0.5">
               {isLead ? <Target size={10} className="text-purple-500" /> : <Briefcase size={10} className="text-blue-500" />}
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">
                 {res.request_type || (isLead ? 'Lead da contattare' : 'Affare')}
               </span>
            </div>
            {isLead && (
              <div className="flex flex-col gap-0.5 mt-2">
                {res.company_data.email && (
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-medium">
                    <Mail size={10} className="text-slate-300" /> {res.company_data.email}
                  </div>
                )}
                {res.company_data.phone && (
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-medium">
                    <Phone size={10} className="text-slate-300" /> {res.company_data.phone}
                  </div>
                )}
              </div>
            )}
            {getInactivityData(deal, currentStage?.name || '')?.isExpired && (
              <Badge className="mt-1 bg-red-50 text-red-600 border-red-100 text-[8px] xl:text-[9px] font-black uppercase flex items-center gap-1 w-fit">
                <AlertTriangle size={8} />
                <span className="xl:hidden">Inattivo</span>
                <span className="hidden xl:inline">⚠ inattivo {getInactivityData(deal, currentStage?.name || '')?.daysInactivity} giorni</span>
              </Badge>
            )}
          </div>
          <Badge className={cn(
            "text-[8px] xl:text-[10px] font-black uppercase px-2 py-0.5 border ring-1 shrink-0 flex items-center gap-1", 
            getScoreBadgeStyles(res.score)
          )}>
            <span className="hidden xl:inline">{getScoreLabel(res.score)}</span>
            <span>{res.score}%</span>
          </Badge>
        </div>

        {/* Contact info - hidden on smallest mobile screens for extra compactness as requested */}
        <div className="hidden md:flex flex-col gap-1.5 pt-1">
          <div className="flex items-center gap-2 text-[10px] xl:text-[11px] text-slate-600 font-bold overflow-hidden">
            <User size={10} className="text-slate-400 shrink-0" />
            <span className="truncate">{res.contact_data.name}</span>
          </div>
        </div>

        {/* Mobile-only compact view extras */}
        <div className="md:hidden flex items-center gap-2 text-[10px] text-slate-500 font-medium">
          <Phone size={10} className="text-slate-400 shrink-0" />
          <span>{res.contact_data.phone}</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
          <span className="text-[10px] xl:text-xs font-black text-blue-600 italic">
            €{res.estimated_amount?.toLocaleString() || '0'}
          </span>
          <div className="flex items-center -space-x-2">
            <UserAvatar className="h-6 w-6 xl:h-8 xl:w-8" />
          </div>
        </div>
      </div>
    );
  }

  // STANDARD DEAL CARD
  return (
    <div
      ref={setNodeRef}
      style={cardStyle}
      {...listeners}
      {...attributes}
      className={cn(
        "bg-white rounded-lg shadow-sm border-l-4 border-slate-200 cursor-grab active:cursor-grabbing transition-all",
        "p-2.5 md:p-[10px] xl:p-3", // Responsive padding
        "xl:hover:shadow-md",
        isDragging && "opacity-50 grayscale z-50",
        isReadOnly && "bg-slate-50/50 cursor-default opacity-90",
        "flex flex-col gap-2 md:gap-3"
      )}
    >
      {isReadOnly && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-40">
           <Lock size={12} className="text-slate-400" />
           <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">ReadOnly</span>
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col min-w-0 flex-1">
          <h4 className="text-[11px] md:text-[12px] xl:text-[13px] font-black text-slate-800 leading-tight uppercase tracking-tight truncate">
            {deal.company || deal.title}
          </h4>
          <div className="flex items-center gap-1 mt-0.5 xl:mt-1">
             {isLead ? <Target size={10} className="text-purple-500" /> : <Briefcase size={10} className="text-blue-500" />}
             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">
               {structure?.name || (isLead ? 'Lead' : 'Affare')}
             </span>
          </div>
          {isLead && (
            <div className="flex flex-col gap-0.5 mt-2">
              {deal.email && (
                <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-medium">
                  <Mail size={10} className="text-slate-300" /> {deal.email}
                </div>
              )}
              {deal.phone && (
                <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-medium">
                  <Phone size={10} className="text-slate-300" /> {deal.phone}
                </div>
              )}
            </div>
          )}
          {getInactivityData(deal, currentStage?.name || '')?.isExpired && (
            <Badge className="mt-1 bg-red-50 text-red-600 border-red-100 text-[8px] xl:text-[10px] font-black uppercase flex items-center gap-1 w-fit">
              <AlertTriangle size={8} className="xl:h-3 xl:w-3" />
              <span className="inline">⚠ inattivo {getInactivityData(deal, currentStage?.name || '')?.daysInactivity} giorni</span>
            </Badge>
          )}
        </div>
        
        {/* Lead score badge OR deal value */}
        <div className="shrink-0 flex flex-col items-end gap-1">
          <LeadScoreBadge leadId={deal.id} size="sm" />
          {!isLead && (
            <span className="hidden xl:block text-[12px] font-black text-emerald-600 tracking-tight">€{deal.value.toLocaleString()}</span>
          )}
        </div>

        {deal.preanalysis_result && (
          <Badge className={cn(
            "xl:hidden text-[8px] font-black uppercase px-1.5 py-0 border ring-1", 
            getScoreBadgeStyles(deal.preanalysis_result.score)
          )}>
            {deal.preanalysis_result.score}%
          </Badge>
        )}
      </div>

      <div className="space-y-1 md:space-y-1.5 pt-1">
        <div className="flex items-center gap-2">
          <User size={10} className="text-slate-400 shrink-0" />
          <span className="text-[10px] md:text-[11px] font-bold text-slate-600 truncate">{deal.contact || '-'}</span>
        </div>
        
        {/* Mobile-only compact view extra: Phone */}
        <div className="md:hidden flex items-center gap-2 pt-0.5">
          <Phone size={10} className="text-slate-400 shrink-0" />
          <span className="text-[9px] font-medium text-blue-500 truncate">{deal.phone || '-'}</span>
        </div>
      </div>

      {/* Custom Fields - Kanban Visible */}
      {kanbanFields.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 border-t border-slate-50 pt-2">
          {kanbanFields.map(field => {
            const val = deal.custom_fields?.[field.name];
            if (val === undefined || val === null || val === '') return null;
            return (
              <div key={field.id} className="flex flex-col">
                <span className="text-[7px] font-black uppercase text-slate-400 tracking-widest leading-none mb-0.5">{field.label}</span>
                <span className="text-[9px] font-bold text-slate-600 truncate max-w-[100px]">
                  {field.type === 'checkbox' ? (val ? 'Sì' : 'No') : val.toString()}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-auto">
        <div className="flex flex-col xl:flex-row xl:items-center gap-1 xl:gap-2">
          {/* Lower value display for Tablet/Mobile */}
          {!isLead && (
            <span className="xl:hidden text-[11px] md:text-[11px] font-black text-emerald-600 tracking-tight">€{deal.value.toLocaleString()}</span>
          )}
          
          <div className="flex items-center gap-1.5 text-[8px] xl:text-[9px] font-black text-slate-300 uppercase tracking-tight">
             <Calendar size={10} />
             {new Date(deal.created_at).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop specific: High score badge at bottom if exists */}
          {deal.preanalysis_result && (
            <Badge className={cn(
              "hidden xl:flex text-[10px] font-black uppercase px-2 py-0 border ring-1 h-5 items-center gap-2", 
              getScoreBadgeStyles(deal.preanalysis_result.score)
            )}>
              {getScoreLabel(deal.preanalysis_result.score)}
              <span className="opacity-50">•</span>
              {deal.preanalysis_result.score}%
            </Badge>
          )}

          <div className="flex items-center -space-x-1.5">
            <UserAvatar className="h-6 w-6 xl:h-8 xl:w-8" />
          </div>
        </div>
      </div>
    </div>
  );
};
