// Color mapping for different regulation types
export const regulationColors: Record<string, string> = {
  'catch-release': '#ff9900',   // Orange
  'fly-only': '#29a329',        // Green
  'special-season': '#9966ff',  // Purple
  'closed': '#ff3333',          // Red
  'extended-season': '#3399ff', // Blue
  'special-limit': '#ffcc00'    // Yellow
};

// Display names for regulation types
export const regulationNames: Record<string, string> = {
  'catch-release': 'Catch & Release',
  'fly-only': 'Fly Fishing Only',
  'special-season': 'Special Season',
  'closed': 'Closed to Angling',
  'extended-season': 'Extended Season',
  'special-limit': 'Special Limits'
};

// Get regulation color with fallbacks
export const getRegulationColor = (type?: string): string => {
  // Default color (green) if type is missing
  if (!type) return '#70d670';
  
  // If it's a valid type in our mapping, use that color
  if (type in regulationColors) {
    return regulationColors[type];
  }
  
  // For any other string, use these fallback mappings
  const fallbackMap: Record<string, string> = {
    // Handle possible variations of types
    'catch': '#ff9900',       // Orange for any "catch" related
    'release': '#ff9900',     // Orange for any "release" related
    'fly': '#29a329',         // Green for any "fly" related
    'season': '#9966ff',      // Purple for "season" related
    'close': '#ff3333',       // Red for anything "closed" related
    'extend': '#3399ff',      // Blue for any "extended" related
    'special': '#ffcc00',     // Yellow for "special" related
    'limit': '#ffcc00'        // Yellow for "limit" related
  };
  
  // Check if type contains any of our fallback keywords
  for (const [keyword, color] of Object.entries(fallbackMap)) {
    if (type.toLowerCase().includes(keyword.toLowerCase())) {
      return color;
    }
  }
  
  // Final fallback - safe green color
  return '#70d670';
};
