"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import {
  getStreamingProviders,
  getSimilarTitles,
} from "../../services/apiService";
import Navigation from "../../components/Navigation";
import StreamingProviders from "../../components/StreamingProviders";
import { StreamerDetail, SimilarTitle } from "../../types";
import MediaCard from "@/app/components/MediaCard";
import { useCountry } from "@/app/context/CountryContext";

export default function MediaDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const posterFromSearch = searchParams.get("poster");

  const [streamingData, setStreamingData] = useState<StreamerDetail[]>([]);
  const [similarTitles, setSimilarTitles] = useState<SimilarTitle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mediaDetails, setMediaDetails] = useState<{
    ID: string;
    title: string;
    originalTitle?: string;
    posterUrl: string;
    backdropUrl?: string;
    description: string;
    shortDescription?: string;
    isReleased?: boolean;
    originalReleaseYear: number | null;
    year: string;
    type: string;
    genres: string[];
    imdbScore?: number;
    imdbCount?: number;
    tmdbRating?: number;
    tomatoMeter?: number;
    productionCountries?: string[];
    runtime?: number;
    ageCertification?: string;
  }>({
    ID: "",
    title: "",
    posterUrl: posterFromSearch || "",
    description: "",
    shortDescription: "",
    year: "",
    originalReleaseYear: null,
    type: "",
    genres: [],
  });

  const fullPath = Array.isArray(params.path)
    ? params.path.join("/")
    : typeof params.path === "string"
    ? params.path
    : "";
  const { selectedCountry } = useCountry();
  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const streamingResponse = await getStreamingProviders(
          fullPath,
          selectedCountry.code
        );

        if (streamingResponse) {
          setMediaDetails((prev) => ({
            ...prev,
            ID: streamingResponse.ID || "",
            title: streamingResponse.title || "",
            originalTitle: streamingResponse.originalTitle,
            // Keep poster from search params if it was initially set, otherwise use fetched one
            posterUrl:
              prev.posterUrl && prev.posterUrl !== ""
                ? prev.posterUrl
                : streamingResponse.posterUrl || "",
            shortDescription: streamingResponse.shortDescription, // Keep shortDescription
            year: streamingResponse.originalReleaseYear?.toString() || "",
            originalReleaseYear: streamingResponse.originalReleaseYear,
            isReleased: streamingResponse.isReleased,
            genres: streamingResponse.genres || [],
            imdbScore:
              typeof streamingResponse.imdbScore === "string"
                ? parseFloat(streamingResponse.imdbScore)
                : streamingResponse.imdbScore,
            imdbCount:
              typeof streamingResponse.imdbCount === "string"
                ? parseInt(streamingResponse.imdbCount, 10)
                : streamingResponse.imdbCount,
            tmdbRating:
              typeof streamingResponse.tmdbRating === "string"
                ? parseFloat(streamingResponse.tmdbRating)
                : streamingResponse.tmdbRating,
            tomatoMeter:
              typeof streamingResponse.tomatoMeter === "string"
                ? parseFloat(streamingResponse.tomatoMeter)
                : streamingResponse.tomatoMeter,
            productionCountries: streamingResponse.productionCountries,
          }));
        }

        if (streamingResponse) {
          const fetchedStreamData = streamingResponse;
          const uniqueUrls: Set<string> = new Set();
          const uniqueStreams: StreamerDetail[] = [];

          fetchedStreamData.Streams?.forEach((streamOpt) => {
            if (streamOpt.Link && !uniqueUrls.has(streamOpt.Link)) {
              uniqueUrls.add(streamOpt.Link);
              uniqueStreams.push(streamOpt);
            }
          });

          setStreamingData(uniqueStreams);

          // Fetch similar titles using the ID obtained from streaming data (or media details if available)
          const idForSimilar =
            fetchedStreamData.ID ||
            (streamingResponse ? streamingResponse.ID : null);
          if (idForSimilar) {
            const similarResponse = await getSimilarTitles(
              idForSimilar,
              selectedCountry.code
            ); // Assuming US, replace with dynamic country later
            setSimilarTitles(
              similarResponse.filter((item) => item.fullPath !== "") || []
            );
          }
        }
      } catch (error) {
        console.error("Error in fetchDetails:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (fullPath) {
      fetchDetails();
    }
  }, [fullPath, posterFromSearch, selectedCountry]);

  // Format runtime to hours and minutes
  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? `${mins}m` : ""}`;
  };

  if (isLoading) {
    return (
      <div className="bg-slate-950 min-h-screen">
        <Navigation />
        <main className="pt-20 min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-t-4 border-b-4 border-red-600 border-solid rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 animate-pulse">Loading content...</p>
          </div>
        </main>
      </div>
    );
  }

  // Calculate overall score (averaged from available ratings)
  let overallScore = 0;
  let scoreCount = 0;

  if (mediaDetails.imdbScore && mediaDetails.imdbScore > 0 && !isNaN(mediaDetails.imdbScore)) {
    overallScore += mediaDetails.imdbScore / 10; // IMDb is out of 10
    scoreCount++;
  }

  if (mediaDetails.tmdbRating && mediaDetails.tmdbRating > 0 && !isNaN(mediaDetails.tmdbRating)) {
    overallScore += mediaDetails.tmdbRating / 10; // TMDB is out of 10
    scoreCount++;
  }

  if (mediaDetails.tomatoMeter && mediaDetails.tomatoMeter > 0 && !isNaN(mediaDetails.tomatoMeter)) {
    overallScore += mediaDetails.tomatoMeter / 100; // RT is percentage
    scoreCount++;
  }

  const finalScore = scoreCount > 0 ? Math.round((overallScore / scoreCount) * 100) : 0;

  // Score color based on rating
  const getScoreColor = (score: number) => {
    if (score >= 75) return "bg-emerald-600";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-600";
  };

  const scoreColorClass = getScoreColor(finalScore);

  return (
    <div className="bg-slate-950 text-white min-h-screen">
      <Navigation />

      {/* Hero Banner - Fixed height, better positioned content */}
      <div className="relative w-full h-[500px] sm:h-[550px] md:h-[600px] lg:h-[650px]">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          {mediaDetails.posterUrl && (
            <div className="relative h-full w-full">
              <Image
                src={mediaDetails.backdropUrl || mediaDetails.posterUrl}
                alt=""
                fill
                priority
                className="object-cover object-center opacity-80"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 from-20% via-slate-950/85 to-slate-950/40"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 from-15% via-slate-950/80 to-transparent"></div>
            </div>
          )}
        </div>

        {/* Content overlay - Positioned over the backdrop */}
        <div className="relative z-10 h-full container mx-auto px-6 flex flex-col md:flex-row items-end pb-12 pt-24">
          {/* Poster */}
          <div className="hidden md:block md:w-64 lg:w-72 flex-shrink-0">
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-300 ring-1 ring-white/10">
              <Image
                src={mediaDetails.posterUrl}
                alt={mediaDetails.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 0vw, 25vw"
                priority
              />
              {finalScore > 0 && (
                <div className="absolute top-3 right-3">
                  <div className={`${scoreColorClass} h-12 w-12 rounded-md flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {finalScore}%
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Details - Better aligned with the poster */}
          <div className="md:ml-8 text-center md:text-left flex-grow max-w-3xl">
            {/* Type Badge */}
            {mediaDetails.type && (
              <div className="inline-block mb-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-red-600/90 text-white uppercase tracking-wider">
                  {mediaDetails.type === "movie" ? "Movie" : "TV Show"}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 leading-tight drop-shadow-md">
              {mediaDetails.title}
            </h1>

            {/* Year & Details Row */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-sm md:text-base text-gray-300 my-3">
              {mediaDetails.year && (
                <span className="font-medium">{mediaDetails.year}</span>
              )}

              {mediaDetails.runtime && mediaDetails.runtime > 0 && (
                <>
                  <span className="text-gray-500">•</span>
                  <span>{formatRuntime(mediaDetails.runtime)}</span>
                </>
              )}

              {mediaDetails.ageCertification && (
                <>
                  <span className="text-gray-500">•</span>
                  <span className="border border-gray-400 px-1.5 py-0.5 rounded text-xs font-medium">
                    {mediaDetails.ageCertification}
                  </span>
                </>
              )}
            </div>

            {/* Genres Pills */}
            {mediaDetails.genres && mediaDetails.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-5">
                {mediaDetails.genres.slice(0, 4).map((genre, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-slate-800/70 text-gray-200 text-sm rounded-full hover:bg-slate-700 transition"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Description - Display shortDescription or fallback to description */}
            {(mediaDetails.shortDescription || mediaDetails.description) && (
              <div className="mb-6">
                <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                  {mediaDetails.shortDescription || mediaDetails.description}
                </p>
              </div>
            )}

            {/* Ratings Cards - Made more mobile friendly with better sizing and NaN protection */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-6">
              {mediaDetails.imdbScore && mediaDetails.imdbScore > 0 && !isNaN(mediaDetails.imdbScore) && (
                <div className="flex items-center bg-slate-800/70 backdrop-blur px-3 py-2 rounded-lg border border-slate-700/50 hover:bg-slate-800 transition-colors">
                  <div className="bg-yellow-500 h-8 w-8 sm:h-10 sm:w-10 rounded flex items-center justify-center text-black font-bold text-xs sm:text-sm mr-2 sm:mr-3">
                    IMDb
                  </div>
                  <div>
                    <div className="font-semibold text-lg sm:text-xl leading-none">
                      {mediaDetails.imdbScore.toFixed(1)}/10
                    </div>
                    {mediaDetails.imdbCount && !isNaN(mediaDetails.imdbCount) && (
                      <div className="text-xs text-gray-400 mt-1">
                        {Number(mediaDetails.imdbCount).toLocaleString()} votes
                      </div>
                    )}
                  </div>
                </div>
              )}

              {mediaDetails.tmdbRating && mediaDetails.tmdbRating > 0 && !isNaN(mediaDetails.tmdbRating) && (
                <div className="flex items-center bg-slate-800/70 backdrop-blur px-3 py-2 rounded-lg border border-slate-700/50 hover:bg-slate-800 transition-colors">
                  <div className="bg-teal-600 h-8 w-8 sm:h-10 sm:w-10 rounded flex items-center justify-center text-white font-bold text-xs sm:text-sm mr-2 sm:mr-3">
                    TMDB
                  </div>
                  <div className="font-semibold text-lg sm:text-xl">
                    {mediaDetails.tmdbRating.toFixed(1)}/10
                  </div>
                </div>
              )}

              {mediaDetails.tomatoMeter && mediaDetails.tomatoMeter > 0 && !isNaN(mediaDetails.tomatoMeter) && (
                <div className="flex items-center bg-slate-800/70 backdrop-blur px-3 py-2 rounded-lg border border-slate-700/50 hover:bg-slate-800 transition-colors">
                  <div className="bg-red-600 h-8 w-8 sm:h-10 sm:w-10 rounded flex items-center justify-center text-white font-bold text-xs sm:text-sm mr-2 sm:mr-3">
                    RT
                  </div>
                  <div className="font-semibold text-lg sm:text-xl">
                    {mediaDetails.tomatoMeter}%
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Poster (only visible on mobile) - Improved positioning and visibility */}
      <div className="md:hidden -mt-24 mb-8 px-6">
        <div className="relative aspect-[2/3] w-36 sm:w-44 mx-auto rounded-lg overflow-hidden shadow-xl ring-1 ring-white/20">
          <Image
            src={mediaDetails.posterUrl}
            alt={mediaDetails.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 36vw, 44vw"
            priority
          />

          {finalScore > 0 && (
            <div className="absolute top-2 right-2">
              <div className={`${scoreColorClass} h-9 w-9 rounded-md flex items-center justify-center text-white font-bold text-xs shadow-lg`}>
                {finalScore}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Production Info - Additional info now placed outside for better layout */}
      <div className="container mx-auto px-6 py-2">
        <div className="text-sm text-gray-400 space-y-1 flex flex-col items-center md:items-start">
          {mediaDetails.originalTitle &&
            mediaDetails.originalTitle !== mediaDetails.title && (
              <p>
                <span className="text-gray-300 font-medium">
                  Original title:
                </span>{" "}
                {mediaDetails.originalTitle}
              </p>
            )}

          {mediaDetails.productionCountries &&
            mediaDetails.productionCountries.length > 0 && (
              <p>
                <span className="text-gray-300 font-medium">Production:</span>{" "}
                {mediaDetails.productionCountries.join(", ")}
              </p>
            )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Streaming Providers Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <span className="w-1 h-8 bg-red-600 mr-3 rounded-full"></span>
            Where to Watch
          </h2>
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/30 rounded-2xl overflow-hidden shadow-xl">
            <StreamingProviders streams={streamingData} />
          </div>
        </div>

        {/* Similar Titles Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <span className="w-1 h-8 bg-red-600 mr-3 rounded-full"></span>
            You Might Also Like
          </h2>

          {similarTitles.length > 0 ? (
            <div className="flex flex-wrap align-middle justify-center md:justify-start gap-4 md:gap-6 overflow-hidden">
              {similarTitles.slice(0, 12).map((title) => (
                <div
                  key={title.fullPath}
                  className="transform transition duration-300"
                >
                  <MediaCard item={title} size="small" />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/50 text-center py-16 rounded-2xl border border-slate-700/30">
              <p className="text-gray-400">No similar titles found</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 px-6 text-center text-gray-400 text-sm">
        <div className="container mx-auto">
          <div className="flex justify-center space-x-6 mb-6">
            {["Facebook", "Twitter", "Instagram"].map((social) => (
              <a
                key={social}
                href="#"
                className="hover:text-white transition-colors"
              >
                {social}
              </a>
            ))}
          </div>
          <p className="mb-1">© 2025 WhereIsMyShow. All rights reserved.</p>
          <p>
            Find your favorite shows and movies across all streaming platforms.
          </p>
        </div>
      </footer>
    </div>
  );
}
