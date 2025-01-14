'use client';

import { Button } from '@/components/ui/button';
import { Settings, FileText, Sparkles, Wifi, WifiOff } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState, useEffect } from 'react';
import { DEFAULT_SYSTEM_PROMPT } from '@/lib/hooks/use-chat';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface ChatHeaderProps {
  onChangePrompt: (preset: string) => void;
  currentPrompt: string;
  activeModel: 'ollama' | 'gemini' | 'gpt' | 'anthropic';
  onModelChange: (model: 'ollama' | 'gemini' | 'gpt' | 'anthropic') => void;
  ollamaConnected: boolean;
  onSettingsChange?: (settings: {
    temperature: number;
    topP: number;
    maxTokens: number;
    presencePenalty: number;
    frequencyPenalty: number;
    characterConsistency: boolean;
  }) => void;
}

const CHARACTER_CONSISTENCY_PROMPT = `You must stay in character at all times. Never break character or acknowledge that you are an AI. Respond as your character would, maintaining their personality, knowledge, and mannerisms consistently throughout the conversation.`;

const PROMPT_PRESETS = {
  default: {
    name: 'Default',
    content: DEFAULT_SYSTEM_PROMPT
  },
  inCharacter: {
    name: 'Stay in Character',
    content: CHARACTER_CONSISTENCY_PROMPT
  },
  roleplay: {
    name: 'Roleplay Focus',
    content: 'Focus on immersive roleplay interactions while maintaining character consistency.'
  }
};

