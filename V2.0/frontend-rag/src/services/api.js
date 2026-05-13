import axios from 'axios';

const API_BASE_URL = "http://127.0.0.1:8000";

export const chatApi = {
    // Listar todas las conversaciones
    getConversations: () => axios.get(`${API_BASE_URL}/conversations`),

    // Crear un nuevo chat
    createConversation: (title) => axios.post(`${API_BASE_URL}/conversations?title=${title}`),

    // --- NUEVA FUNCIÓN: Obtener el historial de mensajes de un chat ---
    getMessages: (chatId) => axios.get(`${API_BASE_URL}/conversations/${chatId}/messages`),

    // Enviar mensaje incluyendo el chat_id para el filtrado RAG
    sendMessage: (chatId, text) => axios.post(`${API_BASE_URL}/chat`, {
        pregunta: text,
        chat_id: chatId
    }),

    // Obtener las fuentes exclusivas del chat activo
    getChatFiles: (chatId) => axios.get(`${API_BASE_URL}/conversations/${chatId}/files`),

    deleteConversation: (chatId) => axios.delete(`${API_BASE_URL}/conversations/${chatId}`),

    // --- NUEVA FUNCIÓN: Alias para getChatFiles (para evitar errores de nombre en App.jsx) ---
    getConversationSources: (chatId) => axios.get(`${API_BASE_URL}/conversations/${chatId}/files`),

    // Desvincular un archivo de un chat específico
    removeFile: (chatId, filename) => 
        axios.post(`${API_BASE_URL}/conversations/${chatId}/remove-file/${filename}`),

    // --- NUEVA FUNCIÓN: Alias para removeFile (por si App usa deleteSource) ---
    deleteSource: (chatId, filename) => 
        axios.post(`${API_BASE_URL}/conversations/${chatId}/remove-file/${filename}`),

    // Subir archivo vinculado al chat
    uploadFile: async (chatId, file) => {
        if (!(file instanceof File)) {
            console.error("El objeto proporcionado no es un archivo válido:", file);
            throw new Error("Objeto de archivo no válido");
        }

        const formData = new FormData();
        formData.append('file', file); 

        return axios.post(`${API_BASE_URL}/upload/${chatId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
};

export const ragApi = chatApi;