import React from 'react';
import { ChatBubble } from '../molecules/ChatBubble';
import { Send, Loader2 } from 'lucide-react';

export const ChatWindow = ({ messages, input, setInput, onSend, isChatting }) => (
  <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
    <div className="flex-1 overflow-y-auto px-6 py-4">
      {messages.map((m, i) => <ChatBubble key={i} {...m} />)}
      {isChatting && <Loader2 className="animate-spin text-blue-500 mx-auto" />}
    </div>
    
    <div className="p-6">
      <div className="relative shadow-2xl rounded-3xl border border-gray-100 bg-white">
        <textarea 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-5 pr-14 rounded-3xl focus:outline-none resize-none text-gray-700"
          placeholder="Haz una pregunta técnica..."
          rows="2"
        />
        <button onClick={onSend} className="absolute right-4 bottom-4 p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
          <Send size={20} />
        </button>
      </div>
    </div>
  </div>
);