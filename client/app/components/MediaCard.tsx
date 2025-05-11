"use client";

import Image from "next/image";
import Link from "next/link";
import { SearchResult, SimilarTitle } from "../types";

interface MediaCardProps {
  item: SearchResult | SimilarTitle;
  size?: "small" | "medium" | "large";
}

export default function MediaCard({ item, size = "medium" }: MediaCardProps) {
  // Handle both SearchResult and SimilarTitle types
  const title = "title" in item ? item.title : null;
  const posterUrl =
    "posterUrl" in item
      ? item.posterUrl
      : "poster" in item
      ? item.poster
      : null;
  const fullPath = item.fullPath;
  if (!fullPath || fullPath === "") {
    return;
  }

  // Get additional info for SimilarTitle items
  const genres = "genres" in item ? item.genres : [];
  const imdbScore =
    "scoring" in item && item.scoring?.imdbScore && !isNaN(Number(item.scoring.imdbScore)) 
      ? Number(item.scoring.imdbScore) 
      : null;

  // Create the URL with posterUrl as a query parameter
  const detailsUrl = `/details/${encodeURIComponent(fullPath || "")}${
    posterUrl ? `?poster=${encodeURIComponent(posterUrl)}` : ""
  }`;

  // Define size-specific classes
  const sizeClasses = {
    small: {
      card: "w-36 sm:w-40",
      poster: "h-54 w-36 sm:h-60 sm:w-40",
      text: "text-xs",
    },
    medium: {
      card: "w-48 sm:w-52",
      poster: "h-72 w-48 sm:h-78 sm:w-52",
      text: "text-sm",
    },
    large: {
      card: "w-60",
      poster: "h-80 w-60",
      text: "text-sm",
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <Link
      href={detailsUrl}
      className={`flex flex-col items-center justify-start text-center bg-neutral-900 rounded-md h-full transition-transform transform hover:scale-105 group overflow-hidden ${currentSize.card}`}
    >
      {/* Poster Image */}
      <div
        className={`${currentSize.poster} relative rounded-md overflow-hidden bg-gray-800`}
      >
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={title || "Media poster"}
            className="p-4"
            fill
            quality={80}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          <h3 className={`text-white font-semibold ${currentSize.text} line-clamp-2`}>
            {title}
          </h3>

          {"originalReleaseYear" in item && item.originalReleaseYear && (
            <p className="text-gray-300 text-xs">{item.originalReleaseYear}</p>
          )}

          {imdbScore && (
            <div className="mt-1 flex items-center">
              <span className="bg-yellow-500 text-black text-xs px-1 font-bold rounded">
                {imdbScore.toFixed(1)}
              </span>
              <span className="text-xs text-gray-300 ml-1">IMDb</span>
            </div>
          )}

          {genres && genres?.length > 0 && (
            <p className="text-gray-400 text-xs mt-1 line-clamp-1">
              {genres?.slice(0, 2).join(" • ")}
            </p>
          )}
        </div>
      </div>

      {/* Title shown all the time */}
      <p className={`text-white font-medium mt-2 ${currentSize.text} w-full`}>
        {title}
      </p>

      {"originalReleaseYear" in item && item.originalReleaseYear && (
        <p className="text-gray-400 text-xs">{item.originalReleaseYear}</p>
      )}
    </Link>
  );
}
