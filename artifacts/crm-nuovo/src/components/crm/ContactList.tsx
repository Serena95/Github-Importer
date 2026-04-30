import React, { useEffect, useState } from 'react';
import { useCRMStore } from '@/stores/crmStore';
import { CRMContact } from '@/types/crm';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Building, 
  User,
  Filter,
  Download,
  Trash2,
  Edit2
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
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

import { CreateContactModal } from './CreateContactModal';
import { ContactDetail } from './ContactDetail';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { toast } from 'sonner';

export const ContactList: React.FC = () => {
  const { contacts, fetchContacts, isLoading, activeWorkspace } = useCRMStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<CRMContact | null>(null);
  const [detailContact, setDetailContact] = useState<CRMContact | null>(null);

  useEffect(() => {
    fetchContacts();
  }, [activeWorkspace?.id]);

  const handleDelete = async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo contatto?')) {
      try {
        await supabaseCRMService.deleteContact(id);
        toast.success('Contatto eliminato');
        fetchContacts();
      } catch (e) {
        toast.error('Errore durante l\'eliminazione');
      }
    }
  };

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Top Bar Actions */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <Input 
              placeholder="Cerca contatti..." 
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
               setSelectedContact(null);
               setIsModalOpen(true);
             }}
             className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl px-4 text-[10px] uppercase tracking-widest"
           >
             <Plus size={16} className="mr-2" /> Nuovo Contatto
           </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="bg-slate-50/50 sticky top-0 z-10 shadow-sm">
            <TableRow className="border-slate-100 hover:bg-transparent">
              <TableHead className="w-12"></TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contatto</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Azienda</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email & Telefono</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ruolo / Posizione</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stato</TableHead>
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
            ) : filteredContacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-64 text-center">
                   <div className="flex flex-col items-center gap-3 opacity-40">
                     <User size={48} className="text-slate-300" />
                     <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Nessun contatto trovato</p>
                   </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredContacts.map((contact) => (
                <TableRow 
                  key={contact.id} 
                  className="group hover:bg-slate-50/50 border-slate-50 transition-colors cursor-pointer"
                  onClick={() => {
                    setDetailContact(contact);
                    setIsDetailOpen(true);
                  }}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Avatar className="h-8 w-8 border border-white shadow-sm ring-2 ring-slate-50">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-[10px] font-black">
                        {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-slate-800">{contact.name}</span>
                      <span className="text-[10px] text-slate-400 font-medium">#{contact.id.split('-')[1] || contact.id.substring(0, 5)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <Building size={14} className="text-slate-300" />
                       <span className="text-[11px] font-medium text-slate-600">{contact.company_name || 'Nessuna'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                       <div className="flex items-center gap-2">
                         <Mail size={12} className="text-slate-300" />
                         <span className="text-[11px] text-slate-600">{contact.email}</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <Phone size={12} className="text-slate-300" />
                         <span className="text-[11px] text-slate-600">{contact.phone}</span>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-[11px] font-medium text-slate-500 italic">{contact.position || 'N/A'}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border-none",
                      contact.status === 'lead' ? "bg-amber-50 text-amber-600" :
                      contact.status === 'customer' ? "bg-emerald-50 text-emerald-600" :
                      "bg-blue-50 text-blue-600"
                    )}>
                      {contact.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {format(new Date(contact.created_at), 'dd MMM yyyy', { locale: it })}
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
                            setSelectedContact(contact);
                            setIsModalOpen(true);
                          }}
                          className="text-[11px] font-bold p-2 cursor-pointer gap-2 rounded-lg"
                        >
                           <Edit2 size={14} /> Modifica
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(contact.id)}
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

      <CreateContactModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        contact={selectedContact}
      />

      {/* Detail Slide-over */}
      {isDetailOpen && detailContact && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div 
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px] transition-opacity" 
            onClick={() => setIsDetailOpen(false)} 
          />
          <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl animate-in slide-in-from-right duration-300">
            <ContactDetail 
              contact={detailContact} 
              onClose={() => setIsDetailOpen(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};
