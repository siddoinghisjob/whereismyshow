import searchMovie from "./helper/search";
import getRandomProxy from "getactiveproxies";
import getStreamingInfo from "./helper/getdetails";
import getRecomendations from "./helper/getRecommendations";

import FetchWithProxyFallback from "super-fetch-proxy";
import timedFunction from "timed-function";

// Define types for the library
export type ShowResult = {
  title: string;
  originalReleaseYear?: number;
  fullPath: string;
};

export type StreamProvider = {
  Resolution: string;
  Type: string;
  Price: string;
  Provider: string;
  Link: string;
};

export type StreamingInfo = {
  ID: string;
  Streams: StreamProvider[];
};

export type RecommendationResult = {
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

class JustWatch {
  private time: number;
  private fetchInstance: any;
  private FetchUtil: any;
  private cleanup: FinalizationRegistry<any>;

  constructor(time: number) {
    this.time = time;
    this.fetchInstance = new FetchWithProxyFallback(getRandomProxy, time);
    this.FetchUtil = this.fetchInstance.fetch.bind(this.fetchInstance);

    // Ensure cleanup when instance is garbage collected
    // Using FinalizationRegistry which is available in ES2021
    this.cleanup = new FinalizationRegistry((heldValue) => {
      if (
        this.fetchInstance &&
        typeof this.fetchInstance.abort === "function"
      ) {
        this.fetchInstance.abort();
      }
    });
    this.cleanup.register(this, this.fetchInstance);
  }

  async searchMovie(query: string, country: string = "IN"): Promise<ShowResult[]> {
    const res = await timedFunction(
      searchMovie,
      this.time,
      [] as ShowResult[],
      query,
      this.FetchUtil,
      country
    );
    return res.map(item => ({
      title: item.title || '',
      originalReleaseYear: item.originalReleaseYear,
      fullPath: item.fullPath || ''
    })) as ShowResult[];
  }

  async getStreamingInfo(urlFullPath: string, country: string = "IN"): Promise<StreamingInfo> {
    const res = await timedFunction(
      getStreamingInfo,
      this.time,
      {} as StreamingInfo,
      urlFullPath,
      this.FetchUtil,
      country
    );
    return res;
  }

  async getRecomendations(showid: string, country: string = "IN"): Promise<RecommendationResult[]> {
    const res = await timedFunction(
      getRecomendations,
      this.time,
      [] as RecommendationResult[],
      showid,
      this.FetchUtil,
      country
    );
    return res;
  }
}

export default JustWatch;