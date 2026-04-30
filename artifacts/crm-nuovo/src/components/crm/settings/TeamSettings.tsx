import React, { useEffect, useState } from 'react';
import { useCRMStore } from '@/stores/crmStore';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { CRMWorkspaceMember } from '@/types/crm';
import { 
  Users, 
  Mail, 
  Shield, 
  UserPlus, 
  MoreHorizontal,
  Crown,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

export const TeamSettings: React.FC = () => {
  const { activeWorkspace } = useCRMStore();
  const [members, setMembers] = useState<CRMWorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (activeWorkspace) {
      fetchMembers();
    }
  }, [activeWorkspace]);

  const fetchMembers = async () => {
    if (!activeWorkspace) return;
    setIsLoading(true);
    try {
      const data = await supabaseCRMService.getWorkspaceMembers(activeWorkspace.id);
      setMembers(data);
    } catch (error) {
      toast.error('Errore nel caricamento del team');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Membri del Team</h3>
          <p className="text-sm text-slate-500">Gestisci gli accessi e i permessi del tuo workspace.</p>
        </div>
        <Button className="bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[10px] tracking-widest px-6 h-10 rounded-xl">
          <UserPlus size={16} className="mr-2" /> Invita Membro
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse" />
          ))
        ) : members.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-100">
             <Users size={48} className="mx-auto text-slate-200 mb-4" />
             <p className="text-xs font-black uppercase tracking-widest text-slate-400">Nessun membro trovato</p>
          </div>
        ) : (
          members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all group">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-slate-50">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">
                    {member.user_email?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{member.user_email}</span>
                    {member.role === 'owner' && (
                      <Crown size={12} className="text-amber-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-wider h-5 px-2 bg-slate-50 text-slate-500 border-none">
                      {member.role === 'owner' ? 'Proprietario' : member.role === 'admin' ? 'Amministratore' : 'Membro'}
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <Clock size={10} /> Attivo dal {new Date(member.joined_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {member.role !== 'owner' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px] rounded-xl shadow-xl p-1">
                      <DropdownMenuItem className="text-xs font-bold p-2 gap-2">
                        <Shield size={14} /> Cambia Ruolo
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-xs font-bold p-2 gap-2 text-rose-500">
                        Rimuovi Accesso
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {member.role === 'owner' && (
                  <div className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest border border-amber-100 flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 size={10} /> Account Master
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