export function ChatHeader({ 
  onChangePrompt, 
  currentPrompt,
  activeModel,
  onModelChange,
  ollamaConnected,
  onSettingsChange
}: ChatHeaderProps) {
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('default');
  const [customPrompt, setCustomPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [presets, setPresets] = useState(PROMPT_PRESETS);
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [presencePenalty, setPresencePenalty] = useState(0);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0);
  const [characterConsistency, setCharacterConsistency] = useState(true);

  useEffect(() => {
    if (isPromptDialogOpen) {
      setPresets(prev => ({
        ...prev,
        default: {
          ...prev.default,
          content: DEFAULT_SYSTEM_PROMPT
        }
      }));
      setCustomPrompt(currentPrompt);
    }
  }, [isPromptDialogOpen, currentPrompt]);

  useEffect(() => {
    if (characterConsistency) {
      const updatedPrompt = `${currentPrompt}\n\n${CHARACTER_CONSISTENCY_PROMPT}`;
      onChangePrompt(updatedPrompt);
    }
  }, [characterConsistency]);

  useEffect(() => {
    onSettingsChange?.({
      temperature,
      topP,
      maxTokens,
      presencePenalty,
      frequencyPenalty,
      characterConsistency
    });
  }, [temperature, topP, maxTokens, presencePenalty, frequencyPenalty, characterConsistency]);

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    setCustomPrompt(presets[value as keyof typeof presets].content);
  };

  const handlePromptChange = () => {
    setPresets(prev => ({
      ...prev,
      [selectedPreset]: {
        ...prev[selectedPreset as keyof typeof presets],
        content: customPrompt
      }
    }));
    onChangePrompt(customPrompt);
    setIsPromptDialogOpen(false);
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">Chat Settings</h2>
        {!ollamaConnected && activeModel === 'ollama' && (
          <Badge variant="destructive" className="gap-1">
            <WifiOff className="h-3 w-3" />
            Disconnected
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Model Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              {activeModel === 'ollama' ? (
                <Badge variant="default" className="gap-1">
                  <Wifi className="h-3 w-3" />
                  Local: Ollama
                </Badge>
              ) : activeModel === 'gemini' ? (
                <Badge variant="default" className="gap-1 bg-blue-500">
                  <Sparkles className="h-3 w-3" />
                  Cloud: Gemini
                </Badge>
              ) : activeModel === 'gpt' ? (
                <Badge variant="default" className="gap-1 bg-green-500">
                  <Sparkles className="h-3 w-3" />
                  Cloud: GPT
                </Badge>
              ) : (
                <Badge variant="default" className="gap-1 bg-orange-500">
                  <Sparkles className="h-3 w-3" />
                  Cloud: Claude
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Select Model</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onModelChange('ollama')}>
              <Wifi className="mr-2 h-4 w-4" />
              Local: Ollama
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onModelChange('gemini')}>
              <Sparkles className="mr-2 h-4 w-4" />
              Cloud: Gemini
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onModelChange('gpt')}>
              <Sparkles className="mr-2 h-4 w-4" />
              Cloud: GPT
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onModelChange('anthropic')}>
              <Sparkles className="mr-2 h-4 w-4" />
              Cloud: Claude
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>AI Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Character Consistency */}
            <div className="p-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="character-consistency">Stay in Character</Label>
                <Switch
                  id="character-consistency"
                  checked={characterConsistency}
                  onCheckedChange={setCharacterConsistency}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Forces the AI to maintain character consistency
              </p>
            </div>

            {/* Temperature */}
            <div className="p-2">
              <Label htmlFor="temperature">Temperature: {temperature}</Label>
              <Slider
                id="temperature"
                min={0}
                max={2}
                step={0.1}
                value={[temperature]}
                onValueChange={([value]) => setTemperature(value)}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Higher values make responses more creative but less focused
              </p>
            </div>

            {/* Top P */}
            <div className="p-2">
              <Label htmlFor="top-p">Top P: {topP}</Label>
              <Slider
                id="top-p"
                min={0}
                max={1}
                step={0.05}
                value={[topP]}
                onValueChange={([value]) => setTopP(value)}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Controls diversity of token selection
              </p>
            </div>

            {/* Max Tokens */}
            <div className="p-2">
              <Label htmlFor="max-tokens">Max Tokens: {maxTokens}</Label>
              <Slider
                id="max-tokens"
                min={100}
                max={4000}
                step={100}
                value={[maxTokens]}
                onValueChange={([value]) => setMaxTokens(value)}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum length of the response
              </p>
            </div>

            {/* Presence Penalty */}
            <div className="p-2">
              <Label htmlFor="presence-penalty">Presence Penalty: {presencePenalty}</Label>
              <Slider
                id="presence-penalty"
                min={-2}
                max={2}
                step={0.1}
                value={[presencePenalty]}
                onValueChange={([value]) => setPresencePenalty(value)}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Reduces repetition of topics
              </p>
            </div>

            {/* Frequency Penalty */}
            <div className="p-2">
              <Label htmlFor="frequency-penalty">Frequency Penalty: {frequencyPenalty}</Label>
              <Slider
                id="frequency-penalty"
                min={-2}
                max={2}
                step={0.1}
                value={[frequencyPenalty]}
                onValueChange={([value]) => setFrequencyPenalty(value)}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Reduces repetition of specific words
              </p>
            </div>

            <DropdownMenuSeparator />
            
            {/* Prompt Settings */}
            <DropdownMenuItem onClick={() => setIsPromptDialogOpen(true)}>
              <FileText className="mr-2 h-4 w-4" />
              Edit System Prompt
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Prompt Dialog */}
        <Dialog open={isPromptDialogOpen} onOpenChange={setIsPromptDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <FileText className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>System Prompt</DialogTitle>
              <DialogDescription>
                Choose a preset or customize the system prompt
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <RadioGroup 
                value={selectedPreset}
                onValueChange={handlePresetChange}
              >
                {Object.entries(presets).map(([key, preset]) => (
                  <div key={key} className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value={key} id={key} />
                    <Label htmlFor={key}>{preset.name}</Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="space-y-2">
                <Label htmlFor="custom-prompt">Custom Prompt</Label>
                <Textarea
                  id="custom-prompt"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Enter your custom system prompt..."
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handlePromptChange}>
                Apply Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}