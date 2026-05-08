import React, { useState, useRef, useEffect } from 'react';
import { ragApi } from './services/api';

// Importación de componentes siguiendo Diseño Atómico
import { NotebookLayout } from './components/templates/NotebookLayout';
import { SourceSidebar } from './components/organisms/SourceSidebar';
import { SourceList } from './components/organisms/SourceList'; // <--- IMPORTACIÓN FALTANTE
import { ChatBubble } from './components/molecules/ChatBubble';
import { Loader } from './components/atoms/Loader';
import { UploadModal } from './components/molecules/UploadModal';
import { PreviewModal } from './components/molecules/PreviewModal';

// Iconos
import { Send } from 'lucide-react';

function App() {
  const [sources, setSources] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState({ uploading: false, chatting: false });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [selectedSources, setSelectedSources] = useState([]);
  const fileInputRef = useRef(null);

  // Efecto para manejar el modo oscuro
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Manejador para alternar modo oscuro
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Manejador para seleccionar/deseleccionar fuentes
  const toggleSource = (name) => {
    setSelectedSources(prev => 
      prev.includes(name) 
        ? prev.filter(s => s !== name) 
        : [...prev, name]
    );
  };

  // Manejador para previsualizar archivos PDF
  const handlePreview = (name) => {
    setPreviewFile(name);
    setPreviewOpen(true);
  };

  // Manejador para subir archivos PDF
const handleUpload = async (e) => {
  const file = e.target?.files ? e.target.files[0] : e;
  if (!file) return;

  setStatus(s => ({ ...s, uploading: true }));
  try {
    const response = await ragApi.upload(file);
    console.log("Respuesta del servidor al subir:", response);

    // ESTA LÍNEA ES LA QUE LLENA LA LISTA
    setSources(prev => [...prev, file.name]); 
    
  } catch (err) {
    console.error("Error en la subida:", err);
  } finally {
    setStatus(s => ({ ...s, uploading: false }));
  }
};
  // Manejador para enviar mensajes al chat
  const handleChat = async () => {
    if (!input.trim() || status.chatting) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput("");
    setStatus(s => ({ ...s, chatting: true }));

    try {
      const { data } = await ragApi.chat(userMsg, selectedSources.length > 0 ? selectedSources : null);
      setMessages(prev => [...prev, { role: 'bot', text: data.respuesta }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: "Hubo un error al procesar tu pregunta." }]);
    } finally {
      setStatus(s => ({ ...s, chatting: false }));
    }
  };

  return (
    <>
      {/* Modal que bloquea la app hasta que sources.length > 0 */}
      <UploadModal 
        isOpen={sources.length === 0} 
        onUpload={handleUpload}
        isLoading={status.uploading}
      />

      {/* Modal para previsualización de PDFs */}
      <PreviewModal 
        isOpen={previewOpen} 
        onClose={() => setPreviewOpen(false)} 
        fileName={previewFile} 
      />

      <NotebookLayout
        sidebar={
          <SourceSidebar sources={sources} onUpload={handleUpload} loading={status.uploading} onPreview={handlePreview} onToggleDark={toggleDarkMode} darkMode={darkMode} selectedSources={selectedSources} onToggleSource={toggleSource} />
        }
        
        chat={
          <div className="flex flex-col h-full relative">
            <div className="flex-1 overflow-y-auto px-4 md:px-24 pt-12 pb-32 scrollbar-hide">
              <div className="max-w-3xl mx-auto">
                {messages.length === 0 && sources.length > 0 && (
                  <div className="text-center mt-20 animate-in fade-in duration-700">
                    <h2 className="text-4xl font-light text-gray-300 dark:text-gray-600 mb-4 tracking-tight">
                      ¿Cómo puedo ayudarte hoy?
                    </h2>
                    <p className="text-gray-400 dark:text-gray-500 font-medium italic">
                      Tus archivos están listos para ser analizados.
                    </p>
                  </div>
                )}
                
                {messages.map((m, i) => (
                  <ChatBubble key={i} role={m.role} text={m.text} />
                ))}
                
                {status.chatting && (
                  <div className="flex justify-start ml-4">
                    <Loader />
                  </div>
                )}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F9FBFD] via-[#F9FBFD] to-transparent dark:from-gray-900 dark:via-gray-900">
              <div className="max-w-3xl mx-auto relative flex items-center">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleChat();
                    }
                  }}
                  placeholder={sources.length > 0 ? (selectedSources.length > 0 ? `Haz una pregunta sobre ${selectedSources.length} documento(s) seleccionado(s)...` : "Selecciona documentos y haz una pregunta...") : "Sube un archivo primero..."}
                  disabled={sources.length === 0}
                  className="w-full bg-white dark:bg-gray-800 border border-[#e3e3e3] dark:border-gray-600 shadow-2xl rounded-[32px] py-4 px-6 pr-14 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 resize-none min-h-[60px] max-h-[200px] text-gray-700 dark:text-gray-300 transition-all disabled:bg-gray-50 dark:disabled:bg-gray-700"
                  rows="1"
                />
                <button 
                  onClick={handleChat}
                  disabled={!input.trim() || status.chatting || sources.length === 0 || selectedSources.length === 0}
                  className="absolute right-3 p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all active:scale-90 disabled:bg-gray-300 dark:disabled:bg-gray-600 shadow-lg"
                >
                  <Send size={20} />
                </button>
              </div>
              <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-4 uppercase tracking-widest font-bold">
                Software Engineering Assistant - V2.0
              </p>
            </div>
          </div>
        }
      />
    </>
  );
}

export default App;