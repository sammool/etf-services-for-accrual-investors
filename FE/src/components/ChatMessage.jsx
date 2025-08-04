import React from 'react';
import { formatChatTime } from '../utils/timezone';

const ChatMessage = ({ message, isStreaming = false }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex items-start gap-4 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in-0 slide-in-from-bottom-2 duration-300`}>
      {!isUser && (
        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/25">
          AI
        </div>
      )}
      
      <div className={`max-w-[75%] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-lg backdrop-blur-sm ${
            isUser
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border border-blue-500/30'
              : 'bg-gradient-to-r from-gray-800/80 to-gray-700/80 text-gray-100 border border-gray-600/30'
          }`}
        >
          <div className="whitespace-pre-wrap">
            {message.content}
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse">
                |
              </span>
            )}
          </div>
        </div>
        
        <div className={`text-xs text-gray-500 mt-2 flex items-center gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="opacity-70">
            {formatChatTime(message.timestamp)}
          </span>
          {!isUser && (
            <span className="text-blue-400">💬 AI 상담사</span>
          )}
        </div>
      </div>
      
      {isUser && (
        <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-lg">
          나
        </div>
      )}
    </div>
  );
};

export default ChatMessage; 