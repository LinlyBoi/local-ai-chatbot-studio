import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedMessageProps {
  content: string;
  activeMotion?: string;
  motionDuration?: number;
}

export function AnimatedMessage({ content, activeMotion, motionDuration = 3 }: AnimatedMessageProps) {
  const [parts, setParts] = useState<{ text: string; isEmotion: boolean; isActive: boolean }[]>([]);
  
  useEffect(() => {
    // Split text into parts based on *emotion* markers
    const regex = /\*(.*?)\*|([^*]+)/g;
    const matches = Array.from(content.matchAll(regex));
    
    const newParts = matches.map(match => {
      const emotionText = match[1]; // Captured emotion text
      const regularText = match[2]; // Regular text
      
      if (emotionText) {
        return {
          text: emotionText,
          isEmotion: true,
          isActive: emotionText === activeMotion
        };
      } else {
        return {
          text: regularText || '',
          isEmotion: false,
          isActive: false
        };
      }
    });
    
    setParts(newParts);
  }, [content, activeMotion]);

  return (
    <div className="inline">
      {parts.map((part, index) => {
        if (part.isEmotion) {
          return (
            <motion.span
              key={index}
              className="relative inline-block font-italic px-1"
              initial={false}
              animate={part.isActive ? {
                color: 'hsl(var(--primary))',
                scale: 1.05,
                transition: { duration: 0.2 }
              } : {
                color: 'hsl(var(--muted-foreground))',
                scale: 1,
                transition: { duration: 0.2 }
              }}
            >
              <AnimatePresence>
                {part.isActive && (
                  <>
                    {/* Background glow effect */}
                    <motion.span
                      className="absolute inset-0 rounded-md bg-primary/10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                    
                    {/* Progress bar */}
                    <motion.span
                      className="absolute bottom-0 left-0 h-[2px] bg-primary/50"
                      initial={{ width: '0%', opacity: 0 }}
                      animate={{ 
                        width: '100%', 
                        opacity: [0, 1, 1, 0],
                        transition: { 
                          width: { duration: motionDuration, ease: 'linear' },
                          opacity: { 
                            times: [0, 0.1, 0.9, 1],
                            duration: motionDuration 
                          }
                        }
                      }}
                      exit={{ opacity: 0 }}
                    />
                    
                    {/* Highlight outline */}
                    <motion.span
                      className="absolute inset-0 rounded-md ring-1 ring-primary/30"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  </>
                )}
              </AnimatePresence>
              
              {/* Emotion text */}
              <span className="relative z-10">*{part.text}*</span>
            </motion.span>
          );
        }
        return <span key={index}>{part.text}</span>;
      })}
    </div>
  );
} 