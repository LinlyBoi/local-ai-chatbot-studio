import { NextResponse } from 'next/server';

const COMFY_API = 'http://127.0.0.1:8188';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    console.log('Received prompt:', prompt);

    // Check ComfyUI connection
    try {
      const statsResponse = await fetch(`${COMFY_API}/system_stats`);
      if (!statsResponse.ok) {
        throw new Error('ComfyUI is not running');
      }
    } catch (error) {
      console.error('ComfyUI connection error:', error);
      return NextResponse.json({
        success: false,
        error: 'ComfyUI is not running. Please start ComfyUI and try again.'
      }, { status: 503 });
    }

    // Simple workflow with 12 steps and 728x728 resolution
    const workflow = {
      "3": {
        "inputs": {
          "seed": Math.floor(Math.random() * 1000000),
          "steps": 12,
          "cfg": 7,
          "sampler_name": "euler",
          "scheduler": "normal",
          "denoise": 1,
          "model": ["4", 0],
          "positive": prompt,
          "negative": "nsfw, nude, bad quality, blurry",
          "latent_image": ["5", 0]
        },
        "class_type": "KSampler"
      },
      "4": {
        "inputs": {
          "ckpt_name": "sdxl_vae.safetensors"
        },
        "class_type": "CheckpointLoaderSimple"
      },
      "5": {
        "inputs": {
          "width": 728,
          "height": 728,
          "batch_size": 1
        },
        "class_type": "EmptyLatentImage"
      },
      "6": {
        "inputs": {
          "samples": ["3", 0],
          "vae": ["7", 0]
        },
        "class_type": "VAEDecode"
      },
      "7": {
        "inputs": {
          "vae_name": "sdxl_vae.safetensors"
        },
        "class_type": "VAELoader"
      },
      "8": {
        "inputs": {
          "filename_prefix": "ComfyUI",
          "images": ["6", 0],
          "output_dir": "output",
          "filename_pattern": "ComfyUI_%counter%",
          "counter_digits": 5,
          "overwrite_existing": true
        },
        "class_type": "SaveImage"
      }
    };

    // Queue the prompt
    try {
      console.log('Sending workflow to ComfyUI');
      const queueResponse = await fetch(`${COMFY_API}/prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: workflow,
          client_id: `nextjs_${Date.now()}`
        }),
      });

      if (!queueResponse.ok) {
        const errorData = await queueResponse.json();
        console.error('Queue response error:', errorData);
        return NextResponse.json({
          success: false,
          error: 'Failed to queue prompt',
          details: errorData
        }, { status: 400 });
      }

      const queueData = await queueResponse.json();
      console.log('Queue response:', queueData);
      
      return NextResponse.json({
        success: true,
        prompt_id: queueData.prompt_id,
        execution_id: queueData.execution_id
      });

    } catch (error) {
      console.error('Error queuing prompt:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to queue prompt',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('ComfyUI error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate image'
    }, { status: 500 });
  }
} 