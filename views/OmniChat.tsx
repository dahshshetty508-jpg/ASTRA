
import React, { useState, useRef, useEffect } from 'react';
import { chatWithModel } from '../services/geminiService';
import { ChatMessage } from '../types';
import { AVAILABLE_MODELS } from '../App';

const OmniChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState(AVAILABLE_MODELS[0].id);
  const [thinking, setThinking] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getSystemInstruction = (modelId: string) => {
    if (modelId === 'astra-gpt-4o') {
      return "You are Astra AI, emulating ChatGPT-4o. Be conversational, direct, and versatile.";
    }
    if (modelId === 'astra-claude-3-5') {
      return "You are Astra AI, emulating Claude 3.5 Sonnet. Be thoughtful, honest, and nuanced.";
    }
    if (modelId === 'astra-perplexity') {
      return "You are Astra AI in Perplexity mode. Prioritize search results and provide evidence-based summaries.";
    }
    return undefined;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg: ChatMessage = {
      role: 'user',
      text: input,
      timestamp: Date.now(),
      model: 'You'
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const isSearch = model === 'astra-perplexity';
      const instruction = getSystemInstruction(model);
      const response = await chatWithModel(model, input, [], thinking, instruction, isSearch);
      
      setMessages(prev => [...prev, {
        role: 'model',
        text: response.text,
        timestamp: Date.now(),
        model: AVAILABLE_MODELS.find(m => m.id === model)?.name || model,
        isThinking: thinking
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'model',
        text: "System Error: Failed to communicate with logic core.",
        timestamp: Date.now(),
        model: 'SYSTEM'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold">Logic Multiverse</h2>
          <p className="text-gray-500">Switch between standard and emulated intelligence layers.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={model} 
            onChange={(e) => setModel(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-blue-500 transition-colors text-sm font-bold"
          >
            {AVAILABLE_MODELS.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          
          <label className="flex items-center gap-2 cursor-pointer bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:bg-white/10 transition-colors">
            <input 
              type="checkbox" 
              checked={thinking} 
              onChange={(e) => setThinking(e.target.checked)}
              className="accent-blue-600"
            />
            <span className="text-sm font-bold">Deep Thinking</span>
          </label>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 mb-6 pr-4"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
            <div className="text-6xl opacity-10 animate-pulse">🌌</div>
            <p className="font-bold tracking-widest uppercase text-xs opacity-30">Awaiting Signal</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div 
            key={i} 
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`max-w-[85%] rounded-[24px] p-6 ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'glass text-gray-200 rounded-tl-none border-l-4 border-white/10'
            }`}>
              <div className="text-[9px] uppercase tracking-[0.2em] font-black opacity-40 mb-3 flex items-center justify-between">
                <span>{m.model}</span>
                {m.isThinking && <span className="text-blue-400">LOGIC SYNCED</span>}
              </div>
              <div className="whitespace-pre-wrap leading-relaxed font-light tracking-wide">{m.text}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="glass p-5 rounded-3xl rounded-tl-none flex items-center gap-4">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              </div>
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Astra Syncing...</span>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          placeholder={`Talk to ${AVAILABLE_MODELS.find(m => m.id === model)?.name}...`}
          className="w-full glass bg-white/5 p-6 pr-16 rounded-[28px] border border-white/10 outline-none focus:border-blue-500 transition-all resize-none h-20 placeholder:text-gray-700"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="absolute right-4 bottom-4 w-12 h-12 bg-white text-black hover:bg-gray-200 rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 shadow-2xl active:scale-90"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>
    </div>
  );
};

export default OmniChat;
