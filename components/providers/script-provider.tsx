'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

export function ScriptProvider() {
  const [scriptsLoaded, setScriptsLoaded] = useState({
    cubism: false,
    pixi: false,
    live2d: false
  });

  const handleScriptLoad = (script: keyof typeof scriptsLoaded) => {
    setScriptsLoaded(prev => ({
      ...prev,
      [script]: true
    }));
    console.log(`${script} loaded`);
  };

  return (
    <>
      <Script 
        src="https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js" 
        strategy="beforeInteractive"
        onLoad={() => handleScriptLoad('cubism')}
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/pixi.js@6.5.1/dist/browser/pixi.min.js" 
        strategy="beforeInteractive"
        onLoad={() => handleScriptLoad('pixi')}
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/pixi-live2d-display/dist/cubism4.min.js" 
        strategy="beforeInteractive"
        onLoad={() => handleScriptLoad('live2d')}
      />
    </>
  );
} 