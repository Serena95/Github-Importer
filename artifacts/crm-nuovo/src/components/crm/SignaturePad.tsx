import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, RotateCcw, PenTool, MousePointer2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setHasContent(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasContent) return;
    onSave(canvas.toDataURL());
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-900 text-white">
            <PenTool size={16} />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">Firma Elettronica</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Traccia la tua firma nel riquadro</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
             <MousePointer2 size={12} className="animate-pulse" />
             <span className="text-[8px] font-black uppercase tracking-widest">Touch/Mouse Active</span>
           </div>
        </div>
      </div>

      <div className="relative aspect-[2/1] bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 overflow-hidden cursor-crosshair group">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasContent && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Firma Qui</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          onClick={clear}
          className="flex-1 rounded-2xl h-12 font-bold uppercase tracking-widest text-[10px] gap-2"
        >
          <RotateCcw size={14} /> Pulisci
        </Button>
        <Button 
          variant="outline"
          onClick={onCancel}
          className="flex-1 rounded-2xl h-12 font-bold uppercase tracking-widest text-[10px]"
        >
          Annulla
        </Button>
        <Button 
          onClick={handleSave}
          disabled={!hasContent}
          className="flex-[2] bg-slate-900 hover:bg-black text-white rounded-2xl h-12 font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-slate-200 gap-2"
        >
          <CheckCircle2 size={16} /> Conferma Firma
        </Button>
      </div>
    </div>
  );
};
