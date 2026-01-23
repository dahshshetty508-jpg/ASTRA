
export enum AI_MODE {
  GENERAL = 'GENERAL',
  X_SEARCH = 'X_SEARCH',
  REDDIT = 'REDDIT',
  RESEARCH = 'RESEARCH',
  VIDEOS = 'VIDEOS',
  FACT_CHECK = 'FACT_CHECK',
  STOCKS = 'STOCKS'
}

/**
 * AppView enum defining the available views in the application navigation.
 */
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

/**
 * ChatMessage interface representing a single message in a conversation.
 */
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  model: string;
  isThinking?: boolean;
}
