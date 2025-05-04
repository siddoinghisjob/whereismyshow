import { Country, getCountryByCode } from './countries';

export async function detectCountryFromIP(): Promise<Country | null> {
  try {
    // First try using ipapi.co which gives direct country code
    try {
      const countryResponse = await fetch('https://ipapi.co/country/');
      if (countryResponse.ok) {
        const countryCode = await countryResponse.text();
        if (countryCode && countryCode.length === 2) {
          const country = getCountryByCode(countryCode);
          if (country) return country;
        }
      }
    } catch (error) {
      console.error('Error with primary IP detection method:', error);
    }
    
    // Fallback to ipify + ipapi if the direct method fails
    try {
      const ipResponse = await fetch("https://api.ipify.org?format=json");
      if (ipResponse.ok) {
        const ipData = await ipResponse.json();
        const userIP = ipData.ip;
        
        const countryResponse = await fetch(`https://ipapi.co/${userIP}/country/`);
        if (countryResponse.ok) {
          const countryCode = await countryResponse.text();
          if (countryCode && countryCode.length === 2) {
            const country = getCountryByCode(countryCode);
            if (country) return country;
          }
        }
      }
    } catch (error) {
      console.error('Error with fallback IP detection method:', error);
    }
    
    // Return null if detection failed (CountryContext will handle the fallback)
    return null;
  } catch (error) {
    console.error('Error in country detection:', error);
    return null;
  }
}