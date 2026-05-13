import React, { useState, useEffect } from 'react';
import { FolderOpen, Moon, Sun, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { SourceList } from './SourceList';
import { ConfirmModal } from '../molecules/ConfirmModal';
import { chatApi } from '../../services/api';

export const SourceSidebar = ({ 
  sources, 
  onUpload, 
  loading, 
  onPreview, 
  onDeleteSource, // Prop clave añadida
  onToggleDark, 
  darkMode, 
  selectedSources, 
  onToggleSource,
  activeChatId, 
  onSelectChat 
}) => {
  const [conversations, setConversations] = useState([]);

  // Cargar conversaciones al montar o cuando cambia el chat activo
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await chatApi.getConversations();
        setConversations(res.data);
      } catch (err) {
        console.error("Error cargando chats", err);
      }
    };
    fetchChats();
  }, [activeChatId]); 

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateChat = async () => {
    try {
      const title = `Nueva Sesión ${conversations.length + 1}`;
      const res = await chatApi.createConversation(title);
      onSelectChat(res.data.id);
    } catch (err) {
      console.error("Error al crear conversación", err);
    }
  };

  const handleDeleteChat = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      await chatApi.deleteConversation(deleteTarget.id);
      const nextChats = conversations.filter((chat) => chat.id !== deleteTarget.id);
      setConversations(nextChats);

      if (activeChatId === deleteTarget.id) {
        onSelectChat(nextChats.length > 0 ? nextChats[0].id : null);
      }
    } catch (err) {
      console.error("Error al eliminar conversación:", err);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const openDeleteModal = (chat) => setDeleteTarget(chat);
  const closeDeleteModal = () => setDeleteTarget(null);

  return (
    <aside className="w-[340px] border-r border-[#e3e3e3] dark:border-gray-700 h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-50 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0b57d0] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <FolderOpen size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg text-[#1f1f1f] dark:text-white leading-none">Notebook ESPE</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1">Software Engineering</p>
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

      {/* SECCIÓN: Selector de Conversaciones */}
      <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/20">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Conversaciones</h2>
          <button 
            onClick={handleCreateChat}
            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-[#0b57d0] transition-colors"
            title="Nuevo Chat"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex flex-col gap-1 max-h-48 overflow-y-auto scrollbar-hide">
          {conversations.length === 0 ? (
             <p className="text-[11px] text-gray-400 italic py-2 text-center">No hay chats activos</p>
          ) : (
            conversations.map((chat) => (
              <div
                key={chat.id}
                className={`group flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeChatId === chat.id 
                    ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-800/30' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectChat(chat.id)}
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  <MessageSquare size={14} className={activeChatId === chat.id ? "text-blue-500" : "text-gray-400"} />
                  <span className="truncate">{chat.title}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteModal(chat);
                  }}
                  className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                  title="Eliminar conversación"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        <ConfirmModal
          isOpen={!!deleteTarget}
          title="¿Eliminar esta conversación?"
          description="Esta acción no se puede deshacer. Se eliminará el historial y las fuentes vinculadas a este chat."
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          onConfirm={handleDeleteChat}
          onCancel={closeDeleteModal}
          isLoading={isDeleting}
        />
      </div>
      
      {/* SECCIÓN: Lista de Fuentes (Documentos) */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Fuentes del Chat</h2>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-4 italic leading-relaxed">
          Los documentos seleccionados se usarán como contexto para el RAG.
        </p>
        <SourceList 
          sources={sources} 
          onUploadClick={onUpload} 
          isUploading={loading} 
          onPreview={onPreview}
          onDeleteSource={onDeleteSource} // Se pasa al hijo SourceList
          selectedSources={selectedSources}
          onToggleSource={onToggleSource}
        />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
            V2.0 • RAG System • ESPE
          </p>
        </div>
      </div>
    </aside>
  );
};