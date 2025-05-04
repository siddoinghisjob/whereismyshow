"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import { Country, getDefaultCountry } from "../utils/countries";
import { detectCountryFromIP } from "../utils/ip-detection";

interface CountryContextType {
  selectedCountry: Country;
  setSelectedCountry: (country: Country) => void;
  isLoading: boolean;
  isAutoDetected: boolean;
  resetToAutoDetected: () => void;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export function CountryProvider({ children }: { children: React.ReactNode }) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(getDefaultCountry());
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoDetected, setIsAutoDetected] = useState(true);
  const [autoDetectedCountry, setAutoDetectedCountry] = useState<Country | null>(null);

  // Function to handle manual country selection
  const handleSetSelectedCountry = (country: Country) => {
    setSelectedCountry(country);
    setIsAutoDetected(false);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCountry', JSON.stringify(country));
      localStorage.setItem('countrySelectionMode', 'manual');
    }
  };

  // Function to reset to auto-detected country
  const resetToAutoDetected = () => {
    if (autoDetectedCountry) {
      setSelectedCountry(autoDetectedCountry);
      setIsAutoDetected(true);
      
      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedCountry', JSON.stringify(autoDetectedCountry));
        localStorage.setItem('countrySelectionMode', 'auto');
      }
    } else {
      // If no auto-detection available, use US as fallback
      const fallbackCountry = getDefaultCountry();
      setSelectedCountry(fallbackCountry);
      setIsAutoDetected(true);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedCountry', JSON.stringify(fallbackCountry));
        localStorage.setItem('countrySelectionMode', 'auto');
      }
    }
  };

  // Detect country on initial load
  useEffect(() => {
    const detectCountry = async () => {
      try {
        // Check localStorage first
        if (typeof window !== 'undefined') {
          const savedCountry = localStorage.getItem('selectedCountry');
          const selectionMode = localStorage.getItem('countrySelectionMode');
          
          if (savedCountry) {
            const parsedCountry = JSON.parse(savedCountry);
            setSelectedCountry(parsedCountry);
            
            // If selection mode is manual, keep it that way
            setIsAutoDetected(selectionMode !== 'manual');
          }
        }
        
        // Always attempt auto-detection in the background
        const detectedCountry = await detectCountryFromIP();
        
        if (detectedCountry) {
          // Store the auto-detected country for potential reset
          setAutoDetectedCountry(detectedCountry);
          
          // If we're in auto mode or no saved country, use the detected one
          if (isAutoDetected || !localStorage.getItem('selectedCountry')) {
            setSelectedCountry(detectedCountry);
            
            if (typeof window !== 'undefined') {
              localStorage.setItem('selectedCountry', JSON.stringify(detectedCountry));
              localStorage.setItem('countrySelectionMode', 'auto');
            }
          }
        } else {
          // If detection failed, store US as the auto-detected fallback
          const fallbackCountry = getDefaultCountry();
          setAutoDetectedCountry(fallbackCountry);
          
          // Only set selected if we're in auto mode or no saved selection
          if (isAutoDetected || !localStorage.getItem('selectedCountry')) {
            setSelectedCountry(fallbackCountry);
            
            if (typeof window !== 'undefined') {
              localStorage.setItem('selectedCountry', JSON.stringify(fallbackCountry));
              localStorage.setItem('countrySelectionMode', 'auto');
            }
          }
        }
      } catch (error) {
        console.error('Error setting up country:', error);
        
        // Use US as fallback
        const usCountry = getDefaultCountry();
        setSelectedCountry(usCountry);
        setAutoDetectedCountry(usCountry);
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('selectedCountry', JSON.stringify(usCountry));
          localStorage.setItem('countrySelectionMode', 'auto');
        }
      } finally {
        setIsLoading(false);
      }
    };

    detectCountry();
  }, [isAutoDetected]);

  const value = {
    selectedCountry,
    setSelectedCountry: handleSetSelectedCountry,
    isLoading,
    isAutoDetected,
    resetToAutoDetected
  };

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const context = useContext(CountryContext);
  if (context === undefined) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
}