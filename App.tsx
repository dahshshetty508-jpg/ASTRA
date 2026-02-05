
import React, { useState, useEffect, useRef } from 'react';
import { AppView, AI_MODE, ImpersioResponse, AVAILABLE_MODELS } from './types';
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

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiKeyReady, setApiKeyReady] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; avatar: string } | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<AI_MODE>(AI_MODE.GENERAL);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ImpersioResponse | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ data: string; type: string } | null>(null);
  const [groundingEnabled, setGroundingEnabled] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[1].id); // Default to GPT-5
  const [showModelPicker, setShowModelPicker] = useState(false);

  const modelPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (typeof window.aistudio !== 'undefined' && window.aistudio.hasSelectedApiKey) {
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
        name: 'Vexa Operator',
        email: 'operator@vexa.ai',
        avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Vexa'
      });
      setIsSigningIn(false);
    }, 1000);
  };

  const handleOpenKey = async () => {
    if (typeof window.aistudio !== 'undefined' && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      setApiKeyReady(true);
    }
  };

  const getSystemInstruction = (modelId: string) => {
    const common = " You are Vexa AI, a high-order intelligence interface. Built by DAKSH.";
    switch(modelId) {
      case 'astra-gpt-5': return "You are GPT-5. You represent the absolute peak of reasoning and creative logic." + common;
      case 'astra-claude-4-opus': return "You are Claude 4 Opus. You are nuanced, deeply intellectual, and helpful." + common;
      default: return "You are a multimodal intelligence engine." + common;
    }
  };

  const handleDashboardAction = async () => {
    if (!input.trim() && !attachedFile) return;
    setLoading(true);
    const query = input;
    // Keep input for UX until response or clear
    try {
      let res: ImpersioResponse = { text: '' };
      const systemInstruction = getSystemInstruction(selectedModel);
      const forceSearch = selectedModel === 'astra-perplexity' || groundingEnabled;

      if (mode === AI_MODE.VIDEOS) {
        if (!apiKeyReady) await handleOpenKey();
        const videoUrl = await generateVideoVeo(query, '16:9', attachedFile?.data);
        res = { text: "Generated sequence successfully.", mediaUrl: videoUrl, mediaType: 'video' };
      } else if (attachedFile) {
        const analysis = await analyzeMedia(attachedFile.data, attachedFile.type, query || "Describe this content.");
        res = { text: analysis };
      } else if (forceSearch) {
        const grounded = await groundSearch(query);
        res = { text: grounded.text, urls: grounded.urls };
      } else {
        const simple = await chatWithModel(selectedModel, query, [], false, systemInstruction);
        res = { text: simple.text };
      }
      setResponse(res);
      setInput(''); // Clear after success
    } catch (err) {
      console.error(err);
      setResponse({ text: "Logic synchronization failed. Re-initiating..." });
    } finally {
      setLoading(false);
      setAttachedFile(null);
    }
  };

  const renderDashboardInput = (isBottom: boolean) => (
    <div className={`w-full max-w-3xl mx-auto transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isBottom ? 'fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-6 scale-90 md:scale-95' : 'relative'}`}>
      <div className={`w-full impersio-input-bg rounded-[32px] p-2 flex flex-col shadow-2xl relative border border-white/5 transition-all ${isBottom ? 'shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.8)]' : ''}`}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleDashboardAction())}
          placeholder="Command Vexa..."
          className={`w-full bg-transparent p-5 text-lg outline-none resize-none placeholder:text-gray-700 leading-relaxed transition-all ${isBottom ? 'min-h-[60px] max-h-[120px] text-base py-3' : 'min-h-[140px]'}`}
        />
        
        <div className={`flex items-center justify-between px-4 pb-4 ${isBottom ? 'pb-2' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="relative" ref={modelPickerRef}>
              <button 
                onClick={() => setShowModelPicker(!showModelPicker)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-[10px] font-black text-gray-400 transition-all border border-white/5 uppercase tracking-tighter"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${selectedModel.includes('gpt') ? 'bg-emerald-500' : selectedModel.includes('claude') ? 'bg-purple-500' : 'bg-blue-500'}`}></span>
                {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name}
              </button>
              
              {showModelPicker && (
                <div className="absolute bottom-full left-0 mb-4 w-64 bg-[#0a0a0c] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="max-h-80 overflow-y-auto">
                    {AVAILABLE_MODELS.map(m => (
                      <button
                        key={m.id}
                        onClick={() => { setSelectedModel(m.id); setShowModelPicker(false); }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex flex-col ${selectedModel === m.id ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-white/5 text-gray-500'}`}
                      >
                        <span className="text-xs font-bold">{m.name}</span>
                        <span className="text-[9px] opacity-50">{m.brand}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setGroundingEnabled(!groundingEnabled)}
              className={`p-2 rounded-full hover:bg-white/5 transition-colors ${groundingEnabled ? 'text-blue-400' : 'text-gray-600'}`}
              title="Grounding"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <button className="p-2 text-gray-600 hover:text-white transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
              </button>
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  const reader = new FileReader();
                  reader.onload = (ev) => setAttachedFile({ data: ev.target?.result as string, type: f.type });
                  reader.readAsDataURL(f);
                }
              }} />
            </div>
            <button 
              onClick={handleDashboardAction}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black hover:bg-gray-200 transition-all active:scale-95 shadow-lg"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderView = () => {
    switch (currentView) {
      case AppView.CHATS: return <OmniChat />;
      case AppView.IMAGERY: return <VisualStudio />;
      case AppView.DIRECTOR: return <DirectorSuite apiKeyReady={apiKeyReady} onOpenKey={handleOpenKey} />;
      case AppView.LIVE: return <LiveCore />;
      case AppView.GROUNDING: return <GroundingLab />;
      case AppView.ANALYSIS: return <AnalysisHub />;
      case AppView.DASHBOARD:
      default: return (
        <div className={`flex-1 flex flex-col items-center w-full transition-all duration-1000 ${response ? 'justify-start pt-10' : 'justify-center'}`}>
          {!response && (
            <div className="mb-12 flex flex-col items-center gap-2 select-none animate-in fade-in duration-1000">
              <div className="w-20 h-20 border-4 border-white rounded-[28px] flex items-center justify-center font-black text-4xl mb-6 shadow-[0_0_50px_rgba(255,255,255,0.1)]">V</div>
              <h1 className="text-7xl font-black tracking-tighter uppercase">Vexa</h1>
              <p className="text-gray-500 text-[10px] tracking-[0.6em] uppercase font-black opacity-50">Intelligence Nexus • v5.0</p>
            </div>
          )}

          {!response && renderDashboardInput(false)}

          {!response && (
            <div className="flex flex-wrap justify-center gap-4 mt-14 fade-in max-w-3xl px-6">
              <button onClick={() => { setMode(AI_MODE.RESEARCH); setGroundingEnabled(true); }} className="chip px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5">📄 Research</button>
              <button onClick={() => setMode(AI_MODE.VIDEOS)} className="chip px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5">🎬 Cinematic</button>
              <button onClick={() => { setMode(AI_MODE.STOCKS); setGroundingEnabled(true); }} className="chip px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5">📈 Markets</button>
            </div>
          )}

          {loading && (
            <div className="mt-20 flex flex-col items-center gap-4 animate-in fade-in">
              <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
              <p className="text-[9px] text-gray-600 font-black tracking-[0.5em] uppercase">Syncing Neural Cores</p>
            </div>
          )}

          {response && !loading && (
            <div className="w-full max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-40 px-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-8">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 glass rounded-lg flex items-center justify-center font-black text-xs">V</div>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name} active</span>
                </div>
                <button onClick={() => { setResponse(null); setInput(''); }} className="text-[10px] font-black text-gray-500 hover:text-white transition-all uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">Reset Context</button>
              </div>

              {response.mediaUrl && (
                <div className="rounded-[40px] overflow-hidden glass border border-white/5 shadow-2xl animate-in zoom-in-95 duration-700">
                  {response.mediaType === 'video' ? <video src={response.mediaUrl} controls autoPlay className="w-full" /> : <img src={response.mediaUrl} className="w-full object-cover" />}
                </div>
              )}

              <div className="prose prose-invert max-w-none text-gray-200 leading-relaxed text-xl whitespace-pre-wrap font-light tracking-wide">
                {response.text}
              </div>

              {response.urls && response.urls.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-10 border-t border-white/5">
                  {response.urls.map((u, i) => (
                    <a key={i} href={u.uri} target="_blank" className="p-6 rounded-[32px] glass hover:bg-white/10 transition-all flex justify-between items-center group border border-white/5">
                      <div className="flex flex-col gap-1 overflow-hidden">
                        <span className="truncate text-sm font-bold text-white group-hover:text-blue-400 uppercase tracking-tight">{u.title || u.uri}</span>
                        <span className="text-[9px] text-gray-600 truncate font-mono">{u.uri}</span>
                      </div>
                      <span className="text-gray-700 group-hover:text-white transition-all">↗</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {response && renderDashboardInput(true)}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 flex">
      <div className={`fixed inset-y-0 left-0 z-[60] transition-transform duration-500 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar currentView={currentView} setView={(v) => { setCurrentView(v); setIsSidebarOpen(false); }} />
      </div>
      
      {isSidebarOpen && <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[55] animate-in fade-in duration-500" onClick={() => setIsSidebarOpen(false)} />}

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="w-full px-8 py-6 flex justify-between items-center sticky top-0 z-50 bg-black/40 backdrop-blur-2xl border-b border-white/5">
          <button onClick={() => setIsSidebarOpen(true)} className="p-3 hover:bg-white/5 rounded-2xl transition-all group">
            <div className="space-y-1.5">
              <div className="w-6 h-[2.5px] bg-white group-hover:w-4 transition-all"></div>
              <div className="w-4 h-[2.5px] bg-white group-hover:w-6 transition-all"></div>
            </div>
          </button>
          
          <div className="flex items-center gap-6">
            <button onClick={() => setCurrentView(AppView.DASHBOARD)} className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-600 hover:text-white transition-all">Nexus</button>
            {user ? (
              <div className="flex items-center gap-4 glass px-4 py-2 rounded-full border border-white/5">
                <img src={user.avatar} className="w-7 h-7 rounded-lg" alt="Avatar" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white hidden sm:block">{user.name}</span>
              </div>
            ) : (
              <button onClick={handleSignIn} disabled={isSigningIn} className="px-6 py-2.5 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-gray-200 transition-all">
                {isSigningIn ? '...' : 'Authenticate'}
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
