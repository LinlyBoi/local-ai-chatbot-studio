'use client';

import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { EmotionConfig, EmotionTooltipData, MainEmotion } from '@/types/emotions';
import { motion } from 'framer-motion';

interface EmotionBarProps {
  emotion: MainEmotion;
  config: EmotionConfig;
  level: number;
  tooltipData: EmotionTooltipData;
}

export function EmotionBar({ emotion, config, level, tooltipData }: EmotionBarProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div 
          className="p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium capitalize text-base">{emotion}</span>
            <motion.span 
              className="text-sm font-medium"
              animate={{ opacity: level > 0 ? 1 : 0.5 }}
            >
              {Math.round(level)}%
            </motion.span>
          </div>
          <div className="relative h-3 w-full">
            <div className="absolute inset-0 rounded-full bg-background/50" />
            <motion.div 
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
              style={{ 
                width: `${level}%`,
                backgroundColor: config.color,
                boxShadow: level === 100 ? `0 0 10px ${config.color}, 0 0 20px ${config.color}` : 'none'
              }}
              animate={{
                scale: level === 100 ? [1, 1.05, 1] : 1
              }}
              transition={{
                repeat: level === 100 ? Infinity : 0,
                duration: 2
              }}
            />
          </div>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="left" className="w-64 p-3">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Current Level</span>
            <span className="text-sm">{Math.round(tooltipData.currentLevel)}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Decay Rate</span>
            <span className="text-sm">{tooltipData.decayRate}/min</span>
          </div>
          {tooltipData.conflicts.length > 0 && (
            <div>
              <span className="text-sm font-medium block mb-1">Conflicts with</span>
              <div className="flex flex-wrap gap-1">
                {tooltipData.conflicts.map(conflict => (
                  <span 
                    key={conflict}
                    className="px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs"
                  >
                    {conflict}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
} 