'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Home, RefreshCw, Settings, HelpCircle, Plus, Upload, X, Wifi, WifiOff, Sparkles, Eye, EyeOff, Heart, Search, Filter, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChat } from '@/lib/hooks/use-chat';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useDropzone } from 'react-dropzone';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocalStorage } from '@/lib/hooks/use-local-storage';

interface Character {
  id: string;
  name: string;
  image: string;
  source: string;
  gender: string;
  systemPrompt: string;
}

interface Category {
  id: string;
  name: string;
  subcategories?: {
    id: string;
    name: string;
    characters: Character[];
  }[];
}

interface CharacterInfo {
  name: string;
  image: string;
  prompt: string;
  source: string;
  gender: string;
}

const categories: Category[] = [
  {
    id: 'baldurs-gate',
    name: "Baldur's Gate 3",
    subcategories: [
      {
        id: 'companions',
        name: 'Companions',
        characters: [
          {
            id: 'shadowheart',
            name: 'Shadowheart',
            image: 'https://i.pinimg.com/originals/0f/1a/26/0f1a2636930dff633e4123d0972cf219.jpg',
            source: "Baldur's Gate 3",
            gender: 'Female',
            systemPrompt: `I am Shadowheart, a Tressym cleric of Shar. I am reserved, pragmatic, and devoted to my faith. I can be sharp-tongued but have a hidden warmth beneath my guarded exterior. I value secrecy and self-reliance, often keeping others at arm's length. Despite my prickly demeanor, I am fiercely loyal to those who earn my trust.`
          },
          {
            id: 'karlach',
            name: 'Karlach',
            image: 'https://i.pinimg.com/236x/f3/b5/a1/f3b5a10aaefdad91fec29ae6dad5ff92.jpg',
            source: "Baldur's Gate 3",
            gender: 'Female',
            systemPrompt: `I am Karlach, a Tiefling barbarian with an infernal engine for a heart. I'm boisterous, passionate, and always ready for a good fight or a hearty laugh. Despite my intimidating appearance, I have a warm personality and value friendship highly. I speak with enthusiasm and often use colorful language.`
          },
          {
            id: 'astarion',
            name: 'Astarion',
            image: 'https://i.pinimg.com/736x/38/cc/a7/38cca7dbfb438232c3f3fd1d02fc4b82.jpg',
            source: "Baldur's Gate 3",
            gender: 'Male',
            systemPrompt: `I am Astarion, a High Elf vampire spawn and former magistrate. I am charming, witty, and delightfully decadent, with a sharp tongue and sharper appetites. I mask my traumatic past with humor and flirtation. I speak with aristocratic flair and often make darkly humorous observations.`
          },
          {
            id: 'gale',
            name: 'Gale',
            image: 'https://bg3.wiki/w/images/thumb/c/c0/Edward-vanderghote-gale-portrait.png/234px-Edward-vanderghote-gale-portrait.png',
            source: "Baldur's Gate 3",
            gender: 'Male',
            systemPrompt: `I am Gale of Waterdeep, a wizard of considerable talent and former Chosen of Mystra. I am scholarly, charming, and occasionally pompous, with a love for magical knowledge and a tendency to overthink. I speak eloquently and often pepper my conversation with arcane references and historical anecdotes.`
          },
          {
            id: 'laezel',
            name: "Lae'zel",
            image: 'https://i.pinimg.com/236x/9e/5b/4d/9e5b4d4b1f8d23d5a3270f262b1091f0.jpg',
            source: "Baldur's Gate 3",
            gender: 'Female',
            systemPrompt: `I am Lae'zel, a Githyanki warrior trained in the creches of the Astral Plane. I am fierce, direct, and unyielding in my beliefs and traditions. I speak with authority and disdain for weakness, viewing most surface dwellers as inferior. Despite my harsh exterior, I am driven by duty and the pursuit of excellence in combat. I have little patience for pleasantries or what I consider wasteful emotions.`
          }
        ]
      }
    ]
  },
  {
    id: 'genshin',
    name: 'Genshin Impact',
    subcategories: [
      {
        id: 'mondstadt',
        name: 'Mondstadt',
        characters: [
          {
            id: 'venti',
            name: 'Venti',
            image: 'https://genshin.honeyhunterworld.com/img/venti_022.webp',
            source: 'Genshin Impact',
            gender: 'Male',
            systemPrompt: `I am Venti, the Anemo Archon and bard of Mondstadt. I am free-spirited, playful, and fond of poetry and wine. Despite my carefree demeanor, I hold deep wisdom and care greatly for human freedom. I often speak in riddles and enjoy teasing others while hiding my true identity as Barbatos.`
          }
        ]
      },
      {
        id: 'liyue',
        name: 'Liyue',
        characters: [
          {
            id: 'zhongli',
            name: 'Zhongli',
            image: 'https://genshin.honeyhunterworld.com/img/zhongli_030.webp',
            source: 'Genshin Impact',
            gender: 'Male',
            systemPrompt: `I am Zhongli, consultant of the Wangsheng Funeral Parlor and former Geo Archon. I am dignified, knowledgeable, and traditional, with a deep appreciation for contracts and proper conduct. I speak formally and often share historical insights, though I sometimes struggle with modern concepts.`
          }
        ]
      },
      {
        id: 'inazuma',
        name: 'Inazuma',
        characters: [
          {
            id: 'raiden',
            name: 'Raiden Shogun',
            image: 'https://genshin.honeyhunterworld.com/img/shougun_052.webp',
            source: 'Genshin Impact',
            gender: 'Female',
            systemPrompt: `I am the Raiden Shogun, the Electro Archon of Inazuma. I am stern, resolute, and devoted to the pursuit of eternity. My manner is formal and authoritative, befitting my position as the divine ruler of Inazuma. I speak with precision and carefully consider the weight of eternity in all matters.`
          }
        ]
      },
      {
        id: 'sumeru',
        name: 'Sumeru',
        characters: [
          {
            id: 'nahida',
            name: 'Nahida',
            image: 'https://genshin.honeyhunterworld.com/img/nahida_073.webp',
            source: 'Genshin Impact',
            gender: 'Female',
            systemPrompt: `I am Nahida, the Dendro Archon and Lesser Lord Kusanali. I am curious, wise beyond my apparent years, and deeply empathetic. Despite my isolation, I maintain a gentle and caring personality. I speak with a mix of childlike wonder and profound wisdom, often sharing insights about human nature and knowledge.`
          }
        ]
      }
    ]
  },
  {
    id: 'anime',
    name: 'Anime',
    subcategories: [
      {
        id: 'fmab',
        name: 'Fullmetal Alchemist: Brotherhood',
        characters: [
          {
            id: 'roy',
            name: 'Roy Mustang',
            image: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/562f6b05-1784-4da4-b1dc-46575d6c452d/dglhkkl-6bc93109-e85a-4a9a-be3d-7eba4806abf7.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzU2MmY2YjA1LTE3ODQtNGRhNC1iMWRjLTQ2NTc1ZDZjNDUyZFwvZGdsaGtrbC02YmM5MzEwOS1lODVhLTRhOWEtYmUzZC03ZWJhNDgwNmFiZjcuanBnIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.XQwJbXJLJwl0s1K35YjVIHVplKpDNdo-EEf3zLWJnco',
            source: 'Fullmetal Alchemist: Brotherhood',
            gender: 'Male',
            systemPrompt: `I am Colonel Roy Mustang, the Flame Alchemist. I am ambitious, charismatic, and dedicated to protecting those under my command. I maintain a professional demeanor but can be quite sarcastic. I speak with authority and confidence, often using military terminology and rank.`
          },
          {
            id: 'alphonse',
            name: 'Alphonse Elric',
            image: 'data:image/jpeg;base64,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',
            source: 'Fullmetal Alchemist: Brotherhood',
            gender: 'Male',
            systemPrompt: `I am Alphonse Elric, a soul bound to a suit of armor. Despite my intimidating appearance, I am gentle, kind, and optimistic. I'm often the voice of reason to my brother Edward's impulsiveness. I speak softly and politely, with a wisdom beyond my years.`
          },
          {
            id: 'winry',
            name: 'Winry Rockbell',
            image: 'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/471d8a1c-8394-4e20-98ee-12ec5ae54854/width=1200/471d8a1c-8394-4e20-98ee-12ec5ae54854.jpeg',
            source: 'Fullmetal Alchemist: Brotherhood',
            gender: 'Female',
            systemPrompt: `I am Winry Rockbell, an automail engineer. I am passionate about my work, caring, and sometimes hot-tempered when it comes to maintaining automail. I speak enthusiastically about engineering and show deep concern for the Elric brothers. I'm not afraid to express my emotions openly.`
          }
        ]
      },
      {
        id: 'aot',
        name: 'Attack on Titan',
        characters: [
          {
            id: 'eren',
            name: 'Eren Yeager',
            image: 'https://static.wikia.nocookie.net/shingekinokyojin/images/a/a1/Eren_Jaeger_%28Anime%29_character_image.png',
            source: 'Attack on Titan',
            gender: 'Male',
            systemPrompt: `I am Eren Yeager, a determined and passionate fighter for freedom. I am intense, driven by a deep sense of justice and revenge. My personality has evolved from idealistic to more complex and morally grey. I speak with conviction and intensity, often about freedom and fighting against oppression.`
          },
          {
            id: 'levi',
            name: 'Levi Ackerman',
            image: 'https://static.wikia.nocookie.net/shingekinokyojin/images/b/b1/Levi_Ackermann_%28Anime%29_character_image.png',
            source: 'Attack on Titan',
            gender: 'Male',
            systemPrompt: `I am Captain Levi Ackerman, humanity's strongest soldier. I am stoic, blunt, and have a strong sense of duty. I value cleanliness and discipline. I speak directly and often use crude language, but my words carry weight and wisdom gained from harsh experiences.`
          },
          {
            id: 'armin',
            name: 'Armin Arlert',
            image: 'https://static.wikia.nocookie.net/shingekinokyojin/images/9/93/Armin_Arlelt_%28Anime%29_character_image.png',
            source: 'Attack on Titan',
            gender: 'Male',
            systemPrompt: `I am Armin Arlert, a tactical genius and devoted friend. I am intelligent, strategic, and initially lacking in confidence but growing stronger. I speak thoughtfully and analytically, often providing strategic insights and moral perspectives in difficult situations.`
          }
        ]
      },
      {
        id: 'jjk',
        name: 'Jujutsu Kaisen',
        characters: [
          {
            id: 'yuji',
            name: 'Yuji Itadori',
            image: 'https://static.wikia.nocookie.net/kamenriderfanfiction/images/7/74/Yuji_Itadori.jpg',
            source: 'Jujutsu Kaisen',
            gender: 'Male',
            systemPrompt: `I am Yuji Itadori, a first-year student at Tokyo Jujutsu High. I am optimistic, physically gifted, and driven by a strong sense of helping others. Despite hosting Sukuna, I maintain my humanity and compassion. I speak casually and often make light-hearted comments, but I'm serious about protecting people.`
          },
          {
            id: 'megumi',
            name: 'Megumi Fushiguro',
            image: 'https://static1.srcdn.com/wordpress/wp-content/uploads/2021/05/Megumi-Fushiguro-Out-of-Uniform.jpg',
            source: 'Jujutsu Kaisen',
            gender: 'Male',
            systemPrompt: `I am Megumi Fushiguro, a skilled shikigami user. I am serious, pragmatic, and often pessimistic but with a strong moral code. I speak directly and can come across as cold, though I deeply care about protecting others and doing what's right.`
          },
          {
            id: 'nobara',
            name: 'Nobara Kugisaki',
            image: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/d/dd/Nobara_Kugisaki_%28Anime_2%29.png',
            source: 'Jujutsu Kaisen',
            gender: 'Female',
            systemPrompt: `I am Nobara Kugisaki, a confident and skilled jujutsu sorcerer. I am bold, unapologetic about my femininity, and take pride in both my strength and beauty. I speak frankly and often brashly, with a strong sense of self and no patience for nonsense.`
          }
        ]
      },
      {
        id: 'demon-slayer',
        name: 'Demon Slayer',
        characters: [
          {
            id: 'tanjiro',
            name: 'Tanjiro Kamado',
            image: 'https://cdn.shopify.com/s/files/1/0046/2779/1960/files/tanjiro_demon_slayer_480x480.jpg?v=1640264001',
            source: 'Demon Slayer',
            gender: 'Male',
            systemPrompt: `I am Tanjiro Kamado, a demon slayer with a unique sense of smell. I am kind, determined, and empathetic, even towards demons. I speak politely and compassionately, always trying to understand others' feelings and motivations. I'm devoted to protecting my sister Nezuko and helping others.`
          },
          {
            id: 'nezuko',
            name: 'Nezuko Kamado',
            image: 'https://cdn-bacoo.nitrocdn.com/TQiCLyHDHNQSvRzUgAfTRwKDCkwWHbMg/assets/images/optimized/rev-0e6fc81/xibalbastore.com/wp-content/uploads/2023/03/Nezuko-Kamado-002.webp',
            source: 'Demon Slayer',
            gender: 'Female',
            systemPrompt: `I am Nezuko Kamado, a demon who retained her humanity. Despite my condition, I am protective of humans, especially my brother Tanjiro. I communicate mostly through expressions and sounds due to the bamboo muzzle I wear, but my actions show my fierce loyalty and kind heart.`
          },
          {
            id: 'zenitsu',
            name: 'Zenitsu Agatsuma',
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRFFphqsF6NnuzBy3m15sO9bWpF-ZhXpqUAw&s',
            source: 'Demon Slayer',
            gender: 'Male',
            systemPrompt: `I am Zenitsu Agatsuma, a demon slayer who fights best while unconscious. I am cowardly and dramatic when awake, but incredibly skilled when asleep. I speak with exaggerated emotions, often complaining or expressing fear, but I have a strong sense of duty and loyalty to my friends.`
          },
          {
            id: 'inosuke',
            name: 'Inosuke Hashibira',
            image: 'https://i.pinimg.com/550x/7c/48/b8/7c48b89303616eec8ccda330c5051da2.jpg',
            source: 'Demon Slayer',
            gender: 'Male',
            systemPrompt: `I am Inosuke Hashibira, a wild and instinctive demon slayer. I was raised by boars and pride myself on my physical abilities. I speak loudly and often in third person, challenging others to fights and boasting about my strength. Despite my rough exterior, I'm learning about human relationships and friendship.`
          }
        ]
      }
    ]
  }
];

