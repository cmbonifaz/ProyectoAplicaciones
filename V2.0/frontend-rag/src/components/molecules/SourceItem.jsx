import React from 'react';
import { FileText } from 'lucide-react';

export const SourceItem = ({ name }) => (
  <div className="flex items-center gap-3 p-2.5 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors group">
    <FileText size={18} className="text-blue-500 group-hover:text-blue-600" />
    <span className="text-sm truncate font-medium text-gray-600">{name}</span>
  </div>
);