'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getMediaType } from '@/lib/utils';

interface MediaPreviewProps {
  url: string;
}

export function MediaPreview({ url }: MediaPreviewProps) {
  const [imageError, setImageError] = useState(false);
  const mediaType = getMediaType(url);

  if (!mediaType || imageError) return null;

  switch (mediaType) {
    case 'gif':
    case 'image':
      return (
        <div className="mt-2 rounded-lg overflow-hidden animate-fadeIn">
          <Image
            src={url}
            alt="Media content"
            width={300}
            height={200}
            className="object-cover transition-transform duration-200 hover:scale-[1.02]"
            onError={() => setImageError(true)}
          />
        </div>
      );
    case 'youtube':
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1];
      if (!videoId) return null;
      
      return (
        <div className="mt-2 aspect-video animate-fadeIn">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg"
          />
        </div>
      );
    default:
      return null;
  }
}