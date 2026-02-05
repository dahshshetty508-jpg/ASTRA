
import React from 'react';
import { AppView } from '../types.ts';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const items = [
    { id: AppView.DASHBOARD, icon: '✦', label: 'Dashboard' },
    { id: AppView.CHATS, icon: '💬', label: 'Vexa Chat' },
    { id: AppView.IMAGERY, icon: '🎨', label: 'Visual Studio' },
    { id: AppView.DIRECTOR, icon: '🎬', label: 'Director Suite' },
    { id: AppView.LIVE, icon: '🎙️', label: 'Live Core' },
    { id: AppView.GROUNDING, icon: '🌐', label: 'Grounding' },
    { id: AppView.ANALYSIS, icon: '🔍', label: 'Analysis Hub' },
  ];

  return (
    <div className="w-72 bg-[#0a0a0b] border-r border-white/5 h-screen flex flex-col p-6 shadow-2xl">
      <div className="mb-12 flex items-center gap-4 px-2">
        <div className="w-10 h-10 border-2 border-white rounded-xl flex items-center justify-center font-black text-xl">V</div>
        <div className="flex flex-col">
          <span className="font-bold text-lg tracking-tight">Vexa</span>
          <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Intelligence</span>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1.5">
        <p className="px-4 py-2 text-[10px] font-black text-gray-700 uppercase tracking-[0.2em] mb-2">Systems</p>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
              currentView === item.id 
                ? 'bg-white/10 text-white shadow-lg border border-white/5' 
                : 'hover:bg-white/5 text-gray-500 hover:text-gray-200'
            }`}
          >
            <span className={`text-xl transition-transform group-hover:scale-110 ${currentView === item.id ? 'text-blue-400' : ''}`}>{item.icon}</span>
            <span className="font-bold text-sm tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-white/5 px-2">
        <div className="flex flex-col gap-1 opacity-40 hover:opacity-100 transition-opacity cursor-default">
          <div className="text-[10px] font-black uppercase tracking-[0.25em]">Vexa Core v5.0</div>
          <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Created by DAKSH</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
