
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { decode, decodeAudioData, encode } from '../services/geminiService';

const LiveCore: React.FC = () => {
  const [active, setActive] = useState(false);
  const [transcript, setTranscript] = useState<{ role: string, text: string }[]>([]);
  const [status, setStatus] = useState('Standby');

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startSession = async () => {
    try {
      setStatus('Connecting...');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('Listening');
            setActive(true);
            
            const source = inputContext.createMediaStreamSource(stream);
            const scriptProcessor = inputContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              
              const blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };

              sessionPromise.then(session => session.sendRealtimeInput({ media: blob }));
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputContext.destination);
          },
          onmessage: async (message) => {
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscript(prev => [...prev, { role: 'AI', text }]);
            }
            
            const b64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (b64 && audioContextRef.current) {
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(b64), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error(e);
            setStatus('Error');
            setActive(false);
          },
          onclose: () => {
            setStatus('Closed');
            setActive(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
          systemInstruction: 'You are OmniMind, a friendly and helpful real-time AI assistant.',
          outputAudioTranscription: {}
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('Failed');
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setActive(false);
    setStatus('Standby');
  };

  return (
    <div className="h-[70vh] flex flex-col items-center justify-center space-y-8 glass rounded-3xl p-12">
      <div className="relative">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl shadow-2xl transition-all duration-500 ${active ? 'bg-blue-600 animate-pulse' : 'bg-white/10'}`}>
          {active ? '🎙️' : '💤'}
        </div>
        {active && (
           <div className="absolute -inset-4 border-2 border-blue-500/50 rounded-full animate-ping opacity-20"></div>
        )}
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Live Core Interface</h2>
        <p className="text-gray-500 font-medium uppercase tracking-widest text-xs">Status: <span className={active ? 'text-green-400' : 'text-gray-500'}>{status}</span></p>
      </div>

      <div className="max-w-md w-full glass bg-black/40 p-4 rounded-2xl h-40 overflow-y-auto text-sm space-y-2">
        {transcript.length === 0 && <p className="text-gray-600 text-center py-8 italic">Transcription will appear here...</p>}
        {transcript.map((t, i) => (
          <div key={i} className="flex gap-2">
            <span className="font-bold text-blue-400">{t.role}:</span>
            <span className="text-gray-300">{t.text}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        {!active ? (
          <button 
            onClick={startSession}
            className="px-10 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold transition-all shadow-xl shadow-blue-900/30"
          >
            Initiate Conversation
          </button>
        ) : (
          <button 
            onClick={stopSession}
            className="px-10 py-4 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/30 rounded-2xl font-bold transition-all"
          >
            End Session
          </button>
        )}
      </div>
      
      <p className="text-gray-600 text-xs">Uses Gemini 2.5 Native Audio for sub-second latency responses.</p>
    </div>
  );
};

export default LiveCore;
