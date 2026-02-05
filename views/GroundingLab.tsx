
import React, { useState } from 'react';
import { groundSearch, groundMaps } from '../services/geminiService.ts';

const GroundingLab: React.FC = () => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'search' | 'maps'>('search');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string, urls: { title: string, uri: string }[] } | null>(null);

  const handleGround = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    try {
      let data;
      if (mode === 'search') {
        data = await groundSearch(query);
      } else {
        // Try to get geolocation if possible
        let lat, lng;
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch {}
        data = await groundMaps(query, lat, lng);
      }
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold">Real World Grounding</h2>
        <p className="text-gray-500">Connecting AI to verified facts and spatial data.</p>
      </header>

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="glass p-8 rounded-3xl space-y-6">
          <div className="flex bg-white/5 p-1 rounded-2xl">
            <button 
              onClick={() => setMode('search')}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${mode === 'search' ? 'bg-blue-600' : 'text-gray-500'}`}
            >
              Google Search
            </button>
            <button 
              onClick={() => setMode('maps')}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${mode === 'maps' ? 'bg-green-600' : 'text-gray-500'}`}
            >
              Google Maps
            </button>
          </div>

          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={mode === 'search' ? "Who won the most medals in 2024 Paris Olympics?" : "Find high-rated Italian restaurants near me..."}
              className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-500 transition-all pr-16"
            />
            <button 
              onClick={handleGround}
              disabled={loading || !query.trim()}
              className="absolute right-3 top-3 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
            >
              {loading ? '...' : '🔍'}
            </button>
          </div>
        </div>

        {result && (
          <div className="glass p-8 rounded-3xl animate-in fade-in slide-in-from-top-4 duration-500 space-y-6">
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed text-gray-200">{result.text}</div>
            </div>
            
            {result.urls.length > 0 && (
              <div className="pt-6 border-t border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Verified Sources</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.urls.map((u, i) => (
                    <a 
                      key={i} 
                      href={u.uri} 
                      target="_blank" 
                      className="glass bg-white/5 p-4 rounded-xl flex items-center justify-between hover:bg-white/10 transition-all group"
                    >
                      <span className="text-sm truncate mr-4">{u.title || u.uri}</span>
                      <span className="text-blue-400 group-hover:translate-x-1 transition-transform">→</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroundingLab;
