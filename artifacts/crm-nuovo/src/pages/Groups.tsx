import React from 'react';
import { Users, Briefcase, Plus, Search, MoreHorizontal, MessageSquare, CheckSquare, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const Groups: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gruppi di lavoro</h1>
          <p className="text-slate-500">Collabora con i tuoi colleghi su progetti specifici</p>
        </div>
        <Button className="bg-[#2FC6F6] hover:bg-[#1eb0e0] text-white rounded-full px-6 font-bold">
          <Plus size={18} className="mr-2" />
          NUOVO GRUPPO
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input placeholder="Cerca gruppi o progetti..." className="pl-10 bg-slate-50 border-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'Team Marketing', members: 8, tasks: 12, files: 45, type: 'Gruppo' },
          { name: 'Sviluppo App Mobile', members: 5, tasks: 24, files: 12, type: 'Progetto' },
          { name: 'Risorse Umane', members: 3, tasks: 5, files: 89, type: 'Gruppo' },
          { name: 'Lancio Prodotto 2024', members: 12, tasks: 45, files: 156, type: 'Progetto' },
        ].map((group, i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow border-slate-100 overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600"></div>
            <CardHeader className="relative -mt-12">
              <div className="flex items-end justify-between">
                <div className="w-20 h-20 bg-white p-1 rounded-2xl shadow-md">
                  <div className="w-full h-full bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 font-bold text-2xl">
                    {group.name.charAt(0)}
                  </div>
                </div>
                <Badge className={group.type === 'Progetto' ? 'bg-purple-500' : 'bg-blue-500'}>
                  {group.type}
                </Badge>
              </div>
              <CardTitle className="mt-4 text-xl">{group.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                <div className="flex items-center gap-1"><Users size={16} /> {group.members}</div>
                <div className="flex items-center gap-1"><CheckSquare size={16} /> {group.tasks}</div>
                <div className="flex items-center gap-1"><FileText size={16} /> {group.files}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((m) => (
                    <Avatar key={m} className="border-2 border-white w-8 h-8">
                      <AvatarImage src={`https://i.pravatar.cc/150?u=${m + i}`} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  ))}
                  <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                    +{group.members - 4}
                  </div>
                </div>
                <Button variant="ghost" size="icon"><MoreHorizontal size={20} /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Groups;
