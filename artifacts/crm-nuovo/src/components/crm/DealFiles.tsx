import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Download, 
  File as FileIcon, 
  FileImage, 
  FileArchive, 
  Plus, 
  MoreVertical,
  Search,
  Grid,
  List as ListIcon,
  X,
  Loader2,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CRMFile } from '@/types/crm';
import { storageService } from '@/services/storageService';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface DealFilesProps {
  dealId: string;
}

export const DealFiles: React.FC<DealFilesProps> = ({ dealId }) => {
  const [files, setFiles] = useState<CRMFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [dragActive, setDragActive] = useState(false);

  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await storageService.getFiles(dealId, 'deal');
      setFiles(data);
    } catch (e) {
      console.error(e);
      toast.error('Errore nel caricamento dei file');
    } finally {
      setIsLoading(false);
    }
  }, [dealId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let uploadFiles: FileList | null = null;
    
    if ('files' in e.target) {
      uploadFiles = (e.target as HTMLInputElement).files;
    } else if ('dataTransfer' in e) {
      e.preventDefault();
      uploadFiles = (e as React.DragEvent).dataTransfer.files;
    }

    if (!uploadFiles || uploadFiles.length === 0) return;

    setIsUploading(true);
    try {
      const promises = Array.from(uploadFiles).map(file => 
        storageService.uploadFile(file, dealId, 'deal')
      );
      await Promise.all(promises);
      toast.success('File caricati correttamente');
      loadFiles();
    } catch (e) {
      console.error(e);
      toast.error('Errore durante l\'upload');
    } finally {
      setIsUploading(false);
      setDragActive(false);
    }
  };

  const handleDelete = async (file: CRMFile) => {
    if (!confirm('Sei sicuro di voler eliminare questo file?')) return;
    
    try {
      await storageService.deleteFile(file.id, file.path);
      setFiles(prev => prev.filter(f => f.id !== file.id));
      toast.success('File eliminato');
    } catch (e) {
      toast.error('Errore nell\'eliminazione');
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <FileImage className="text-emerald-500" />;
    if (type.includes('pdf')) return <FileText className="text-rose-500" />;
    if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) return <FileSpreadsheet className="text-green-600" />;
    if (type.includes('zip') || type.includes('archive')) return <FileArchive className="text-amber-500" />;
    return <FileIcon className="text-slate-400" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER & ACTIONS */}
      <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[32px] border border-slate-100">
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Documenti Affare</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Contratti, preventivi e documenti cliente</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex bg-white p-1 rounded-xl border border-slate-200">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setViewType('grid')}
              className={`w-8 h-8 rounded-lg ${viewType === 'grid' ? 'bg-slate-100 text-blue-600' : 'text-slate-400'}`}
            >
              <Grid size={16} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setViewType('list')}
              className={`w-8 h-8 rounded-lg ${viewType === 'list' ? 'bg-slate-100 text-blue-600' : 'text-slate-400'}`}
            >
              <ListIcon size={16} />
            </Button>
          </div>
          <label className="cursor-pointer bg-slate-900 hover:bg-black text-white rounded-2xl text-[10px] uppercase font-black tracking-widest h-10 px-6 shadow-lg shadow-slate-200 flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
            <Plus size={16} /> Upload
            <input type="file" multiple className="hidden" onChange={handleUpload} disabled={isUploading} />
          </label>
        </div>
      </div>

      {/* UPLOAD PROGRESS / DROP ZONE */}
      <AnimatePresence>
        {(dragActive || isUploading) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className={`p-12 border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center gap-4 transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-slate-50/50'
            }`}
            onDragEnter={onDrag}
            onDragLeave={onDrag}
            onDragOver={onDrag}
            onDrop={handleUpload}
          >
            {isUploading ? (
              <>
                <Loader2 size={40} className="text-blue-500 animate-spin" />
                <p className="text-xs font-black uppercase tracking-widest text-blue-600">Caricamento in corso...</p>
              </>
            ) : (
              <>
                <Upload size={40} className="text-blue-500 animate-bounce" />
                <p className="text-xs font-black uppercase tracking-widest text-blue-600">Rilascia qui i file</p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FILES CONTENT */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="animate-spin text-slate-300" size={32} />
        </div>
      ) : files.length === 0 ? (
        <div className="p-16 text-center border-2 border-dashed border-slate-100 rounded-[32px] bg-white">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
            <FileIcon size={32} className="text-slate-200" />
          </div>
          <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Ancora nessun file</h4>
          <p className="text-[10px] text-slate-300 font-bold uppercase">Carica il primo documento per questo affare</p>
        </div>
      ) : viewType === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map(file => (
            <motion.div 
              key={file.id}
              layoutId={file.id}
              className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all group relative"
            >
              <div className="aspect-square rounded-2xl bg-slate-50 mb-4 flex items-center justify-center group-hover:bg-slate-100 transition-colors relative overflow-hidden">
                {file.type.includes('image') ? (
                  <img src={file.url} alt={file.name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <div className="scale-150 opacity-40">{getFileIcon(file.type)}</div>
                )}
                
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                   <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-900 hover:text-blue-600 transition-colors"
                   >
                     <Download size={14} />
                   </a>
                   <button 
                    onClick={() => handleDelete(file)}
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-900 hover:text-rose-600 transition-colors"
                   >
                     <Trash2 size={14} />
                   </button>
                </div>
              </div>
              
              <h4 className="text-[11px] font-black text-slate-900 truncate uppercase tracking-tight mb-1">{file.name}</h4>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400 uppercase">{formatFileSize(file.size)}</span>
                <span className="text-[9px] font-bold text-slate-300 uppercase">{format(new Date(file.created_at), 'dd/MM/yy', { locale: it })}</span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-50">
            {files.map(file => (
              <div key={file.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-slate-900 truncate uppercase tracking-tight">{file.name}</h4>
                  <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                    <span>{formatFileSize(file.size)}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                    <span>Inviato da {file.uploaded_by_name}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                    <span>{format(new Date(file.created_at), 'dd MMM yyyy', { locale: it })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full hover:bg-white border border-transparent hover:border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all"
                   >
                     <Download size={16} />
                   </a>
                   <button 
                    onClick={() => handleDelete(file)}
                    className="w-9 h-9 rounded-full hover:bg-white border border-transparent hover:border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-all"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
