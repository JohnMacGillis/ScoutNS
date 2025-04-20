// Base shared types that will be used across the application

export interface BaseSpecialWater {
  id: string;
  name: string;
  area: string;
  regulationType?: string;
  species?: string[];
}

export interface PointSpecialWater extends BaseSpecialWater {
  featureType: 'point';
  coordinates: [number, number]; // Single point [longitude, latitude]
}

export interface LinearSpecialWater extends BaseSpecialWater {
  featureType: 'linear';
  coordinates: [number, number][]; // Array of points [longitude, latitude][]
}

export type SpecialWater = PointSpecialWater | LinearSpecialWater;

export interface FishingRule {
  species: string[];
  area?: string | null;
  season?: string;
  bagLimit?: string;
  notes?: string;
}

export interface ZoneInfo {
  zone: string;
  notes?: string;
  rules: FishingRule[];
  specialWaters: FishingRule[];
}
