import { NextResponse } from 'next/server';

const OLLAMA_API = 'http://localhost:11434';
const MODEL_NAME = 'hf.co/QuantFactory/Peach-9B-8k-Roleplay-GGUF:Q8_0';

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    // Check if Ollama is running first
    try {
      const healthCheck = await fetch(`${OLLAMA_API}/api/tags`);
      if (!healthCheck.ok) {
        throw new Error('Ollama service is not running');
      }
    } catch (error) {
      console.error('Ollama health check failed:', error);
      return NextResponse.json(
        { error: 'Ollama service is not available. Please start Ollama and try again.' },
        { status: 503 }
      );
    }

    // Format the conversation history
    const systemMessage = messages[0];
    const conversationHistory = messages.slice(1).map(msg => 
      `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`
    ).join('\n');

    // Send request to Ollama
    const response = await fetch(`${OLLAMA_API}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: `${systemMessage.content}\n\nPrevious conversation:\n${conversationHistory}\n\nHuman: ${messages[messages.length - 1].content}\nAssistant:`,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ response: data.response });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get response from AI service' },
      { status: 500 }
    );
  }
} 