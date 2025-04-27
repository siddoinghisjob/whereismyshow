import { HttpsProxyAgent } from "https-proxy-agent";

interface FetchOptions extends RequestInit {
  agent?: HttpsProxyAgent<string>;
}

class FetchWithProxyFallback {
  private proxies: string[];
  private func: (...args: any[]) => Promise<string[]>;
  private args: any[];

  constructor(func: (...args: any[]) => Promise<string[]>, ...args: any[]) {
    this.func = func;
    this.args = args;
    this.proxies = [];
  }

  private async getRandomProxyAgent(): Promise<HttpsProxyAgent<string> | null> {
    if (this.proxies.length === 0) {
      console.log("No proxies defined, fetching directly");
      this.proxies = await this.func(...this.args);
    }
    const randomIndex = Math.floor(Math.random() * this.proxies.length);
    const proxyUrl = this.proxies[randomIndex];
    return new HttpsProxyAgent(proxyUrl);
  }

  async fetch(url: string, options?: FetchOptions): Promise<Response> {
    let response: Response;
    const fetchOptions: FetchOptions = { ...options };

    try {
      response = await fetch(url, fetchOptions);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      const agent = await this.getRandomProxyAgent();
      if (agent) {
        try {
          fetchOptions.agent = agent;
          response = await fetch(url, fetchOptions);
          if (!response.ok) {
            throw new Error(`Proxy fetch HTTP error! status: ${response.status}`);
          }
          return response;
        } catch (proxyError) {
          throw proxyError;
        }
      } else {
        throw error;
      }
    }
  }
}

export default FetchWithProxyFallback;