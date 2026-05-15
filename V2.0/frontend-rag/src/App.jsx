import React, { useState, useEffect } from 'react';
import { chatApi } from './services/api'; 

// Importación de componentes siguiendo Diseño Atómico
import { NotebookLayout } from './components/templates/NotebookLayout';
import { SourceSidebar } from './components/organisms/SourceSidebar';
import { ChatBubble } from './components/molecules/ChatBubble';
import { Loader } from './components/atoms/Loader';
import { UploadModal } from './components/molecules/UploadModal';
import { PreviewModal } from './components/molecules/PreviewModal';

// Iconos
import { Send } from 'lucide-react';

function App() {
  // --- ESTADOS ---
  const [activeChatId, setActiveChatId] = useState(null);
  const [sources, setSources] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState({ uploading: false, chatting: false, loadingChats: true });
  
  // UI States
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [selectedSources, setSelectedSources] = useState([]);

  // --- EFECTOS ---

  // 1. Manejar Modo Oscuro
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // 2. Inicializar aplicación: Cargar última conversación
  useEffect(() => {
    const initApp = async () => {
      try {
        const { data } = await chatApi.getConversations();
        if (data.length > 0) {
          // Seleccionamos el más reciente
          setActiveChatId(data[0].id);
        }
      } catch (err) {
        console.error("Error al inicializar chats:", err);
      } finally {
        setStatus(prev => ({ ...prev, loadingChats: false }));
      }
    };
    initApp();
  }, []);

  // 3. Sincronizar Contexto (Mensajes y Fuentes) al cambiar de Chat
// Ubicación: Dentro de App.jsx
// Ubicación: src/App.jsx
// Ubicación: src/App.jsx
useEffect(() => {
  const syncChatContext = async () => {
    if (!activeChatId) return;

    try {
      setStatus(prev => ({ ...prev, loadingChats: true }));
      
      // 1. Cargar mensajes
      const msgRes = await chatApi.getMessages(activeChatId);
      setMessages(msgRes.data.map(m => ({
        role: m.role,
        text: m.content
      })));

      // 2. Cargar fuentes (LIMPIEZA DE OBJETOS)
      const sourcesRes = await chatApi.getChatFiles(activeChatId);
      
      // IMPORTANTE: f.name extrae el texto para que React no explote
      const cleanFileNames = sourcesRes.data.map(f => (typeof f === 'object' ? f.name : f));
      
      setSources(cleanFileNames);
      setSelectedSources(cleanFileNames); 

    } catch (err) {
      console.error("Error sincronizando chat:", err);
    } finally {
      setStatus(prev => ({ ...prev, loadingChats: false }));
    }
  };

  syncChatContext();
}, [activeChatId]);
// Ubicación: Dentro de App.jsx
// Ubicación: src/App.jsx
// Ubicación: src/App.jsx
const handleUpload = async (e) => {
  const file = e.target?.files ? e.target.files[0] : e;
  if (!file) return;

  setStatus(s => ({ ...s, uploading: true }));
  try {
    let chatId = activeChatId;
    if (!chatId) {
      const newChat = await chatApi.createConversation(`Nueva Sesión`);
      chatId = newChat.data.id;
      setActiveChatId(chatId);
    }

    // Subida al backend
    await chatApi.uploadFile(chatId, file); 
    
    // IMPORTANTE: Guardamos el nombre como string, NO la respuesta del server
    const fileName = file.name;
    
    setSources(prev => [...new Set([...prev, fileName])]);
    setSelectedSources(prev => [...new Set([...prev, fileName])]);
    
  } catch (err) {
    console.error("Error en Upload:", err);
    alert("Error al subir el archivo.");
  } finally {
    setStatus(s => ({ ...s, uploading: false }));
  }
};

// --- MANEJADORES DE UI ---

  const handlePreview = (fileName) => {
    setPreviewFile(fileName);
    setPreviewOpen(true);
  };

  const toggleSource = (name) => {
    setSelectedSources(prev => 
      prev.includes(name) 
        ? prev.filter(s => s !== name) 
        : [...prev, name]
    );
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleDeleteSource = async (filename) => {
    if (!activeChatId) return;
    try {
      await chatApi.removeFile(activeChatId, filename);
      setSources(prev => prev.filter(s => s !== filename));
      setSelectedSources(prev => prev.filter(s => s !== filename));
    } catch (err) {
      console.error("Error al eliminar fuente:", err);
    }
  };
// src/App.jsx

useEffect(() => {
  const loadChatHistory = async () => {
    if (!activeChatId) {
      setMessages([]); // Limpiar si no hay chat seleccionado
      return;
    }

    try {
      setStatus(prev => ({ ...prev, loadingChats: true }));
      
      // 1. Llamada a tu API para obtener mensajes previos
      const response = await chatApi.getMessages(activeChatId);
      
      // 2. Mapear los datos del backend al formato que usa tu ChatBubble
      // Asumiendo que tu backend devuelve { role: 'user'/'assistant', content: '...' }
      const history = response.data.map(msg => ({
        role: msg.role,
        text: msg.content
      }));

      setMessages(history);

      // 3. (Opcional) Cargar qué documentos estaban marcados en este chat
      const sourcesRes = await chatApi.getConversationSources(activeChatId);
      setSelectedSources(sourcesRes.data.map(s => typeof s === 'object' ? s.name ?? String(s) : s));

    } catch (err) {
      console.error("Error cargando historial de la base de datos:", err);
    } finally {
      setStatus(prev => ({ ...prev, loadingChats: false }));
    }
  };

  loadChatHistory();
}, [activeChatId]); // Se ejecuta cada vez que cambias de chat


// En App.jsx
useEffect(() => {
  const loadChatContent = async () => {
    if (!activeChatId) return;
    
    try {
      // 1. Obtener mensajes previos
      const msgRes = await chatApi.getMessages(activeChatId);
      setMessages(msgRes.data.map(m => ({
        role: m.role,
        text: m.content
      })));

      // 2. Obtener archivos vinculados a este chat
      const sourcesRes = await chatApi.getConversationSources(activeChatId);
      const normalizedSources = sourcesRes.data.map(file => typeof file === 'object' ? file.name ?? String(file) : file);
      setSources(normalizedSources);
    } catch (err) {
      console.error("Error al cargar contenido de chat:", err);
    }
  };

  loadChatContent();
}, [activeChatId]); 

const handleChat = async () => {
    if (!input.trim() || status.chatting || !activeChatId) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput("");
    setStatus(s => ({ ...s, chatting: true }));

    try {
      const { data } = await chatApi.sendMessage(activeChatId, userMsg);
      
      // Si el título cambió en el backend (auto-título), podrías disparar 
      // una actualización aquí si tu Sidebar no lo hace solo.
      
      setMessages(prev => [...prev, { role: 'bot', text: data.respuesta }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: "Error al procesar la consulta." }]);
    } finally {
      setStatus(s => ({ ...s, chatting: false }));
    }
  };

// ... dentro de App.jsx ...

return (
  <>
    {/* Modales */}
    <UploadModal 
      isOpen={sources.length === 0 && !status.loadingChats && !activeChatId} 
      onUpload={handleUpload}
      isLoading={status.uploading}
    />

    <PreviewModal 
      isOpen={previewOpen} 
      onClose={() => setPreviewOpen(false)} 
      fileName={previewFile} 
    />

    <NotebookLayout
      sidebar={
        <SourceSidebar 
          sources={sources} 
          onUpload={handleUpload} 
          loading={status.uploading} 
          onPreview={handlePreview} 
          onDeleteSource={handleDeleteSource} // <--- SE MANTIENE CORRECTO
          onToggleDark={toggleDarkMode} 
          darkMode={darkMode} 
          selectedSources={selectedSources} 
          onToggleSource={toggleSource}
          activeChatId={activeChatId}
          onSelectChat={setActiveChatId}
        />
      }
      
      chat={
        <div className="flex flex-col h-full relative">
          <div className="flex-1 overflow-y-auto px-4 md:px-24 pt-12 pb-32 scrollbar-hide">
            <div className="max-w-3xl mx-auto">
              
              {messages.length === 0 && (
                <div className="text-center mt-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <h2 className="text-4xl font-light text-gray-300 dark:text-gray-600 mb-4 tracking-tight">
                    {activeChatId ? "¿Qué analizaremos hoy?" : "Sube un archivo para comenzar"}
                  </h2>
                  <p className="text-gray-400 dark:text-gray-500 font-medium italic">
                    {activeChatId 
                      ? (sources.length > 0 
                          ? (selectedSources.length > 0 ? "Listo para chatear." : "Selecciona documentos en la izquierda.") 
                          : "Esta sesión no tiene documentos aún.") 
                      : "Crea una nueva conversación para empezar."}
                  </p>
                </div>
              )}
              
              {messages.map((m, i) => (
                <ChatBubble key={i} role={m.role} text={m.text} />
              ))}
              
              {status.chatting && (
                <div className="flex justify-start ml-4 mb-10">
                  <Loader /> 
                </div>
              )}
            </div>
          </div>

          {/* Input de Chat Estilizado */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F9FBFD] via-[#F9FBFD] to-transparent dark:from-gray-900 dark:via-gray-900">
            <div className="max-w-3xl mx-auto relative flex items-center">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if(input.trim() && !status.chatting && selectedSources.length > 0) handleChat();
                  }
                }}
                placeholder={
                  !activeChatId 
                    ? "Selecciona un chat a la izquierda..." 
                    : (sources.length === 0 
                        ? "Sube un documento para preguntar..." 
                        : (selectedSources.length > 0 
                            ? `Preguntar sobre ${selectedSources.length} documento(s)...` 
                            : "Selecciona fuentes (check) para chatear..."))
                }
                disabled={!activeChatId || sources.length === 0 || status.chatting}
                className="w-full bg-white dark:bg-gray-800 border border-[#e3e3e3] dark:border-gray-600 shadow-2xl rounded-[28px] py-4 px-6 pr-16 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none min-h-[60px] max-h-[200px] text-gray-700 dark:text-gray-300 transition-all disabled:opacity-60 disabled:bg-gray-50 dark:disabled:bg-gray-800/50"
                rows="1"
              />
              <button 
                onClick={handleChat}
                disabled={!input.trim() || status.chatting || !activeChatId || selectedSources.length === 0}
                className="absolute right-3 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all active:scale-95 disabled:bg-gray-300 dark:disabled:bg-gray-700 shadow-lg"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-center text-[9px] text-gray-400 dark:text-gray-500 mt-4 uppercase tracking-[0.2em] font-bold">
              ESPE Software Engineering Assistant • RAG v2.0
            </p>
          </div>
        </div>
      }
    />
  </>
);
}

export default App;