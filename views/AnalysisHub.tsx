
import React, { useState } from 'react';
import { analyzeMedia, transcribeAudio, generateTTS } from '../services/geminiService';

const AnalysisHub: React.FC = () => {
  const [file, setFile] = useState<{ data: string, type: string } | null>(null);
  const [prompt, setPrompt] = useState('Analyze this content in detail.');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const reader = new FileReader();
      reader.onload = (ev) => setFile({ data: ev.target?.result as string, type: f.type });
      reader.readAsDataURL(f);
    }
  };

  const handleProcess = async () => {
    if (!file || loading) return;
    setLoading(true);
    try {
      let resText = '';
      if (file.type.startsWith('audio')) {
        resText = await transcribeAudio(file.data.split(',')[1]);
      } else {
        resText = await analyzeMedia(file.data, file.type, prompt);
      }
      setResult(resText);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const speakResult = async () => {
    if (!result || speaking) return;
    setSpeaking(true);
    try {
      const b64 = await generateTTS(result);
      if (b64) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const bytes = new Uint8Array(atob(b64).split('').map(c => c.charCodeAt(0)));
        // Raw PCM decoding manually
        const dataInt16 = new Int16Array(bytes.buffer);
        const buffer = audioCtx.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
        
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start();
        source.onended = () => setSpeaking(false);
      }
    } catch (err) {
      console.error(err);
      setSpeaking(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold">Analysis Hub</h2>
        <p className="text-gray-500">Unpack images, videos, and audio with Pro-level intelligence.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="glass p-8 rounded-3xl space-y-6">
             <div className="border-2 border-dashed border-white/10 rounded-3xl p-12 text-center relative group hover:border-blue-500/50 transition-all">
                {file ? (
                  <div className="space-y-4">
                     {file.type.startsWith('image') && <img src={file.data} className="mx-auto max-h-40 rounded-lg" />}
                     {file.type.startsWith('video') && <video src={file.data} className="mx-auto max-h-40 rounded-lg" />}
                     {file.type.startsWith('audio') && <div className="text-4xl">🎵</div>}
                     <p className="text-sm font-medium">{file.type}</p>
                  </div>
                ) : (
                  <div className="space-y-4 opacity-30">
                    <div className="text-6xl">📁</div>
                    <p>Drop image, video or audio</p>
                  </div>
                )}
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} />
             </div>

             <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Context or Question</label>
                <input 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-blue-500 transition-all"
                />
             </div>

             <button 
               onClick={handleProcess}
               disabled={!file || loading}
               className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-2xl font-bold transition-all shadow-xl shadow-blue-900/30"
             >
               {loading ? 'Analyzing Content...' : 'Process Media'}
             </button>
          </div>
        </div>

        <div className="space-y-6">
           <div className="glass p-8 rounded-3xl h-full flex flex-col min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold uppercase tracking-widest text-xs text-gray-500">Insights Output</h4>
                {result && (
                  <button 
                    onClick={speakResult}
                    disabled={speaking}
                    className={`text-sm flex items-center gap-2 ${speaking ? 'text-blue-400 animate-pulse' : 'text-gray-400 hover:text-white'}`}
                  >
                    <span>{speaking ? '🔊 Speaking...' : '🔈 Read Aloud'}</span>
                  </button>
                )}
              </div>
              
              <div className="flex-1 text-gray-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                {result ? result : (
                  <div className="h-full flex flex-col items-center justify-center opacity-10 text-center">
                    <div className="text-9xl mb-4">📜</div>
                    <p className="text-xl">Analysis will be logged here.</p>
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisHub;
