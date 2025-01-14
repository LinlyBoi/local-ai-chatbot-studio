'use client';

import { formatDistanceToNow } from 'date-fns';
import { MediaPreview } from '@/components/media/media-preview';
import { LinkPreview } from '@/components/media/link-preview';
import { isValidUrl } from '@/lib/utils';

interface ChatMessageProps {
  message: string;
  timestamp: Date;
  sender: string;
}

export function ChatMessage({ message, timestamp, sender }: ChatMessageProps) {
  const isUrl = isValidUrl(message);

  return (
    <div className="group animate-slideIn">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{sender}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(timestamp, { addSuffix: true })}
            </span>
          </div>
          <div className="mt-1">
            {isUrl ? (
              <LinkPreview url={message} isExpanded={false} />
            ) : (
              <p className="text-sm">{message}</p>
            )}
            {isUrl && <MediaPreview url={message} />}
          </div>
        </div>
      </div>
    </div>
  );
}