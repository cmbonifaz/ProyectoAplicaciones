import React from 'react';
import { FileText } from 'lucide-react';
import { Trash2 } from 'lucide-react';
export const SourceItem = ({ name }) => (
  <div className="flex items-center gap-3 p-2.5 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors group">
    <FileText size={18} className="text-blue-500 group-hover:text-blue-600" />
    <span className="text-sm truncate font-medium text-gray-600">{name}</span>
  </div>
);
export const SourceItem = ({ name, onDelete }) => (
    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg group">
        <span className="text-xs truncate">{name}</span>
        <button 
            onClick={(e) => { e.stopPropagation(); onDelete(name); }}
            className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all"
        >
            <Trash2 size={14} />
        </button>
    </div>
);