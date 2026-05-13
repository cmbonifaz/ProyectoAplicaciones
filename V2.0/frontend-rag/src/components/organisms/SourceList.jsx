import React from 'react';
import { SourceCard } from '../molecules/SourceCard';

export const SourceList = ({ 
  sources = [], 
  onUploadClick, 
  isUploading, 
  onPreview, 
  onDeleteSource, // <--- 1. RECIBIR LA PROP AQUÍ
  selectedSources = [], 
  onToggleSource 
}) => {
  
  return (
    <div className="flex flex-col gap-3">
      {sources?.length === 0 ? (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-600">
          <p className="text-gray-400 dark:text-gray-500 text-xs text-center italic">
            No hay fuentes cargadas en esta sesión.
          </p>
        </div>
      ) : (
        sources.map((source, index) => (
          <SourceCard 
            key={index} 
            name={source} 
            isSelected={selectedSources.includes(source)} 
            onSelect={onToggleSource}
            onPreview={onPreview}
            onDelete={onDeleteSource} // <--- 2. PASAR LA PROP AL HIJO
          />
        ))
      )}
      
      {isUploading && (
        <div className="flex items-center justify-center gap-2 py-2">
           <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
           <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">
             Procesando PDF...
           </p>
        </div>
      )}

      <button 
        onClick={() => document.getElementById('sidebar-upload-input').click()}
        disabled={isUploading}
        className="mt-4 py-2.5 px-4 border border-blue-100 dark:border-blue-900/50 rounded-xl text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all active:scale-95 disabled:opacity-50"
      >
        + Agregar Fuente
        <input 
          id="sidebar-upload-input" 
          type="file" 
          className="hidden" 
          accept=".pdf"
          onChange={onUploadClick} 
        />
      </button>
    </div>
  );
};