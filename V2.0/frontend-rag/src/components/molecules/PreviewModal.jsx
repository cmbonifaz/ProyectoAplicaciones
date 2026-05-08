import React from 'react';
import { X } from 'lucide-react';

export const PreviewModal = ({ isOpen, onClose, fileName }) => {
  if (!isOpen || !fileName) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-2xl max-w-4xl w-full h-[80vh] p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <X size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Previsualización: {fileName}</h2>
        
        <div className="w-full h-full">
          <iframe 
            src={`http://127.0.0.1:8000/files/${fileName}`}
            className="w-full h-full border rounded-lg"
            title={`Previsualización de ${fileName}`}
          />
        </div>
      </div>
    </div>
  );
};