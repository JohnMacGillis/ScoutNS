import zone1Data from './zone1_fishing_rules.json';
import zone2Data from './zone2_fishing_rules.json';
import zone3Data from './zone3_fishing_rules.json';
import zone4Data from './zone4_fishing_rules.json';
import zone5Data from './zone5_fishing_rules.json';
import zone6Data from './zone6_fishing_rules.json';

// Export individual zone data
export const zone1 = zone1Data;
export const zone2 = zone2Data;
export const zone3 = zone3Data;
export const zone4 = zone4Data;
export const zone5 = zone5Data;
export const zone6 = zone6Data;

// Export as a map
export const zoneMap = {
  'RFA 1': zone1Data,
  'RFA 2': zone2Data,
  'RFA 3': zone3Data,
  'RFA 4': zone4Data,
  'RFA 5': zone5Data,
  'RFA 6': zone6Data
};

// Make globally available for debugging
if (typeof window !== 'undefined') {
  window.__DEBUG_ZONE_RULE_MAP = zoneMap;
  window.zoneRuleMap = zoneMap;
}

// Add typescript support for window properties
declare global {
  interface Window {
    __DEBUG_ZONE_RULE_MAP?: Record<string, any>;
    zoneRuleMap?: Record<string, any>;
    normalizeZoneKey?: (zone: string) => string;
  }
}

// Log for debugging
console.log('[ZoneData] Exported zone data:', {
  'RFA 1': !!zone1Data,
  'RFA 2': !!zone2Data,
  'RFA 3': !!zone3Data,
  'RFA 4': !!zone4Data,
  'RFA 5': !!zone5Data,
  'RFA 6': !!zone6Data
});
