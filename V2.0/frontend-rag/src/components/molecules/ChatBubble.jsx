import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const ChatBubble = ({ role, text }) => {
  const isUser = role === 'user';

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`max-w-[85%] rounded-[24px] px-6 py-4 text-[15px] leading-relaxed shadow-sm transition-colors ${
        isUser 
        ? 'bg-blue-600 text-white rounded-tr-none' 
        : 'bg-white dark:bg-gray-800 border border-[#f0f0f0] dark:border-gray-700 text-[#1f1f1f] dark:text-gray-200 rounded-tl-none'
      }`}>
        
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Estilo para bloques de código
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <div className="rounded-lg overflow-hidden my-4 border border-gray-700">
                    <div className="bg-gray-700 text-gray-300 px-4 py-1 text-xs font-mono flex justify-between uppercase">
                        {match[1]}
                    </div>
                    <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{ margin: 0, padding: '1rem', fontSize: '13px' }}
                        {...props}
                    >
                        {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                </div>
              ) : (
                <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200 dark:border-gray-600" {...props}>
                  {children}
                </code>
              );
            },
            // Estilo para listas
            ul: ({ children }) => <ul className="list-disc ml-4 mb-3 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal ml-4 mb-3 space-y-1">{children}</ol>,
            // Estilo para párrafos
            p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
            // Estilo para negritas
            strong: ({ children }) => <strong className="font-bold text-inherit border-b border-current/20">{children}</strong>,
            // Estilo para tablas
            table: ({children}) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">{children}</table>
              </div>
            ),
            th: ({children}) => <th className="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b text-left text-sm font-semibold">{children}</th>,
            td: ({children}) => <td className="px-4 py-2 border-b dark:border-gray-700 text-sm">{children}</td>
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    </div>
  );
};