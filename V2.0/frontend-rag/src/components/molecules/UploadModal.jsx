import React from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';

export const UploadModal = ({ onUpload, isOpen, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-2xl max-w-md w-full p-8 text-center animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          {isLoading ? (
            <Loader2 className="text-blue-600 dark:text-blue-400 animate-spin" size={40} />
          ) : (
            <FileText className="text-blue-600 dark:text-blue-400" size={40} />
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Comencemos</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Sube un archivo PDF para entrenar a la IA y comenzar tu análisis.
        </p>

        <label className={`
          flex items-center justify-center gap-2 w-full py-4 px-6 rounded-2xl font-bold transition-all cursor-pointer
          ${isLoading ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'}
        `}>
          <Upload size={20} />
          {isLoading ? 'Procesando...' : 'Seleccionar PDF'}
          <input 
            type="file" 
            className="hidden" 
            accept=".pdf" 
            onChange={onUpload} 
            disabled={isLoading}
          />
        </label>
        
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-6 uppercase tracking-widest">
          Universidad de las Fuerzas Armadas ESPE
        </p>
      </div>
    </div>
  );
};