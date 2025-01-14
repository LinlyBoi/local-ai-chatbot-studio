export type MainEmotion = 
  | 'happy' 
  | 'shy' 
  | 'excited'
  | 'horny'
  | 'submissive'
  | 'flirty'
  | 'troubled'
  | 'blushing'
  | 'trembling'
  | 'panting'
  | 'whimpering'
  | 'leaking'
  | 'pleased'
  | 'greeting';

export type EmotionLevel = {
  emotion: MainEmotion;
  level: number;
  lastUpdated: number;
};

export interface EmotionConfig {
  color: string;
  decayRate: number;
  conflictsWith?: MainEmotion[];
  requiresMinLevel?: Record<MainEmotion, number>;
  isAdult: boolean;
}

export interface EmotionState {
  level: number;
  lastUpdate: number;
  isDecaying: boolean;
}

export type EmotionsState = Record<MainEmotion, EmotionState>;

export interface EmotionTooltipData {
  currentLevel: number;
  decayRate: number;
  conflicts: MainEmotion[];
  requirements: Record<MainEmotion, number> | null;
  timeUntilDecay: number;
} 