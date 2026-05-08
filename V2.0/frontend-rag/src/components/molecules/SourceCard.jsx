import React from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';

export const SourceCard = ({ name, isSelected = false, onSelect, onPreview }) => (
  <div className={`relative flex flex-col p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-lg ${isSelected ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'}`} onClick={() => onSelect && onSelect(name)} onDoubleClick={() => onPreview && onPreview(name)}>
    <div className="flex justify-between items-start mb-3">
      <FileText className="text-blue-600 dark:text-blue-400" size={24} />
      {isSelected && <CheckCircle2 className="text-blue-600 dark:text-blue-400" size={16} />}
    </div>
    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-2 leading-tight">
      {name}
    </span>
  </div>
);