'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { AlertTriangle } from 'lucide-react';

interface GeneratedImage {
  url: string;
  node: string;
  progress: number;
}

interface ImageGenerationProgressProps {
  promptId: string;
}

export function ImageGenerationProgress({ promptId }: ImageGenerationProgressProps) {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [status, setStatus] = useState<'connecting' | 'generating' | 'complete' | 'error'>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    if (!promptId) return;
    console.log('Starting image generation with promptId:', promptId);

    let ws: WebSocket | null = null;
    let retryTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        ws = new WebSocket('ws://127.0.0.1:8188/ws');

        ws.onopen = () => {
          console.log('WebSocket connected to ComfyUI');
          setStatus('generating');
          setError(null);
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected from ComfyUI');
          if (retryCount < maxRetries) {
            console.log('Attempting to reconnect...');
            retryTimeout = setTimeout(() => {
              setRetryCount(prev => prev + 1);
              connect();
            }, 1000);
          } else {
            setStatus('error');
            setError('Failed to connect to ComfyUI after multiple attempts');
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('Received WebSocket message:', data);

            if (data.type === 'progress') {
              const progress = Math.round(data.data.value * 100);
              console.log('Progress update:', progress);
              setCurrentProgress(progress);
            }
            
            if (data.type === 'executed' && data.data.output?.images) {
              console.log('Generation complete, output:', data.data.output);
              const newImages = data.data.output.images.map((filename: string) => ({
                url: `http://127.0.0.1:8188/view?filename=output/${filename}`,
                node: data.data.node,
                progress: 100
              }));

              console.log('Setting images:', newImages);
              setImages(prev => [...prev, ...newImages]);
              setStatus('complete');
            }

            if (data.type === 'error') {
              console.error('ComfyUI error:', data);
              setError(data.message || 'An error occurred during generation');
              if (retryCount >= maxRetries) {
                setStatus('error');
              }
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
      } catch (error) {
        console.error('Connection error:', error);
        setError(error instanceof Error ? error.message : 'Failed to connect to ComfyUI');
        setStatus('error');
      }
    };

    connect();

    return () => {
      console.log('Cleaning up WebSocket connection');
      if (ws) {
        ws.close();
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [promptId, retryCount]);

  // Show loading state with progress
  if (status === 'connecting' || status === 'generating') {
    return (
      <div className="flex flex-col items-center space-y-2 p-4">
        <div className="w-full max-w-xs bg-secondary rounded-full h-2.5">
          <div 
            className="bg-primary h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${currentProgress}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {status === 'connecting' ? 'Connecting to image generator...' : `Generating image... ${currentProgress}%`}
        </p>
      </div>
    );
  }

  // Show error state
  if (status === 'error') {
    return (
      <div className="flex flex-col items-center space-y-2 p-4 text-destructive">
        <AlertTriangle className="h-6 w-6" />
        <p className="text-sm">{error || 'Failed to generate image'}</p>
      </div>
    );
  }

  // Show generated images
  if (images.length > 0) {
    return (
      <div className="grid grid-cols-2 gap-4 p-4">
        {images.map((image, index) => (
          <div key={index} className="relative aspect-square">
            <Image
              src={image.url}
              alt={`Generated image ${index + 1}`}
              fill
              className="object-cover rounded-lg"
              onError={(e) => {
                console.error('Image failed to load:', image.url);
                if (retryCount < maxRetries) {
                  setRetryCount(prev => prev + 1);
                }
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  // Fallback state
  return (
    <div className="flex justify-center items-center p-4">
      <p className="text-sm text-muted-foreground">Waiting for image generation to start...</p>
    </div>
  );
} 