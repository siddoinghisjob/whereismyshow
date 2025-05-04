"use client";

import Image from "next/image";
import Link from "next/link";
import { SearchResult, SimilarTitle } from "../types";

interface MediaCardProps {
  item: SearchResult | SimilarTitle;
  size?: "small" | "medium" | "large";
}

export default function MediaCard({ item }: MediaCardProps) {
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

  return (
    <Link
      href={detailsUrl}
      className={`w-full flex flex-col items-center justify-start text-center bg-neutral-900 rounded-md p-4 transition-transform transform hover:scale-105 group`}
    >
      {/* Poster Image */}
      <div
        className={`relative h-80 w-60 rounded-md overflow-hidden bg-gray-800`}
      >
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={title || "Media poster"}
            className = "absolute left-0 top-0 w-full h-full object-cover border-2"
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
          <h3 className="text-white font-semibold text-sm line-clamp-2">
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
      <p className="text-white font-medium mt-2 text-sm w-full h-full">
        {title}
      </p>

      {"originalReleaseYear" in item && item.originalReleaseYear && (
        <p className="text-gray-400 text-xs">{item.originalReleaseYear}</p>
      )}
    </Link>
  );
}
