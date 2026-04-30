import React, { useState } from 'react';
import { useCRMStore } from '@/stores/crmStore';
import { CRM_USERS } from '@/constants/crm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Filter, 
  X, 
  Check, 
  Calendar as CalendarIcon, 
  User, 
  Target, 
  TrendingUp, 
  Building2,
  Trash2,
  Save,
  ChevronDown,
  Clock,
  Layout
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export const AdvancedFilters: React.FC = () => {
  const { 
    filters, 
    setFilters, 
    resetFilters, 
    stages, 
    structures, 
    savedFilters, 
    applySavedFilter, 
    saveCurrentFilter,
    activeSavedFilterId,
    activeStructure
  } = useCRMStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [isSavePopoverOpen, setIsSavePopoverOpen] = useState(false);

  const handleToggleOwner = (id: string) => {
    const current = filters.owner;
    const next = current.includes(id) 
      ? current.filter(i => i !== id)
      : [...current, id];
    setFilters({ owner: next });
  };

  const handleToggleStage = (id: string) => {
    const current = filters.stage;
    const next = current.includes(id)
      ? current.filter(i => i !== id)
      : [...current, id];
    setFilters({ stage: next });
  };

  const handleToggleStatus = (id: string) => {
    const current = filters.status;
    const next = current.includes(id)
      ? current.filter(i => i !== id)
      : [...current, id];
    setFilters({ status: next });
  };

  const handleSetPipeline = (id: string) => {
    setFilters({ pipeline: id });
  };

  const activeFiltersCount = Object.entries(filters).reduce((acc, [key, value]) => {
    if (key === 'search' && value !== '') return acc + 1;
    if (key === 'valueMin' && value !== null) return acc + 1;
    if (key === 'valueMax' && value !== null) return acc + 1;
    if (key === 'score' && (value[0] !== 0 || value[1] !== 100)) return acc + 1;
    if (key === 'pipeline' && value !== activeStructure?.id && value !== '') return acc + 1;
    if (Array.isArray(value) && value.length > 0 && key !== 'score') return acc + 1;
    if ((key === 'dateFrom' || key === 'dateTo') && value !== null) return acc + 1;
    return acc;
  }, 0);

  const FilterBadges = () => {
    if (activeFiltersCount === 0) return null;

    const badges: { label: string; onRemove: () => void }[] = [];

    if (filters.search) {
      badges.push({ label: `Cerca: ${filters.search}`, onRemove: () => setFilters({ search: '' }) });
    }
    if (filters.owner.length > 0) {
      const names = filters.owner.map(id => CRM_USERS.find(u => u.id === id)?.name || id).join(', ');
      badges.push({ label: `Resp: ${names}`, onRemove: () => setFilters({ owner: [] }) });
    }
    if (filters.stage.length > 0) {
      const names = filters.stage.map(id => stages.find(s => s.id === id)?.name || id).join(', ');
      badges.push({ label: `Stage: ${names}`, onRemove: () => setFilters({ stage: [] }) });
    }
    if (filters.status.length > 0) {
      badges.push({ label: `Stato: ${filters.status.join(', ')}`, onRemove: () => setFilters({ status: [] }) });
    }
    if (filters.valueMin !== null || filters.valueMax !== null) {
      badges.push({ 
        label: `Valore: ${filters.valueMin || 0}€ - ${filters.valueMax || '∞'}€`, 
        onRemove: () => setFilters({ valueMin: null, valueMax: null }) 
      });
    }
    if (filters.score[0] !== 0 || filters.score[1] !== 100) {
      badges.push({ 
        label: `Score: ${filters.score[0]}-${filters.score[1]}%`, 
        onRemove: () => setFilters({ score: [0, 100] }) 
      });
    }
    if (filters.dateFrom || filters.dateTo) {
      const from = filters.dateFrom ? format(filters.dateFrom, 'dd/MM/yy') : 'Inizio';
      const to = filters.dateTo ? format(filters.dateTo, 'dd/MM/yy') : 'Oggi';
      badges.push({ 
        label: `Data: ${from} - ${to}`, 
        onRemove: () => setFilters({ dateFrom: null, dateTo: null }) 
      });
    }

    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {badges.map((b, i) => (
          <div key={i} className="flex items-center gap-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full border border-blue-100">
            {b.label}
            <button onClick={b.onRemove} className="hover:text-blue-800">
              <X size={10} />
            </button>
          </div>
        ))}
      </div>
    );
  };

  const FilterContent = ({ className }: { className?: string }) => (
    <div className={cn("flex flex-col gap-6 p-4", className)}>
      <div className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
           <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
             Cerca nel CRM
           </Label>
           <Input 
             value={filters.search}
             onChange={(e) => setFilters({ search: e.target.value })}
             placeholder="Titolo, Azienda, Contatto..."
             className="h-9 text-xs focus-visible:ring-blue-500 rounded-xl"
           />
        </div>

        {/* Pipeline Selection */}
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
             <Layout size={12} className="text-blue-500" /> Pipeline
          </Label>
          <Select 
            value={filters.pipeline || activeStructure?.id || ""} 
            onValueChange={handleSetPipeline}
          >
            <SelectTrigger className="h-9 text-[11px] font-bold border-slate-200 rounded-xl">
              <SelectValue placeholder="Seleziona pipeline..." />
            </SelectTrigger>
            <SelectContent>
              {structures.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Saved Filters Presets */}
        <div>
          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 block">Filtri Rapidi</Label>
          <div className="flex flex-wrap gap-2">
            {savedFilters.map(sf => (
              <Button
                key={sf.id}
                variant={activeSavedFilterId === sf.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => applySavedFilter(sf.id)}
                className={cn(
                  "text-[9px] font-black uppercase rounded-full px-3 h-7",
                  activeSavedFilterId === sf.id ? "bg-blue-600 shadow-lg shadow-blue-100" : "text-slate-500 border-slate-200"
                )}
              >
                {sf.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Responsabile */}
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
             <User size={12} className="text-blue-500" /> Responsabile
          </Label>
          <div className="grid grid-cols-1 gap-2">
            {CRM_USERS.map(user => (
              <div key={user.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`user-${user.id}`} 
                  checked={filters.owner.includes(user.id)}
                  onCheckedChange={() => handleToggleOwner(user.id)}
                />
                <label 
                  htmlFor={`user-${user.id}`} 
                  className="text-[11px] font-bold text-slate-700 cursor-pointer"
                >
                  {user.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Stage */}
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
             <Target size={12} className="text-blue-500" /> Stage
          </Label>
          <div className="max-h-[150px] overflow-y-auto pr-2 space-y-2 no-scrollbar">
            {stages.map(stage => (
              <div key={stage.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`stage-${stage.id}`} 
                  checked={filters.stage.includes(stage.id)}
                  onCheckedChange={() => handleToggleStage(stage.id)}
                />
                <label 
                  htmlFor={`stage-${stage.id}`} 
                  className="text-[11px] font-bold text-slate-700 cursor-pointer flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                  {stage.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Stato */}
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
             <Check size={12} className="text-blue-500" /> Stato
          </Label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'attivo', label: 'Attivo' },
              { id: 'vinto', label: 'Vinto' },
              { id: 'perso', label: 'Perso' }
            ].map(s => (
              <div key={s.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`status-${s.id}`} 
                  checked={filters.status.includes(s.id)}
                  onCheckedChange={() => handleToggleStatus(s.id)}
                />
                <label 
                  htmlFor={`status-${s.id}`} 
                  className="text-[11px] font-bold text-slate-700 cursor-pointer"
                >
                  {s.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Valore Range */}
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
             <TrendingUp size={12} className="text-blue-500" /> Valore (€)
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Input 
              type="number"
              placeholder="Min"
              value={filters.valueMin || ''}
              onChange={(e) => setFilters({ valueMin: e.target.value ? parseInt(e.target.value) : null })}
              className="h-9 text-xs rounded-xl"
            />
            <Input 
              type="number"
              placeholder="Max"
              value={filters.valueMax || ''}
              onChange={(e) => setFilters({ valueMax: e.target.value ? parseInt(e.target.value) : null })}
              className="h-9 text-xs rounded-xl"
            />
          </div>
        </div>

        {/* Data Range */}
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
             <CalendarIcon size={12} className="text-blue-500" /> Periodo
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-bold text-[10px] h-9 px-3 border-slate-200 rounded-xl", !filters.dateFrom && "text-slate-400")}>
                  {filters.dateFrom ? format(filters.dateFrom, 'dd/MM/yy') : 'Dal'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateFrom || undefined}
                  onSelect={(date) => setFilters({ dateFrom: date || null })}
                  locale={it}
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-bold text-[10px] h-9 px-3 border-slate-200 rounded-xl", !filters.dateTo && "text-slate-400")}>
                  {filters.dateTo ? format(filters.dateTo, 'dd/MM/yy') : 'Al'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateTo || undefined}
                  onSelect={(date) => setFilters({ dateTo: date || null })}
                  locale={it}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Score Range */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
               <Check size={12} className="text-blue-500" /> Score
            </Label>
            <span className="text-[9px] font-mono text-slate-500">{filters.score[0]}% - {filters.score[1]}%</span>
          </div>
          <Slider
            defaultValue={[0, 100]}
            min={0}
            max={100}
            step={1}
            value={filters.score}
            onValueChange={(val) => setFilters({ score: val as [number, number] })}
            className="py-4"
          />
        </div>
      </div>

      <div className="mt-4 pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
        <Button 
          variant="outline" 
          onClick={resetFilters}
          className="flex-1 h-10 rounded-xl border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-600 text-[10px] font-black uppercase tracking-widest"
        >
          <Trash2 size={14} className="mr-2" /> Reset
        </Button>
        <Popover open={isSavePopoverOpen} onOpenChange={setIsSavePopoverOpen}>
          <PopoverTrigger asChild>
            <Button 
              className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100"
            >
              <Save size={14} className="mr-2" /> Salva
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-4 rounded-2xl shadow-2xl border-slate-100" side="top">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nome Filtro</Label>
              <Input 
                value={saveName} 
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Es. Alta priorità..."
                className="h-9 text-xs"
              />
              <Button 
                onClick={() => {
                  if (saveName) {
                    saveCurrentFilter(saveName);
                    setSaveName('');
                    setIsSavePopoverOpen(false);
                  }
                }}
                className="w-full h-9 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase"
              >
                CONFERMA
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-wrap items-center gap-2">
        {/* Desktop View: Dropdown */}
        <div className="hidden lg:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "h-8 md:h-9 text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-white shadow-sm border px-3 md:px-4 rounded-xl transition-all",
                  activeFiltersCount > 0 ? "text-blue-600 border-blue-200 bg-blue-50/50" : "text-slate-500 border-slate-200"
                )}
              >
                <Filter size={14} className={cn("mr-1.5 md:mr-2", activeFiltersCount > 0 ? "text-blue-600" : "text-blue-500")} /> 
                FILTRI {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent translate="no" align="start" className="w-[360px] max-h-[80vh] overflow-y-auto p-0 rounded-2xl shadow-3xl border-slate-100 no-scrollbar">
              <FilterContent />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile/Tablet View: Lateral/Bottom Sheet */}
        <div className="lg:hidden">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "h-9 text-[10px] font-black uppercase tracking-widest bg-white shadow-sm border px-4 rounded-xl transition-all",
                  activeFiltersCount > 0 ? "text-blue-600 border-blue-200 bg-blue-50/50" : "text-slate-500 border-slate-200"
                )}
              >
                <Filter size={14} className="mr-2 text-blue-500" /> FILTRI {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[350px] p-0 border-l border-slate-100 sm:max-w-[350px]">
              <SheetHeader className="p-6 border-b border-slate-50">
                <SheetTitle className="text-[14px] font-black uppercase tracking-tighter text-slate-800">Filtri Avanzati</SheetTitle>
              </SheetHeader>
              <FilterContent className="flex-1 overflow-y-auto" />
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Active Badges */}
      <FilterBadges />
    </div>
  );
};
