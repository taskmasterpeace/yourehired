import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design
 * @param {string} query - Media query string e.g. '(max-width: 768px)'
 * @returns {boolean} - Whether the media query matches
 */
export function useMediaQuery(query) {
  // Initialize with null and update after mount to avoid hydration mismatch
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    // Set initial value after mount
    const media = window.matchMedia(query);
    setMatches(media.matches);
    
    // Create listener function
    const listener = (event) => {
      setMatches(event.matches);
    };
    
    // Add listener
    media.addEventListener('change', listener);
    
    // Clean up
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);
  
  return matches;
}
