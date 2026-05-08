import React from 'react';
import { FolderOpen, Moon, Sun } from 'lucide-react';
import { SourceList } from './SourceList'; // Asegúrate de que la ruta sea correcta

export const SourceSidebar = ({ sources, onUpload, loading, onPreview, onToggleDark, darkMode, selectedSources, onToggleSource }) => (
  <aside className="w-[340px] border-r border-[#e3e3e3] dark:border-gray-700 h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
    <div className="p-6 border-b border-gray-50 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#0b57d0] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <FolderOpen size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-[#1f1f1f] dark:text-white leading-none">Notebook ESPE</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1">
              Software Engineering
            </p>
          </div>
        </div>
        <button 
          onClick={onToggleDark}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {darkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-gray-600 dark:text-gray-300" />}
        </button>
      </div>
    </div>
    
    <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Haz clic en los documentos para seleccionarlos. Doble clic para previsualizar.
      </p>
      <SourceList 
        sources={sources} 
        onUploadClick={onUpload} 
        isUploading={loading} 
        onPreview={onPreview}
        selectedSources={selectedSources}
        onToggleSource={onToggleSource}
      />
    </div>

    <div className="p-4 border-t border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
      <p className="text-[10px] text-center text-gray-400 dark:text-gray-500 font-medium">
        V2.0 • RAG System
      </p>
    </div>
  </aside>
);