import { Rule34Post } from './api';
import { TenorGif } from '@/lib/services/tenor';
import { ComfyGeneration } from './comfy';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  results?: Rule34Post[];
  gif?: TenorGif;
  comfyGeneration?: ComfyGeneration;
  animationKey: string;
}

export interface MediaPreviewProps {
  url: string;
}

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

export interface LinkPreviewProps {
  url: string;
  isExpanded: boolean;
}