import React, { useEffect, useState } from 'react';
import { useCRMStore } from '@/stores/crmStore';
import { CRMCompany } from '@/types/crm';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Building, 
  Globe,
  Filter,
  Download,
  Trash2,
  Edit2,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CreateCompanyModal } from './CreateCompanyModal';
import { CompanyDetail } from './CompanyDetail';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export const CompanyList: React.FC = () => {
  const { companies, fetchCompanies, isLoading, activeWorkspace } = useCRMStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CRMCompany | null>(null);
  const [detailCompany, setDetailCompany] = useState<CRMCompany | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, [activeWorkspace?.id]);

  const handleDelete = async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questa azienda? Tutte le relazioni potrebbero andare perse.')) {
      try {
        await supabaseCRMService.deleteCompany(id);
        toast.success('Azienda eliminata');
        fetchCompanies();
      } catch (e) {
        toast.error('Errore durante l\'eliminazione');
      }
    }
  };

  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (company.email && company.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (company.website && company.website.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (company.industry && company.industry.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Top Bar Actions */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <Input 
              placeholder="Cerca aziende..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs border-slate-200 bg-white rounded-xl focus-visible:ring-blue-500"
            />
          </div>
          <Button variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Filter size={14} className="mr-2" /> Filtra
          </Button>
        </div>

        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-600">
             <Download size={16} />
           </Button>
           <Button 
             onClick={() => {
               setSelectedCompany(null);
               setIsModalOpen(true);
             }}
             className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl px-4 text-[10px] uppercase tracking-widest"
           >
             <Plus size={16} className="mr-2" /> Nuova Azienda
           </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="bg-slate-50/50 sticky top-0 z-10 shadow-sm">
            <TableRow className="border-slate-100 hover:bg-transparent">
              <TableHead className="w-12"></TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Azienda</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Settore</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sito Web & Email</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Località</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dimensione</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Creato il</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell colSpan={8} className="h-16 bg-slate-50/20"></TableCell>
                </TableRow>
              ))
            ) : filteredCompanies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-64 text-center">
                   <div className="flex flex-col items-center gap-3 opacity-40">
                     <Building size={48} className="text-slate-300" />
                     <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Nessuna azienda trovata</p>
                   </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCompanies.map((company) => (
                <TableRow 
                  key={company.id} 
                  className="group hover:bg-slate-50/50 border-slate-50 transition-colors cursor-pointer"
                  onClick={() => {
                    setDetailCompany(company);
                    setIsDetailOpen(true);
                  }}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Avatar className="h-8 w-8 border border-white shadow-sm rounded-lg overflow-hidden ring-2 ring-slate-50">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg">
                        {company.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-slate-800">{company.name}</span>
                      <span className="text-[10px] text-slate-400 font-medium">P.IVA: {company.vat || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border-none">
                      {company.industry || 'Settore N/D'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                       {company.website && (
                         <div className="flex items-center gap-2">
                           <Globe size={12} className="text-slate-300" />
                           <a href={company.website} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 hover:underline">{company.website.replace('https://', '').replace('http://', '')}</a>
                         </div>
                       )}
                       {company.email && (
                         <div className="flex items-center gap-2">
                           <Mail size={12} className="text-slate-300" />
                           <span className="text-[11px] text-slate-600">{company.email}</span>
                         </div>
                       )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <MapPin size={12} className="text-slate-300" />
                       <span className="text-[11px] text-slate-600 truncate max-w-[150px]">{company.address || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter bg-slate-100 px-2 py-0.5 rounded">
                      {company.size || 'N/D'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {format(new Date(company.created_at), 'dd MMM yyyy', { locale: it })}
                    </span>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px] rounded-xl shadow-xl border-slate-100 p-1">
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedCompany(company);
                            setIsModalOpen(true);
                          }}
                          className="text-[11px] font-bold p-2 cursor-pointer gap-2 rounded-lg"
                        >
                           <Edit2 size={14} /> Modifica
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(company.id)}
                          className="text-[11px] font-bold p-2 cursor-pointer gap-2 rounded-lg text-rose-500 focus:text-rose-600 focus:bg-rose-50"
                        >
                           <Trash2 size={14} /> Elimina
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateCompanyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        company={selectedCompany}
      />

      {/* Detail Slide-over */}
      {isDetailOpen && detailCompany && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div 
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px] transition-opacity" 
            onClick={() => setIsDetailOpen(false)} 
          />
          <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl animate-in slide-in-from-right duration-300">
            <CompanyDetail 
              company={detailCompany} 
              onClose={() => setIsDetailOpen(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};
