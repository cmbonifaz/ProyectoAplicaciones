import React from 'react';
export const ChatBubble = ({ role, text }) => (
  <div className={`flex w-full mb-6 ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-[85%] rounded-[28px] px-6 py-3.5 text-[15px] leading-relaxed shadow-sm ${
      role === 'user' 
      ? 'bg-[#e3e3e3] dark:bg-gray-700 text-[#1f1f1f] dark:text-white' 
      : 'bg-white dark:bg-gray-800 border border-[#f0f0f0] dark:border-gray-600 text-[#1f1f1f] dark:text-gray-200'
    }`}>
      {text}
    </div>
  </div>
);