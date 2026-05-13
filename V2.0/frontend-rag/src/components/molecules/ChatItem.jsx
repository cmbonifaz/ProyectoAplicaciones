import React from 'react';

const ChatItem = ({ title, isActive, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
        >
            <p className="text-sm font-medium truncate">{title}</p>
        </div>
    );
};

export default ChatItem;