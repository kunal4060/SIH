import React from 'react';
import ChatWindow from '../components/ChatWindow';

const Chatbot = () => {
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto content-padding space-y-3 sm:space-y-4 w-full">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">Farmer AI Assistant</h1>
        <p className="text-xs text-slate-500 mt-1">
          Ask farming, crop health, irrigation, or fertilizer questions. Injected with real-time farm sensor & scan context.
        </p>
      </div>

      <ChatWindow />
    </div>
  );
};

export default Chatbot;
