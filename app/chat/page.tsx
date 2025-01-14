'use client';

import Live2DModel from '@/components/Live2DModel';
import { ResultsGrid } from '@/components/search/results-grid';
import { ChatHeader } from '@/components/chat/chat-header';
import { MessageList } from '@/components/chat/message-list';
import { ChatInput } from '@/components/chat/chat-input';
import { useChat } from '@/lib/hooks/use-chat';
import { Card } from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, Wifi, WifiOff, Heart, Shield, ArrowLeft, Sparkles, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { ImageGenerationProgress } from '@/components/chat/image-generation-progress';
import { EmotionType, detectEmotion, getEmotionIntensity } from '@/lib/live2d/emotions';
import { Chat } from '@/components/chat/chat';
import { EmotionPanel } from '@/components/emotions/EmotionPanel';
import { useEmotions } from '@/lib/emotions/context';
import { useSearchParams, useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Link from 'next/link';
import Image from 'next/image';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';

type MainEmotion = 'happy' | 'sad' | 'angry' | 'excited' | 'shy';

export default function ChatPage() {
  const searchParams = useSearchParams();
  const { 
    messages, 
    sendMessage, 
    loading, 
    error, 
    ollamaConnected, 
    retryConnection,
    shouldShowResults,
    setShowResults,
    setSystemPrompt,
    systemPrompt,
    expandedResults,
    toggleExpandedResults
  } = useChat();

  const [currentPrompt, setCurrentPrompt] = useState(systemPrompt);
  const [activePromptId, setActivePromptId] = useState<string | undefined>();
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>('neutral');
  const { updateEmotion } = useEmotions();
  const lastMessageRef = useRef<string>('');
  const [activeMotion, setActiveMotion] = useState<string | null>(null);
  const [motionDuration, setMotionDuration] = useState(3);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [showEmotionPanel, setShowEmotionPanel] = useState(false);
  const [isAdultMode, setIsAdultMode] = useState(false);
  const [showAdultWarning, setShowAdultWarning] = useState(false);
  const [activeModel, setActiveModel] = useState<'ollama' | 'gemini' | 'gpt' | 'anthropic'>('ollama');
  const [characterInfo, setCharacterInfo] = useState<{
    name: string;
    image: string;
    prompt: string;
  } | null>(null);
  const [showLive2D, setShowLive2D] = useState(false);
  const [aiSettings, setAISettings] = useState({
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 2000,
    presencePenalty: 0,
    frequencyPenalty: 0,
    characterConsistency: true
  });
  const [storedCharacterInfo] = useLocalStorage('selectedCharacter', null);

  const handlePromptChange = (newPrompt: string) => {
    setCurrentPrompt(newPrompt);
    setSystemPrompt(newPrompt);
  };

  const handleSendMessage = async (message: string) => {
    setGenerationStatus(null);
    setGenerationError(null);
    setActivePromptId(undefined);
    
    setCurrentEmotion('thinking');
    
    // Check for Rule34 API usage
    if (message.startsWith('!') && !isAdultMode) {
      setShowAdultWarning(true);
      return;
    }
    
    await sendMessage(message);
  };

  useEffect(() => {
    if (messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.sender !== 'assistant' || lastMessage.content === lastMessageRef.current) return;

    console.log('Processing new message:', lastMessage.content);
    lastMessageRef.current = lastMessage.content;
    
    // Detect primary emotion for Live2D
    const emotion = detectEmotion(lastMessage.content);
    console.log('Detected emotion:', emotion);
    setCurrentEmotion(emotion);

    // Update emotion intensities
    const emotions: MainEmotion[] = ['happy', 'sad', 'angry', 'excited', 'shy'];
    emotions.forEach(e => {
      const intensity = getEmotionIntensity(lastMessage.content, e);
      console.log(`${e} intensity:`, intensity);
      if (intensity > 0) {
        updateEmotion(e, intensity);
      }
    });
  }, [messages, updateEmotion]);

  const handleMotionStart = (motion: string, duration: number) => {
    setActiveMotion(motion);
    setMotionDuration(duration);
  };

  const handleMotionEnd = () => {
    setActiveMotion(null);
  };

  // Handle Live2D model loading
  const handleModelLoad = () => {
    setIsModelLoading(false);
  };

  // Set initial system prompt from URL parameters
  useEffect(() => {
    const prompt = searchParams.get('prompt');
    if (prompt) {
      setCurrentPrompt(prompt);
      setSystemPrompt(prompt);
    }
  }, [searchParams]);

  const handleAdultModeToggle = () => {
    if (!isAdultMode) {
      setShowAdultWarning(true);
    } else {
      setIsAdultMode(false);
    }
  };

  const handleModelChange = (model: 'ollama' | 'gemini' | 'gpt' | 'anthropic') => {
    setActiveModel(model);
  };

  // Show adult mode dialog on first visit
  useEffect(() => {
    const hasSeenHelp = localStorage.getItem('hasSeenCommandHelp');
    if (!hasSeenHelp) {
      setShowAdultWarning(true);
    }
  }, []);

  // Set initial character info from storage
  useEffect(() => {
    if (storedCharacterInfo) {
      setCharacterInfo(storedCharacterInfo);
      setSystemPrompt(storedCharacterInfo.prompt);
      setCurrentPrompt(storedCharacterInfo.prompt);
    }
  }, [storedCharacterInfo]);

  const handleSettingsChange = (newSettings: typeof aiSettings) => {
    setAISettings(newSettings);
    // You can apply these settings to your chat implementation
    // For example, update the chat configuration or pass to the API
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-background to-muted">
      {/* Top Navigation Bar */}
      <div className="w-full border-b bg-background/50 backdrop-blur-sm p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/characters">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Characters
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmotionPanel(!showEmotionPanel)}
              className="gap-2"
            >
              <Heart className={cn(
                "w-4 h-4",
                showEmotionPanel ? "fill-current" : "fill-none"
              )} />
              Emotions
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAdultModeToggle}
              className={cn(
                "gap-2",
                isAdultMode && "text-red-500 hover:text-red-600"
              )}
            >
              <Shield className="w-4 h-4" />
              18+ Mode {isAdultMode ? "On" : "Off"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className={cn(
          "flex-1 flex flex-col h-full relative",
          showEmotionPanel ? "pr-[300px]" : "pr-0"
        )}>
          {/* Character Info Header */}
          <div className="flex items-center justify-center gap-6 p-6">
            <div className="relative w-[120px] h-[120px] rounded-full overflow-hidden border-2 border-primary/20">
              {characterInfo?.image && (
                <Image
                  src={characterInfo.image}
                  alt={characterInfo.name || 'Character'}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight">
                {characterInfo?.name ? `Chatting with ${characterInfo.name}` : 'Chat'}
              </h1>
              <p className="text-muted-foreground mt-2">
                {characterInfo?.name 
                  ? `Have a conversation with ${characterInfo.name}!`
                  : 'Start chatting with your selected character!'}
              </p>
              {characterInfo && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLive2D(!showLive2D)}
                  className="mt-4 gap-2"
                >
                  {showLive2D ? (
                    <><ImageIcon className="w-4 h-4" /> Use Static Image</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Enable Live2D</>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Live2D Model Overlay (when active) */}
          {showLive2D && (
            <div className="absolute right-4 top-4 w-[300px] h-[400px] bg-background/50 backdrop-blur-sm rounded-lg border overflow-hidden">
              {isModelLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                  <div className="text-center space-y-4">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground">Loading character model...</p>
                  </div>
                </div>
              )}
              <Live2DModel 
                modelPath="/AnimeModel/v2_15nene_casual.model3.json"
                width={300}
                height={400}
                currentEmotion={currentEmotion}
                emotionText={messages[messages.length - 1]?.content || ''}
                onMotionStart={handleMotionStart}
                onMotionEnd={handleMotionEnd}
                onLoad={handleModelLoad}
              />
            </div>
          )}

          {/* Chat Area */}
          <div className="flex-1 overflow-hidden mx-auto w-full max-w-4xl px-4">
            <Card className="flex-1 flex flex-col h-full">
              <ChatHeader 
                onChangePrompt={handlePromptChange}
                currentPrompt={currentPrompt}
                activeModel={activeModel}
                onModelChange={handleModelChange}
                ollamaConnected={ollamaConnected}
                onSettingsChange={handleSettingsChange}
              />

              {/* Messages Area - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                  {messages.length === 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Start chatting with your character! The AI will respond based on their personality.
                      </AlertDescription>
                    </Alert>
                  )}
                  <MessageList 
                    messages={messages} 
                    expandedResults={expandedResults}
                    onToggleExpand={toggleExpandedResults}
                    activeMotion={activeMotion}
                    motionDuration={motionDuration}
                  />
                  
                  {activePromptId && (
                    <div className="mt-4">
                      <ImageGenerationProgress promptId={activePromptId} />
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Input */}
              <div className="border-t bg-card p-4">
                <ChatInput 
                  onSendMessage={handleSendMessage}
                  disabled={loading}
                  className="w-full focus-within:shadow-sm"
                  placeholder={loading 
                    ? "Processing your message..." 
                    : "Type a message to chat with your character..."}
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Emotion Panel - Fixed on the right */}
        {showEmotionPanel && (
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            className="fixed right-0 top-0 w-[300px] h-screen bg-background/50 backdrop-blur-sm border-l"
          >
            <EmotionPanel adultMode={isAdultMode} />
          </motion.div>
        )}
      </div>

      {/* Adult Content Warning Dialog */}
      <Dialog open={showAdultWarning} onOpenChange={setShowAdultWarning}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Enable Adult Content & Rule34 Search</DialogTitle>
            <DialogDescription>
              Warning: This will enable adult content and Rule34 API search functionality.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Adult Content Warning */}
            <div className="space-y-2">
              <h3 className="font-medium text-red-500">Adult Content Warning</h3>
              <p className="text-sm text-muted-foreground">
                Enabling this will allow access to adult content through the Rule34 API. Please proceed only if you are 18 or older.
              </p>
            </div>

            {/* Command Information */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium">Available Commands</h3>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Rule34 Search Commands</h4>
                <p className="text-sm text-muted-foreground">
                  Use <code className="bg-muted px-1 rounded">!</code> followed by tags to search for images.
                </p>
                <p className="text-sm text-muted-foreground">
                  Example: <code className="bg-muted px-1 rounded">!anime girl blue_hair</code>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  You can combine multiple tags with spaces or underscores:
                </p>
                <p className="text-sm text-muted-foreground">
                  <code className="bg-muted px-1 rounded">!anime blue_hair cute</code>
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAdultWarning(false)}>
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={() => {
                setIsAdultMode(true);
                setShowAdultWarning(false);
                // Also mark help as seen
                localStorage.setItem('hasSeenCommandHelp', 'true');
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Enable & Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 