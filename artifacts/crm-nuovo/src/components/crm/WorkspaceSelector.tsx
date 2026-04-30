import React from 'react';
import { 
  Building2, 
  ChevronDown, 
  Plus, 
  Settings, 
  Check,
  Briefcase
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useCRMStore } from '@/stores/crmStore';
import { cn } from '@/lib/utils';

export const WorkspaceSelector: React.FC = () => {
  const { workspaces, activeWorkspace, switchWorkspace } = useCRMStore();

  if (!activeWorkspace) return null;

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 px-3 py-2 h-auto rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Building2 size={18} />
            </div>
            <div className="flex flex-col items-start hidden sm:flex">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Azienda</span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-slate-800 leading-none">{activeWorkspace.name}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[240px] rounded-2xl p-2 shadow-2xl border-none">
          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">
            I Miei Workspace
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-50 mx-2" />
          
          <div className="max-h-[300px] overflow-y-auto py-1">
            {workspaces.map((ws) => (
              <DropdownMenuItem 
                key={ws.id}
                onClick={() => switchWorkspace(ws)}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer mb-1 last:mb-0 transition-colors",
                  activeWorkspace.id === ws.id ? "bg-blue-50" : "hover:bg-slate-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    activeWorkspace.id === ws.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                  )}>
                    <Briefcase size={16} />
                  </div>
                  <span className={cn(
                    "text-xs font-bold",
                    activeWorkspace.id === ws.id ? "text-blue-700" : "text-slate-700"
                  )}>
                    {ws.name}
                  </span>
                </div>
                {activeWorkspace.id === ws.id && (
                  <Check size={16} className="text-blue-600" />
                )}
              </DropdownMenuItem>
            ))}
          </div>

          <DropdownMenuSeparator className="bg-slate-50 mx-2" />
          <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Plus size={16} />
            </div>
            <span className="text-xs font-bold text-slate-700">Nuova Azienda</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-slate-100 mt-1">
            <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center">
              <Settings size={16} />
            </div>
            <span className="text-xs font-bold text-slate-700">Impostazioni Workspace</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
