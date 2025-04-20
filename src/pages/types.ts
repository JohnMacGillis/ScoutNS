// Base type for special waters
export interface BaseSpecialWater {
  id: string;
  name: string;
  area: string;
  regulationType?: string;
  species?: string[];
}

// Special water with a point geometry (single lat/lng coordinate)
export interface PointSpecialWater extends BaseSpecialWater {
  featureType: 'point';
  coordinates: [number, number]; // Single point [longitude, latitude]
}

// Special water with a linear geometry (array of lat/lng coordinates)
export interface LinearSpecialWater extends BaseSpecialWater {
  featureType: 'linear';
  coordinates: [number, number][]; // Array of points [longitude, latitude][]
}

// Union type that can be either point or linear
export type SpecialWater = PointSpecialWater | LinearSpecialWater;

// Type for fishing rules
export interface FishingRule {
  species: string[];
  area?: string | null; // Updated to allow null values
  season?: string;
  bagLimit?: string;
  notes?: string;
}

// Type for zone information
export interface ZoneInfo {
  zone: string;
  notes?: string;
  rules: FishingRule[];
  specialWaters: FishingRule[];
}
