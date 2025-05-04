"use client";

import { useState, useEffect, useRef } from "react";
import { countries } from "../utils/countries";
import { useCountry } from "../context/CountryContext";

export default function CountrySelect() {
  const { selectedCountry, setSelectedCountry, isAutoDetected, resetToAutoDetected } = useCountry();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Filter countries based on search term
  const filteredCountries = searchTerm.trim() === "" 
    ? countries 
    : countries.filter(country => 
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.code.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Handle clicks outside of the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  // Reset search term when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center space-x-2 bg-neutral-800 hover:bg-neutral-700 transition-colors px-3 py-2 rounded-md text-sm text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg">{selectedCountry.flag}</span>
        <span>{selectedCountry.name}</span>
        <span className="ml-2 text-gray-400 text-xs">({selectedCountry.code})</span>
        {isAutoDetected && (
          <span className="ml-1 text-xs text-green-500">(Auto)</span>
        )}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute mt-2 z-50 w-64 right-1 bg-neutral-800 rounded-md shadow-lg overflow-hidden border border-neutral-700">
          <div className="p-2">
            <input
              ref={searchRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search countries..."
              className="w-full px-3 py-2 bg-neutral-700/50 text-white placeholder-gray-400 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          
          {!isAutoDetected && (
            <div className="px-4 py-2 border-b border-neutral-700">
              <button 
                onClick={() => {
                  resetToAutoDetected();
                  setIsOpen(false);
                }}
                className="w-full text-left text-sm text-green-500 hover:text-green-400 flex items-center"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset to auto-detected location
              </button>
            </div>
          )}
          
          <div className="max-h-80 overflow-y-auto">
            {filteredCountries.map((country) => (
              <button
                key={country.code}
                className={`w-full flex items-center space-x-3 px-4 py-2 text-sm text-left hover:bg-neutral-700 transition-colors ${
                  selectedCountry.code === country.code ? "bg-neutral-700" : ""
                }`}
                onClick={() => {
                  setSelectedCountry(country);
                  setIsOpen(false);
                }}
              >
                <span className="text-xl">{country.flag}</span>
                <span className="text-white">{country.name}</span>
                <span className="text-gray-400 ml-auto">{country.code}</span>
              </button>
            ))}
            
            {filteredCountries.length === 0 && (
              <div className="p-4 text-center text-gray-400 text-sm">
                No countries match your search
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}