import React from 'react';
import { Send, Loader2 } from 'lucide-react';

export const ChatInput = ({ value, onChange, onSend, loading }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="relative flex items-center max-w-3xl mx-auto w-full group">
      <textarea
        rows="1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Haz una pregunta sobre tus fuentes..."
        className="w-full bg-white border border-gray-200 shadow-2xl rounded-[32px] py-4 px-6 pr-14 focus:outline-none focus:border-blue-400 resize-none min-h-[60px] text-[15px]"
      />
      <button
        onClick={onSend}
        disabled={loading || !value.trim()}
        className="absolute right-3 p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-200 transition-all active:scale-90"
      >
        {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
      </button>
    </div>
  );
};