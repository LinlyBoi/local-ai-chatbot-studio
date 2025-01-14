'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/lib/hooks/use-chat';
import { ResultsGrid } from '@/components/search/results-grid';
import { cn } from '@/lib/utils';
import { ComfyGeneration } from '@/types/comfy';
import { AnimatedMessage } from './AnimatedMessage';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  loading?: boolean;
  error?: string | null;
}

export function MessageList({ messages, loading, error }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleExpanded = (messageId: string) => {
    setExpandedResults(prev => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isExpanded = expandedResults.has(message.id);
        const hasMoreResults = message.results && message.results.length > 20;

        return (
          <div
            key={message.id}
            className={cn(
              'flex flex-col gap-2',
              message.sender === 'assistant' ? 'items-start' : 'items-end'
            )}
          >
            {/* Message content */}
            <div
              className={cn(
                'rounded-lg px-4 py-2 max-w-[85%] break-words',
                message.sender === 'assistant'
                  ? 'bg-muted text-foreground'
                  : 'bg-primary text-primary-foreground'
              )}
            >
              <AnimatedMessage content={message.content} />
            </div>

            {/* Rule34 results */}
            {message.results && message.results.length > 0 && (
              <div className="w-full mt-2 space-y-4">
                <div className="text-sm text-muted-foreground">
                  Found {message.results.length} results
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-2 max-h-20 overflow-y-auto p-2 bg-muted/50 rounded-lg">
                  {Array.from(new Set(message.results.flatMap(post => post.tags))).slice(0, 15).map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <ResultsGrid 
                  results={isExpanded ? message.results : message.results.slice(0, 20)}
                  loading={false}
                  error={null}
                />

                {hasMoreResults && (
                  <button
                    onClick={() => toggleExpanded(message.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm text-muted-foreground hover:text-foreground"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Show {message.results.length - 20} More Results
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* ComfyUI generation */}
            {message.comfyGeneration && (
              <ComfyPreview generation={message.comfyGeneration} />
            )}
          </div>
        );
      })}

      {loading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center p-4 text-destructive">
          {error}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

function ComfyPreview({ generation }: { generation: ComfyGeneration }) {
  if (!generation.imageUrl) return null;

  return (
    <div className="relative aspect-square w-full max-w-xl rounded-lg overflow-hidden">
      <img
        src={generation.imageUrl}
        alt={generation.prompt}
        className="w-full h-full object-contain"
      />
    </div>
  );
}