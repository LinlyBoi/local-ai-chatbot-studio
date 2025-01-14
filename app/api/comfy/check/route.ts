import { NextResponse } from 'next/server';

const COMFY_API = 'http://127.0.0.1:8188';

export async function GET() {
  try {
    const response = await fetch(`${COMFY_API}/system_stats`);
    if (!response.ok) {
      throw new Error('ComfyUI is not running');
    }
    return NextResponse.json({ status: 'connected' });
  } catch (error) {
    return NextResponse.json(
      { error: 'ComfyUI is not running. Please start ComfyUI and try again.' },
      { status: 503 }
    );
  }
} 