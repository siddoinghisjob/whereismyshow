# super-fetch-proxy-proxy

A robust fetch utility that automatically falls back to proxy when direct fetch fails. This package is particularly useful when you need a reliable way to make HTTP requests with automatic proxy fallback.

---

## Features

- 🚀 Attempts direct fetch first for optimal performance  
- 🔄 Automatic fallback to proxy on failure  
- 🎲 Random proxy selection from provided pool  
- 📦 TypeScript support  
- ⚡ Promise-based API  
- 🛡️ Error handling with detailed messages  

---

## Installation

```bash
npm install super-fetch-proxy
```

---

## Usage

### Basic Example (TypeScript)

```ts
import FetchWithProxyFallback from 'super-fetch-proxy';

// Your function to fetch proxies (should return a Promise<string[]>)
async function getProxies() {
  // Example: fetch from your proxy provider or use a static list
  return [
    'http://proxy1.example.com:8080',
    'http://proxy2.example.com:8080'
  ];
}

const fetcher = new FetchWithProxyFallback(getProxies);

fetcher.fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(err => console.error('Fetch failed:', err));
```

### Advanced Usage with Custom Options

```ts
const fetchOptions = {
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
};

fetcher.fetch('https://api.example.com/data', fetchOptions)
  .then(response => response.json())
  .then(data => console.log(data));
```

---

## Integration Example

This package is designed to be easily integrated into larger projects. For example, here’s how it can be used in a demo function:

```js
import FetchWithProxyFallback from 'super-fetch-proxy';
import getRandomProxy from 'getactiveproxies';

const fetchInstance = new FetchWithProxyFallback(getRandomProxy);
const FetchUtil = fetchInstance.fetch.bind(fetchInstance);

// Use FetchUtil in your API calls
```

Or in a class-based architecture:

```js
import searchMovie from "./helper/search.js";
import FetchWithProxyFallback from "super-fetch-proxy";
import getRandomProxy from "getactiveproxies";

class FetchMovieData {
  constructor(time) {
    this.fetchInstance = new FetchWithProxyFallback(getRandomProxy, time);
    this.FetchUtil = this.fetchInstance.fetch.bind(this.fetchInstance);
  }

  async searchMovie(query, country = "IN") {
    return await searchMovie(query, this.FetchUtil, country);
  }
}
```

---

## API

### `FetchWithProxyFallback`

#### Constructor

```ts
new FetchWithProxyFallback(
  proxyFetcher: (...args: any[]) => Promise<string[]>,
  ...args: any[]
)
```

- `proxyFetcher`: A function that returns a Promise resolving to an array of proxy URLs.  
- `...args`: Optional arguments passed to the `proxyFetcher`.

#### `fetch(url: string, options?: RequestInit): Promise<Response>`

Attempts to fetch the URL directly. If it fails, retries using a randomly selected proxy.

---

## License

MIT
