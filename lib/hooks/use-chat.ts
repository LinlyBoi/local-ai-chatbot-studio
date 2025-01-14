import { useState, useEffect } from 'react';
import type { Message as BaseMessage } from '@/types/chat';
import type { 
  Rule34Post, 
  LocalRule34Post, 
  PartialRule34Post, 
  MediaFile as ApiMediaFile, 
  MediaType 
} from '@/types/api';
import type { ComfyGeneration } from '@/types/comfy';

// Local types for API responses
interface MediaFile extends ApiMediaFile {
  url: string;
  width: number;
  height: number;
  type: MediaType;
}

// Extend base Message type with LocalRule34Post
interface Message extends BaseMessage {
  results?: Rule34Post[];
  comfyGeneration?: ComfyGeneration;
  animationKey: string;
}

interface ChatState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  ollamaConnected: boolean;
  shouldShowResults: boolean;
  systemPrompt: string;
  tagHistory: Set<string>;
  expandedResults: Set<string>;
}

const OLLAMA_API = 'http://localhost:11434';
const MODEL_NAME = 'hf.co/QuantFactory/Peach-9B-8k-Roleplay-GGUF:Q8_0';

// Fix TypeScript errors by adding type safety to TAG_MAPPINGS
type TagMappingKey = 
  | 'small' | 'petite' | 'tiny' | 'cute' | 'shy' | 'embarrassed' | 'blushing' 
  | 'nervous' | 'flustered' | 'penis' | 'cock' | 'dick' | 'pussy' | 'vagina'
  | 'small penis' | 'little penis' | 'tiny penis' | 'futanari' | 'futa' 
  | 'dickgirl' | 'girl' | 'anime' | 'hentai' | 'showing' | 'presenting'
  | 'posing' | 'masturbating' | 'touching' | 'playing' | 'happy' | 'sad'
  | 'crying' | 'smiling' | 'laughing' | 'naked' | 'nude' | 'dressed'
  | 'underwear' | 'panties' | 'bra' | 'lewd' | 'ecchi' | 'horny'
  | 'aroused' | 'excited';

const TAG_MAPPINGS: Record<TagMappingKey, string> = {
  // Character traits
  'small': 'small_breasts',
  'petite': 'small_breasts',
  'tiny': 'small_breasts',
  'cute': 'cute',
  'shy': 'shy',
  'embarrassed': 'embarrassed',
  'blushing': 'blush',
  'nervous': 'nervous',
  'flustered': 'embarrassed',
  
  // Body parts
  'penis': 'penis',
  'cock': 'penis',
  'dick': 'penis',
  'pussy': 'pussy',
  'vagina': 'pussy',
  'small penis': 'small_penis',
  'little penis': 'small_penis',
  'tiny penis': 'small_penis',
  
  // Character types
  'futanari': 'futanari',
  'futa': 'futanari',
  'dickgirl': 'futanari',
  'girl': 'female',
  'anime': 'anime',
  'hentai': 'hentai',
  
  // Actions
  'showing': 'presenting',
  'presenting': 'presenting',
  'posing': 'posing',
  'masturbating': 'masturbation',
  'touching': 'touching',
  'playing': 'playing_with_self',
  
  // Emotions
  'happy': 'happy',
  'sad': 'sad',
  'crying': 'crying',
  'smiling': 'smile',
  'laughing': 'laughing',
  
  // Clothing
  'naked': 'nude',
  'nude': 'nude',
  'dressed': 'clothed',
  'underwear': 'underwear',
  'panties': 'panties',
  'bra': 'bra',
  
  // Situations
  'lewd': 'lewd',
  'ecchi': 'ecchi',
  'horny': 'horny',
  'aroused': 'aroused',
  'excited': 'excited'
};

// Add helper function to check if a string is a valid tag mapping key
function isValidTagKey(key: string): key is TagMappingKey {
  return key in TAG_MAPPINGS;
}

