import React from 'react'; // <--- AGREGAR ESTO

export const NotebookLayout = ({ sidebar, chat }) => (
  <div className="flex h-screen w-full overflow-hidden bg-[#F9FBFD] dark:bg-gray-900">
    {sidebar}
    <main className="flex-1 flex flex-col relative h-full">
      {chat}
    </main>
  </div>
);