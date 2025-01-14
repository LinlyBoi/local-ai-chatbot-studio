import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, limit = 40 } = body;

    console.log('Received search request:', { query, limit });

    // Format tags for Rule34 API - use space separation instead of +
    const formattedQuery = query.replace(/\+/g, ' ').trim();
    
    // Build Rule34 API URL with proper parameters
    const apiUrl = 'https://api.rule34.xxx/index.php';
    const searchParams = new URLSearchParams({
      page: 'dapi',
      s: 'post',
      q: 'index',
      tags: formattedQuery,
      limit: limit.toString(),
      json: '1'
    });

    const url = `${apiUrl}?${searchParams.toString()}`;
    console.log('Fetching from Rule34 API:', url);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Rule34App/1.0',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('API Response not OK:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      throw new Error(`Rule34 API request failed with status ${response.status}`);
    }

    const text = await response.text();
    console.log('Raw response length:', text.length);
    
    // Handle empty response
    if (!text || text.trim() === '') {
      console.log('Empty response from API, trying XML endpoint...');
      
      // Try XML endpoint as fallback
      const xmlSearchParams = new URLSearchParams({
        page: 'dapi',
        s: 'post',
        q: 'index',
        tags: formattedQuery,
        limit: limit.toString(),
        json: '0' // Request XML instead
      });

      const xmlUrl = `${apiUrl}?${xmlSearchParams.toString()}`;
      const xmlResponse = await fetch(xmlUrl, {
        headers: {
          'User-Agent': 'Rule34App/1.0',
          'Accept': 'application/xml',
          'Cache-Control': 'no-cache'
        }
      });

      if (!xmlResponse.ok) {
        throw new Error('Both JSON and XML endpoints failed');
      }

      const xmlText = await xmlResponse.text();
      
      // Parse XML response
      if (xmlText.includes('<post')) {
        // Basic XML parsing to extract posts
        const posts = xmlText.match(/<post[^>]*>/g) || [];
        if (posts.length > 0) {
          // Convert XML posts to our JSON format
          const jsonPosts = posts.map(post => {
            const getId = (attr: string) => {
              const match = post.match(new RegExp(`${attr}="([^"]*)"`, 'i'));
              return match ? match[1] : '';
            };
            
            return {
              id: parseInt(getId('id')) || 0,
              score: parseInt(getId('score')) || 0,
              file_url: getId('file_url'),
              preview_url: getId('preview_url'),
              sample_url: getId('sample_url'),
              tags: getId('tags').split(' ').filter(Boolean),
              width: parseInt(getId('width')) || 0,
              height: parseInt(getId('height')) || 0,
              rating: getId('rating'),
              source: getId('source'),
            };
          });

          return NextResponse.json({
            posts: jsonPosts,
            count: jsonPosts.length
          });
        }
      }
      
      return NextResponse.json({
        posts: [],
        count: 0
      });
    }

    // Process JSON response
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON Parse error:', parseError);
      throw new Error('Failed to parse API response');
    }
    
    if (!Array.isArray(data)) {
      console.error('Invalid response format:', data);
      if (data && Array.isArray(data.posts)) {
        data = data.posts;
      } else {
        throw new Error('Invalid response format from Rule34 API');
      }
    }

    // Filter out invalid posts
    const validPosts = data.filter(post => {
      if (!post || typeof post !== 'object') return false;
      if (!post.file_url || !post.preview_url) return false;
      return true;
    });

    console.log('Found valid posts:', validPosts.length);

    return NextResponse.json({
      posts: validPosts,
      count: validPosts.length
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch results',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 