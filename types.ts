
export enum AI_MODE {
  GENERAL = 'GENERAL',
  X_SEARCH = 'X_SEARCH',
  REDDIT = 'REDDIT',
  RESEARCH = 'RESEARCH',
  VIDEOS = 'VIDEOS',
  FACT_CHECK = 'FACT_CHECK',
  STOCKS = 'STOCKS'
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CHATS = 'CHATS',
  IMAGERY = 'IMAGERY',
  DIRECTOR = 'DIRECTOR',
  LIVE = 'LIVE',
  GROUNDING = 'GROUNDING',
  ANALYSIS = 'ANALYSIS'
}

export interface ImpersioResponse {
  text: string;
  urls?: { title: string; uri: string }[];
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  thinking?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  model: string;
  isThinking?: boolean;
}

export const AVAILABLE_MODELS = [
  { id: 'gemini-3-pro-preview', name: 'Vexa Pro', desc: 'Gemini 3.0 Standard', brand: 'VEXA', icon: '✦' },
  { id: 'astra-gpt-5', name: 'GPT-5', desc: 'Next-Gen Emulation', brand: 'OPENAI', icon: '🔘' },
  { id: 'astra-claude-4-opus', name: 'Claude 4 Opus', desc: 'Peak Reasoning', brand: 'ANTHROPIC', icon: '🟣' },
  { id: 'astra-gpt-4o', name: 'GPT-4o', desc: 'ChatGPT Emulation', brand: 'OPENAI', icon: '🟢' },
  { id: 'astra-claude-3-5', name: 'Claude 3.5', desc: 'Sonnet Emulation', brand: 'ANTHROPIC', icon: '🟠' },
  { id: 'astra-kimi-k2', name: 'Kimi K2', desc: 'Long Context Engine', brand: 'MOONSHOT', icon: '🌙' },
  { id: 'astra-qwen-2', name: 'Qwen 2.5', desc: 'Coding & Logic King', brand: 'ALIBABA', icon: '🐉' },
  { id: 'astra-llama-3', name: 'Llama 3.1', desc: 'Meta Open Intelligence', brand: 'META', icon: '🦙' },
  { id: 'astra-grok-1', name: 'Grok 1', desc: 'xAI Reasoning', brand: 'XAI', icon: '🇽' },
  { id: 'astra-gpt-oss-20tb', name: 'GPT OSS 20TB', desc: 'Massive Dataset Model', brand: 'OPENSOURCE', icon: '🌐' },
  { id: 'astra-mimo-v2', name: 'Mimo V2', desc: 'Ultra-Fast Reasoning', brand: 'MIMO', icon: '⚡' },
  { id: 'astra-perplexity', name: 'Perplexity', desc: 'Search-First Mode', brand: 'PPLX', icon: '🔍' },
  { id: 'gemini-3-flash-preview', name: 'Vexa Flash', desc: 'Fast & balanced', brand: 'VEXA', icon: '⚏' }
];
