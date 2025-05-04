// Search API types
export interface SearchResult {
  ID: string;
  title: string | null;
  originalTitle?: string;
  isReleased?: boolean;
  originalReleaseYear: number | null;
  releastyear?: string;
  genres?: string[];
  imdbScore?: string | number;
  imdbCount?: string | number;
  tmdbRating?: string | number;
  tomatoMeter?: string | number;
  productionCountries?: string[];
  shortDescription?: string;
  posterUrl: string;
  fullPath: string | null;
  Streams: StreamProvider[];
}

export interface StreamProvider {
  Resolution: string;
  Type: string;
  Price: string;
  Provider: string;
  Link: string;
  Name: string;
  Audio: string[];
  Subtitle: string[];
  Icon: string;
}

// Streaming API types
export interface StreamerDetail {
  Resolution: string;
  Type: string;
  Price: string;
  Provider: string;
  Link: string;
  Name: string;
  Audio: string[];
  Subtitle: string[];
  Icon: string;
}

export interface StreamerResponse {
  ID: string;
  Streams: StreamerDetail[];
  title: string | null;
  originalTitle?: string;
  isReleased?: boolean;
  originalReleaseYear: number | null;
  releastyear?: string;
  genres?: string[];
  imdbScore?: string | number;
  imdbCount?: string | number;
  tmdbRating?: string | number;
  tomatoMeter?: string | number;
  productionCountries?: string[];
  shortDescription?: string;
  posterUrl: string;
  fullPath: string | null;
}

// Similar titles API types
export interface SimilarTitle {
  type: string;
  title: string;
  poster: string | null;
  fullPath: string;
  genres: string[];
  scoring: {
    imdbVotes?: number | null;
    imdbScore?: number | null;
    tomatoMeter?: number | null;
  };
}
