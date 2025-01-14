import { NextResponse } from 'next/server';

const RULE34_API = 'https://rule34.xxx/index.php';

export async function POST(request: Request) {
  try {
    const { query, pid = 0, limit = 40 } = await request.json();

    // Format query: ensure tags are properly formatted
    const formattedQuery = query.trim()
      .replace(/\++/g, ' ') // Replace multiple + with single space
      .replace(/\s+/g, '+') // Replace spaces with +
      .toLowerCase(); // Ensure lowercase

    // Add default parameters
    const searchQuery = `${formattedQuery}+rating:questionable+sort:score:desc`;
    console.log('Search request:', { query: searchQuery, pid, limit });

    // Try JSON endpoint first
    const jsonUrl = `${RULE34_API}?page=dapi&s=post&q=index&pid=${pid}&limit=${limit}&tags=${encodeURIComponent(searchQuery)}&json=1`;
    console.log('Trying JSON URL:', jsonUrl);
    
    try {
      const jsonResponse = await fetch(jsonUrl);
      if (jsonResponse.ok) {
        const jsonText = await jsonResponse.text();
        console.log('JSON Response length:', jsonText.length);
        console.log('JSON Response preview:', jsonText.slice(0, 100));
        
        if (jsonText.length > 0) {
          const data = JSON.parse(jsonText);
          return NextResponse.json({
            success: true,
            posts: data,
            message: 'Rule34 posts fetched successfully'
          });
        }
      }
      console.log('Empty JSON response, falling back to XML');
    } catch (jsonError) {
      console.error('JSON endpoint failed:', jsonError);
      console.log('Falling back to XML endpoint');
    }

    // Fallback to XML endpoint
    const xmlUrl = `${RULE34_API}?page=dapi&s=post&q=index&pid=${pid}&limit=${limit}&tags=${encodeURIComponent(searchQuery)}`;
    console.log('Trying XML URL:', xmlUrl);
    
    const xmlResponse = await fetch(xmlUrl);
    if (!xmlResponse.ok) {
      throw new Error('Failed to fetch from Rule34 XML endpoint');
    }

    const xmlText = await xmlResponse.text();
    console.log('XML Response:', xmlText);

    // Parse XML response
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const posts = Array.from(xmlDoc.getElementsByTagName('post')).map(post => ({
      id: post.getAttribute('id'),
      score: post.getAttribute('score'),
      file_url: post.getAttribute('file_url'),
      preview_url: post.getAttribute('preview_url'),
      sample_url: post.getAttribute('sample_url'),
      width: post.getAttribute('width'),
      height: post.getAttribute('height'),
      tags: post.getAttribute('tags')?.split(' ') || [],
      rating: post.getAttribute('rating'),
      source: post.getAttribute('source')
    }));

    return NextResponse.json({
      success: true,
      posts,
      message: 'Rule34 posts fetched successfully (XML)'
    });
  } catch (error) {
    console.error('Rule34 API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Rule34 posts'
      },
      { status: 500 }
    );
  }
} 