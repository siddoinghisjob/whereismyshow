# JustWatch API Client

A TypeScript client library for interacting with the unofficial JustWatch GraphQL API, allowing you to search for movies and TV shows, get streaming information, and find recommendations.

## Installation

```bash
npm install justwatch-api-client
```

## Features

- Search for movies and TV shows across streaming platforms
- Get detailed streaming information (providers, prices, availability)
- Find similar content recommendations
- Support for different country codes
- Built with TypeScript for complete type safety
- Uses proxy rotation to avoid rate limiting
- Automatic request timeout handling

## Usage

```typescript
import JustWatch from 'justwatch-api-client';

// Create a new JustWatch client with a timeout (in milliseconds)
const justwatch = new JustWatch(5000);

// Search for a movie/show (with optional country code, default is "IN")
const searchResults = await justwatch.searchMovie('Stranger Things', 'US');
console.log(searchResults);

// Get streaming information using the full path from search results
const streamingInfo = await justwatch.getStreamingInfo('/us/tv-show/stranger-things', 'US');
console.log(streamingInfo);

// Get recommendations for a show using its ID
const recommendations = await justwatch.getRecomendations('show_id_here', 'US');
console.log(recommendations);
```

## API Reference

### Constructor

```typescript
new JustWatch(timeoutMs: number)
```

Creates a new JustWatch client with the specified timeout in milliseconds.

### Methods

#### `searchMovie(query: string, country = "IN"): Promise<ShowResult[]>`

Searches for movies and TV shows matching the query.

**Parameters:**
- `query` - The search query string
- `country` - Two-letter country code (default: "IN")

**Returns:** Array of show results with title, originalReleaseYear, and fullPath

#### `getStreamingInfo(urlFullPath: string, country = "IN"): Promise<StreamingInfo>`

Returns streaming providers and details for a specific show/movie using its path.

**Parameters:**
- `urlFullPath` - The full path from search results
- `country` - Two-letter country code (default: "IN")

**Returns:** Streaming information including ID and array of providers with resolution, type, price, and links

#### `getRecomendations(showid: string, country = "IN"): Promise<RecommendationResult[]>`

Returns recommendations similar to the specified show/movie using its ID.

**Parameters:**
- `showid` - The ID of the show to get recommendations for
- `country` - Two-letter country code (default: "IN")

**Returns:** Array of recommended shows with details

## Types

```typescript
// Search results type
type ShowResult = {
  title: string;
  originalReleaseYear?: number;
  fullPath: string;
};

// Streaming provider type
type StreamProvider = {
  Resolution: string;
  Type: string;
  Price: string;
  Provider: string;
  Link: string;
};

// Streaming information type
type StreamingInfo = {
  ID: string;
  Streams: StreamProvider[];
};

// Recommendation result type
type RecommendationResult = {
  id: string;
  type: string;
  title: string;
  poster: string;
  fullPath: string;
  genres: string[];
  backdrops: string[];
  scoring: {
    imdbVotes?: number;
    imdbScore?: number;
    tomatoMeter?: number;
  };
};
```

## License

ISC