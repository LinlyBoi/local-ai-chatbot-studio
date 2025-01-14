'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ANIMATION_DURATION, UI_CONSTANTS } from '@/lib/constants';

interface LinkPreviewProps {
  url: string;
  isExpanded: boolean;
}

export function LinkPreview({ url, isExpanded }: LinkPreviewProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(UI_CONSTANTS.COPY_SUCCESS_MESSAGE);
      setTimeout(() => setCopied(false), ANIMATION_DURATION.COPY_FEEDBACK);
    } catch (err) {
      toast.error(UI_CONSTANTS.COPY_ERROR_MESSAGE);
    }
  };

  return (
    <div className="group relative flex items-center gap-2 text-sm">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'text-blue-500 hover:underline transition-all duration-300 overflow-hidden',
          isExpanded ? 'max-w-full' : 'max-w-[200px] truncate'
        )}
      >
        {url}
      </a>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-6 w-6 opacity-0 transition-opacity duration-200',
          'group-hover:opacity-100',
          copied && 'text-green-500'
        )}
        onClick={copyToClipboard}
      >
        {copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}