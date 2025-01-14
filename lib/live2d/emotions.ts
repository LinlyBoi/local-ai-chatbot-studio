import { MainEmotion } from '@/types/emotions';

export type EmotionType = MainEmotion | 'neutral' | 'thinking' | 'greeting';

// Motion mappings for each emotion
export const EMOTION_MOTIONS: Record<EmotionType, string[]> = {
  shy: ['w-adult01-blushed', 'w-adult02-blushed', 'w-adult05-blushed'],
  happy: ['w-adult02-glad', 'w-adult12-glad', 'w-adult02-delicious'],
  thinking: ['w-adult01-think', 'w-adult05-think'],
  troubled: ['w-adult02-trouble', 'w-adult05-trouble'],
  neutral: ['w-adult01-pose', 'w-adult02-pose', 'w-adult05-pose'],
  greeting: [
    'w-adult01-shakehand',
    'w-cool01-shakehand',
    'w-happy01-shakehand',
    'w-happy02-shakehand',
    'w-happy11-shakehand',
    'w-normal15-greeting'
  ],
  blushing: ['w-adult11-blushed03', 'w-adult01-blushed'],
  horny: ['w-adult11-blushed03', 'w-adult02-delicious', 'w-adult05-blushed'],
  excited: ['w-adult02-glad', 'w-adult12-glad', 'w-adult02-delicious'],
  flirty: ['w-adult02-blushed', 'w-adult05-blushed', 'w-adult11-blushed03'],
  submissive: ['w-adult01-blushed', 'w-adult11-blushed03', 'w-adult05-blushed'],
  trembling: ['w-adult11-blushed03', 'face_breath_01', 'w-adult02-trouble'],
  panting: ['face_breath_01', 'w-adult02-delicious', 'w-adult11-blushed03'],
  whimpering: ['w-adult05-trouble', 'face_cry_02', 'w-adult02-blushed'],
  leaking: ['w-adult11-blushed03', 'face_closeeye_03', 'w-adult02-delicious'],
  pleased: ['w-adult02-delicious', 'face_smile_15', 'w-adult11-glad02']
};

// Keywords that trigger each emotion
export const EMOTION_TRIGGERS: Record<EmotionType, string[]> = {
  happy: [
    'happy', 'excited', 'glad', 'delicious', 'pleasure',
    'love', 'appreciate', 'thank', 'yay', 'hehe'
  ],
  greeting: [
    'hello', 'hi', 'hey', 'greetings', 'welcome', 'wave',
    'good morning', 'good afternoon', 'good evening'
  ],
  horny: [
    'horny', 'lewd', 'naughty', 'dirty', 'kinky',
    'aroused', 'turned on', 'hot', 'mmm'
  ],
  submissive: [
    'submissive', 'obedient', 'good girl', 'please',
    'beg', 'serve', 'master', 'mistress'
  ],
  flirty: [
    'flirt', 'tease', 'wink', 'playful', 'seductive',
    'alluring', 'tempting', 'enticing'
  ],
  troubled: [
    'troubled', 'worried', 'concerned', 'anxious',
    'uneasy', 'nervous', 'distressed'
  ],
  blushing: [
    'blush', 'flush', 'redden', 'embarrassed',
    'shy', 'timid', 'bashful'
  ],
  trembling: [
    'tremble', 'shake', 'quiver', 'shiver',
    'quake', 'vibrate', 'tremor'
  ],
  panting: [
    'pant', 'breathe', 'gasp', 'huff',
    'wheeze', 'breathless', 'out of breath'
  ],
  whimpering: [
    'whimper', 'moan', 'whine', 'cry',
    'sob', 'sniffle', 'weep'
  ],
  leaking: [
    'leak', 'drip', 'wet', 'moist',
    'damp', 'soaked', 'dripping'
  ],
  pleased: [
    'pleased', 'satisfied', 'content', 'happy',
    'delighted', 'gratified', 'fulfilled'
  ],
  shy: [
    'shy', 'embarrassed', 'nervous', 'fidget', 'blush',
    'uhm', 'um', 'uh', 'eep'
  ],
  excited: [
    'excited', 'cant wait', 'amazing', 'wonderful',
    'fantastic', 'awesome', 'yes', 'please', 'omg'
  ],
  thinking: [
    'think', 'hmm', 'well', 'maybe', 'programming',
    'computers', 'code', 'let me see'
  ],
  neutral: [
    'ok', 'alright', 'i see', 'understood', 'continue',
    'proceed', 'next', 'mhm'
  ]
};