// Update convertToSearchTags to handle tag combinations better
const convertToSearchTags = (query: string): string => {
  // First normalize the input by replacing underscores and plus signs with spaces
  let normalizedQuery = query.toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\+/g, ' ');
  
  const words = normalizedQuery.split(/\s+/).filter(Boolean);
  const tags: Set<string> = new Set();
  
  // First pass: check for multi-word matches
  for (let i = 0; i < words.length - 1; i++) {
    const twoWords = `${words[i]} ${words[i + 1]}` as string;
    if (isValidTagKey(twoWords)) {
      tags.add(TAG_MAPPINGS[twoWords]);
      words[i] = '';
      words[i + 1] = '';
    }
  }
  
  // Second pass: check remaining single words
  words.forEach(word => {
    if (word && isValidTagKey(word)) {
      tags.add(TAG_MAPPINGS[word]);
    } else if (word) {
      // If it's not in our mapping but is a valid word, add it directly
      // Keep original word, just remove spaces
      tags.add(word.replace(/\s+/g, '_'));
    }
  });
  
  // Join with spaces for Rule34 API
  return Array.from(tags).join(' ');
};

// Update handleUserCommand to better handle tag search
const handleUserCommand = (text: string): { type: 'search' | 'comfy', query: string } | null => {
  // Check for @comfy command first
  const comfyMatch = text.match(/^@comfy\s+(.+?)(?:\s+|$)/);
  if (comfyMatch) {
    return {
      type: 'comfy',
      query: comfyMatch[1].trim()
    };
  }

  // Extract tag search command
  const tagMatch = text.match(/^!(.+)$/);
  if (tagMatch) {
    // Get everything after the ! prefix
    const searchQuery = tagMatch[1].trim();
    
    // Convert the search query to proper tags
    const formattedTags = convertToSearchTags(searchQuery);
    console.log('Formatted tags for search:', formattedTags);

    return {
      type: 'search',
      query: formattedTags
    };
  }

  return null;
};

export const DEFAULT_SYSTEM_PROMPT = ``;

// Add tag history management
const updateTagHistory = (
  tags: string[], 
  state: ChatState, 
  setState: React.Dispatch<React.SetStateAction<ChatState>>
) => {
  const newTags = new Set(state.tagHistory);
  tags.forEach(tag => newTags.add(tag));
  setState(prev => ({
    ...prev,
    tagHistory: newTags
  }));
};

// Add TenorGif interface
interface TenorGif {
  url: string;
  id: string;
  title: string;
  media: {
    gif: { url: string; width: number; height: number; };
    preview: { url: string; width: number; height: number; };
  };
}

// Update performImageSearch to handle errors better
const performImageSearch = async (query: string, limit: number = 5) => {
  const apiUrl = `${window.location.origin}/api/search`;
  // Format tags: replace spaces with + for API
  const formattedQuery = query.trim().replace(/\s+/g, '+');
  console.log('Performing image search with tags:', formattedQuery);
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: formattedQuery,
        limit
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Search failed:', data);
      throw new Error(data.error || 'Search failed');
    }

    console.log('Raw API response:', data);

    if (!data.posts || !Array.isArray(data.posts)) {
      console.error('Invalid API response:', data);
      return {
        posts: [],
        foundTags: [],
        count: 0
      };
    }

    // Process posts to ensure proper URL structure
    const validPosts = data.posts
      .filter((post: any) => {
        if (!post || typeof post !== 'object') {
          console.warn('Invalid post object:', post);
          return false;
        }

        // Rule34 API always includes these URLs
        if (!post.file_url || !post.preview_url) {
          console.warn('Post missing required URLs:', post);
          return false;
        }

        return true;
      })
      .map((post: any): Rule34Post => {
        // Rule34 API returns tags as a space-separated string
        const tags = typeof post.tags === 'string' 
          ? post.tags.split(' ').filter(Boolean)
          : Array.isArray(post.tags)
            ? post.tags
            : [];

        console.log('Processing post:', {
          id: post.id,
          file_url: post.file_url,
          preview_url: post.preview_url,
          tags: tags.slice(0, 5)
        });

        return {
          id: post.id || 0,
          score: post.score || 0,
          tags,
          file_url: post.file_url,
          preview_url: post.preview_url,
          sample_url: post.sample_url,
          width: post.width || 0,
          height: post.height || 0,
          rating: post.rating || '',
          source: post.source || '',
          created_at: post.created_at || post.change?.toString(),
          updated_at: post.updated_at
        };
      });
    
    const limitedPosts = validPosts.slice(0, limit);
    
    // Extract all unique tags from the results
    const foundTags = new Set<string>();
    limitedPosts.forEach((post: Rule34Post) => {
      post.tags.forEach((tag: string) => foundTags.add(tag));
    });

    console.log('Processed posts:', {
      total: limitedPosts.length,
      sample: limitedPosts.slice(0, 2).map((post: Rule34Post) => ({
        id: post.id,
        file_url: post.file_url,
        preview_url: post.preview_url
      }))
    });

    return {
      posts: limitedPosts,
      foundTags: Array.from(foundTags),
      count: data.posts.length
    };
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

