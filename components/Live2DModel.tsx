"use client";

import { useEffect, useRef, useState } from 'react';
import { EmotionType, getRandomMotion, getEmotionSequence } from '@/lib/live2d/emotions';

interface Live2DModelProps {
  modelPath: string;
  width?: number;
  height?: number;
  currentEmotion?: EmotionType;
  emotionText?: string;
  onMotionStart?: (motion: string, duration: number) => void;
  onMotionEnd?: () => void;
  onLoad?: () => void;
}

interface MotionQueueItem {
  emotion: EmotionType;
  motion?: string;
  priority?: number;
  timestamp: number;
  text?: string;
}

export default function Live2DModel({ 
  modelPath, 
  width = 500, 
  height = 500,
  currentEmotion = 'neutral',
  emotionText = '',
  onMotionStart,
  onMotionEnd,
  onLoad
}: Live2DModelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<any>(null);
  const isPlayingRef = useRef(false);
  const motionQueueRef = useRef<MotionQueueItem[]>([]);
  const [activeMotion, setActiveMotion] = useState<string | null>(null);

  // Function to handle playing motions
  const playNextMotion = async () => {
    if (!modelRef.current || !modelRef.current.internalModel || isPlayingRef.current) {
      console.log('Model not ready or already playing');
      return;
    }

    try {
      const nextMotion = motionQueueRef.current[0];
      if (!nextMotion?.motion) {
        console.log('No motion to play');
        return;
      }

      console.log('Playing motion:', nextMotion.motion);
      isPlayingRef.current = true;
      setActiveMotion(nextMotion.emotion);
      
      try {
        // Stop any current motions
        modelRef.current.internalModel.motionManager.stopAllMotions();
        
        // Try to play the motion directly
        const motion = await modelRef.current.motion(nextMotion.motion);
        if (!motion) {
          console.log('Motion not found:', nextMotion.motion);
        } else {
          // Get motion duration or use default
          const duration = motion.duration || 3;
          console.log('Motion duration:', duration);
          
          // Notify parent of motion start with the actual emotion text
          onMotionStart?.(nextMotion.text || nextMotion.emotion, duration);
          
          // Wait for motion to complete
          await new Promise(resolve => setTimeout(resolve, duration * 1000));
          
          // Notify parent of motion end
          onMotionEnd?.();
        }
      } catch (err) {
        console.error('Failed to play motion:', err);
      }

      // Remove from queue
      motionQueueRef.current.shift();
      isPlayingRef.current = false;
      setActiveMotion(null);
      
      // Play next if available after a short delay
      if (motionQueueRef.current.length > 0) {
        setTimeout(() => playNextMotion(), 100); // Small delay between motions
      }
    } catch (error) {
      console.error('Error in motion playback:', error);
      isPlayingRef.current = false;
      setActiveMotion(null);
    }
  };

  // Effect to handle emotion changes
  useEffect(() => {
    if (!modelRef.current) return;

    // Get all emotions from the text
    const { emotions, matches } = emotionText ? getEmotionSequence(emotionText) : { emotions: [currentEmotion], matches: [] };
    console.log('Processing emotion sequence:', emotions);

    // Clear current queue
    motionQueueRef.current = [];

    // Add each emotion to the queue
    emotions.forEach((emotion, index) => {
      const motion = getRandomMotion(emotion);
      console.log(`Selected motion for ${emotion}:`, motion);
      
      motionQueueRef.current.push({
        emotion,
        motion,
        timestamp: Date.now(),
        text: matches?.[index]?.[1]
      });
    });

    // Start playing if not already playing
    if (!isPlayingRef.current) {
      playNextMotion();
    }
  }, [currentEmotion, emotionText]);

  useEffect(() => {
    if (!canvasRef.current || typeof window === 'undefined') return;

    let app: any = null;
    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 1000; // 1 second

    const initializeApp = async () => {
      const PIXI = (window as any).PIXI;
      if (!PIXI?.live2d?.Live2DModel) {
        if (retryCount < maxRetries) {
          console.log('Live2D not loaded yet, retrying...');
          retryCount++;
          setTimeout(initializeApp, retryDelay);
        } else {
          console.error('Failed to load Live2D after multiple attempts');
          // Last resort: reload the page
          window.location.reload();
        }
        return;
      }

      try {
        // Create application first
        app = new PIXI.Application({
          view: canvasRef.current,
          width,
          height,
          backgroundAlpha: 0,
          antialias: true,
        });

        // Wait for the next frame to ensure PIXI is initialized
        await new Promise(resolve => requestAnimationFrame(resolve));

        // Additional wait to ensure stage is ready
        await new Promise(resolve => setTimeout(resolve, 100));

        if (!app.stage) {
          if (retryCount < maxRetries) {
            console.log('PIXI stage not ready, retrying...');
            retryCount++;
            if (app) {
              app.destroy(true);
              app = null;
            }
            setTimeout(initializeApp, retryDelay);
            return;
          }
          // Last resort: reload the page
          console.error('Failed to initialize PIXI stage after multiple attempts');
          window.location.reload();
          return;
        }

        // Now load the model
        const Live2DModel = PIXI.live2d.Live2DModel;
        await setupModel(Live2DModel, app);
      } catch (error) {
        console.error('Error initializing PIXI:', error);
        if (retryCount < maxRetries) {
          retryCount++;
          if (app) {
            app.destroy(true);
            app = null;
          }
          setTimeout(initializeApp, retryDelay);
        } else {
          // Last resort: reload the page
          window.location.reload();
        }
      }
    };

    const setupModel = async (Live2DModel: any, app: any) => {
      try {
        console.log('Loading model from:', modelPath);
        const model = await Live2DModel.from(modelPath);
        console.log('Model loaded:', model);

        app.stage.addChild(model);
        modelRef.current = model;

        // Adjust position and scale for better fit
        model.x = width / 2;
        model.y = height / 2 + 100;
        model.scale.set(0.2);
        model.anchor.set(0.5, 0.5);

        // Enable auto update
        app.ticker.add(() => {
          if (model && model.update) {
            model.update(app.ticker.deltaMS / 1000);
          }
        });

        // Initialize motion manager
        if (model.internalModel) {
          console.log('Initializing motion manager');
          model.internalModel.motionManager.update = model.internalModel.motionManager.update.bind(model.internalModel.motionManager);
          model.internalModel.motionManager.startMotion = model.internalModel.motionManager.startMotion.bind(model.internalModel.motionManager);
        }

        // Add basic interactivity
        model.on('hit', (hitAreas: string[]) => {
          if (hitAreas.includes('body')) {
            motionQueueRef.current.push({
              emotion: 'shy',
              motion: 'w-adult01-blushed',
              timestamp: Date.now()
            });
            playNextMotion();
          }
        });

        // Make the model interactive
        model.interactive = true;

        // Notify parent that model is loaded
        onLoad?.();
      } catch (error) {
        console.error('Error loading Live2D model:', error);
        if (retryCount < maxRetries) {
          console.log('Retrying model setup...');
          retryCount++;
          setTimeout(() => setupModel(Live2DModel, app), retryDelay);
        } else {
          // Last resort: reload the page
          window.location.reload();
        }
      }
    };

    // Start initialization with a small delay to ensure scripts are loaded
    setTimeout(initializeApp, 500);

    return () => {
      if (app) {
        app.ticker?.stop();
        app.destroy(true);
      }
    };
  }, [modelPath, width, height]);

  return (
    <div className="flex items-center justify-center h-full">
      <canvas ref={canvasRef} style={{ width, height }} />
    </div>
  );
} 