// Helper function to get a random motion for an emotion
export function getRandomMotion(emotion: EmotionType): string {
  console.log('Getting random motion for emotion:', emotion);
  const motions = EMOTION_MOTIONS[emotion] || EMOTION_MOTIONS.neutral;
  console.log('Available motions:', motions);
  
  if (!motions || motions.length === 0) {
    console.error('No motions found for emotion:', emotion);
    return EMOTION_MOTIONS.neutral[0];
  }
  
  const motion = motions[Math.floor(Math.random() * motions.length)];
  console.log('Selected motion:', motion);
  return motion;
}

// Helper function to map expression to emotion
function mapExpressionToEmotion(expression: string): EmotionType {
  const exp = expression.toLowerCase().trim();
  
  // Combined emotions with intensity
  if (exp.includes('shyly smiles') || exp.includes('shy smile') || exp.includes('nervously smiles')) {
    return 'shy'; // Will be followed by 'happy' in sequence
  }
  if (exp.includes('nervously waves') || exp.includes('shyly waves')) {
    return 'shy'; // Will be followed by 'greeting' in sequence
  }
  if (exp.includes('excitedly fidgets')) {
    return 'excited'; // Will be followed by 'shy' in sequence
  }

  // Intensity modifiers
  if (exp.includes('blushes deeply') || exp.includes('intensely blushes')) {
    return 'shy';
  }
  if (exp.includes('blushes lightly') || exp.includes('slightly blushes')) {
    return 'shy';
  }
  if (exp.includes('intensely trembles') || exp.includes('strongly trembles')) {
    return 'trembling';
  }
  if (exp.includes('slightly trembles') || exp.includes('lightly trembles')) {
    return 'trembling';
  }
  
  // Standard emotion mappings
  if (exp.includes('excitedly') || exp.includes('excited')) {
    return 'excited';
  }
  if (exp.includes('smiling') || exp.includes('smiles')) {
    return 'happy';
  }
  
  // Direct wave/greeting matches
  if (/^(wave|waves|greet|greets|hi|hello)s?$/.test(exp)) {
    return 'greeting';
  }
  
  // Wave/greeting with additional words
  if (exp.includes('wave') || exp.includes('greet') || exp.includes('hello') || exp.includes('hi ')) {
    return 'greeting';
  }
  
  // Intimate expressions
  if (exp.includes('trembl') || exp.includes('pants') || exp.includes('whimper')) {
    return 'horny';
  }
  if (exp.includes('leak')) {
    return 'leaking';
  }
  if (exp.includes('moan') || exp.includes('beg') || exp.includes('submit')) {
    return 'submissive';
  }
  if (exp.includes('pleased') || exp.includes('satisfied')) {
    return 'pleased';
  }
  
  // Basic emotions
  if (exp.includes('happy') || exp.includes('smile')) {
    return 'happy';
  }
  if (exp.includes('blush') || exp.includes('shy') || exp.includes('nervous') || exp.includes('fidget')) {
    return 'shy';
  }
  if (exp.includes('think') || exp.includes('ponder')) {
    return 'thinking';
  }
  if (exp.includes('trouble') || exp.includes('worried')) {
    return 'troubled';
  }
  
  return 'neutral';
}

// Helper function to detect emotion from text
export function detectEmotion(text: string): EmotionType {
  console.log('Detecting emotion from text:', text);
  const expressions = text.match(/\*(.*?)\*/g);
  
  if (!expressions) {
    console.log('No expressions found in text');
    return 'neutral';
  }

  console.log('Found expressions:', expressions);
  
  // Get the last expression for the current emotion
  const lastExpression = expressions[expressions.length - 1]
    .replace(/\*/g, '')
    .trim();
    
  console.log('Processing last expression:', lastExpression);
  const emotion = mapExpressionToEmotion(lastExpression);
  console.log('Mapped to emotion:', emotion);
  return emotion;
}