// Update handleShowMeCommand to properly handle Rule34 API responses
const handleShowMeCommand = async (
  searchQuery: string, 
  aiResponse: string, 
  state: ChatState,
  setState: React.Dispatch<React.SetStateAction<ChatState>>
): Promise<{
  response: string;
  searchResults?: Rule34Post[];
}> => {
  try {
    const tags = convertToSearchTags(searchQuery);
    console.log('Converted to Rule34 tags:', tags);
    
    const searchData = await performImageSearch(tags, 5);
    console.log('Search results:', {
      count: searchData.posts.length,
      tags: searchData.foundTags.slice(0, 10),
      sampleUrls: searchData.posts.slice(0, 2).map((post: Rule34Post) => post.file_url)
    });
    
    if (searchData.posts && searchData.posts.length > 0) {
      // Format tags for feedback
      const tagFeedback = `Found images with tags: ${searchData.foundTags.slice(0, 10).join(', ')}`;
      updateTagHistory(searchData.foundTags, state, setState);
      
      return {
        response: `${aiResponse}\n${tagFeedback}`,
        searchResults: searchData.posts
      };
    }
  } catch (searchError) {
    console.error('Search error:', searchError);
  }
  
  return { response: aiResponse };
};

// Update handleComfyCommand to check for ComfyUI connection
const handleComfyCommand = async (
  prompt: string,
  aiResponse: string,
  state: ChatState,
  setStateFunc: React.Dispatch<React.SetStateAction<ChatState>>
): Promise<{
  response: string;
  comfyGeneration?: ComfyGeneration;
  searchResults?: Rule34Post[];
}> => {
  try {
    // Check ComfyUI connection first
    const checkResponse = await fetch('/api/comfy/check');
    if (!checkResponse.ok) {
      throw new Error('ComfyUI is not running. Please start ComfyUI and try again.');
    }

    // Get workflow status
    const workflowResponse = await fetch('/api/comfy/workflow');
    if (!workflowResponse.ok) {
      throw new Error('No workflow is loaded in ComfyUI. Please load a workflow first.');
    }

    const response = await fetch('/api/comfy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt,
        useOpenWorkflow: true // This will be handled by the API to use the currently open workflow
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate image');
    }

    const data = await response.json();
    return {
      response: aiResponse || `Generated image for: ${prompt}`,
      comfyGeneration: data
    };
  } catch (error) {
    console.error('ComfyUI generation error:', error);
    return { 
      response: `${aiResponse || ''}\nError: ${error instanceof Error ? error.message : 'Failed to generate image'}`
    };
  }
};

// Update getChatResponse to use setStateFunc
const getChatResponse = async (
  conversation: Message[], 
  currentMessage: string,
  state: ChatState,
  setStateFunc: React.Dispatch<React.SetStateAction<ChatState>>
): Promise<{ 
  response: string; 
  searchResults?: Rule34Post[];
  gif?: TenorGif;
  comfyGeneration?: ComfyGeneration;
}> => {
  try {
    const comfyMatch = currentMessage.match(/@comfy\s+(.+)/);
    if (comfyMatch) {
      const prompt = comfyMatch[1];
      const response = await handleComfyCommand(prompt, '', state, setStateFunc);
      return {
        response: response.response,
        searchResults: response.searchResults,
        comfyGeneration: response.comfyGeneration
      };
    }

    // Get response from Ollama
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: state.systemPrompt },
          ...conversation.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          { role: 'user', content: currentMessage }
        ]
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get chat response');
    }

    const data = await response.json();
    const aiResponse = data.response;

    // Check for ComfyUI command in the AI's response
    const aiComfyMatch = aiResponse.match(/@comfy\s+(.+?)(?:\n|$)/);
    if (aiComfyMatch) {
      const prompt = aiComfyMatch[1];
      const comfyResponse = await handleComfyCommand(prompt, aiResponse, state, setStateFunc);
      return {
        response: comfyResponse.response,
        searchResults: comfyResponse.searchResults,
        comfyGeneration: comfyResponse.comfyGeneration
      };
    }

    // Handle existing show me command
    const showMeMatch = aiResponse.match(/show me\s+(.+?)(?:\n|$)/i);
    if (showMeMatch) {
      const searchQuery = showMeMatch[1];
      const searchData = await performImageSearch(searchQuery);
      return {
        response: aiResponse,
        searchResults: searchData.posts
      };
    }

    return { response: aiResponse };
  } catch (error) {
    console.error('Chat response error:', error);
    throw error;
  }
};

