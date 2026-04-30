import React from 'react';
import { motion } from 'framer-motion';

interface GoogleFormEmbedProps {
  url: string;
  title?: string;
}

export const GoogleFormEmbed: React.FC<GoogleFormEmbedProps> = ({ url, title }) => {
  // Ensure the URL is prepared for embedding
  const embedUrl = url.includes('embedded=true') 
    ? url 
    : `${url}${url.includes('?') ? '&' : '?'}embedded=true`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-full min-h-[800px] flex flex-col bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200"
    >
      {title && (
        <div className="bg-[#004a99] p-4 text-white font-bold uppercase tracking-widest text-[10px] sm:text-xs">
          {title}
        </div>
      )}
      <div className="flex-1 w-full relative">
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full border-0"
          title={title || "Google Form"}
          frameBorder="0"
          marginHeight={0}
          marginWidth={0}
        >
          Caricamento...
        </iframe>
      </div>
    </motion.div>
  );
};
