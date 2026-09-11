import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Trash2, Sparkles, Sprout, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { activeScanContext, t } = useAuth();

  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "Should I water my crop today?",
    "Why are my tomato leaves turning yellow?",
    "What fertilizer is suitable for my soil?",
    "How can I prevent fungal leaf spots?",
    "What is the best time to irrigate?"
  ];

  const fetchHistory = async () => {
    try {
      const res = await chatAPI.getHistory();
      if (res.data && res.data.length > 0) {
        setMessages(res.data);
      } else {
        setMessages([
          {
            id: 'welcome',
            role: 'model',
            message: t('chat_welcome') || "Namaste! I am **RASmalAI Assistant**, the intelligence core of the Rural Agriculture System using Machine Learning and AI. How can I assist your farm today?",
            timestamp: 'Just now'
          }
        ]);
      }
    } catch (err) {
      console.error("Chat history fetch error:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      message: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const scanId = activeScanContext?.scan_id || null;
      const res = await chatAPI.sendMessage(query, scanId);

      const aiMsg = {
        id: Date.now() + 1,
        role: 'model',
        message: res.data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        role: 'model',
        message: "I am having trouble connecting to AI services right now. Please check your network connection and try again.",
        timestamp: 'Just now'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    try {
      await chatAPI.clearHistory();
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          message: "Chat history cleared. How can I help with your crops or farm today?",
          timestamp: 'Just now'
        }
      ]);
    } catch (err) {
      console.error("Failed to clear chat:", err);
    }
  };

  // Helper to format raw markdown strings like ***Title:** into clean markdown
  const cleanMarkdownText = (text) => {
    if (!text) return '';
    return text
      .replace(/\*\*\*([^*]+)\*\*/g, '**• $1**')
      .replace(/\*\*\*/g, '**');
  };

  return (
    <div className="h-[calc(100vh-175px)] md:h-[620px] min-h-[440px] max-h-[85vh] flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden w-full transition-all">
      {/* Minimalist Clean Header */}
      <div className="px-4 sm:px-6 py-3.5 bg-white border-b border-slate-150 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-700 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                {t('chat_bot_name') || "RASmalAI Assistant"}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60 hidden sm:inline-block">
                {t('chat_bot_tag') || "AI Model Analysis + IoT Aware"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              {t('brand_tagline') || "Rural Agriculture System using ML & AI"}
            </p>
          </div>
        </div>

        <button
          onClick={handleClear}
          title={t('chat_clear') || "Clear Chat History"}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-colors shrink-0 cursor-pointer"
          aria-label="Clear chat history"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Context Injection Bar if plant diagnosis is active */}
      {activeScanContext && (
        <div className="bg-amber-50/70 border-b border-amber-200/80 px-4 py-2 text-xs font-semibold text-amber-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0 truncate">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">Active Leaf Diagnosis: <strong>{activeScanContext.final_diagnosis}</strong></span>
          </div>
          <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md shrink-0 ml-2 font-bold">
            Attached
          </span>
        </div>
      )}

      {/* Messages Window with Smooth Clean Markdown */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 sm:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser ? 'bg-slate-900 text-white' : 'bg-emerald-600 text-white shadow-sm'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 text-xs leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-tr-none font-medium'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                ) : (
                  <div className="prose prose-xs max-w-none text-slate-800 space-y-2">
                    <ReactMarkdown
                      components={{
                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed text-xs text-slate-800" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-extrabold text-slate-950" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1 mb-2 text-xs text-slate-700" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal pl-4 space-y-1 mb-2 text-xs text-slate-700" {...props} />,
                        li: ({ node, ...props }) => <li className="leading-snug" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-xs font-black text-slate-900 mt-2 mb-1" {...props} />,
                        h4: ({ node, ...props }) => <h4 className="text-xs font-bold text-emerald-900 mt-1.5 mb-1" {...props} />
                      }}
                    >
                      {cleanMarkdownText(msg.message)}
                    </ReactMarkdown>
                  </div>
                )}

                <span
                  className={`block text-[10px] mt-2 font-medium ${
                    isUser ? 'text-slate-400 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3 text-xs text-slate-500 flex items-center gap-2 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce delay-100" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce delay-200" />
              <span className="font-medium text-slate-600">{t('chat_thinking') || "Consulting AI Model & sensor data..."}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Chips - Clean Minimalist Horizontal Scroll */}
      <div className="px-4 py-2 border-t border-slate-150 bg-white flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Try:</span>
        {suggestedQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => sendMessage(q)}
            disabled={loading}
            className="text-[11px] font-medium bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 rounded-full px-3 py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Clean Minimalist Input Bar */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-150 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-2 bg-slate-50 border border-slate-200 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 rounded-2xl p-1.5 transition-all"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chat_placeholder') || "Ask farming, crop health, fertilizer or irrigation questions..."}
            disabled={loading}
            className="flex-1 bg-transparent px-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 disabled:opacity-40 text-white transition-colors shrink-0 cursor-pointer shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
