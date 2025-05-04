"use client";

import { useState, useRef, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { searchShows } from "../services/apiService";
import { SearchResult } from "../types";
import { useDebounce } from "../services/apiService";
import Image from "next/image";
import CountrySelect from "./CountrySelect";
import { useCountry } from "../context/CountryContext";

export default function Navigation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Use debounce to delay API calls until user stops typing
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch suggestions when debounced query changes
  const { selectedCountry } = useCountry();
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchQuery.trim() === "") {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await searchShows(
          debouncedSearchQuery,
          selectedCountry.code
        );
        setSuggestions(results.filter((item) => item.fullPath !== ""));
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchQuery, selectedCountry]);

  // Handle click outside to close suggestions and mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close suggestions when clicking outside
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }

      // Close mobile menu when clicking outside
      if (
        navRef.current &&
        isMobileMenuOpen &&
        !navRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between bg-black/80 backdrop-blur-md"
    >
      <div className="flex items-center">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-red-600 font-bold text-xl sm:text-2xl">
            WhereIsMyShow
          </span>
        </Link>
      </div>

      {/* Mobile menu button */}
      <button
        className="md:hidden flex items-center text-white"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-6 h-6"
        >
          {isMobileMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Desktop search */}
      <div className="hidden md:relative md:flex md:items-center">
        <form onSubmit={handleSearch} className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for shows or movies..."
            className="w-64 pl-10 pr-3 py-2 text-sm bg-gray-800/50 border border-gray-700 rounded-full text-white transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
            onFocus={() => {
              setShowSuggestions(true);
            }}
            autoComplete="off"
          />
          <button
            type="submit"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          {/* Desktop Suggestions dropdown */}
          {showSuggestions &&
            (debouncedSearchQuery.trim() !== "" || isLoading) && (
              <div
                ref={suggestionsRef}
                className="absolute mt-2 w-full bg-gray-900 border border-gray-700 rounded-md shadow-lg overflow-hidden z-50"
                style={{ minWidth: "300px" }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-5 h-5 border-t-2 border-red-500 border-solid rounded-full animate-spin"></div>
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={`${suggestion.fullPath}-${index}`}
                        className="block border-b border-gray-800 last:border-b-0"
                      >
                        <Link
                          href={
                            suggestion.fullPath
                              ? `/details/${encodeURIComponent(
                                  suggestion.fullPath || ""
                                )}${
                                  suggestion.posterUrl
                                    ? `?poster=${encodeURIComponent(
                                        suggestion.posterUrl
                                      )}`
                                    : ""
                                }`
                              : "#"
                          }
                          onClick={() => {
                            if (!suggestion.fullPath) return;
                            setShowSuggestions(false);
                            setSearchQuery("");
                          }}
                          className="block w-full"
                        >
                          <div className="flex items-center p-3 hover:bg-gray-800 cursor-pointer active:bg-gray-700">
                            {suggestion.posterUrl && suggestion.ID && (
                              <div className="flex-shrink-0 w-10 h-14 mr-3 overflow-hidden rounded">
                                <Image
                                  src={suggestion.posterUrl}
                                  alt={suggestion.title || ""}
                                  className="w-full h-full object-cover"
                                  width={40}
                                  height={56}
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {suggestion.title}
                              </p>
                              <div className="flex items-center gap-2">
                                {suggestion.originalReleaseYear && (
                                  <p className="text-xs text-gray-400">
                                    {suggestion.originalReleaseYear}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-sm text-gray-400 text-center">
                    No results found for &quot;{debouncedSearchQuery}&quot;
                  </div>
                )}
              </div>
            )}
        </form>

        <div className="ml-6 flex items-center">
          <CountrySelect />
        </div>
      </div>

      {/* Mobile menu and search */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-black/95 shadow-lg p-4 flex flex-col gap-4 mt-1 z-50">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for shows or movies..."
              className="w-full pl-10 pr-3 py-2 text-sm bg-gray-800/50 border border-gray-700 rounded-full text-white"
              onFocus={() => setShowSuggestions(true)}
              autoComplete="off"
            />
            <button
              type="submit"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </form>

          {/* Mobile Suggestions */}
          {showSuggestions &&
            (debouncedSearchQuery.trim() !== "" || isLoading) && (
              <div 
                className="w-full bg-gray-900 border border-gray-700 rounded-md shadow-lg overflow-hidden"
                ref={suggestionsRef}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-5 h-5 border-t-2 border-red-500 border-solid rounded-full animate-spin"></div>
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={`mobile-${suggestion.fullPath}-${index}`}
                        className="block border-b border-gray-800 last:border-b-0"
                      >
                        <Link
                          href={
                            suggestion.fullPath
                              ? `/details/${encodeURIComponent(
                                  suggestion.fullPath || ""
                                )}${
                                  suggestion.posterUrl
                                    ? `?poster=${encodeURIComponent(
                                        suggestion.posterUrl
                                      )}`
                                    : ""
                                }`
                              : "#"
                          }
                          onClick={() => {
                            if (!suggestion.fullPath) return;
                            setShowSuggestions(false);
                            setIsMobileMenuOpen(false);
                            setSearchQuery("");
                          }}
                          className="block w-full"
                        >
                          <div className="flex items-center p-3 hover:bg-gray-800 cursor-pointer active:bg-gray-700">
                            {suggestion.posterUrl && (
                              <div className="flex-shrink-0 w-10 h-14 mr-3 overflow-hidden rounded">
                                <Image
                                  src={suggestion.posterUrl}
                                  alt={suggestion.title || ""}
                                  className="w-full h-full object-cover"
                                  width={40}
                                  height={56}
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {suggestion.title}
                              </p>
                              <div className="flex items-center gap-2">
                                {suggestion.originalReleaseYear && (
                                  <p className="text-xs text-gray-400">
                                    {suggestion.originalReleaseYear}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-sm text-gray-400 text-center">
                    No results found for &quot;{debouncedSearchQuery}&quot;
                  </div>
                )}
              </div>
            )}

          <div className="flex flex-col space-y-3 pt-2 border-t border-gray-800">
            <Link
              href="/"
              className="text-white hover:text-gray-300 transition-colors text-sm py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <div className="py-2">
              <CountrySelect />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
