import { NextResponse } from 'next/server';

const OLLAMA_API = 'http://localhost:11434';

export async function GET() {
  try {
    // Try to connect to Ollama
    const response = await fetch(`${OLLAMA_API}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Ollama returned status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ 
      status: 'connected',
      models: data.models,
      message: 'Successfully connected to Ollama service'
    });
  } catch (error) {
    console.error('Ollama health check failed:', error);
    return NextResponse.json(
      { 
        status: 'disconnected',
        error: 'Ollama service is not available. Please make sure:',
        steps: [
          '1. Ollama is installed on your system',
          '2. The Ollama service is running',
          '3. It\'s accessible at localhost:11434',
          '4. Required models are downloaded (run: ollama pull llama2)'
        ]
      },
      { status: 503 }
    );
  }
} 