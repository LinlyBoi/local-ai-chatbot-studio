import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getMediaType(url: string) {
  if (!isValidUrl(url)) return null;
  
  // GIF detection
  if (url.match(/\.gif$|giphy\.com|tenor\.com/i)) {
    return 'gif';
  }
  
  // Video detection (YouTube)
  if (url.match(/youtube\.com\/watch|youtu\.be/i)) {
    return 'youtube';
  }
  
  // Image detection
  if (url.match(/\.(jpg|jpeg|png|webp)$/i)) {
    return 'image';
  }
  
  return null;
}