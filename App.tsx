
import React, { useState, useEffect, useRef } from 'react';
import { AppView, AI_MODE, ImpersioResponse, AVAILABLE_MODELS } from './types.ts';
import Sidebar from './components/Sidebar.tsx';
import DashboardView from './views/Dashboard.tsx';
import OmniChat from './views/OmniChat.tsx';
import VisualStudio from './views/VisualStudio.tsx';
import DirectorSuite from './views/DirectorSuite.tsx';
import LiveCore from './views/LiveCore.tsx';
import GroundingLab from './views/GroundingLab.tsx';
import AnalysisHub from './views/AnalysisHub.tsx';
import { 
  chatWithModel, 
  groundSearch, 
  generateVideoVeo, 
  analyzeMedia 
} from './services/geminiService.ts';

/**
 * Main App component for Vexa AI.
 * Handles navigation between different AI modules and global state.
 */
// Fix for Error: Type '() => void' is not assignable to type 'FC<{}>' by ensuring a valid return.
const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
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
    // Check if an API key is already selected on mount
    const checkKey = async () => {
      if (typeof window.aistudio !== 'undefined' && window.aistudio.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setApiKeyReady(hasKey);
      }
    };
    checkKey();

    // Close model picker when clicking outside
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
    // Simulate authentication process
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
      // Assume success after opening dialog as per guidelines
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
    try {
      let res: ImpersioResponse = { text: '' };
      const systemInstruction = getSystemInstruction(selectedModel);
      const forceSearch = selectedModel === 'astra-perplexity' || groundingEnabled;

      // Handle video generation with Veo
      if (mode === AI_MODE.VIDEOS) {
        if (!apiKeyReady) await handleOpenKey();
        const videoUrl = await generateVideoVeo(query, '16:9', attachedFile?.data);
        res = { text: "Generated sequence successfully.", mediaUrl: videoUrl, mediaType: 'video' };
      } else if (attachedFile) {
        // Handle media analysis
        const analysis = await analyzeMedia(attachedFile.data, attachedFile.type, query || "Describe this content.");
        res = { text: analysis };
      } else if (forceSearch) {
        // Handle search grounding
        const grounded = await groundSearch(query);
        res = { text: grounded.text, urls: grounded.urls };
      } else {
        // Default chat interaction
        const simple = await chatWithModel(selectedModel, query, [], false, systemInstruction);
        res = { text: simple.text };
      }
      setResponse(res);
      setInput(''); 
    } catch (err) {
      console.error(err);
      setResponse({ text: "Logic synchronization failed. Re-initiating..." });
    } finally {
      setLoading(false);
      setAttachedFile(null);
    }
  };

  // Helper to render the appropriate view based on selection
  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return (
          <div className="space-y-12 animate-in fade-in duration-700">
            <DashboardView setView={setCurrentView} />
            
            {response && (
              <div className="max-w-3xl mx-auto glass p-8 rounded-[32px] border border-white/5 space-y-4">
                <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Model Synthesis</div>
                <div className="text-gray-200 leading-relaxed whitespace-pre-wrap text-lg font-light">{response.text}</div>
                {response.mediaUrl && response.mediaType === 'video' && (
                  <video src={response.mediaUrl} controls className="mt-6 rounded-2xl w-full shadow-2xl" />
                )}
                {response.urls && response.urls.length > 0 && (
                   <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-3">
                     {response.urls.map((u, i) => (
                       <a key={i} href={u.uri} target="_blank" rel="noreferrer" className="glass bg-white/5 p-4 rounded-xl text-xs text-blue-400 hover:bg-white/10 transition-all truncate">
                         {u.title || u.uri}
                       </a>
                     ))}
                   </div>
                )}
              </div>
            )}

            <div className="max-w-3xl mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-[40px] blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
              <div className="relative glass p-6 rounded-[40px] border border-white/10 bg-[#0a0a0b]/80 backdrop-blur-xl">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleDashboardAction())}
                  placeholder="Ask Vexa anything or drop a file..."
                  className="w-full bg-transparent p-2 outline-none resize-none h-24 text-lg placeholder:text-gray-700"
                />
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setGroundingEnabled(!groundingEnabled)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${groundingEnabled ? 'bg-blue-600 border-blue-500 text-white' : 'border-white/5 text-gray-500 hover:text-gray-300'}`}
                    >
                      Grounding: {groundingEnabled ? 'ON' : 'OFF'}
                    </button>
                    <select 
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none text-gray-400"
                    >
                      {AVAILABLE_MODELS.map(m => (
                        <option key={m.id} value={m.id} className="bg-black text-white">{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <button 
                    onClick={handleDashboardAction}
                    disabled={loading || (!input.trim() && !attachedFile)}
                    className="bg-white text-black px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 disabled:opacity-50 transition-all active:scale-95 shadow-2xl"
                  >
                    {loading ? 'Synthesizing...' : 'Execute Signal'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case AppView.CHATS: return <OmniChat />;
      case AppView.IMAGERY: return <VisualStudio />;
      case AppView.DIRECTOR: return <DirectorSuite apiKeyReady={apiKeyReady} onOpenKey={handleOpenKey} />;
      case AppView.LIVE: return <LiveCore />;
      case AppView.GROUNDING: return <GroundingLab />;
      case AppView.ANALYSIS: return <AnalysisHub />;
      default: return <DashboardView setView={setCurrentView} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white selection:bg-blue-500/30 overflow-hidden font-sans">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-10 py-8 border-b border-white/5 bg-[#050505]/50 backdrop-blur-xl z-50">
          <div className="flex items-center gap-4">
             <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
               {currentView.replace('_', ' ')}
             </div>
          </div>

          <div className="flex items-center gap-8">
            {!user ? (
              <button onClick={handleSignIn} disabled={isSigningIn} className="bg-white text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95 shadow-xl">
                {isSigningIn ? 'Authenticating...' : 'Operator Access'}
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">{user.name}</span>
              </div>
            )}
            <button onClick={handleOpenKey} className={`text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl border transition-all ${apiKeyReady ? 'border-green-500/30 text-green-400 bg-green-500/5' : 'border-red-500/30 text-red-400 bg-red-500/5 animate-pulse'}`}>
              {apiKeyReady ? 'System Key: Active' : 'System Key: Offline'}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 pb-32">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

// Export default App to resolve "no default export" error in index.tsx
export default App;
