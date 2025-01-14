export type MediaType = 'image' | 'video' | 'gif';

export interface MediaFile {
  url: string;
  width: number;
  height: number;
  type: MediaType;
}

// Base interface for raw API response
export interface Rule34Post {
  id: number;
  score: number;
  tags: string[];
  file_url: string;
  preview_url: string;
  sample_url?: string;
  width: number;
  height: number;
  rating: string;
  source: string;
  created_at?: string;
  updated_at?: string;
}

// Interface for partial API responses
export interface PartialRule34Post {
  id?: number;
  score?: number;
  tags?: string[];
  file_url?: string;
  preview_url?: string;
  sample_url?: string;
  width?: number;
  height?: number;
  rating?: string;
  source?: string;
  created_at?: string;
  updated_at?: string;
}

// Extended interface with processed media files
export interface LocalRule34Post extends Rule34Post {
  file: MediaFile;
  preview: MediaFile;
  sample?: MediaFile;
}

export interface SearchResponse {
  posts: Rule34Post[];
  count: number;
  error?: string;
  message?: string;
}

export interface SearchQuery {
  query: string;
  page?: number;
  limit?: number;
  enhancedSearch?: boolean;
  mediaTypes?: MediaType[];
} 