const TENOR_API_URL = 'https://g.tenor.com/v1';

export interface TenorGif {
  id: string;
  title: string;
  url: string;
  media: {
    gif: {
      url: string;
      width: number;
      height: number;
    };
    preview: {
      url: string;
      width: number;
      height: number;
    };
  };
}

export async function searchGif(query: string): Promise<TenorGif | null> {
  try {
    const response = await fetch(`${TENOR_API_URL}/search?q=${encodeURIComponent(query)}&limit=1`);

    if (!response.ok) {
      throw new Error('Failed to fetch GIF');
    }

    const data = await response.json();
    const result = data.results?.[0];
    
    if (!result) return null;

    return {
      id: result.id,
      title: result.title,
      url: result.itemurl,
      media: {
        gif: {
          url: result.media[0].gif.url,
          width: result.media[0].gif.dims[0],
          height: result.media[0].gif.dims[1]
        },
        preview: {
          url: result.media[0].tinygif.url,
          width: result.media[0].tinygif.dims[0],
          height: result.media[0].tinygif.dims[1]
        }
      }
    };
  } catch (error) {
    console.error('Error fetching GIF:', error);
    return null;
  }
}

export async function getRandomGif(tag?: string): Promise<TenorGif | null> {
  try {
    const endpoint = tag ? 
      `${TENOR_API_URL}/random?q=${encodeURIComponent(tag)}&limit=1` :
      `${TENOR_API_URL}/trending?limit=1`;

    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error('Failed to fetch GIF');
    }

    const data = await response.json();
    const result = data.results?.[0];
    
    if (!result) return null;

    return {
      id: result.id,
      title: result.title,
      url: result.itemurl,
      media: {
        gif: {
          url: result.media[0].gif.url,
          width: result.media[0].gif.dims[0],
          height: result.media[0].gif.dims[1]
        },
        preview: {
          url: result.media[0].tinygif.url,
          width: result.media[0].tinygif.dims[0],
          height: result.media[0].tinygif.dims[1]
        }
      }
    };
  } catch (error) {
    console.error('Error fetching GIF:', error);
    return null;
  }
} 