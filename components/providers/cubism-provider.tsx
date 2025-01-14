"use client";

import { useEffect, useState } from 'react';
import Script from 'next/script';

export function CubismProvider({ children }: { children: React.ReactNode }) {
  const [cubismLoaded, setCubismLoaded] = useState(false);

  return (
    <>
      <Script
        src="https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js"
        strategy="beforeInteractive"
        onLoad={() => {
          console.log('Cubism Core loaded');
          setCubismLoaded(true);
        }}
        onError={(e) => {
          console.error('Error loading Cubism Core:', e);
        }}
      />
      {children}
    </>
  );
} 