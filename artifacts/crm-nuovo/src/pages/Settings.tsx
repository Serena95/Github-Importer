import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Shield, Building, User, CreditCard, LogOut, Users, Settings2 } from 'lucide-react';
import { CustomFieldsSettings } from '@/components/crm/settings/CustomFieldsSettings';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/types';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';

interface SettingsProps {
  activeTab?: string;
}

const Settings: React.FC<SettingsProps> = ({ activeTab: externalActiveTab }) => {
  const { profile, tenant, logout } = useAuth();
  const [activeSection, setActiveSection] = React.useState('profile');

  React.useEffect(() => {
    if (externalActiveTab) {
      if (externalActiveTab === 'settings') setActiveSection('profile');
      else {
        const section = externalActiveTab.split('-')[1];
        if (section === 'crm' && externalActiveTab.split('-')[2] === 'fields') {
          setActiveSection('crm-fields');
        } else {
          setActiveSection(section || 'profile');
        }
      }
    }
  }, [externalActiveTab]);
  const [workspaceUsers, setWorkspaceUsers] = React.useState<UserProfile[]>([]);

  React.useEffect(() => {
    if (!tenant) return;
    const q = query(collection(db, 'tenants', tenant.id, 'users'));
    const unsub = onSnapshot(q, (snap) => {
      setWorkspaceUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `tenants/${tenant.id}/users`));
    return () => unsub();
  }, [tenant]);

  const sections = [
    { id: 'profile', label: 'Mio Profilo', icon: User },
    { id: 'workspace', label: 'Workspace', icon: Building },
    { id: 'users', label: 'Gestione Utenti', icon: Users },
    { id: 'crm-fields', label: 'Campi CRM', icon: Settings2 },
    { id: 'security', label: 'Sicurezza', icon: Shield },
  ];

  return (
    <div className="h-full flex flex-col bg-[#f5f7fb]">
      {/* Settings Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 shrink-0 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">Impostazioni</h1>
        <p className="text-sm text-slate-400 font-medium mt-1">Gestisci il tuo account e le preferenze del workspace.</p>
      </div>

      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
          {/* Settings Sidebar */}
          <aside className="w-full lg:w-72 shrink-0 space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                  activeSection === section.id 
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-200" 
                    : "text-slate-500 hover:bg-white hover:text-slate-800"
                )}
              >
                <section.icon size={18} />
                {section.label}
              </button>
            ))}
            <div className="pt-4 mt-4 border-t border-slate-200">
              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all"
              >
                <LogOut size={18} />
                Esci dall'account
              </button>
            </div>
          </aside>

          {/* Settings Content */}
          <div className="flex-1 space-y-6">
            {activeSection === 'profile' && (
              <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-50 pb-4">
                  <CardTitle className="text-base font-bold text-slate-800">Informazioni Profilo</CardTitle>
                  <CardDescription className="text-xs font-medium text-slate-400">Aggiorna i tuoi dati personali e come appari agli altri.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative group">
                      <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                        <AvatarImage src={profile?.photoURL} />
                        <AvatarFallback className="bg-blue-500 text-white text-2xl">{profile?.displayName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <button className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-bold uppercase tracking-widest">
                        Cambia
                      </button>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{profile?.displayName}</h3>
                      <p className="text-sm text-slate-400 font-medium">{profile?.email}</p>
                      <Badge className="mt-2 bg-blue-50 text-blue-600 border-none font-bold uppercase tracking-wider text-[10px]">
                        {profile?.role}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nome Visualizzato</Label>
                      <Input defaultValue={profile?.displayName} className="bg-slate-50 border-none h-11 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-400/30" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email</Label>
                      <Input defaultValue={profile?.email} disabled className="bg-slate-100 border-none h-11 rounded-xl opacity-60" />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full px-8 shadow-lg shadow-blue-200">
                      SALVA MODIFICHE
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'workspace' && (
              <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-50 pb-4">
                  <CardTitle className="text-base font-bold text-slate-800">Dettagli Workspace</CardTitle>
                  <CardDescription className="text-xs font-medium text-slate-400">Informazioni sulla tua organizzazione.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nome Workspace</Label>
                    <Input defaultValue={tenant?.name} className="bg-slate-50 border-none h-11 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-400/30" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Stato Workspace</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-800 uppercase">ATTIVO</span>
                        <Badge className="bg-emerald-500 text-white border-none text-[9px] font-bold">FULL ACCESS</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'users' && (
              <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-50 pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-800">Membri del Team</CardTitle>
                      <CardDescription className="text-xs font-medium text-slate-400">Gestisci gli utenti e i loro permessi.</CardDescription>
                    </div>
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full px-6 text-xs shadow-md shadow-blue-200">
                      INVITA UTENTE
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Utente</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ruolo</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stato</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {workspaceUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={u.photoURL} />
                                <AvatarFallback className="text-[10px] bg-blue-500 text-white">{u.displayName?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-bold text-slate-700">{u.displayName}</p>
                                <p className="text-[10px] text-slate-400 font-medium">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-slate-200 text-slate-400">
                              {u.role}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className="bg-emerald-50 text-emerald-600 border-none text-[9px] font-bold uppercase">
                              {u.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-800">Modifica</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}

            {activeSection === 'crm-fields' && (
              <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                <CustomFieldsSettings />
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
