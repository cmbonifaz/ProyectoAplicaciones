import axios from 'axios';

const api = axios.create({ baseURL: 'http://127.0.0.1:8000' });

export const ragApi = {
  upload: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/upload', fd);
  },
  chat: (pregunta, archivos = null) => api.post('/chat', { pregunta, archivos })
};