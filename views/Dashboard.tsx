
import React from 'react';
import { AppView } from '../types';

const Dashboard: React.FC<{ setView: (v: AppView) => void }> = ({ setView }) => {
  const stats = [
    { label: 'Latency', value: '38ms' },
    { label: 'Protocol', value: 'Gemini 3.0 Pro' },
    { label: 'Intelligence', value: 'High Density' },
  ];

  const cards = [
    { view: AppView.CHATS, title: 'Chat', desc: 'Conversational reasoning.', icon: '💬', color: 'bg-blue-600' },
    { view: AppView.IMAGERY, title: 'Imagery', desc: 'Pixel-perfect synthesis.', icon: '🎨', color: 'bg-indigo-600' },
    { view: AppView.DIRECTOR, title: 'Director', desc: 'Cinematic video forge.', icon: '🎬', color: 'bg-rose-600' },
    { view: AppView.LIVE, title: 'Live', desc: 'Real-time voice sync.', icon: '🎙️', color: 'bg-emerald-600' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
      <header className="space-y-4">
        <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
          Environment Synchronized
        </div>
        <h1 className="text-5xl md:text-7xl font-medium tracking-tight bg-gradient-to-b from-white to-gray-600 bg-clip-text text-transparent">
          The Future, Unified.
        </h1>
        <p className="text-gray-500 text-xl font-light tracking-wide max-w-2xl">
          Welcome to Astra. A centralized intelligence layer harnessing the complete power of Gemini 3.0. Created by DAKSH.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-6">
        {stats.map(s => (
          <div key={s.label} className="glass p-6 rounded-[32px] border border-white/5">
            <div className="text-gray-600 text-[10px] mb-2 uppercase font-black tracking-[0.2em]">{s.label}</div>
            <div className="text-2xl font-bold tracking-tight">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(c => (
          <button
            key={c.view}
            onClick={() => setView(c.view)}
            className="group relative glass p-8 rounded-[40px] text-left transition-all hover:-translate-y-2 hover:border-white/20 hover:bg-white/5 border border-white/5"
          >
            <div className={`${c.color} w-16 h-16 rounded-[24px] flex items-center justify-center text-3xl mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
              {c.icon}
            </div>
            <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors">{c.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed font-medium">{c.desc}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-10 rounded-[48px] border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 scale-150 rotate-12 transition-transform duration-1000 group-hover:rotate-0">
             <span className="text-9xl">📊</span>
          </div>
          <div className="relative z-10 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Financial Intelligence</h2>
            <p className="text-gray-400 text-lg leading-relaxed font-light">
              Access real-time stock data, market trends, and high-fidelity economic analysis powered by real-time grounding.
            </p>
            <button 
              onClick={() => setView(AppView.GROUNDING)}
              className="bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-200 transition-all active:scale-95 shadow-2xl"
            >
              Market Analysis
            </button>
          </div>
        </div>

        <div className="glass p-10 rounded-[48px] border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 scale-150 rotate-12 transition-transform duration-1000 group-hover:rotate-0">
            <svg width="200" height="200" viewBox="0 0 40 40" fill="white"><path d="M20 4C11.1634 4 4 11.1634 4 20C4 28.8366 11.1634 36 20 36C28.8366 36 36 28.8366 36 20C36 11.1634 28.8366 4 20 4Z"/></svg>
          </div>
          <div className="relative z-10 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Logic & Reason</h2>
            <p className="text-gray-400 text-lg leading-relaxed font-light">
              Solve your most complex engineering and logic problems with a massive 32K token reasoning budget.
            </p>
            <button 
               onClick={() => setView(AppView.CHATS)}
               className="bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-200 transition-all active:scale-95 shadow-2xl"
            >
              Astra Reasoning
            </button>
          </div>
        </div>
      </div>
      
      <div className="text-center pb-12 opacity-20">
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Astra Protocol • DAKSH Systems</p>
      </div>
    </div>
  );
};

export default Dashboard;
