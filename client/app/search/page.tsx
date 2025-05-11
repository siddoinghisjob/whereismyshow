"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navigation from "../components/Navigation";
import MediaCard from "../components/MediaCard";
import { searchShows } from "../services/apiService";
import { SearchResult } from "../types";
import { useCountry } from "../context/CountryContext";

function Search() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedCountry } = useCountry();

  // Fetch search results when query changes
  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;

      setIsLoading(true);
      try {
        const data = await searchShows(query, selectedCountry.code || "US");
        setResults(data.filter((item) => item.fullPath !== ""));
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query, selectedCountry]);

  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-24 pb-12 px-6 w-full">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Search Results</h1>
            <p className="text-gray-400">
              {results.length > 0
                ? `Found multiple results for "${query}"`
                : query
                ? `No results found for "${query}"`
                : "Enter a search term to find shows and movies"}
            </p>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        )}

        {/* Results grid */}
        {!isLoading && results.length > 0 && (
          <div className="flex md:justify-start justify-center flex-wrap md:gap-6 gap-4 align-middle w-full overflow-x-hidden">
            {results?.map((result, key) => (
              <div className="my-4 md:my-0" key={key}>
                <MediaCard item={result} size="large" />
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {!isLoading && query && results.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="text-gray-400 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-1">No results found</h2>
            <p className="text-gray-400 text-center max-w-md">
              We couldn&apos;t find any shows or movies matching &quot;{query}
              &quot;. Try a different search term or check your spelling.
            </p>
          </div>
        )}

        {/* Empty search */}
        {!isLoading && !query && (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="text-gray-400 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-1">
              Search for your favorite content
            </h2>
            <p className="text-gray-400 text-center max-w-md">
              Enter a title in the search box above to find where you can stream
              your favorite shows and movies.
            </p>
          </div>
        )}
      </main>
    </>
  );
}

export default function SearchBar() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-24 pb-12 px-6 w-full">
          <div className="mb-8">
            <div className="h-8 w-48 bg-gray-700 rounded animate-pulse mb-3"></div>
            <div className="h-5 w-72 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            <span className="ml-4 text-gray-400">
              Loading search results...
            </span>
          </div>
        </div>
      }
    >
      <Search />
    </Suspense>
  );
}
