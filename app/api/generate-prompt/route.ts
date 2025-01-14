import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { character, source } = await req.json();

    const prompt = `Generate a creative and detailed system prompt for roleplaying as ${character} from ${source}. The prompt should capture their personality, speech patterns, and key character traits. Format it as a first-person introduction.`;

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama2',
        prompt: prompt,
        stream: false
      }),
    });

    const data = await response.json();
    const generatedPrompt = data.response || '';

    return NextResponse.json({ prompt: generatedPrompt });
  } catch (error) {
    console.error('Error generating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to generate prompt' },
      { status: 500 }
    );
  }
} 