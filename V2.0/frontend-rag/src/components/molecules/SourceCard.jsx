// src/components/molecules/SourceCard.jsx
import { FileText, Trash2, Eye } from 'lucide-react';

export const SourceCard = ({ name, isSelected, onSelect, onPreview, onDelete }) => {
  return (
    <div className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
      isSelected 
      ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
      : 'bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700 hover:border-blue-200'
    }`}>
      <div className="flex items-center gap-3 cursor-pointer flex-1 min-w-0" onClick={() => onSelect(name)}>
        <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
          <FileText size={16} />
        </div>
        <span className={`text-xs font-medium truncate ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300'}`}>
          {name}
        </span>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onPreview(name)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-md">
          <Eye size={14} />
        </button>
        
        {/* ESTE ES EL BOTÓN QUE FALTA */}
        <button 
          onClick={(e) => {
            e.stopPropagation(); // IMPORTANTE: para que no se deseleccione al borrar
            if(window.confirm(`¿Eliminar ${name}?`)) onDelete(name);
          }} 
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};