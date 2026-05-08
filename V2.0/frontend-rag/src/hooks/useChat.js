import { useState } from 'react';
import { ragApi } from '../services/api';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const { data } = await ragApi.chat(text);
      setMessages(prev => [...prev, { role: 'bot', text: data.respuesta }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Error de conexión con el servidor." }]);
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading };
};