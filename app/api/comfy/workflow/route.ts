import { NextResponse } from 'next/server';

const COMFY_API = 'http://127.0.0.1:8188';

export async function GET() {
  try {
    // First check if ComfyUI is running
    const statsResponse = await fetch(`${COMFY_API}/system_stats`);
    if (!statsResponse.ok) {
      throw new Error('ComfyUI is not running');
    }

    // Get the current workflow
    const response = await fetch(`${COMFY_API}/object_info`);
    if (!response.ok) {
      throw new Error('Failed to get workflow status');
    }

    const data = await response.json();
    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'No workflow is loaded in ComfyUI' },
        { status: 404 }
      );
    }

    return NextResponse.json({ status: 'workflow_loaded', data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get workflow status' },
      { status: 503 }
    );
  }
} 