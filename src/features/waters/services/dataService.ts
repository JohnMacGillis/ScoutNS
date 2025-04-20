import { SpecialWater } from '../../../shared/types';

// Cache for loaded data to prevent multiple fetches
const dataCache: Record<string, any> = {};

// Function to load water data for a specific zone
export const loadWaterData = async (zoneId: string): Promise<SpecialWater[]> => {
  // Check cache first
  if (dataCache[`waters-${zoneId}`]) {
    return dataCache[`waters-${zoneId}`];
  }
  
  try {
    // In production this would be a fetch request to an API
    // For now, we're importing from the local data files
    const data = await import(`../../../data/waters/zone${zoneId.replace(/\D/g, '')}_waters.json`);
    
    // Store in cache
    dataCache[`waters-${zoneId}`] = data.default;
    
    return data.default;
  } catch (error) {
    console.error(`Failed to load data for zone ${zoneId}:`, error);
    return [];
  }
};

// Function to load zone-specific regulation data
export const loadZoneRegulations = async (zoneId: string) => {
  // Check cache first
  if (dataCache[`regulations-${zoneId}`]) {
    return dataCache[`regulations-${zoneId}`];
  }
  
  try {
    // In production this would be a fetch request to an API
    const data = await import(`../../../data/zone${zoneId.replace(/\D/g, '')}_fishing_rules.json`);
    
    // Store in cache
    dataCache[`regulations-${zoneId}`] = data.default;
    
    return data.default;
  } catch (error) {
    console.error(`Failed to load regulations for zone ${zoneId}:`, error);
    return { rules: [], specialWaters: [], notes: "" };
  }
};
