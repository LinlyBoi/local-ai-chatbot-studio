'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { EmotionsState, MainEmotion } from '@/types/emotions';
import { EMOTION_CONFIG, INITIAL_EMOTION_STATE } from './config';

interface EmotionContextType {
  emotions: EmotionsState;
  updateEmotion: (emotion: MainEmotion, amount: number) => void;
  resetEmotions: () => void;
}

const EmotionContext = createContext<EmotionContextType | undefined>(undefined);

export function EmotionProvider({ children }: { children: ReactNode }) {
  const [emotions, setEmotions] = useState<EmotionsState>(INITIAL_EMOTION_STATE);

  // Effect for emotion decay
  useEffect(() => {
    const decayInterval = setInterval(() => {
      setEmotions(prevEmotions => {
        const now = Date.now();
        const newEmotions = { ...prevEmotions };
        
        Object.entries(newEmotions).forEach(([emotion, state]) => {
          if (state.isDecaying && state.level > 0) {
            const timeDiff = (now - state.lastUpdate) / 1000;
            const decayAmount = (EMOTION_CONFIG[emotion as MainEmotion].decayRate / 60) * timeDiff;
            
            newEmotions[emotion as MainEmotion] = {
              ...state,
              level: Math.max(0, state.level - decayAmount),
              lastUpdate: now
            };
          }
        });
        
        return newEmotions;
      });
    }, 1000);
    
    return () => clearInterval(decayInterval);
  }, []);

  const updateEmotion = (emotion: MainEmotion, amount: number) => {
    setEmotions(prev => {
      const newEmotions = { ...prev };
      const config = EMOTION_CONFIG[emotion];
      
      // Check requirements
      if (config.requiresMinLevel) {
        for (const [reqEmotion, reqLevel] of Object.entries(config.requiresMinLevel)) {
          if ((prev[reqEmotion as MainEmotion].level || 0) < reqLevel) {
            return prev; // Don't update if requirements not met
          }
        }
      }
      
      // Handle conflicts
      if (config.conflictsWith) {
        config.conflictsWith.forEach(conflictEmotion => {
          if (newEmotions[conflictEmotion].level > 0) {
            newEmotions[conflictEmotion] = {
              ...newEmotions[conflictEmotion],
              level: Math.max(0, newEmotions[conflictEmotion].level - Math.abs(amount) * 0.5)
            };
          }
        });
      }
      
      // Update the emotion
      newEmotions[emotion] = {
        ...newEmotions[emotion],
        level: Math.min(100, Math.max(0, newEmotions[emotion].level + amount)),
        lastUpdate: Date.now()
      };
      
      return newEmotions;
    });
  };

  const resetEmotions = () => {
    setEmotions(INITIAL_EMOTION_STATE);
  };

  return (
    <EmotionContext.Provider value={{ emotions, updateEmotion, resetEmotions }}>
      {children}
    </EmotionContext.Provider>
  );
}

export function useEmotions() {
  const context = useContext(EmotionContext);
  if (context === undefined) {
    throw new Error('useEmotions must be used within an EmotionProvider');
  }
  return context;
} 