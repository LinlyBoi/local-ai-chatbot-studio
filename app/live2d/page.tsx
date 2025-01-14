"use client";

import Live2DModel from '@/components/Live2DModel';

export default function Live2DPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Live2DModel 
        modelPath="/AnimeModel/v2_15nene_casual.model3.json"
        width={800}
        height={800}
      />
    </div>
  );
} 