'use client';

import { EmotionBar } from './EmotionBar';
import { EMOTION_CONFIG } from '@/lib/emotions/config';
import { EmotionTooltipData, MainEmotion } from '@/types/emotions';
import { useEmotions } from '@/lib/emotions/context';
import { TooltipProvider } from '@/components/ui/tooltip';

interface EmotionPanelProps {
  adultMode?: boolean;
}

export function EmotionPanel({ adultMode = false }: EmotionPanelProps) {
  const { emotions } = useEmotions();
  
  // Filter out adult emotions if adult mode is disabled
  const filteredEmotions = Object.entries(emotions).filter(([emotion]) => {
    if (!adultMode) {
      return !EMOTION_CONFIG[emotion as MainEmotion].isAdult;
    }
    return true;
  });

  // Function to get tooltip data for an emotion
  const getTooltipData = (emotion: MainEmotion): EmotionTooltipData => {
    const config = EMOTION_CONFIG[emotion];
    return {
      currentLevel: emotions[emotion].level,
      decayRate: config.decayRate,
      conflicts: config.conflictsWith || [],
      requirements: config.requiresMinLevel || null,
      timeUntilDecay: 0 // TODO: Implement if needed
    };
  };

  return (
    <TooltipProvider>
      <div className="fixed right-4 top-1/2 -translate-y-1/2 w-64 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg shadow-lg border">
        <h3 className="text-lg font-semibold mb-4">Emotions</h3>
        <div className="space-y-2">
          {filteredEmotions.map(([emotion, intensity]) => (
            <EmotionBar
              key={emotion}
              emotion={emotion as MainEmotion}
              config={EMOTION_CONFIG[emotion as MainEmotion]}
              level={intensity}
              tooltipData={getTooltipData(emotion as MainEmotion)}
            />
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
} 