// Helper function to get all emotions in sequence
export function getEmotionSequence(text: string): { emotions: EmotionType[], matches: RegExpMatchArray[] } {
  console.log('Getting emotion sequence from:', text);
  
  if (typeof text !== 'string') {
    console.log('Invalid input, not a string:', text);
    return { emotions: ['neutral'], matches: [] };
  }
  
  const expressions = text.match(/\*(.*?)\*/g);
  if (!expressions) {
    console.log('No expressions found');
    return { emotions: ['neutral'], matches: [] };
  }

  console.log('Found expressions:', expressions);
  
  const matches = expressions.map(exp => exp.match(/\*(.*?)\*/) as RegExpMatchArray);
  const sequence = matches
    .map(match => {
      const cleaned = match[1].trim();
      console.log('Processing expression:', cleaned);
      
      // Handle combined emotions
      if (cleaned.includes('shyly smiles') || cleaned.includes('shy smile') || cleaned.includes('nervously smiles')) {
        return ['shy' as EmotionType, 'happy' as EmotionType];
      }
      if (cleaned.includes('nervously waves') || cleaned.includes('shyly waves')) {
        return ['shy' as EmotionType, 'greeting' as EmotionType];
      }
      if (cleaned.includes('excitedly fidgets')) {
        return ['excited' as EmotionType, 'shy' as EmotionType];
      }
      
      const emotion = mapExpressionToEmotion(cleaned);
      console.log('Mapped to emotion:', emotion);
      return [emotion];
    })
    .flat()
    .filter((emotion, index, self) => {
      const isDuplicate = index > 0 && emotion === self[index - 1];
      if (isDuplicate) {
        console.log('Removing duplicate emotion:', emotion);
      }
      return !isDuplicate;
    });

  console.log('Final emotion sequence:', sequence);
  return { emotions: sequence as EmotionType[], matches };
}

// Helper function to get emotion intensity
export function getEmotionIntensity(message: string, emotion: MainEmotion): number {
  const expressions = message.match(/\*(.*?)\*/g);
  if (!expressions) return 0;

  const emotionMappings: Record<string, { emotion: MainEmotion, intensity: number }> = {
    // Shy emotions with reduced intensities
    'peeks': { emotion: 'shy', intensity: 5 },
    'fidgets': { emotion: 'shy', intensity: 8 },
    'blushes lightly': { emotion: 'shy', intensity: 10 },
    'blushes': { emotion: 'shy', intensity: 15 },
    'blushes deeply': { emotion: 'shy', intensity: 20 },
    'hides face': { emotion: 'shy', intensity: 25 },
    'covers face': { emotion: 'shy', intensity: 30 },
    'extremely flustered': { emotion: 'shy', intensity: 35 },
    'completely embarrassed': { emotion: 'shy', intensity: 40 },

    // Intimate expressions
    'trembles': { emotion: 'horny', intensity: 20 },
    'pants': { emotion: 'horny', intensity: 25 },
    'whimpers': { emotion: 'submissive', intensity: 30 },
    'squirms': { emotion: 'horny', intensity: 35 },
    'gasps': { emotion: 'horny', intensity: 40 },
    'leaks': { emotion: 'horny', intensity: 45 },
    'moans': { emotion: 'horny', intensity: 50 },
    'begs': { emotion: 'submissive', intensity: 55 },

    // Greeting emotions
    'waves': { emotion: 'greeting', intensity: 25 },
    'waves happily': { emotion: 'greeting', intensity: 30 },
    'greets': { emotion: 'greeting', intensity: 25 },
    'greets happily': { emotion: 'greeting', intensity: 30 },

    // Happy emotions
    'smiles': { emotion: 'happy', intensity: 35 },
    'grins': { emotion: 'happy', intensity: 40 },
    'giggles': { emotion: 'happy', intensity: 45 },
    'laughs': { emotion: 'happy', intensity: 50 },
    'beams': { emotion: 'happy', intensity: 60 },

    // Other base emotions
    'troubled': { emotion: 'troubled', intensity: 25 },
    'excited': { emotion: 'excited', intensity: 35 }
  };

  let totalIntensity = 0;
  let multiplier = emotion === 'shy' ? 0.5 : 1; // Reduce multiplier for shy emotion

  expressions.forEach(exp => {
    const cleanExp = exp.replace(/\*/g, '').toLowerCase().trim();
    for (const [trigger, data] of Object.entries(emotionMappings)) {
      if (cleanExp.includes(trigger) && data.emotion === emotion) {
        totalIntensity += data.intensity * multiplier;
        break;
      }
    }
  });

  // Additional scaling for shy emotion
  if (emotion === 'shy') {
    totalIntensity *= 0.6; // Global reduction for shy emotion
  }

  return Math.min(totalIntensity, 100);
} 