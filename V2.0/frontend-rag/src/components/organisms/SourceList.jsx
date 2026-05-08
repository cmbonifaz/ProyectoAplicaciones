import React from 'react';
import { SourceCard } from '../molecules/SourceCard';

// 1. Usa { sources = [] } para asegurar que siempre sea un array, incluso si falla la prop
// 2. Verifica que el nombre de la prop sea exactamente 'sources'
export const SourceList = ({ sources = [], onUploadClick, isUploading, onPreview, selectedSources = [], onToggleSource }) => {
  
  // Función para previsualizar el PDF
  const handlePreview = (name) => {
    if (onPreview) onPreview(name);
  };

  // Agregamos un log para que veas en la consola qué está llegando exactamente
  console.log("Fuentes recibidas en SourceList:", sources);

  return (
    <div className="flex flex-col gap-3">
      {/* Usamos el encadenamiento opcional ?. por seguridad extra */}
      {sources?.length === 0 ? (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-600">
          <p className="text-gray-400 dark:text-gray-500 text-xs text-center italic">
            No hay fuentes cargadas.
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
          />
        ))
      )}
      
      {isUploading && (
        <p className="text-[10px] text-blue-500 animate-pulse font-bold text-center">
          SUBIENDO ARCHIVO...
        </p>
      )}

      <button 
        onClick={() => document.getElementById('sidebar-upload-input').click()}
        className="mt-4 py-2 px-4 border border-blue-100 dark:border-blue-800 rounded-xl text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
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