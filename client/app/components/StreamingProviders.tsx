"use client";

import Image from "next/image";
import { StreamerDetail } from "../types";
import { useState } from "react";

interface StreamingProvidersProps {
  streams: StreamerDetail[];
}

export default function StreamingProviders({ streams }: StreamingProvidersProps) {
  // Helper function to get resolution priority (higher number means better quality)
  const getResolutionPriority = (resolution: string): number => {
    const priorities: Record<string, number> = {
      '_4K': 5,
      '4K': 5,
      'UHD': 4,
      'HD': 3,
      'SD': 2,
      'CANVAS': 1,
    };
    return priorities[resolution] || 0;
  };
  
  // Group streams by Type (FLATRATE, RENT, etc.)
  const streamsByType: Record<string, StreamerDetail[]> = {};
  
  // Process streams to keep highest resolution for each provider
  streams.forEach(stream => {
    const type = stream.Type || 'OTHER';
    if (!streamsByType[type]) {
      streamsByType[type] = [];
    }
    
    // Check if provider already exists in this type group
    const existingIndex = streamsByType[type].findIndex(
      s => s.Provider === stream.Provider
    );
    
    if (existingIndex === -1) {
      // Provider doesn't exist yet, add it
      streamsByType[type].push(stream);
    } else {
      // Provider exists, keep the one with better resolution
      const existing = streamsByType[type][existingIndex];
      const existingPriority = getResolutionPriority(existing.Resolution);
      const newPriority = getResolutionPriority(stream.Resolution);
      
      if (newPriority > existingPriority) {
        // Replace with higher resolution option
        streamsByType[type][existingIndex] = stream;
      }
    }
  });
  
  // Sort by common priority (FLATRATE first, then others)
  const sortedTypes = Object.keys(streamsByType).sort((a, b) => {
    const priority: Record<string, number> = {
      'FLATRATE': 1,
      'FREE': 2,
      'ADS': 3,
      'CINEMA': 4,
      'RENT': 5,
      'BUY': 6,
      'OTHER': 7,
    };
    return (priority[a] || 99) - (priority[b] || 99);
  });

  const typeLabels: Record<string, string> = {
    'FLATRATE': 'Stream with Subscription',
    'RENT': 'Rent',
    'BUY': 'Buy',
    'CINEMA': 'In Theaters',
    'FREE': 'Watch Free',
    'ADS': 'Free with Ads',
    'OTHER': 'Other Options'
  };

  const [activeType, setActiveType] = useState<string>(sortedTypes[0] || '');

  if (!streams || streams.length === 0) {
    return (
      <div className="p-8 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/30 text-center">
        <h3 className="text-xl font-bold mb-4">Where to Watch</h3>
        <div className="py-12">
          <p className="text-gray-400">No streaming options available in your region.</p>
          <p className="mt-2 text-sm text-gray-500">Try changing your country in the settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Tab Navigation for Stream Types - Improved mobile scrolling */}
      <div className="flex overflow-x-auto pb-1 scrollbar-hide">
        <div className="flex p-2 gap-1 sm:gap-2">
          {sortedTypes.map(type => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeType === type 
                  ? 'bg-red-600 text-white shadow-lg' 
                  : 'bg-slate-800/90 hover:bg-slate-700 text-gray-300'
              }`}
            >
              {typeLabels[type] || type}
              <span className="ml-1 sm:ml-2 inline-flex items-center justify-center bg-slate-700/50 text-xs rounded-full h-4 sm:h-5 min-w-4 sm:min-w-5 px-1">
                {streamsByType[type].length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Stream Type Content */}
      {activeType && streamsByType[activeType] && (
        <div className="p-3 sm:p-6">
          <div className="space-y-3">
            {streamsByType[activeType].map((stream, index) => (
              <div 
                key={`${stream.Provider}-${index}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors border border-slate-700/50 backdrop-blur-sm"
              >
                <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-0">
                  <div className="w-16 sm:w-20 h-9 sm:h-11 relative rounded-md overflow-hidden bg-slate-700 flex items-center justify-center shrink-0 ring-1 ring-slate-600">
                    {stream.Icon ? (
                      <div className="w-full h-full relative">
                        <Image
                          src={stream.Icon}
                          alt={`${stream.Provider} logo`}
                          fill
                          className="object-contain p-1"
                          sizes="(max-width: 640px) 64px, 80px"
                        />
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-center">{stream.Provider.substring(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-white text-base sm:text-lg">{stream.Provider}</h4>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                      {stream.Resolution && (
                        <span className={`px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium ${
                          stream.Resolution.includes('4K') || stream.Resolution === 'UHD' 
                            ? 'bg-emerald-600/90 text-white' 
                            : stream.Resolution === 'HD'
                              ? 'bg-blue-600/90 text-white'
                              : 'bg-slate-700 text-gray-200'
                        }`}>
                          {stream.Resolution.replace('_', '')}
                        </span>
                      )}
                      {stream.Price && (
                        <span className="text-xs sm:text-sm font-semibold text-amber-400">
                          {stream.Price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <a
                  href={stream.Link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-600 hover:bg-red-700 transition-all text-white text-center py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm font-medium flex-shrink-0 shadow-lg hover:shadow-red-900/30"
                >
                  Watch Now
                </a>
              </div>
            ))}
          </div>
      
          {/* Audio & Subtitles Info - Improved mobile layout */}
          <div className="mt-6 sm:mt-8 pt-4 border-t border-slate-700/50 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="text-xs sm:text-sm text-gray-400">
              <p className="mb-2 text-gray-300 font-medium">Audio languages available:</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {Array.from(new Set(streams.flatMap(s => s.Audio || []))).map(lang => (
                  <span key={lang} className="bg-slate-800 px-2 py-0.5 rounded text-gray-300 text-xs">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="text-xs sm:text-sm text-gray-400">
              <p className="mb-2 text-gray-300 font-medium">Subtitle languages available:</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {Array.from(new Set(streams.flatMap(s => s.Subtitle || []))).map(lang => (
                  <span key={lang} className="bg-slate-800 px-2 py-0.5 rounded text-gray-300 text-xs">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}