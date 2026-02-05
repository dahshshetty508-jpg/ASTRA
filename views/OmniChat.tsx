
import React, { useState, useRef, useEffect } from 'react';
import { chatWithModel } from '../services/geminiService.ts';
import { ChatMessage, AVAILABLE_MODELS } from '../types.ts';

const OmniChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState(AVAILABLE_MODELS[1].id); // GPT-5 as default for chat
  const [thinking, setThinking] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
      const response = await chatWithModel(model, input, [], thinking, undefined, isSearch);
      
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
        text: "System communication failure. Verify logic connection.",
        timestamp: Date.now(),
        model: 'SYSTEM'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Logic Thread</h2>
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Multi-model intelligence layer</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={model} 
            onChange={(e) => setModel(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl px-5 py-2.5 outline-none focus:border-blue-500 transition-all text-[11px] font-black uppercase tracking-widest"
          >
            {AVAILABLE_MODELS.map(m => (
              <option key={m.id} value={m.id} className="bg-black text-white">{m.name}</option>
            ))}
          </select>
          
          <label className="flex items-center gap-2 cursor-pointer bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl hover:bg-white/10 transition-all">
            <input 
              type="checkbox" 
              checked={thinking} 
              onChange={(e) => setThinking(e.target.checked)}
              className="accent-blue-500"
            />
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-500">Overclock</span>
          </label>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-8 mb-6 pr-4 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-20">
            <div className="text-8xl mb-4">🌌</div>
            <p className="font-black tracking-[0.4em] uppercase text-xs">Awaiting Command Signal</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div 
            key={i} 
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-500`}
          >
            <div className={`max-w-[85%] rounded-[32px] p-8 ${
              m.role === 'user' 
                ? 'bg-white text-black rounded-tr-none' 
                : 'glass text-gray-200 rounded-tl-none border-l-2 border-white/10'
            }`}>
              <div className={`text-[9px] uppercase tracking-[0.2em] font-black mb-4 flex items-center justify-between ${m.role === 'user' ? 'opacity-50' : 'text-blue-400'}`}>
                <span>{m.model}</span>
                {m.isThinking && <span>SYNCED</span>}
              </div>
              <div className="whitespace-pre-wrap leading-relaxed font-light tracking-wide text-lg">{m.text}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="glass p-6 rounded-[32px] rounded-tl-none flex items-center gap-4">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative mt-auto">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          placeholder={`Instruct ${AVAILABLE_MODELS.find(m => m.id === model)?.name}...`}
          className="w-full glass bg-white/5 p-6 pr-20 rounded-[32px] border border-white/10 outline-none focus:border-blue-500 transition-all resize-none h-24 placeholder:text-gray-700 leading-relaxed text-lg"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="absolute right-4 bottom-4 w-12 h-12 bg-white text-black hover:bg-gray-200 rounded-[20px] flex items-center justify-center transition-all disabled:opacity-50 shadow-2xl active:scale-90"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>
    </div>
  );
};

export default OmniChat;
