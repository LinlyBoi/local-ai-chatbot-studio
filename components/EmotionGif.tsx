import React, { useEffect, useState } from 'react';
import styles from '@/styles/EmotionGif.module.css';

interface EmotionGifProps {
  url: string;
  animationKey?: string;
}

export const EmotionGif: React.FC<EmotionGifProps> = ({ url, animationKey }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show GIF
    setIsVisible(true);

    // Hide GIF after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [animationKey]); // Reset animation when key changes

  if (!url) return null;

  return (
    <div className={`${styles.gifContainer} ${isVisible ? styles.visible : ''}`}>
      <img 
        src={url} 
        alt="emotion" 
        className={styles.gif}
      />
    </div>
  );
}; 