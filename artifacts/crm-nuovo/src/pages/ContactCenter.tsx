import React from 'react';
import { Headphones, MessageSquare, Send, PhoneCall, Mail, Smartphone, Search, Plus, MoreHorizontal, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ContactCenter: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Contact Center</h1>
          <p className="text-slate-500">Collega tutti i tuoi canali di comunicazione in un unico posto</p>
        </div>
        <Button className="bg-[#2FC6F6] hover:bg-[#1eb0e0] text-white rounded-full px-6 font-bold">
          <Plus size={18} className="mr-2" />
          COLLEGA CANALE
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'Live Chat', icon: MessageSquare, status: 'Collegato', color: 'text-blue-500', bg: 'bg-blue-50', desc: 'Chat in tempo reale sul tuo sito web' },
          { name: 'WhatsApp', icon: MessageSquare, status: 'Collegato', color: 'text-emerald-500', bg: 'bg-emerald-50', desc: 'Messaggi WhatsApp Business API' },
          { name: 'Telegram', icon: Send, status: 'Non collegato', color: 'text-sky-500', bg: 'bg-sky-50', desc: 'Bot Telegram per assistenza clienti' },
          { name: 'Facebook', icon: Globe, status: 'Collegato', color: 'text-blue-600', bg: 'bg-blue-100', desc: 'Messaggi da Facebook Messenger' },
          { name: 'Instagram', icon: Smartphone, status: 'Non collegato', color: 'text-pink-500', bg: 'bg-pink-50', desc: 'Direct messages e commenti Instagram' },
          { name: 'Email', icon: Mail, status: 'Collegato', color: 'text-purple-500', bg: 'bg-purple-50', desc: 'Email di supporto e info' },
        ].map((channel, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow border-slate-100">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${channel.bg} ${channel.color} rounded-xl flex items-center justify-center`}>
                  <channel.icon size={24} />
                </div>
                <Badge className={channel.status === 'Collegato' ? 'bg-emerald-500' : 'bg-slate-400'}>
                  {channel.status}
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{channel.name}</h3>
              <p className="text-sm text-slate-500 mb-6">{channel.desc}</p>
              <div className="flex items-center justify-between">
                <Button variant="outline" className="rounded-full text-xs font-bold border-blue-100 text-blue-600 hover:bg-blue-50">
                  CONFIGURA
                </Button>
                <Button variant="ghost" size="icon"><MoreHorizontal size={18} /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ContactCenter;