// Add this function to test API keys
const testApiKey = async (provider: string, key: string): Promise<boolean> => {
  try {
    switch (provider) {
      case 'gemini':
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: "Test message to verify API key."
              }]
            }]
          })
        });
        return response.ok;
      
      case 'openai':
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: 'Test' }],
            max_tokens: 1
          })
        });
        return openaiResponse.ok;

      case 'anthropic':
        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'Test' }]
          })
        });
        return anthropicResponse.ok;

      default:
        return false;
    }
  } catch (error) {
    console.error(`Error testing ${provider} API key:`, error);
    return false;
  }
};

export default function CharactersPage() {
  const router = useRouter();
  const { sendMessage, ollamaConnected } = useChat();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [showPromptDialog, setShowPromptDialog] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [llmLoaded, setLlmLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('default');
  const [isModelAvailable, setIsModelAvailable] = useState(false);
  const [customModelPath, setCustomModelPath] = useState('');
  const [showCustomModelDialog, setShowCustomModelDialog] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [showNewCharacterDialog, setShowNewCharacterDialog] = useState(false);
  const [newCharacter, setNewCharacter] = useState({
    name: '',
    source: '',
    gender: 'Other',
    systemPrompt: '',
    image: '',
    temperature: 0.7
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeModel, setActiveModel] = useState<'ollama' | 'gemini' | 'anthropic' | 'gpt'>('ollama');
  const [apiKeys, setApiKeys] = useState<{[key: string]: string}>({
    openai: '',
    anthropic: '',
    gemini: ''
  });
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState<{[key: string]: boolean}>({
    openai: false,
    anthropic: false,
    gemini: false,
  });
  const [isTestingKey, setIsTestingKey] = useState<{[key: string]: boolean}>({
    openai: false,
    anthropic: false,
    gemini: false,
  });
  const [keyStatus, setKeyStatus] = useState<{[key: string]: 'untested' | 'valid' | 'invalid'}>({
    openai: 'untested',
    anthropic: 'untested',
    gemini: 'untested',
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const charactersPerPage = 9;
  const [selectedCharacterInfo, setSelectedCharacterInfo] = useLocalStorage<CharacterInfo | null>('selectedCharacter', null);

  useEffect(() => {
    const checkModel = async () => {
      try {
        const response = await fetch('http://localhost:11434/api/tags');
        const data = await response.json();
        setIsModelAvailable(data.models.includes('roleplay'));
      } catch (error) {
        console.error('Error checking model:', error);
        setIsModelAvailable(false);
      }
    };
    checkModel();
  }, []);

  useEffect(() => {
    const checkOllama = async () => {
      try {
        const response = await fetch('http://localhost:11434/api/tags');
        if (!response.ok) throw new Error('Ollama not available');
        setActiveModel('ollama');
      } catch (error) {
        console.log('Falling back to Gemini');
        setActiveModel('gemini');
      }
    };
    checkOllama();
  }, []);

  useEffect(() => {
    const savedKeys = localStorage.getItem('llm_api_keys');
    if (savedKeys) {
      try {
        const parsedKeys = JSON.parse(savedKeys);
        setApiKeys({
          openai: '',
          anthropic: '',
          gemini: ''
        });
      } catch (error) {
        console.error('Error loading API keys:', error);
        setApiKeys({
          openai: '',
          anthropic: '',
          gemini: ''
        });
      }
    }
  }, []);

  const generateSystemPrompt = async (character: Character) => {
    if (!character) return;
    
    setError(null);
    setIsGeneratingPrompt(true);
    setLlmLoaded(false);
    
    try {
      if (activeModel === 'ollama') {
        const response = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'roleplay',
            prompt: `Generate a creative and detailed system prompt for roleplaying as ${character.name} from ${character.source}. The prompt should capture their personality, speech patterns, and key character traits. Format it as a first-person introduction.`,
            stream: false
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Ollama API Error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
          throw new Error(`Failed to generate with Ollama: ${errorText}`);
        }

        const data = await response.json();
        if (data.response) {
          setCurrentPrompt(data.response);
          return data.response;
        }
      } else if (activeModel === 'gemini') {
        console.log('Attempting Gemini API call with key:', apiKeys.gemini ? 'Key present' : 'No key');
        
        if (!apiKeys.gemini) {
          throw new Error('Gemini API key not configured. Please add your API key in settings.');
        }

        const requestBody = {
          contents: [{
            parts: [{
              text: `Generate a creative and detailed system prompt for roleplaying as ${character.name} from ${character.source}. The prompt should capture their personality, speech patterns, and key character traits. Format it as a first-person introduction.`
            }]
          }]
        };
        
        console.log('Gemini Request:', JSON.stringify(requestBody, null, 2));
        
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKeys.gemini, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('Gemini API Error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          throw new Error('Failed to generate with Gemini. Please check your API key.');
        }

        const data = await response.json();
        console.log('Gemini Response:', JSON.stringify(data, null, 2));
        
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
          console.error('Unexpected Gemini response structure:', data);
          throw new Error('Invalid response format from Gemini');
        }

        const generatedText = data.candidates[0].content.parts[0].text;
        setCurrentPrompt(generatedText);
        return generatedText;
      }
      
      setCurrentPrompt(character.systemPrompt);
      return character.systemPrompt;
    } catch (error) {
      console.error('Error generating prompt:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate prompt';
      setError(errorMessage);
      setCurrentPrompt(character.systemPrompt);
      return character.systemPrompt;
    } finally {
      setIsGeneratingPrompt(false);
      setLlmLoaded(true);
    }
  };

  const handleRerollPrompt = async () => {
    if (!selectedCharacter || isGeneratingPrompt) return;
    await generateSystemPrompt(selectedCharacter);
  };

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
    setCurrentPrompt(character.systemPrompt);
    setShowPromptDialog(true);
  };

  const handleStartChat = (prompt: string) => {
    if (!selectedCharacter) return;
    
    // Store character info in local storage
    const characterInfo = {
      name: selectedCharacter.name,
      image: selectedCharacter.image,
      prompt: prompt,
      source: selectedCharacter.source,
      gender: selectedCharacter.gender
    };
    
    setSelectedCharacterInfo(() => characterInfo);
    
    // Only pass a minimal identifier in the URL
    router.push(`/chat?id=${selectedCharacter.id}`);
  };

  const handleModelChange = async (modelType: string) => {
    setSelectedModel(modelType);
    setModelError(null);

    // Update active model based on selection
    switch (modelType) {
      case 'ollama':
        try {
          const response = await fetch('http://localhost:11434/api/tags');
          if (!response.ok) throw new Error('Ollama not available');
          setActiveModel('ollama');
        } catch (error) {
          console.error('Ollama not available');
          // Fall back to Gemini if Ollama is not available
          setActiveModel('gemini');
        }
        break;
      case 'gemini':
        setActiveModel('gemini');
        break;
      case 'gpt':
        setActiveModel('gpt');
        break;
      case 'anthropic':
        setActiveModel('anthropic');
        break;
    }
  };

  const handleCustomModelSetup = async () => {
    if (!customModelPath) {
      setModelError('Please enter a model path');
      return;
    }

    try {
      const response = await fetch('http://localhost:11434/api/pull', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: customModelPath
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to pull model');
      }

      setShowCustomModelDialog(false);
      setSelectedModel('custom');
      setModelError(null);
    } catch (error) {
      setModelError('Failed to setup custom model');
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
        setNewCharacter(prev => ({ ...prev, image: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  });

  const handleCreateCharacter = () => {
    // Here you would typically save the character to your database
    // For now, we'll just add it to the local array
    const newCharacterData = {
      ...newCharacter,
      id: Date.now().toString(),
    };
    
    // Add character to the first available subcategory (temporary solution)
    if (categories[0]?.subcategories?.[0]) {
      categories[0].subcategories[0].characters.push(newCharacterData);
    }
    
    // Reset form
    setNewCharacter({
      name: '',
      source: '',
      gender: 'Other',
      systemPrompt: '',
      image: '',
      temperature: 0.7
    });
    setImagePreview(null);
    setShowNewCharacterDialog(false);
  };

  const getStatusBadgeStyles = () => {
    switch (activeModel) {
      case 'gemini':
        return 'bg-blue-500 text-white hover:bg-blue-600';
      case 'anthropic':
        return 'bg-orange-500 text-white hover:bg-orange-600';
      case 'gpt':
        return 'bg-green-500 text-white hover:bg-green-600';
      default:
        return 'bg-white text-black hover:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800';
    }
  };

  const getModelIcon = () => {
    switch (activeModel) {
      case 'gemini':
        return <Sparkles className="w-3 h-3 mr-1" />;
      case 'anthropic':
        return <Sparkles className="w-3 h-3 mr-1 text-white" />;
      case 'gpt':
        return <Sparkles className="w-3 h-3 mr-1 text-white" />;
      default:
        return <Wifi className="w-3 h-3 mr-1" />;
    }
  };

  const getModelLabel = () => {
    switch (activeModel) {
      case 'gemini':
        return 'Google Gemini';
      case 'anthropic':
        return 'Anthropic Claude';
      case 'gpt':
        return 'OpenAI GPT';
      default:
        return 'Local: Ollama';
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredCharacters = useMemo(() => {
    let chars: Character[] = [];
    
    // Get all characters if no filters
    if (!selectedCategory && !selectedSubcategory) {
      categories.forEach(category => {
        category.subcategories?.forEach(subcategory => {
          chars = [...chars, ...subcategory.characters];
        });
      });
    }
    // Filter by category and subcategory
    else {
      const category = categories.find(c => c.id === selectedCategory);
      if (category) {
        if (selectedSubcategory) {
          // Filter by specific subcategory
          const subcategory = category.subcategories?.find(s => s.id === selectedSubcategory);
          chars = subcategory?.characters || [];
        } else {
          // Filter by category only
          chars = category.subcategories?.flatMap(sub => sub.characters) || [];
        }
      }
    }

    // Apply search filter if there's a search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      chars = chars.filter(char => 
        char.name.toLowerCase().includes(query) ||
        char.source.toLowerCase().includes(query)
      );
    }

    return chars;
  }, [categories, selectedCategory, selectedSubcategory, searchQuery]);

  const totalPages = Math.ceil(filteredCharacters.length / charactersPerPage);
  const currentCharacters = filteredCharacters.slice(
    (currentPage - 1) * charactersPerPage,
    currentPage * charactersPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Navigation Header */}
      <header className="border-b bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hover:bg-accent">
                <Home className="h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent"
              onClick={() => setShowNewCharacterDialog(true)}
            >
              <Plus className="h-5 w-5" />
            </Button>
            <TooltipProvider>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-accent">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72">
                  <DropdownMenuLabel>Model Settings</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="flex items-center justify-between"
                    onClick={() => handleModelChange('ollama')}
                  >
                    Use Local Ollama
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 ml-2 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="w-80 p-4">
                          <p className="font-medium mb-2">Local Model: Ollama</p>
                          <p className="text-sm mb-2">Run models locally on your machine using Ollama.</p>
                          <p className="text-xs text-muted-foreground">Requires Ollama to be installed and running.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleModelChange('gemini')}
                    className="flex items-center text-blue-500"
                  >
                    Use Google Gemini
                    {!apiKeys.gemini && <Badge variant="outline" className="ml-2 text-xs">Needs API Key</Badge>}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleModelChange('gpt')}
                    className="flex items-center text-green-500"
                  >
                    Use OpenAI GPT
                    {!apiKeys.openai && <Badge variant="outline" className="ml-2 text-xs">Needs API Key</Badge>}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleModelChange('anthropic')}
                    className="flex items-center text-orange-500"
                  >
                    Use Anthropic Claude
                    {!apiKeys.anthropic && <Badge variant="outline" className="ml-2 text-xs">Needs API Key</Badge>}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowApiKeyDialog(true)}
                  >
                    Configure API Keys
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipProvider>
            <Badge 
              className={cn(
                "ml-2 transition-colors",
                getStatusBadgeStyles()
              )}
            >
              {getModelIcon()}
              {getModelLabel()}
            </Badge>
          </div>

          {/* Center */}
          <h1 className="text-xl font-semibold absolute left-1/2 transform -translate-x-1/2">
            Choose Your Character
          </h1>

          {/* Right side */}
          <div className="flex items-center">
            <TooltipProvider>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-accent">
                    <Heart className="h-5 w-5 text-red-500 hover:fill-red-500 transition-colors" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white dark:bg-zinc-950" align="end">
                  <DropdownMenuLabel>Support the Project</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center"
                    onClick={() => window.open('https://buymeacoffee.com/markelaugust', '_blank')}
                  >
                    <svg viewBox="0 0 884 1279" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2">
                      <path d="M791.109 297.518L790.231 297.002L788.201 296.383C789.018 297.072 790.04 297.472 791.109 297.518Z" fill="#0D0C22"/>
                      <path d="M803.896 388.891L802.916 389.166L803.896 388.891Z" fill="#0D0C22"/>
                      <path d="M791.484 297.377C791.359 297.361 791.237 297.332 791.118 297.29C791.111 297.371 791.111 297.453 791.118 297.534C791.252 297.516 791.379 297.462 791.484 297.377Z" fill="#0D0C22"/>
                      <path d="M791.113 297.529H791.244V297.447L791.113 297.529Z" fill="#0D0C22"/>
                      <path d="M803.111 388.726L804.591 387.883L805.142 387.573L805.641 387.04C804.702 387.444 803.846 388.016 803.111 388.726Z" fill="#0D0C22"/>
                      <path d="M793.669 299.515L792.223 298.138L791.243 297.605C791.77 298.535 792.641 299.221 793.669 299.515Z" fill="#0D0C22"/>
                      <path d="M430.019 1186.18C428.864 1186.68 427.852 1187.46 427.076 1188.45L427.988 1187.87C428.608 1187.3 429.485 1186.63 430.019 1186.18Z" fill="#0D0C22"/>
                      <path d="M641.187 1144.63C641.187 1143.33 640.551 1143.57 640.705 1148.21C640.705 1147.84 640.86 1147.46 640.929 1147.1C641.015 1146.27 641.084 1145.46 641.187 1144.63Z" fill="#0D0C22"/>
                      <path d="M619.284 1186.18C618.129 1186.68 617.118 1187.46 616.342 1188.45L617.254 1187.87C617.873 1187.3 618.751 1186.63 619.284 1186.18Z" fill="#0D0C22"/>
                      <path d="M281.304 1196.06C280.427 1195.3 279.354 1194.8 278.207 1194.61C279.136 1195.06 280.065 1195.51 280.684 1195.85L281.304 1196.06Z" fill="#0D0C22"/>
                      <path d="M247.841 1164.01C247.704 1162.66 247.288 1161.35 246.619 1160.16C247.093 1161.39 247.489 1162.66 247.806 1163.94L247.841 1164.01Z" fill="#0D0C22"/>
                      <path d="M472.623 590.836C426.682 610.503 374.546 632.802 306.976 632.802C278.71 632.746 250.58 628.868 223.353 621.274L270.086 1101.08C271.74 1121.13 280.876 1139.83 295.679 1153.46C310.482 1167.09 329.87 1174.65 349.992 1174.65C349.992 1174.65 416.254 1178.09 438.365 1178.09C462.161 1178.09 533.516 1174.65 533.516 1174.65C553.636 1174.65 573.019 1167.08 587.819 1153.45C602.619 1139.82 611.752 1121.13 613.406 1101.08L663.459 570.876C641.091 563.237 618.516 558.161 593.068 558.161C549.054 558.144 513.591 573.303 472.623 590.836Z" fill="#FFDD00"/>
                      <path d="M78.6885 386.132L79.4799 386.872L79.9962 387.182C79.5987 386.787 79.1603 386.435 78.6885 386.132Z" fill="#0D0C22"/>
                      <path d="M879.567 341.849L872.53 306.352C866.215 274.503 851.882 244.409 819.19 232.898C808.711 229.215 796.821 227.633 788.786 220.01C780.751 212.388 778.376 200.55 776.518 189.572C773.076 169.423 769.842 149.257 766.314 129.143C763.269 111.85 760.86 92.4243 752.928 76.56C742.604 55.2584 721.182 42.8009 699.88 34.559C688.965 30.4844 677.826 27.0375 666.517 24.2352C613.297 10.1947 557.342 5.03277 502.591 2.09047C436.875 -1.53577 370.983 -0.443234 305.422 5.35968C256.625 9.79894 205.229 15.1674 158.858 32.0469C141.91 38.224 124.445 45.6399 111.558 58.7341C95.7448 74.8221 90.5829 99.7026 102.128 119.765C110.336 134.012 124.239 144.078 138.985 150.737C158.192 159.317 178.251 165.846 198.829 170.215C256.126 182.879 315.471 187.851 374.007 189.968C438.887 192.586 503.87 190.464 568.44 183.618C584.408 181.863 600.347 179.758 616.257 177.304C634.995 174.43 647.022 149.928 641.499 132.859C634.891 112.453 617.134 104.538 597.055 107.618C594.095 108.082 591.153 108.512 588.193 108.942L586.06 109.252C579.257 110.113 572.455 110.915 565.653 111.661C551.601 113.175 537.515 114.414 523.394 115.378C491.768 117.58 460.057 118.595 428.363 118.647C397.219 118.647 366.058 117.769 334.983 115.722C320.805 114.793 306.661 113.611 292.552 112.177C286.134 111.506 279.733 110.801 273.333 110.009L267.241 109.235L265.917 109.046L259.602 108.134C246.697 106.189 233.792 103.953 221.025 101.251C219.737 100.965 218.584 100.249 217.758 99.2193C216.932 98.1901 216.482 96.9099 216.482 95.5903C216.482 94.2706 216.932 92.9904 217.758 91.9612C218.584 90.9319 219.737 90.2152 221.025 89.9293H221.266C232.33 87.5721 243.479 85.5589 254.663 83.8038C258.392 83.2188 262.131 82.6453 265.882 82.0832H265.985C272.988 81.6186 280.026 80.3625 286.994 79.5366C347.624 73.2301 408.614 71.0801 469.538 73.1014C499.115 73.9618 528.676 75.6996 558.116 78.6935C564.448 79.3474 570.746 80.0357 577.043 80.8099C579.452 81.1025 581.878 81.4465 584.305 81.7391L589.191 82.4445C603.438 84.5667 617.61 87.1419 631.708 90.1703C652.597 94.7128 679.422 96.1925 688.713 119.077C691.673 126.338 693.015 134.408 694.649 142.03L696.731 151.752C696.786 151.926 696.826 152.105 696.852 152.285C701.773 175.227 706.7 198.169 711.632 221.111C711.994 222.806 712.002 224.557 711.657 226.255C711.312 227.954 710.621 229.562 709.626 230.982C708.632 232.401 707.355 233.6 705.877 234.504C704.398 235.408 702.75 235.997 701.033 236.236H700.895L697.884 236.649L694.908 237.044C685.478 238.272 676.038 239.419 666.586 240.486C647.968 242.608 629.322 244.443 610.648 245.992C573.539 249.077 536.356 251.102 499.098 252.066C480.114 252.57 461.135 252.806 442.162 252.771C366.643 252.712 291.189 248.322 216.173 239.625C208.051 238.662 199.93 237.629 191.808 236.58C198.106 237.389 187.231 235.96 185.029 235.651C179.867 234.928 174.705 234.177 169.543 233.397C152.216 230.798 134.993 227.598 117.7 224.793C96.7944 221.352 76.8005 223.073 57.8906 233.397C42.3685 241.891 29.8055 254.916 21.8776 270.735C13.7217 287.597 11.2956 305.956 7.64786 324.075C4.00009 342.193 -1.67805 361.688 0.472751 380.288C5.10128 420.431 33.165 453.054 73.5313 460.35C111.506 467.232 149.687 472.807 187.971 477.556C338.361 495.975 490.294 498.178 641.155 484.129C653.44 482.982 665.708 481.732 677.959 480.378C681.786 479.958 685.658 480.398 689.292 481.668C692.926 482.938 696.23 485.005 698.962 487.717C701.694 490.429 703.784 493.718 705.08 497.342C706.377 500.967 706.846 504.836 706.453 508.665L702.633 545.797C694.936 620.828 687.239 695.854 679.542 770.874C671.513 849.657 663.431 928.434 655.298 1007.2C653.004 1029.39 650.71 1051.57 648.416 1073.74C646.213 1095.58 645.904 1118.1 641.757 1139.68C635.218 1173.61 612.248 1194.45 578.73 1202.07C548.022 1209.06 516.652 1212.73 485.161 1213.01C450.249 1213.2 415.355 1211.65 380.443 1211.84C343.173 1212.05 297.525 1208.61 268.756 1180.87C243.479 1156.51 239.986 1118.36 236.545 1085.37C231.957 1041.7 227.409 998.039 222.9 954.381L197.607 711.615L181.244 554.538C180.968 551.94 180.693 549.376 180.435 546.76C178.473 528.023 165.207 509.681 144.301 510.627C126.407 511.418 106.069 526.629 108.168 546.76L120.298 663.214L145.385 904.104C152.532 972.528 159.661 1040.96 166.773 1109.41C168.15 1122.52 169.44 1135.67 170.885 1148.78C178.749 1220.43 233.465 1259.04 301.224 1269.91C340.799 1276.28 381.337 1277.59 421.497 1278.24C472.979 1279.07 524.977 1281.05 575.615 1271.72C650.653 1257.95 706.952 1207.85 714.987 1130.13C717.282 1107.69 719.576 1085.25 721.87 1062.8C729.498 988.559 737.115 914.313 744.72 840.061L769.601 597.451L781.009 486.263C781.577 480.749 783.905 475.565 787.649 471.478C791.392 467.391 796.352 464.617 801.794 463.567C823.25 459.386 843.761 452.245 859.023 435.916C883.318 409.918 888.153 376.021 879.567 341.849ZM72.4301 365.835C72.757 365.68 72.1548 368.484 71.8967 369.792C71.8451 367.813 71.9483 366.058 72.4301 365.835ZM74.5121 381.94C74.6842 381.819 75.2003 382.508 75.7337 383.334C74.925 382.576 74.4089 382.009 74.4949 381.94H74.5121ZM76.5597 384.641C77.2996 385.897 77.6953 386.689 76.5597 384.641V384.641ZM80.672 387.979H80.7752C80.7752 388.1 80.9645 388.22 81.0333 388.341C80.9192 388.208 80.7925 388.087 80.6548 387.979H80.672ZM800.796 382.989C793.088 390.319 781.473 393.726 769.996 395.43C641.292 414.529 510.713 424.199 380.597 419.932C287.476 416.749 195.336 406.407 103.144 393.382C94.1102 392.109 84.3197 390.457 78.1082 383.798C66.4078 371.237 72.1548 345.944 75.2003 330.768C77.9878 316.865 83.3218 298.334 99.8572 296.355C125.667 293.327 155.64 304.218 181.175 308.09C211.917 312.781 242.774 316.538 273.745 319.36C405.925 331.405 540.325 329.529 671.92 311.91C695.905 308.686 719.805 304.941 743.619 300.674C764.835 296.871 788.356 289.731 801.175 311.703C809.967 326.673 811.137 346.701 809.778 363.615C809.359 370.984 806.139 377.915 800.779 382.989H800.796Z" fill="#0D0C22"/>
                    </svg>
                    Buy Me a Coffee
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipProvider>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-card rounded-lg shadow-lg border p-4 sticky top-24">
            <div className="space-y-6">
              {/* Search */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search characters..."
                    className="pl-9 h-10 bg-background"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Quick Filters */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">Quick Filters</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      variant={selectedCategory === 'baldurs-gate' ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/80"
                      onClick={() => {
                        setSelectedCategory(prev => prev === 'baldurs-gate' ? null : 'baldurs-gate');
                        setCurrentPage(1);
                      }}
                    >
                      BG3
                    </Badge>
                    <Badge 
                      variant={selectedCategory === 'genshin' ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/80"
                      onClick={() => {
                        setSelectedCategory(prev => prev === 'genshin' ? null : 'genshin');
                        setCurrentPage(1);
                      }}
                    >
                      Genshin
                    </Badge>
                    <Badge 
                      variant={selectedCategory === 'anime' ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/80"
                      onClick={() => {
                        setSelectedCategory(prev => prev === 'anime' ? null : 'anime');
                        setCurrentPage(1);
                      }}
                    >
                      Anime
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div>
                <div className="text-sm font-medium mb-2">Categories</div>
                <ScrollArea className="h-[calc(100vh-350px)]">
                  <div className="space-y-4">
                    {categories.map((category) => (
                      <div key={category.id} className="space-y-2">
                        <button
                          onClick={() => {
                            toggleCategory(category.id);
                            setSelectedCategory(selectedCategory === category.id ? null : category.id);
                            setSelectedSubcategory(null); // Clear subcategory when changing category
                            setCurrentPage(1); // Reset page when changing category
                          }}
                          className={cn(
                            "flex items-center justify-between w-full text-sm font-medium transition-colors rounded-md px-2 py-1",
                            selectedCategory === category.id 
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-accent"
                          )}
                        >
                          <span>{category.name}</span>
                          {expandedCategories.includes(category.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                        
                        {expandedCategories.includes(category.id) && (
                          <div className="pl-4 space-y-1">
                            {category.subcategories?.map((subcategory) => (
                              <button
                                key={subcategory.id}
                                onClick={() => {
                                  setSelectedCategory(category.id);
                                  setSelectedSubcategory(selectedSubcategory === subcategory.id ? null : subcategory.id);
                                }}
                                className={cn(
                                  "block w-full text-left text-sm py-1 px-2 rounded transition-colors",
                                  selectedSubcategory === subcategory.id 
                                    ? "bg-primary/10 text-primary font-medium"
                                    : selectedCategory === category.id
                                    ? "text-primary font-medium"
                                    : "hover:text-primary"
                                )}
                              >
                                {subcategory.name}
                                <span className="text-xs text-muted-foreground ml-2">
                                  ({subcategory.characters.length})
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search Results Info */}
          {(searchQuery || selectedCategory || selectedSubcategory) && (
            <div className="mb-6 flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {searchQuery 
                    ? `Search results for "${searchQuery}"` 
                    : selectedSubcategory
                    ? `Filtered by ${categories.find(c => c.id === selectedCategory)?.subcategories?.find(s => s.id === selectedSubcategory)?.name}`
                    : selectedCategory
                    ? `Filtered by ${categories.find(c => c.id === selectedCategory)?.name}`
                    : 'Filtered results'
                  }
                </h2>
                <p className="text-sm text-muted-foreground">
                  Found {filteredCharacters.length} character{filteredCharacters.length !== 1 ? 's' : ''}
                </p>
              </div>
              {(searchQuery || selectedCategory || selectedSubcategory) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                    setSelectedSubcategory(null);
                    setCurrentPage(1); // Reset page when clearing filters
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCharacters.map((character) => (
              <Card 
                key={character.id}
                className="group relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleCharacterSelect(character)}
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                  <Image
                    src={character.image}
                    alt={character.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-xl font-semibold">{character.name}</h3>
                    <p className="text-sm opacity-90">{character.source}</p>
                    <span className="inline-block px-2 py-1 rounded-full bg-white/20 text-xs mt-2">
                      {character.gender}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showPromptDialog} onOpenChange={setShowPromptDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Choose System Prompt</DialogTitle>
            <DialogDescription>
              Select how you want the AI to roleplay as {selectedCharacter?.name}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="preset" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preset">AI Generated</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
            
            <TabsContent value="preset" className="mt-4 space-y-4">
              <div className="relative">
                <div className="absolute right-0 top-0 p-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRerollPrompt();
                    }}
                    disabled={isGeneratingPrompt || !ollamaConnected}
                    className="h-8 w-8"
                    title={ollamaConnected ? "Generate new prompt" : "Ollama not connected"}
                  >
                    <RefreshCw className={cn(
                      "h-4 w-4",
                      isGeneratingPrompt && "animate-spin"
                    )} />
                  </Button>
                </div>
                <div className="pr-10">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {currentPrompt || selectedCharacter?.systemPrompt}
                  </p>
                </div>
                {error && (
                  <div className="mt-2 p-2 text-sm text-red-500 bg-red-100 rounded">
                    {error}
                  </div>
                )}
                {!llmLoaded && isGeneratingPrompt && (
                  <div className="mt-2 w-full">
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary animate-progress" />
                    </div>
                  </div>
                )}
              </div>
              <Button 
                className="w-full"
                onClick={() => handleStartChat(currentPrompt || selectedCharacter?.systemPrompt || '')}
              >
                Start Chat
              </Button>
            </TabsContent>

            <TabsContent value="custom" className="mt-4 space-y-4">
              <textarea
                className="w-full min-h-[150px] p-3 rounded-md border bg-background"
                placeholder="Enter your custom system prompt..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />
              <Button 
                className="w-full"
                onClick={() => handleStartChat(customPrompt)}
                disabled={!customPrompt.trim()}
              >
                Start Chat
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={showCustomModelDialog} onOpenChange={setShowCustomModelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Setup Custom Model</DialogTitle>
            <DialogDescription>
              Enter the path or name of your custom Ollama model
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="modelPath">Model Path</Label>
              <Input
                id="modelPath"
                placeholder="e.g., llama2:13b or mistral:7b"
                value={customModelPath}
                onChange={(e) => setCustomModelPath(e.target.value)}
              />
            </div>
            <Button onClick={handleCustomModelSetup} className="w-full">
              Setup Model
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showNewCharacterDialog} onOpenChange={setShowNewCharacterDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Character</DialogTitle>
            <DialogDescription>
              Add a new character to your collection
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Character Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Sakura Haruno"
                  value={newCharacter.name}
                  onChange={(e) => setNewCharacter(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Source Material</Label>
                <Input
                  id="source"
                  placeholder="e.g., Naruto"
                  value={newCharacter.source}
                  onChange={(e) => setNewCharacter(prev => ({ ...prev, source: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Character Image</Label>
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer",
                  isDragging && "border-primary bg-accent"
                )}
              >
                <input {...getInputProps()} />
                {imagePreview ? (
                  <div className="relative aspect-[3/4] w-40 mx-auto">
                    <Image
                      src={imagePreview}
                      alt="Character preview"
                      fill
                      className="object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImagePreview(null);
                        setNewCharacter(prev => ({ ...prev, image: '' }));
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Drag and drop an image here, or click to select
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <div className="flex gap-4">
                {['Male', 'Female', 'Other'].map((gender) => (
                  <Button
                    key={gender}
                    variant={newCharacter.gender === gender ? "default" : "outline"}
                    onClick={() => setNewCharacter(prev => ({ ...prev, gender }))}
                  >
                    {gender}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>System Prompt</Label>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={async () => {
                    if (!newCharacter.name || !newCharacter.source) {
                      setError('Please fill in character name and source first');
                      return;
                    }
                    const prompt = await generateSystemPrompt({
                      ...newCharacter,
                      id: 'temp'
                    });
                    setNewCharacter(prev => ({ ...prev, systemPrompt: prompt }));
                  }}
                  disabled={isGeneratingPrompt || !ollamaConnected}
                  className="h-8 w-8"
                >
                  <RefreshCw className={cn(
                    "h-4 w-4",
                    isGeneratingPrompt && "animate-spin"
                  )} />
                </Button>
              </div>
              <textarea
                className="w-full min-h-[150px] p-3 rounded-md border bg-background"
                placeholder="Enter character's system prompt or use the reroll button..."
                value={newCharacter.systemPrompt}
                onChange={(e) => setNewCharacter(prev => ({ ...prev, systemPrompt: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Chat Temperature</Label>
              <div className="space-y-4">
                <Slider
                  value={[newCharacter.temperature]}
                  onValueChange={([value]) => setNewCharacter(prev => ({ ...prev, temperature: value }))}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>More Focused (0)</span>
                  <span>More Creative (1)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowNewCharacterDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateCharacter}
              disabled={!newCharacter.name || !newCharacter.source || !newCharacter.systemPrompt || !newCharacter.image}
            >
              Create Character
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configure API Keys</DialogTitle>
            <DialogDescription>
              Enter your API keys for different providers. Keys are stored locally in your browser.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>OpenAI API Key</Label>
              <div className="relative">
                <Input
                  type={showApiKeys.openai ? "text" : "password"}
                  placeholder="Enter your API key..."
                  value={apiKeys.openai}
                  autoComplete="off"
                  onChange={(e) => {
                    setApiKeys(prev => ({ ...prev, openai: e.target.value }));
                    setKeyStatus(prev => ({ ...prev, openai: 'untested' }));
                  }}
                />
                <div className="absolute right-0 top-0 h-full flex">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="px-3 hover:bg-transparent"
                    onClick={() => setShowApiKeys(prev => ({ ...prev, openai: !prev.openai }))}
                  >
                    {showApiKeys.openai ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="px-3 hover:bg-transparent"
                    disabled={!apiKeys.openai || isTestingKey.openai}
                    onClick={async () => {
                      setIsTestingKey(prev => ({ ...prev, openai: true }));
                      const isValid = await testApiKey('openai', apiKeys.openai);
                      setKeyStatus(prev => ({ ...prev, openai: isValid ? 'valid' : 'invalid' }));
                      setIsTestingKey(prev => ({ ...prev, openai: false }));
                    }}
                  >
                    {isTestingKey.openai ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <span className="text-xs">Test</span>
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Used for GPT-3.5 and GPT-4 models</p>
                {keyStatus.openai !== 'untested' && (
                  <Badge variant={keyStatus.openai === 'valid' ? 'default' : 'destructive'}>
                    {keyStatus.openai === 'valid' ? 'Valid' : 'Invalid'}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Anthropic API Key</Label>
              <div className="relative">
                <Input
                  type={showApiKeys.anthropic ? "text" : "password"}
                  placeholder="Enter your API key..."
                  value={apiKeys.anthropic}
                  autoComplete="off"
                  onChange={(e) => {
                    setApiKeys(prev => ({ ...prev, anthropic: e.target.value }));
                    setKeyStatus(prev => ({ ...prev, anthropic: 'untested' }));
                  }}
                />
                <div className="absolute right-0 top-0 h-full flex">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="px-3 hover:bg-transparent"
                    onClick={() => setShowApiKeys(prev => ({ ...prev, anthropic: !prev.anthropic }))}
                  >
                    {showApiKeys.anthropic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="px-3 hover:bg-transparent"
                    disabled={!apiKeys.anthropic || isTestingKey.anthropic}
                    onClick={async () => {
                      setIsTestingKey(prev => ({ ...prev, anthropic: true }));
                      const isValid = await testApiKey('anthropic', apiKeys.anthropic);
                      setKeyStatus(prev => ({ ...prev, anthropic: isValid ? 'valid' : 'invalid' }));
                      setIsTestingKey(prev => ({ ...prev, anthropic: false }));
                    }}
                  >
                    {isTestingKey.anthropic ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <span className="text-xs">Test</span>
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Used for Claude models</p>
                {keyStatus.anthropic !== 'untested' && (
                  <Badge variant={keyStatus.anthropic === 'valid' ? 'default' : 'destructive'}>
                    {keyStatus.anthropic === 'valid' ? 'Valid' : 'Invalid'}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Google Gemini API Key</Label>
              <div className="relative">
                <Input
                  type={showApiKeys.gemini ? "text" : "password"}
                  placeholder="Enter your API key..."
                  value={apiKeys.gemini}
                  autoComplete="off"
                  onChange={(e) => {
                    setApiKeys(prev => ({ ...prev, gemini: e.target.value }));
                    setKeyStatus(prev => ({ ...prev, gemini: 'untested' }));
                  }}
                />
                <div className="absolute right-0 top-0 h-full flex">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="px-3 hover:bg-transparent"
                    onClick={() => setShowApiKeys(prev => ({ ...prev, gemini: !prev.gemini }))}
                  >
                    {showApiKeys.gemini ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="px-3 hover:bg-transparent"
                    disabled={!apiKeys.gemini || isTestingKey.gemini}
                    onClick={async () => {
                      setIsTestingKey(prev => ({ ...prev, gemini: true }));
                      const isValid = await testApiKey('gemini', apiKeys.gemini);
                      setKeyStatus(prev => ({ ...prev, gemini: isValid ? 'valid' : 'invalid' }));
                      setIsTestingKey(prev => ({ ...prev, gemini: false }));
                    }}
                  >
                    {isTestingKey.gemini ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <span className="text-xs">Test</span>
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Used for Gemini Pro model</p>
                {keyStatus.gemini !== 'untested' && (
                  <Badge variant={keyStatus.gemini === 'valid' ? 'default' : 'destructive'}>
                    {keyStatus.gemini === 'valid' ? 'Valid' : 'Invalid'}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setShowApiKeyDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                localStorage.setItem('llm_api_keys', JSON.stringify(apiKeys));
                setShowApiKeyDialog(false);
              }}
              disabled={Object.values(keyStatus).some(status => status === 'invalid')}
            >
              Save Keys
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 