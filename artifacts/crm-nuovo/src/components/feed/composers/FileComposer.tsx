import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  X, 
  FileText, 
  Image as ImageIcon, 
  File as FileIcon, 
  Search,
  FolderOpen,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseFeedService } from '@/services/supabaseFeedService';
import { toast } from 'sonner';

interface FileComposerProps {
  onCancel: () => void;
}

export const FileComposer: React.FC<FileComposerProps> = ({ onCancel }) => {
  const { profile, tenant } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (files.length === 0 || !tenant || !profile) return;
    
    setIsSubmitting(true);
    try {
      await supabaseFeedService.createPost({
        author_id: profile.uid,
        author_name: profile.displayName || 'Utente',
        author_photo: profile.photoURL || undefined,
        type: 'file',
        content: description || `Caricati ${files.length} file`,
        targets: ['all'],
        attachments: files.map(f => ({
          id: Math.random().toString(36),
          name: f.name,
          url: '', // Simulated
          type: f.type,
          size: f.size
        })),
        reactions: [],
        comments_count: 0,
        is_pinned: false
      });
      setFiles([]);
      setDescription('');
      toast.success('File pubblicati nel feed');
      onCancel();
    } catch (error) {
      toast.error('Errore durante la pubblicazione');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col bg-slate-50/10">
      <div className="p-6">
        {files.length === 0 ? (
          <div className="relative group cursor-pointer">
            <input 
              type="file" 
              multiple 
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-white group-hover:border-blue-300 group-hover:bg-blue-50/30 transition-all">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <h4 className="text-sm font-black text-slate-700 uppercase tracking-tight">Carica i tuoi file</h4>
              <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">Trascina qui o clicca per selezionare</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {files.map((file, i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-xl p-3 flex items-center gap-3 shadow-sm group">
                  <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                    {file.type.includes('image') ? <ImageIcon size={20} /> : <FileIcon size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">{file.name}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{Math.round(file.size / 1024)} KB</p>
                  </div>
                  <button onClick={() => removeFile(i)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ))}
              <div className="relative cursor-pointer">
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="border-2 border-dashed border-slate-100 rounded-xl p-3 flex items-center justify-center gap-2 h-full text-slate-400 hover:text-blue-500 hover:bg-white transition-all">
                  <Plus size={16} />
                  <span className="text-xs font-black uppercase tracking-widest">Aggiungi</span>
                </div>
              </div>
            </div>

            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Aggiungi una descrizione ai file..."
              className="w-full bg-white border border-slate-100 rounded-xl p-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 min-h-[80px]"
            />
          </div>
        )}

        <div className="flex items-center gap-4 mt-6">
           <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
             <Search size={14} /> Cerca in Nexus Drive
           </button>
           <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
             <FolderOpen size={14} /> Da Computer
           </button>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-end bg-white">
        <div className="flex items-center gap-2">
          <Button 
            disabled={isSubmitting || files.length === 0}
            onClick={handleSend}
            className="bg-[#2FC6F6] hover:bg-[#1eb0e0] text-white font-bold px-6 h-9 rounded text-xs uppercase tracking-widest"
          >
            {isSubmitting ? 'PUBBLICAZIONE...' : 'PUBBLICA'}
          </Button>
          <Button 
            variant="ghost" 
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 font-bold px-4 h-9 rounded text-xs uppercase tracking-widest"
          >
            ANNULLA
          </Button>
        </div>
      </div>
    </div>
  );
};
