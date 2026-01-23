
import React, { useState } from 'react';
import { generateImagePro, editImageFlash } from '../services/geminiService';

const VisualStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [size, setSize] = useState('1K');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'generate' | 'edit'>('generate');

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    try {
      const url = await generateImagePro(prompt, aspectRatio, size);
      setResult(url);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!result || !prompt.trim() || loading) return;
    setLoading(true);
    try {
      const url = await editImageFlash(result, prompt);
      setResult(url);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setResult(ev.target?.result as string);
      reader.readAsDataURL(file);
      setMode('edit');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Visual Studio</h2>
          <p className="text-gray-500">Pro-grade imagery and intelligent editing.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setMode('generate')}
             className={`px-6 py-2 rounded-xl font-medium transition-all ${mode === 'generate' ? 'bg-blue-600 text-white' : 'glass text-gray-400'}`}
           >
             Generate
           </button>
           <button 
             onClick={() => setMode('edit')}
             className={`px-6 py-2 rounded-xl font-medium transition-all ${mode === 'edit' ? 'bg-blue-600 text-white' : 'glass text-gray-400'}`}
           >
             Edit
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={mode === 'generate' ? "A futuristic neon city in the rain..." : "Add a vintage filter / Remove background..."}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 min-h-[120px] outline-none focus:border-blue-500 transition-all text-sm"
              />
            </div>

            {mode === 'generate' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Aspect Ratio</label>
                  <select 
                    value={aspectRatio} 
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none"
                  >
                    {['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Quality</label>
                  <select 
                    value={size} 
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none"
                  >
                    {['1K', '2K', '4K'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={mode === 'generate' ? handleGenerate : handleEdit}
                disabled={loading || !prompt.trim()}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/30"
              >
                {loading ? 'Processing...' : (mode === 'generate' ? 'Forge Image' : 'Apply Edit')}
              </button>
            </div>
            
            <div className="text-center">
              <label className="text-xs text-blue-400 cursor-pointer hover:underline">
                Upload your own image to edit
                <input type="file" className="hidden" accept="image/*" onChange={handleFile} />
              </label>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="glass min-h-[400px] rounded-3xl flex items-center justify-center relative overflow-hidden group">
            {result ? (
              <img src={result} alt="AI Result" className="max-w-full max-h-[700px] object-contain rounded-2xl" />
            ) : (
              <div className="text-center text-gray-600 p-12">
                <div className="text-7xl mb-4 opacity-10">🎨</div>
                <p>Your creation will appear here.</p>
              </div>
            )}
            {loading && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-blue-400 font-bold animate-pulse">Forging Visual Reality...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualStudio;
