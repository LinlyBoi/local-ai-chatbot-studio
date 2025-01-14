import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const OUTPUT_DIR = 'C:/Users/markel/Desktop/ComfyUI/ComfyUI_windows_portable/ComfyUI/output';

// Keep track of processed files to detect new ones
let processedFiles = new Set<string>();
let lastCheck = Date.now();

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const since = url.searchParams.get('since');
    const sinceTimestamp = since ? parseInt(since) : lastCheck;

    // Read the directory
    const files = await fs.readdir(OUTPUT_DIR);
    const currentTime = Date.now();
    
    // Get file stats and filter for new images
    const fileStats = await Promise.all(
      files
        .filter(file => file.match(/\.(png|jpg|jpeg|webp)$/i))
        .map(async file => {
          const filePath = path.join(OUTPUT_DIR, file);
          const stats = await fs.stat(filePath);
          return {
            name: file,
            path: filePath,
            mtimeMs: stats.mtimeMs,
            isNew: !processedFiles.has(file) && stats.mtimeMs > sinceTimestamp
          };
        })
    );

    // Update processed files
    fileStats.forEach(file => {
      if (file.isNew) {
        processedFiles.add(file.name);
      }
    });

    // Get new files
    const newFiles = fileStats.filter(file => file.isNew);
    lastCheck = currentTime;

    return NextResponse.json({
      files: newFiles.map(file => ({
        name: file.name,
        url: `/comfy/output/${file.name}`,
        timestamp: file.mtimeMs
      })),
      lastCheck: currentTime,
      success: true
    });
  } catch (error) {
    console.error('Error reading output directory:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to read output directory'
      },
      { status: 500 }
    );
  }
} 