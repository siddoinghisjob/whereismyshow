import { SearchResult, StreamerResponse, SimilarTitle } from "../types";
import { useState, useEffect } from "react";

// Client-side API service that calls our server-side API routes
export const searchShows = async (
  query: string,
  country: string = "US"
): Promise<SearchResult[]> => {
  if (!query || query.trim() === "") return [];

  try {
    const response = await fetch(
      `/api/search?query=${encodeURIComponent(
        query
      )}&country=${encodeURIComponent(country)}`
    );
    if (!response.ok) throw new Error("Search request failed");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error searching shows:", error);
    return [];
  }
};

export const getStreamingProviders = async (
  itemFullPath: string,
  country: string = "US"
): Promise<StreamerResponse | null> => {
  if (!itemFullPath) return null;

  try {
    const response = await fetch(
      `/api/streaming?itemFullPath=${encodeURIComponent(
        itemFullPath
      )}&country=${encodeURIComponent(country)}`
    );
    if (!response.ok) throw new Error("Streaming providers request failed");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting streaming providers:", error);
    return null;
  }
};

export const getSimilarTitles = async (
  showId: string,
  country: string = "US"
): Promise<SimilarTitle[]> => {
  if (!showId) return [];
  try {
    const response = await fetch(
      `/api/similar?showId=${encodeURIComponent(
        showId
      )}&country=${encodeURIComponent(country)}`
    );
    if (!response.ok) throw new Error("Similar titles request failed");
    return await response.json();
  } catch (error) {
    console.error("Error getting similar titles:", error);
    return [];
  }
};

// Debounced search utility for autocomplete
export const useDebounce = <T>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Skip effect on server-side
    if (typeof window === "undefined") return;

    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
