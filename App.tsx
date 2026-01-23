
import React, { useState, useEffect, useRef } from 'react';
import { AppView, AI_MODE, ImpersioResponse } from './types';
import Sidebar from './components/Sidebar';
import DashboardView from './views/Dashboard';
import OmniChat from './views/OmniChat';
import VisualStudio from './views/VisualStudio';
import DirectorSuite from './views/DirectorSuite';
import LiveCore from './views/LiveCore';
import GroundingLab from './views/GroundingLab';
import AnalysisHub from './views/AnalysisHub';
import { 
  chatWithModel, 
  groundSearch, 
  generateVideoVeo, 
  analyzeMedia 
} from './services/geminiService';

export const AVAILABLE_MODELS = [
  { id: 'gemini-3-pro-preview', name: 'Astra Pro', desc: 'Gemini 3.0 Standard', brand: 'ASTRA', icon: '✦' },
  { id: 'astra-gpt-4o', name: 'GPT-4o Mode', desc: 'ChatGPT Emulation', brand: 'OPENAI', icon: '🟢' },
  { id: 'astra-claude-3-5', name: 'Claude 3.5', desc: 'Sonnet Emulation', brand: 'ANTHROPIC', icon: '🟠' },
  { id: 'astra-kimi-k2', name: 'Kimi K2', desc: 'Long Context Engine', brand: 'MOONSHOT', icon: '🌙' },
  { id: 'astra-qwen-2', name: 'Qwen 2.5', desc: 'Coding & Logic King', brand: 'ALIBABA', icon: '🐉' },
  { id: 'astra-llama-3', name: 'Llama 3.1', desc: 'Meta Open Intelligence', brand: 'META', icon: '🦙' },
  { id: 'astra-gpt-oss', name: 'GPT OSS 120B', desc: 'Large Open Model', brand: 'OPENSOURCE', icon: '🌐' },
  { id: 'astra-mimo-v2', name: 'Mimo V2', desc: 'Ultra-Fast Reasoning', brand: 'MIMO', icon: '⚡' },
  { id: 'astra-perplexity', name: 'Perplexity', desc: 'Search-First Mode', brand: 'PPLX', icon: '🔍' },
  { id: 'gemini-3-flash-preview', name: 'Astra Flash', desc: 'Fast & balanced', brand: 'ASTRA', icon: '⚏' }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiKeyReady, setApiKeyReady] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; avatar: string } | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showCapabilities, setShowCapabilities] = useState(false);
  
  // Dashboard Specific State
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<AI_MODE>(AI_MODE.GENERAL);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ImpersioResponse | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ data: string; type: string } | null>(null);
  const [groundingEnabled, setGroundingEnabled] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [showModelPicker, setShowModelPicker] = useState(false);

  const modelPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (typeof window.aistudio !== 'undefined') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setApiKeyReady(hasKey);
      }
    };
    checkKey();

    const handleClickOutside = (event: MouseEvent) => {
      if (modelPickerRef.current && !modelPickerRef.current.contains(event.target as Node)) {
        setShowModelPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignIn = () => {
    setIsSigningIn(true);
    setTimeout(() => {
      setUser({
        name: 'Astra Explorer',
        email: 'explorer@astra.ai',
        avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=Astra'
      });
      setIsSigningIn(false);
    }, 1200);
  };

  const handleOpenKey = async () => {
    if (typeof window.aistudio !== 'undefined') {
      await window.aistudio.openSelectKey();
      setApiKeyReady(true);
    }
  };

  const getSystemInstruction = (modelId: string) => {
    const common = " You were unified into the Astra ecosystem by DAKSH.";
    switch(modelId) {
      case 'astra-gpt-4o': return "You are Astra AI, emulating GPT-4o. Be direct, conversational, and creative." + common;
      case 'astra-claude-3-5': return "You are Astra AI, emulating Claude 3.5 Sonnet. Be helpful, honest, and highly detailed." + common;
      case 'astra-kimi-k2': return "You are Astra AI, emulating Kimi K2. Focus on massive context windows and precise technical retrieval." + common;
      case 'astra-qwen-2': return "You are Astra AI, emulating Qwen 2.5. Excel at mathematics, coding, and multi-lingual reasoning." + common;
      case 'astra-llama-3': return "You are Astra AI, emulating Meta's Llama 3.1. Be open, efficient, and versatile." + common;
      case 'astra-gpt-oss': return "You are Astra AI, emulating a 120B parameter Open Source model. Focus on raw computational logic and transparency." + common;
      case 'astra-mimo-v2': return "You are Astra AI, emulating Mimo V2. Focus on lightning-fast creative responses." + common;
      case 'astra-perplexity': return "You are Astra AI in Perplexity mode. Prioritize search grounding and list multiple sources clearly." + common;
      default: return "You are Astra AI, a high-density intelligence layer created by DAKSH.";
    }
  };

  const handleDashboardAction = async () => {
    if (!input.trim() && !attachedFile) return;
    setLoading(true);
    setResponse(null);

    try {
      let res: ImpersioResponse = { text: '' };
      const systemInstruction = getSystemInstruction(selectedModel);
      const forceSearch = selectedModel === 'astra-perplexity' || groundingEnabled;

      switch (mode) {
        case AI_MODE.RESEARCH:
          const research = await chatWithModel('gemini-3-pro-preview', input, [], true, "Mode: Deep Research. Break down the query into components and solve step-by-step. Developed by DAKSH.", true);
          res = { text: research.text, thinking: true };
          break;
        case AI_MODE.VIDEOS:
          if (!apiKeyReady) await handleOpenKey();
          const videoUrl = await generateVideoVeo(input, '16:9', attachedFile?.data);
          res = { text: "Generated Cinematic Sequence", mediaUrl: videoUrl, mediaType: 'video' };
          break;
        case AI_MODE.X_SEARCH:
          const xRes = await groundSearch(`Find the latest discussions and trending tweets on X (Twitter) about: ${input}`);
          res = { text: xRes.text, urls: xRes.urls };
          break;
        case AI_MODE.REDDIT:
          const redditRes = await groundSearch(`Search Reddit for the top community threads and consensus on: ${input}`);
          res = { text: redditRes.text, urls: redditRes.urls };
          break;
        case AI_MODE.STOCKS:
          const stockRes = await groundSearch(`Fetch current stock price, market chart analysis, and recent financial news for: ${input}`);
          res = { text: stockRes.text, urls: stockRes.urls };
          break;
        case AI_MODE.FACT_CHECK:
          const factRes = await groundSearch(`Verify the accuracy of this statement and provide reputable sources: ${input}`);
          res = { text: factRes.text, urls: factRes.urls };
          break;
        default:
          if (attachedFile) {
            const analysis = await analyzeMedia(attachedFile.data, attachedFile.type, input || "Describe this media.");
            res = { text: analysis };
          } else if (forceSearch) {
            const grounded = await groundSearch(input);
            res = { text: grounded.text, urls: grounded.urls };
          } else {
            const simple = await chatWithModel(selectedModel, input, [], false, systemInstruction);
            res = { text: simple.text };
          }
      }
      setResponse(res);
    } catch (err) {
      console.error(err);
      setResponse({ text: "Logic Core Error: " + (err as Error).message });
    } finally {
      setLoading(false);
      setAttachedFile(null);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.CHATS: return <OmniChat />;
      case AppView.IMAGERY: return <VisualStudio />;
      case AppView.DIRECTOR: return <DirectorSuite apiKeyReady={apiKeyReady} onOpenKey={handleOpenKey} />;
      case AppView.LIVE: return <LiveCore />;
      case AppView.GROUNDING: return <GroundingLab />;
      case AppView.ANALYSIS: return <AnalysisHub />;
      default: return (
        <div className={`flex-1 flex flex-col items-center justify-center w-full max-w-3xl mx-auto transition-all duration-700 ${response ? 'mt-10' : ''}`}>
          {!response && (
            <div className="mb-12 flex flex-col items-center gap-2 select-none fade-in">
              <div className="flex items-center gap-4">
                <svg width="64" height="64" viewBox="0 0 40 40" className="opacity-90">
                  <path d="M20 4C11.1634 4 4 11.1634 4 20C4 28.8366 11.1634 36 20 36C28.8366 36 36 28.8366 36 20C36 11.1634 28.8366 4 20 4ZM20 6C27.732 6 34 12.268 34 20C34 27.732 27.732 34 20 34C12.268 34 6 27.732 6 20C6 12.268 12.268 6 20 6ZM20 10C14.4772 10 10 14.4772 10 20C10 25.5228 14.4772 30 20 30C25.5228 30 30 25.5228 30 20C30 14.4772 25.5228 10 20 10ZM20 12C24.4183 12 28 15.5817 28 20C28 24.4183 24.4183 28 20 28C15.5817 28 12 24.4183 12 20C12 15.5817 15.5817 12 20 12Z" fill="white"/>
                </svg>
                <h1 className="text-6xl font-medium tracking-tight">Astra</h1>
              </div>
              <p className="text-gray-500 text-xs tracking-[0.2em] uppercase font-bold mt-2">Created by DAKSH</p>
            </div>
          )}

          <div className="w-full impersio-input-bg rounded-[32px] p-2 flex flex-col shadow-2xl relative border border-white/5">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleDashboardAction())}
              placeholder="Ask anything..."
              className="w-full bg-transparent p-6 text-xl outline-none resize-none min-h-[120px] placeholder:text-gray-600 leading-relaxed"
            />
            
            <div className="flex items-center justify-between px-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="relative" ref={modelPickerRef}>
                  <button 
                    onClick={() => setShowModelPicker(!showModelPicker)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-[11px] font-bold text-gray-400 transition-all border border-white/5"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${selectedModel.includes('gpt') ? 'bg-green-500' : selectedModel.includes('claude') ? 'bg-orange-500' : selectedModel.includes('perplexity') ? 'bg-blue-300' : 'bg-blue-500'}`}></span>
                    {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"></path></svg>
                  </button>
                  
                  {showModelPicker && (
                    <div className="absolute bottom-full left-0 mb-3 w-64 bg-[#0d0d0f] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 overflow-hidden">
                      <p className="px-3 py-2 text-[10px] uppercase font-bold text-gray-500 tracking-widest bg-white/5">Logic Hub</p>
                      <div className="max-h-80 overflow-y-auto">
                        {AVAILABLE_MODELS.map(m => (
                          <button
                            key={m.id}
                            onClick={() => { setSelectedModel(m.id); setShowModelPicker(false); }}
                            className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex flex-col gap-0.5 ${selectedModel === m.id ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold">{m.name}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 text-gray-600 font-black">{m.brand}</span>
                            </div>
                            <span className="text-[10px] opacity-60">{m.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setGroundingEnabled(!groundingEnabled)}
                  className={`p-2 rounded-full hover:bg-white/5 transition-colors ${groundingEnabled ? 'text-blue-400' : 'text-gray-500'}`}
                  title="Search Grounding"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <button className="p-2 text-gray-500 hover:bg-white/5 rounded-full transition-colors" title="Attach media">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                  </button>
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const reader = new FileReader();
                        reader.onload = (ev) => setAttachedFile({ data: ev.target?.result as string, type: f.type });
                        reader.readAsDataURL(f);
                      }
                    }}
                  />
                </div>
                <button 
                  onClick={() => setCurrentView(AppView.LIVE)}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-[#eec6a1] text-black hover:bg-[#d8b593] transition-all active:scale-95 shadow-lg"
                  title="Live Audio"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                </button>
              </div>
            </div>
          </div>

          {!response && (
            <div className="flex flex-wrap justify-center gap-5 mt-14 fade-in">
              <button onClick={() => { setMode(AI_MODE.X_SEARCH); setGroundingEnabled(true); }} className={`chip px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 border border-white/5 ${mode === AI_MODE.X_SEARCH ? 'active bg-white/10 text-white' : 'text-gray-500'}`}>
                <span className="text-sm">𝕏</span> X Search
              </button>
              <button onClick={() => { setMode(AI_MODE.REDDIT); setGroundingEnabled(true); }} className={`chip px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 border border-white/5 ${mode === AI_MODE.REDDIT ? 'active bg-white/10 text-white' : 'text-gray-500'}`}>
                <span className="text-sm">🔴</span> Reddit
              </button>
              <button onClick={() => { setMode(AI_MODE.STOCKS); setGroundingEnabled(true); }} className={`chip px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 border border-white/5 ${mode === AI_MODE.STOCKS ? 'active bg-white/10 text-white' : 'text-gray-500'}`}>
                <span className="text-sm">📈</span> Stocks
              </button>
              <button onClick={() => { setMode(AI_MODE.RESEARCH); setGroundingEnabled(true); }} className={`chip px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 border border-white/5 ${mode === AI_MODE.RESEARCH ? 'active bg-white/10 text-white' : 'text-gray-500'}`}>
                <span className="text-sm">📄</span> Deep Res
              </button>
              <button onClick={() => setMode(AI_MODE.VIDEOS)} className={`chip px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 border border-white/5 ${mode === AI_MODE.VIDEOS ? 'active bg-white/10 text-white' : 'text-gray-500'}`}>
                <span className="text-sm">🎬</span> Videos
              </button>
              <button onClick={() => { setMode(AI_MODE.FACT_CHECK); setGroundingEnabled(true); }} className={`chip px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 border border-white/5 ${mode === AI_MODE.FACT_CHECK ? 'active bg-white/10 text-white' : 'text-gray-500'}`}>
                <span className="text-sm">✅</span> Verify
              </button>
            </div>
          )}

          {loading && (
            <div className="mt-16 flex flex-col items-center gap-5 fade-in">
              <div className="w-10 h-10 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
              <p className="text-xs text-gray-500 font-bold tracking-[0.3em] uppercase animate-pulse">Astra Processing</p>
            </div>
          )}

          {response && !loading && (
            <div className="mt-16 w-full space-y-10 fade-in pb-24">
              <div className="flex justify-between items-center border-b border-white/5 pb-5">
                <div className="flex items-center gap-3">
                  <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Synthesis</h2>
                  <span className="text-[10px] bg-white/5 text-gray-500 px-2 py-0.5 rounded-md border border-white/5 font-bold uppercase">{AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name}</span>
                </div>
                <button onClick={() => {setResponse(null); setInput(''); setMode(AI_MODE.GENERAL); }} className="text-[11px] font-bold text-gray-500 hover:text-white flex items-center gap-2 transition-colors uppercase tracking-wider">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                  New Stream
                </button>
              </div>

              {response.mediaUrl && (
                <div className="rounded-[40px] overflow-hidden glass border border-white/5 shadow-2xl animate-in zoom-in-95 duration-500">
                  {response.mediaType === 'video' ? (
                    <video src={response.mediaUrl} controls autoPlay className="w-full" />
                  ) : (
                    <img src={response.mediaUrl} className="w-full object-cover max-h-[600px]" />
                  )}
                </div>
              )}

              <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed text-lg whitespace-pre-wrap font-light tracking-wide">
                {response.thinking && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/5 border border-blue-500/20 rounded-full text-[10px] font-bold text-blue-400 mb-6 animate-in slide-in-from-left-4">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                    EXTENDED LOGIC ACTIVE
                  </div>
                )}
                {response.text}
              </div>

              {response.urls && response.urls.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 border-t border-white/5">
                  {response.urls.map((u, i) => (
                    <a key={i} href={u.uri} target="_blank" className="p-5 rounded-[24px] glass hover:bg-white/5 transition-all flex justify-between items-center group border border-white/5">
                      <div className="flex flex-col gap-1 overflow-hidden">
                        <span className="truncate text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{u.title || u.uri}</span>
                        <span className="text-[10px] text-gray-600 truncate">{u.uri}</span>
                      </div>
                      <span className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all">↗</span>
                    </a>
                  ))}
                </div>
              )}
              
              <div className="pt-20 text-center opacity-20">
                <p className="text-[10px] tracking-[0.4em] uppercase font-black">Astra Intelligence • DAKSH</p>
              </div>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 overflow-x-hidden flex">
      {/* Capabilities Overlay */}
      {showCapabilities && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-3xl overflow-y-auto animate-in fade-in zoom-in-95 duration-500 p-8 md:p-20">
          <button 
            onClick={() => setShowCapabilities(false)}
            className="fixed top-12 right-12 w-14 h-14 glass rounded-full flex items-center justify-center text-3xl hover:bg-white/10 transition-all border border-white/10 z-[110]"
          >
            ×
          </button>
          
          <div className="max-w-6xl mx-auto space-y-20">
            <header className="text-center space-y-4">
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter bg-gradient-to-b from-white to-gray-700 bg-clip-text text-transparent">Dimensions</h2>
              <p className="text-gray-500 text-xl font-medium tracking-[0.3em] uppercase">Unified AI Protocol by DAKSH</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
              <section className="space-y-10">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-blue-400 border-l-2 border-blue-400 pl-4">Neural Cores</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {AVAILABLE_MODELS.map(m => (
                    <button 
                      key={m.id}
                      onClick={() => { setSelectedModel(m.id); setShowCapabilities(false); setCurrentView(AppView.CHATS); }}
                      className="glass p-6 rounded-[28px] text-left hover:bg-white/5 transition-all border border-white/5 group"
                    >
                      <div className="text-2xl mb-4 group-hover:scale-110 transition-transform">{m.icon}</div>
                      <div className="font-bold text-lg mb-1">{m.name}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-2">{m.brand}</div>
                      <div className="text-xs text-gray-400 leading-relaxed">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </section>

              <div className="space-y-20">
                <section className="space-y-10">
                  <h3 className="text-xs font-black uppercase tracking-[0.4em] text-emerald-400 border-l-2 border-emerald-400 pl-4">Data Dimensions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { mode: AI_MODE.X_SEARCH, icon: '𝕏', label: 'X Pulse', desc: 'Real-time social trends' },
                      { mode: AI_MODE.REDDIT, icon: '🔴', label: 'Reddit Core', desc: 'Community consensus' },
                      { mode: AI_MODE.STOCKS, icon: '📈', label: 'Market Flow', desc: 'Live financial data' },
                      { mode: AI_MODE.FACT_CHECK, icon: '✅', label: 'Truth Lab', desc: 'Fact verification' },
                    ].map(item => (
                      <button 
                        key={item.mode}
                        onClick={() => { setMode(item.mode); setGroundingEnabled(true); setShowCapabilities(false); setCurrentView(AppView.DASHBOARD); }}
                        className="glass p-6 rounded-[28px] text-left hover:bg-white/5 transition-all border border-white/5 group"
                      >
                        <div className="text-2xl mb-4 group-hover:rotate-12 transition-transform">{item.icon}</div>
                        <div className="font-bold text-lg mb-1">{item.label}</div>
                        <div className="text-xs text-gray-400 leading-relaxed">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-10">
                  <h3 className="text-xs font-black uppercase tracking-[0.4em] text-rose-400 border-l-2 border-rose-400 pl-4">Creative Foundries</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { view: AppView.IMAGERY, icon: '🎨', label: 'Visual Studio', desc: 'High-density image generation' },
                      { view: AppView.DIRECTOR, icon: '🎬', label: 'Director Suite', desc: 'Veo Cinematic video synthesis' },
                      { view: AppView.LIVE, icon: '🎙️', label: 'Live Core', desc: 'Real-time audio interface' },
                      { view: AppView.ANALYSIS, icon: '🔍', label: 'Analysis Hub', desc: 'Multi-modal media parsing' },
                    ].map(item => (
                      <button 
                        key={item.view}
                        onClick={() => { setCurrentView(item.view); setShowCapabilities(false); }}
                        className="glass p-6 rounded-[28px] text-left hover:bg-white/5 transition-all border border-white/5 group"
                      >
                        <div className="text-2xl mb-4 group-hover:scale-125 transition-transform">{item.icon}</div>
                        <div className="font-bold text-lg mb-1">{item.label}</div>
                        <div className="text-xs text-gray-400 leading-relaxed">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </div>
            
            <footer className="pt-20 text-center border-t border-white/5">
              <p className="text-[10px] font-black tracking-[1em] text-gray-700 uppercase">Astra Intelligence Architecture • DAKSH Systems 2025</p>
            </footer>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-[60] transition-transform duration-500 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar currentView={currentView} setView={(v) => { setCurrentView(v); setIsSidebarOpen(false); }} />
      </div>
      
      {/* Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] animate-in fade-in duration-500"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col relative">
        {/* Universal Header */}
        <div className="w-full px-8 py-8 flex justify-between items-center sticky top-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/5">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-3 hover:bg-white/5 rounded-2xl transition-all active:scale-90 group"
          >
            <div className="space-y-1.5">
              <div className="w-6 h-[2px] bg-white group-hover:w-4 transition-all"></div>
              <div className="w-4 h-[2px] bg-white group-hover:w-6 transition-all"></div>
              <div className="w-6 h-[2px] bg-white group-hover:w-5 transition-all"></div>
            </div>
          </button>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setShowCapabilities(true)}
              className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors px-4 py-2"
            >
              Capabilities
            </button>
            {user ? (
              <div className="flex items-center gap-3 glass px-4 py-2 rounded-full border border-white/5 animate-in fade-in">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black leading-none">{user.name}</p>
                  <p className="text-[9px] text-gray-500 leading-tight">{user.email}</p>
                </div>
                <img src={user.avatar} className="w-8 h-8 rounded-full border border-white/20" alt="Avatar" />
              </div>
            ) : (
              <button 
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="px-6 py-2.5 bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-gray-200 transition-all active:scale-95 shadow-xl flex items-center gap-2"
              >
                {isSigningIn ? (
                  <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                )}
                {isSigningIn ? 'Authenticating...' : 'Sign In'}
              </button>
            )}
          </div>
        </div>

        {/* View Content */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
