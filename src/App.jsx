import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Paperclip, Stethoscope, Pill, Dna, 
  Moon, Sun, Bot, User, Loader2, Image as ImageIcon, X 
} from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import logo from './assets/Medimitra Health AI Chatbot.png';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'bot',
      content: 'Hello! I am MediMitra, your AI Health Assistant. How can I help you today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const messagesEndRef = useRef(null); 

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedFile) || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      file: selectedFile ? { name: selectedFile.name, isImage: selectedFile.type.startsWith('image/') } : null,
      filePreview: filePreview
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    
    const apiHistory = messages.map(msg => ({
      role: msg.role === 'bot' ? 'assistant' : 'user',
      content: msg.content
    }));

    const formData = new FormData();
    formData.append('message', input);
    formData.append('history', JSON.stringify(apiHistory));
    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    try {
      const response = await axios.post(
  'https://sarvesh650-medimitra-ai.hf.space/chat',
  formData
);
      
      const botResponse = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: response.data.response,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botResponse]);
      removeFile();
    } catch (error) {
      console.error('Failed to send message', error);
      let errorMessage = 'Sorry, I am having trouble connecting to the server. Please try again later.';
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = `Server Error: ${error.response.data.error}`;
      }
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: errorMessage,
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 glass px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden shadow-sm">
            <img src={logo} alt="MediMitra Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
              MediMitra 
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">AI Health Assistant</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-custom bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto space-y-6 pb-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={cn(
                  "flex w-full",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "flex max-w-[85%] sm:max-w-[75%] gap-3",
                  msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}>
                  
                  {/* Avatar */}
                  <div className="flex-shrink-0 mt-1">
                    {msg.role === 'bot' ? (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 flex items-center justify-center ring-2 ring-white dark:ring-slate-800 shadow-sm">
                        <Bot size={20} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center ring-2 ring-white dark:ring-slate-800 shadow-sm">
                        <User size={20} />
                      </div>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={cn(
                    "flex flex-col gap-1",
                    msg.role === 'user' ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "px-5 py-3.5 rounded-2xl shadow-sm text-[15px] leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-tr-sm" 
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-100 dark:border-slate-700/50",
                      msg.isError && "border-red-300 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                    )}>
                      {/* Attached File Preview inside Message */}
                      {msg.file && (
                        <div className={cn(
                          "mb-3 rounded-xl overflow-hidden border",
                          msg.role === 'user' ? "border-brand-400/50 bg-brand-600/50" : "border-slate-200 dark:border-slate-700"
                        )}>
                          {msg.file.isImage && msg.filePreview ? (
                            <img src={msg.filePreview} alt="attachment" className="max-w-full h-auto max-h-48 object-cover" />
                          ) : (
                            <div className="flex items-center gap-2 p-3 text-sm font-medium">
                              <Paperclip size={16} />
                              <span className="truncate max-w-[200px]">{msg.file.name}</span>
                            </div>
                          )}
                        </div>
                      )}
                      {/* Message Content */}
                      {msg.role === 'bot' ? (
                        <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:bg-slate-800 dark:prose-pre:bg-slate-900 max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium px-1">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 w-full"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 flex items-center justify-center ring-2 ring-white dark:ring-slate-800 shadow-sm flex-shrink-0">
                <Bot size={20} />
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                <div className="flex space-x-1.5">
                  <motion.div className="w-2 h-2 rounded-full bg-brand-400" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                  <motion.div className="w-2 h-2 rounded-full bg-brand-400" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                  <motion.div className="w-2 h-2 rounded-full bg-brand-400" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400 ml-2 font-medium">AI is analyzing...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-10 relative">
        <div className="max-w-4xl mx-auto">
          
          {/* File Preview before sending */}
          <AnimatePresence>
            {selectedFile && (
              <motion.div 
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 10, height: 0 }}
                className="mb-4"
              >
                <div className="inline-flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-2 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 relative group shadow-sm">
                  {filePreview ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200">
                      <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                      <ImageIcon size={24} />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                      {selectedFile.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <button 
                    onClick={removeFile}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative flex items-end gap-2 bg-slate-100 dark:bg-slate-800/50 p-2 rounded-3xl border border-slate-200 dark:border-slate-700/50 focus-within:ring-2 focus-within:ring-brand-500/50 focus-within:border-brand-500/50 transition-all shadow-sm">
            
            <label className="flex-shrink-0 cursor-pointer p-3 text-slate-400 hover:text-brand-500 transition-colors rounded-full hover:bg-white dark:hover:bg-slate-700">
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx"
              />
              <Paperclip size={22} />
            </label>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask your health question..."
              className="w-full max-h-32 bg-transparent border-none focus:ring-0 resize-none py-3 px-2 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-[15px] scrollbar-custom"
              rows={1}
              style={{ minHeight: '48px' }}
            />

            <button
              onClick={handleSend}
              disabled={(!input.trim() && !selectedFile) || isLoading}
              className="flex-shrink-0 p-3 m-1 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-full transition-all disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
            </button>
          </div>
          <div className="text-center mt-3 text-xs text-slate-400 dark:text-slate-500 font-medium">
            MediMitra can make mistakes. Always consult a real doctor for medical advice.
          </div>
        </div>
      </footer>
    </div>
  );
}
