import React from 'react';

/**
 * NotebookLayout Template
 * Define la estructura de dos columnas: Sidebar fijo y Main flexible.
 * @param {ReactNode} sidebar - El componente SourceSidebar con la gestión de archivos y chats.
 * @param {ReactNode} chat - El componente de conversación principal.
 */
export const NotebookLayout = ({ sidebar, chat }) => (
  <div className="flex h-screen w-full overflow-hidden bg-[#F9FBFD] dark:bg-gray-950 transition-colors duration-300">
    
    {/* Contenedor del Sidebar: Mantiene el ancho fijo definido en SourceSidebar */}
    <div className="flex-shrink-0">
      {sidebar}
    </div>

    {/* Área Principal: Ocupa el resto del espacio y contiene el Chat */}
    <main className="flex-1 flex flex-col relative h-full min-w-0 bg-white dark:bg-gray-900 shadow-2xl">
      {/* El chat se expandirá para llenar este contenedor */}
      {chat}
    </main>

  </div>
);