const checkIfUserWantsToSeeMore = (message: string): boolean => {
  const showMoreTriggers = [
    'show more',
    'show all',
    'see more',
    'view more',
    'view all',
    'display more',
    'display all',
    'expand',
    'open results'
  ];
  return showMoreTriggers.some(trigger => message.toLowerCase().includes(trigger));
};

// Update model loading check
const checkModelLoaded = async () => {
  try {
    const response = await fetch(`${OLLAMA_API}/api/tags`);
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.models?.some((model: string) => model === MODEL_NAME) ?? false;
  } catch (error) {
    console.error('Model check error:', error);
    return false;
  }
};

// Update Ollama connection check
const checkOllamaConnection = async (setState: React.Dispatch<React.SetStateAction<ChatState>>) => {
  try {
    // First check if Ollama is running
    const listResponse = await fetch(`${OLLAMA_API}/api/tags`);
    if (!listResponse.ok) {
      throw new Error('Ollama service not available');
    }

    // Then check if our model is loaded
    const modelLoaded = await checkModelLoaded();
    if (!modelLoaded) {
      console.log('Model not found, attempting to pull...');
      const pullResponse = await fetch(`${OLLAMA_API}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: MODEL_NAME,
          insecure: true
        })
      });

      if (!pullResponse.ok) {
        throw new Error(`Failed to pull model. Please run: ollama pull ${MODEL_NAME}`);
      }
    }
    
    setState((prev: ChatState) => ({
      ...prev,
      ollamaConnected: true,
      error: null
    }));
  } catch (error) {
    console.error('Ollama connection error:', error);
    setState((prev: ChatState) => ({
      ...prev,
      ollamaConnected: false,
      error: error instanceof Error ? error.message : 'Failed to connect to Ollama'
    }));
  }
};

export function useChat() {
  const [state, setState] = useState<ChatState>({
    messages: [],
    loading: false,
    error: null,
    ollamaConnected: false,
    shouldShowResults: false,
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    tagHistory: new Set(),
    expandedResults: new Set()
  });

  // Check Ollama connection on mount with immediate retry
  useEffect(() => {
    let mounted = true;
    const checkConnection = async () => {
      try {
        const response = await fetch(`${OLLAMA_API}/api/tags`);
        if (!mounted) return;
        
        if (response.ok) {
          setState(prev => ({ ...prev, ollamaConnected: true, error: null }));
        } else {
          throw new Error('Connection failed');
        }
      } catch (error) {
        if (!mounted) return;
        // Retry once immediately if first attempt fails
        try {
          const retryResponse = await fetch(`${OLLAMA_API}/api/tags`);
          if (!mounted) return;
          
          if (retryResponse.ok) {
            setState(prev => ({ ...prev, ollamaConnected: true, error: null }));
          } else {
            setState(prev => ({
              ...prev,
              ollamaConnected: false,
              error: 'Failed to connect to Ollama'
            }));
          }
        } catch (retryError) {
          if (!mounted) return;
          setState(prev => ({
            ...prev,
            ollamaConnected: false,
            error: 'Failed to connect to Ollama'
          }));
        }
      }
    };

    checkConnection();
    return () => { mounted = false; };
  }, []);

  // Add function to toggle expanded results
  const toggleExpandedResults = (messageId: string) => {
    setState(prev => {
      const newExpanded = new Set(prev.expandedResults);
      if (newExpanded.has(messageId)) {
        newExpanded.delete(messageId);
      } else {
        newExpanded.add(messageId);
      }
      return {
        ...prev,
        expandedResults: newExpanded
      };
    });
  };

  const sendMessage = async (content: string) => {
    try {
      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
      }));

      // Check for user command first
      const userCommand = handleUserCommand(content);
      if (userCommand) {
        // Add user message
        const userMessage: Message = {
          id: Date.now().toString(),
          content: userCommand.type === 'comfy' 
            ? `Generating image with prompt: ${userCommand.query}`
            : `Searching for: ${userCommand.query}`,
          sender: 'user',
          timestamp: new Date(),
          animationKey: Math.random().toString()
        };

        setState(prev => ({
          ...prev,
          messages: [...prev.messages, userMessage]
        }));

        try {
          if (userCommand.type === 'comfy') {
            // Handle ComfyUI generation
            const response = await handleComfyCommand(
              userCommand.query,
              'I will generate an image based on your description.',
              state,
              setState
            );

            const resultMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: response.response,
              sender: 'assistant',
              timestamp: new Date(),
              comfyGeneration: response.comfyGeneration,
              animationKey: Math.random().toString()
            };

            setState(prev => ({
              ...prev,
              messages: [...prev.messages, resultMessage],
              loading: false,
              error: null,
              shouldShowResults: false
            }));
          } else {
            // Handle Rule34 search
            const searchData = await performImageSearch(userCommand.query, 40);
            console.log('Search results to display:', {
              count: searchData.posts.length,
              sampleUrls: searchData.posts.slice(0, 2).map((p: Rule34Post) => p.file_url)
            });
            
            const resultMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: `Here are the results for "${userCommand.query}"\nFound tags: ${searchData.foundTags.slice(0, 10).join(', ')}`,
              sender: 'assistant',
              timestamp: new Date(),
              results: searchData.posts,
              animationKey: Math.random().toString()
            };

            setState(prev => {
              console.log('Adding message with results:', resultMessage);
              updateTagHistory(searchData.foundTags, prev, setState);
              return {
                ...prev,
                messages: [...prev.messages, resultMessage],
                loading: false,
                error: null,
                shouldShowResults: true
              };
            });
          }
          return;
        } catch (error) {
          console.error('Command handling error:', error);
          setState(prev => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to process command'
          }));
          return;
        }
      }

      // Regular message handling
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        sender: 'user',
        timestamp: new Date(),
        animationKey: Math.random().toString()
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage]
      }));

      try {
        if (state.ollamaConnected) {
          const currentState = state;
          const response = await getChatResponse(currentState.messages, content, currentState, setState);
          
          // If response includes show me command, handle it
          if (response.searchResults) {
            const showMeResponse = await handleShowMeCommand(
              content,
              response.response,
              currentState,
              setState
            );
            
            const aiMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: showMeResponse.response,
              sender: 'assistant',
              timestamp: new Date(),
              results: showMeResponse.searchResults,
              gif: response.gif,
              animationKey: Math.random().toString()
            };

            setState(prev => ({
              ...prev,
              messages: [...prev.messages, aiMessage],
              loading: false,
              error: null,
              shouldShowResults: Boolean(showMeResponse.searchResults)
            }));
          } else {
            // Regular response without search results
            const aiMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: response.response,
              sender: 'assistant',
              timestamp: new Date(),
              gif: response.gif,
              animationKey: Math.random().toString()
            };

            setState(prev => ({
              ...prev,
              messages: [...prev.messages, aiMessage],
              loading: false,
              error: null,
              shouldShowResults: false
            }));
          }
        } else {
          setState(prev => ({
            ...prev,
            loading: false,
            error: 'Ollama is not connected'
          }));
        }
      } catch (error) {
        console.error('Message processing error:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to process message'
        }));
      }
    } catch (error) {
      console.error('Chat error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to send message'
      }));
    }
  };

  const setShowResults = (show: boolean) => {
    setState(prev => ({
      ...prev,
      shouldShowResults: show
    }));
  };

  const setSystemPrompt = (newPrompt: string) => {
    setState(prev => ({
      ...prev,
      systemPrompt: newPrompt
    }));
  };

  return {
    messages: state.messages,
    loading: state.loading,
    error: state.error,
    ollamaConnected: state.ollamaConnected,
    shouldShowResults: state.shouldShowResults,
    expandedResults: state.expandedResults,
    sendMessage,
    setShowResults,
    retryConnection: checkOllamaConnection,
    setSystemPrompt,
    toggleExpandedResults
  };
}