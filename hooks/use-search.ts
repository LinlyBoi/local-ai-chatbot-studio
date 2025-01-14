import { useState } from 'react';
import type { Rule34Post, SearchResponse } from '@/types/api';

interface UseSearchReturn {
  results: Rule34Post[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  search: (query: string, page?: number) => Promise<void>;
}

export function useSearch(): UseSearchReturn {
  const [results, setResults] = useState<Rule34Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const search = async (query: string, page = 0) => {
    try {
      setLoading(true);
      setError(null);

      // Get the current URL's origin (includes protocol, hostname, and port)
      const apiUrl = `${window.location.origin}/api/search`;
      console.log('Sending request to:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          page,
          enhancedSearch: true,
          limit: 20
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Response:', errorText);
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();
      console.log('Search results:', data);
      setResults(data.posts);
      setTotalCount(data.count);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      console.error('Search error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    results,
    loading,
    error,
    totalCount,
    search
  };
} 