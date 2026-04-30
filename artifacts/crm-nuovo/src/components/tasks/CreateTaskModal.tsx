import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose }) => {
  const { tenant, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !user) return;
    setLoading(true);

    try {
      await addDoc(collection(db, 'tenants', tenant.id, 'tasks'), {
        tenantId: tenant.id,
        creatorId: user.uid,
        responsibleId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...formData
      });
      onClose();
      setFormData({ title: '', description: '', priority: 'medium', status: 'pending' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `tenants/${tenant.id}/tasks`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800 uppercase tracking-tight">
            Nuovo Task
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-slate-400 uppercase">Titolo Task</Label>
            <Input 
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Cosa bisogna fare?"
              className="rounded-xl border-slate-200"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-slate-400 uppercase">Descrizione</Label>
            <Textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="rounded-xl border-slate-200 min-h-[100px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-400 uppercase">Priorità</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(val: any) => setFormData({...formData, priority: val})}
              >
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Bassa</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Critica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-400 uppercase">Stato</Label>
              <Select 
                value={formData.status} 
                onValueChange={(val: any) => setFormData({...formData, status: val})}
              >
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">In attesa</SelectItem>
                  <SelectItem value="ongoing">In corso</SelectItem>
                  <SelectItem value="deferred">Rinviato</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-full font-bold text-xs">ANNULLA</Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full px-8 text-xs shadow-lg shadow-blue-100"
            >
              {loading ? 'CREAZIONE...' : 'CREA TASK'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
