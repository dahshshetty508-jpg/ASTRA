
import React, { useState } from 'react';
import { generateVideoVeo } from '../services/geminiService';

interface DirectorProps {
  apiKeyReady: boolean;
  onOpenKey: () => void;
}

const DirectorSuite: React.FC<DirectorProps> = ({ apiKeyReady, onOpenKey }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [imageB64, setImageB64] = useState<string | null>(null);

  const steps = [
    "Initializing cinematic engine...",
    "Analyzing narrative structure...",
    "Rendering dynamic physics...",
    "Applying light simulation...",
    "Finalizing sequences..."
  ];

  const handleForge = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    
    // Fake loading progress for better UX as Veo takes time
    const interval = setInterval(() => {
      setLoadingStep(s => (s + 1) % steps.length);
    }, 15000);

    try {
      const url = await generateVideoVeo(prompt, aspectRatio, imageB64 || undefined);
      setVideoUrl(url);
    } catch (err) {
      console.error(err);
      alert("Generation failed. Please check if you have an active paid billing project selected.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImageB64(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (!apiKeyReady) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-8 glass rounded-3xl p-12">
        <div className="text-6xl">🎞️</div>
        <div className="max-w-md space-y-4">
          <h2 className="text-3xl font-bold">Director Suite</h2>
          <p className="text-gray-400 leading-relaxed">
            Veo requires a paid API project. Select a valid key to access high-quality video generation.
          </p>
          <div className="pt-4 flex flex-col gap-3">
            <button 
              onClick={onOpenKey}
              className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all"
            >
              Select Project Key
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              className="text-sm text-blue-400 hover:underline"
            >
              Learn about Billing Configuration
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h2 className="text-3xl font-bold">Director Suite</h2>
        <p className="text-gray-500">Veo powered cinematic synthesis.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="glass p-6 rounded-3xl space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Narrative Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A drone shot flying through a neon-lit cyber-forest..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 min-h-[150px] outline-none focus:border-red-500 transition-all text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setAspectRatio('16:9')}
                className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${aspectRatio === '16:9' ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-white/10 glass text-gray-400'}`}
              >
                <div className="w-8 h-5 border-2 border-current rounded-sm"></div>
                <span className="text-xs font-bold">16:9</span>
              </button>
              <button 
                onClick={() => setAspectRatio('9:16')}
                className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${aspectRatio === '9:16' ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-white/10 glass text-gray-400'}`}
              >
                <div className="w-5 h-8 border-2 border-current rounded-sm"></div>
                <span className="text-xs font-bold">9:16</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Reference Image (Optional)</label>
              <div className="relative group overflow-hidden glass rounded-2xl aspect-video flex items-center justify-center">
                {imageB64 ? (
                   <img src={imageB64} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl opacity-20">📸</span>
                )}
                <input type="file" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
              </div>
              {imageB64 && (
                <button onClick={() => setImageB64(null)} className="text-xs text-red-400 mt-2">Remove Image</button>
              )}
            </div>

            <button
              onClick={handleForge}
              disabled={loading || !prompt.trim()}
              className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-2xl font-bold transition-all shadow-lg shadow-red-900/30 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : 'Animate Scene'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="glass min-h-[500px] h-full rounded-3xl flex items-center justify-center relative overflow-hidden bg-black/60">
            {videoUrl ? (
              <video 
                src={videoUrl} 
                controls 
                autoPlay 
                loop 
                className={`max-w-full max-h-full ${aspectRatio === '9:16' ? 'h-full w-auto' : 'w-full h-auto'}`} 
              />
            ) : (
              <div className="text-center p-12">
                {loading ? (
                  <div className="space-y-6 max-w-sm mx-auto">
                    <div className="relative w-24 h-24 mx-auto">
                      <div className="absolute inset-0 border-4 border-red-500/20 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-xl font-bold">{steps[loadingStep]}</h3>
                       <p className="text-gray-500 text-sm">Video generation typically takes 1-3 minutes. Sit tight.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 opacity-20">
                    <div className="text-9xl">🎬</div>
                    <p className="text-xl font-medium">Ready for your vision.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectorSuite;
