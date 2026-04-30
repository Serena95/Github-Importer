import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  updateDoc, 
  doc,
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Pipeline, PipelineStage } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Settings2, 
  GripVertical, 
  Trash2, 
  Save, 
  ArrowRightLeft,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import { toast } from 'sonner';

const PipelineSettings: React.FC = () => {
  const { tenant } = useAuth();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);

  useEffect(() => {
    if (!tenant) return;

    const unsub = onSnapshot(collection(db, 'tenants', tenant.id, 'pipelines'), (snap) => {
      setPipelines(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pipeline)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `tenants/${tenant.id}/pipelines`));

    return () => unsub();
  }, [tenant]);

  const handleUpdateStages = async (pipelineId: string, stages: PipelineStage[]) => {
    if (!tenant) return;
    try {
      await updateDoc(doc(db, 'tenants', tenant.id, 'pipelines', pipelineId), {
        stages,
        updatedAt: new Date().toISOString()
      });
      toast.success('Pipeline aggiornata con successo');
    } catch (error) {
      toast.error('Errore durante l\'aggiornamento');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Pipeline e Tunnel di Vendita</h2>
          <p className="text-slate-500 text-sm">Configura i tuoi flussi di vendita e i collegamenti tra le diverse pipeline.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 rounded-full">
          <Plus size={16} className="mr-2" /> NUOVA PIPELINE
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pipelines.sort((a, b) => a.name.localeCompare(b.name)).map((pipeline) => (
          <Card key={pipeline.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600">
                {pipeline.name}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-slate-400"
                onClick={() => setEditingPipeline(pipeline)}
              >
                <Settings2 size={16} />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pipeline.stages.slice(0, 4).map((stage) => (
                  <div key={stage.id} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }}></div>
                    <span className="text-slate-500">{stage.name}</span>
                  </div>
                ))}
                {pipeline.stages.length > 4 && (
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">
                    + {pipeline.stages.length - 4} ALTRI STATI
                  </p>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                  <ArrowRightLeft size={12} />
                  <span>2 Tunnel attivi</span>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-widest">
                  GESTISCI <ChevronRight size={12} className="ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Editing Modal/Drawer would go here */}
      {editingPipeline && (
        <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="bg-slate-50 border-b shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle>Configura Pipeline: {editingPipeline.name}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setEditingPipeline(null)}>
                  <Plus size={20} className="rotate-45" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Stati della Pipeline</h3>
                {editingPipeline.stages.map((stage, index) => (
                  <div key={stage.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <GripVertical size={16} className="text-slate-300 cursor-grab" />
                    <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: stage.color }}></div>
                    <Input 
                      value={stage.name} 
                      className="h-8 text-sm bg-white border-slate-200"
                      onChange={(e) => {
                        const newStages = [...editingPipeline.stages];
                        newStages[index].name = e.target.value;
                        setEditingPipeline({ ...editingPipeline, stages: newStages });
                      }}
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full border-dashed border-slate-300 text-slate-500 hover:bg-slate-50">
                  <Plus size={16} className="mr-2" /> AGGIUNGI STATO
                </Button>
              </div>

              <div className="mt-8 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Tunnel di Vendita</h3>
                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                  <p className="text-xs text-blue-600 leading-relaxed">
                    I tunnel permettono di spostare automaticamente un affare in un'altra pipeline quando raggiunge uno stato specifico.
                  </p>
                  <Button variant="link" className="text-blue-600 p-0 h-auto text-xs font-bold mt-2">
                    CONFIGURA NUOVO TUNNEL <ChevronRight size={12} />
                  </Button>
                </div>
              </div>
            </CardContent>
            <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditingPipeline(null)}>ANNULLA</Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  handleUpdateStages(editingPipeline.id, editingPipeline.stages);
                  setEditingPipeline(null);
                }}
              >
                <Save size={16} className="mr-2" /> SALVA CONFIGURAZIONE
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PipelineSettings;
