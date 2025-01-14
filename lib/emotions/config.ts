import { EmotionConfig, EmotionsState, MainEmotion } from '@/types/emotions';

export const EMOTION_CONFIG: Record<MainEmotion, EmotionConfig> = {
  happy: {
    color: 'rgb(255, 200, 50)',
    decayRate: 5,
    conflictsWith: ['troubled'],
    isAdult: false
  },
  horny: {
    color: 'rgb(255, 100, 150)',
    decayRate: 3,
    conflictsWith: ['shy'],
    isAdult: true
  },
  submissive: {
    color: 'rgb(200, 150, 255)',
    decayRate: 4,
    conflictsWith: [],
    isAdult: true
  },
  flirty: {
    color: 'rgb(255, 150, 200)',
    decayRate: 5,
    conflictsWith: ['shy'],
    isAdult: false
  },
  troubled: {
    color: 'rgb(100, 150, 255)',
    decayRate: 3,
    conflictsWith: ['happy', 'excited'],
    isAdult: false
  },
  blushing: {
    color: 'rgb(255, 150, 150)',
    decayRate: 4,
    conflictsWith: [],
    isAdult: false
  },
  trembling: {
    color: 'rgb(255, 200, 200)',
    decayRate: 6,
    conflictsWith: [],
    isAdult: true
  },
  panting: {
    color: 'rgb(255, 150, 100)',
    decayRate: 5,
    conflictsWith: [],
    isAdult: true
  },
  whimpering: {
    color: 'rgb(200, 200, 255)',
    decayRate: 4,
    conflictsWith: [],
    isAdult: true
  },
  leaking: {
    color: 'rgb(150, 200, 255)',
    decayRate: 3,
    conflictsWith: [],
    isAdult: true
  },
  pleased: {
    color: 'rgb(200, 255, 150)',
    decayRate: 4,
    conflictsWith: ['troubled'],
    isAdult: false
  },
  excited: {
    color: 'rgb(255, 100, 255)',
    decayRate: 6,
    conflictsWith: ['troubled'],
    isAdult: false
  },
  shy: {
    color: 'rgb(255, 150, 150)',
    decayRate: 4,
    conflictsWith: ['horny', 'flirty'],
    isAdult: false
  },
  greeting: {
    color: 'rgb(150, 255, 150)',
    decayRate: 8,
    conflictsWith: [],
    isAdult: false
  }
};

export const INITIAL_EMOTION_STATE: EmotionsState = Object.keys(EMOTION_CONFIG).reduce((acc, emotion) => ({
  ...acc,
  [emotion]: { level: 0, lastUpdate: Date.now(), isDecaying: true }
}), {} as EmotionsState); 