import React, { useEffect } from 'react';
import { useZoneState } from '../../zones/hooks/useZoneState';

// Add this interface to tell TypeScript about our window property
declare global {
  interface Window {
    __DEBUG_ZONE_RULE_MAP?: Record<string, any>;
    zoneRuleMap?: Record<string, any>;
    normalizeZoneKey?: (zone: string) => string;
  }
}

/**
 * This component doesn't render anything but adds debug instrumentation
 * to help diagnose zone data loading issues.
 */
const ZoneDebugProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const zoneState = useZoneState();
  const { selectedZone, zoneData, isLoading, error } = zoneState;

  // Run debugging on each render
  useEffect(() => {
    console.log('[ZoneDebug] Component rendered with state:', {
      selectedZone,
      hasZoneData: !!zoneData,
      isLoading,
      hasError: !!error,
      ruleCount: zoneData?.rules?.length || 0,
      specialWaterCount: zoneData?.specialWaters?.length || 0
    });

    // Special debugging when a zone is selected
    if (selectedZone) {
      console.log(`[ZoneDebug] Zone ${selectedZone} selected`);

      // If we have zone data from the state, analyze it
      if (zoneData && zoneData.rules && zoneData.rules.length > 0) {
        console.log(`[ZoneDebug] ${selectedZone} data found in zoneState:`, {
          hasRules: Array.isArray(zoneData.rules) && zoneData.rules.length > 0,
          ruleCount: Array.isArray(zoneData.rules) ? zoneData.rules.length : 0,
          specialWaterCount: Array.isArray(zoneData.specialWaters) ? zoneData.specialWaters.length : 0,
          notes: zoneData.notes?.substring(0, 50) + '...',
          firstRule: zoneData.rules[0]
        });
      } else {
        console.log(`[ZoneDebug] No ${selectedZone} data found in zoneState`);
        
        // Check if it's available in the window map
        if (window.__DEBUG_ZONE_RULE_MAP && window.__DEBUG_ZONE_RULE_MAP[selectedZone]) {
          const directData = window.__DEBUG_ZONE_RULE_MAP[selectedZone];
          console.log(`[ZoneDebug] But ${selectedZone} data IS available in window.__DEBUG_ZONE_RULE_MAP:`, {
            hasRules: Array.isArray(directData.rules) && directData.rules.length > 0,
            ruleCount: Array.isArray(directData.rules) ? directData.rules.length : 0,
            specialWaterCount: Array.isArray(directData.specialWaters) ? directData.specialWaters.length : 0
          });
        }
      }

      // Debug the zoneRuleMap
      try {
        if (window.__DEBUG_ZONE_RULE_MAP) {
          const zoneRuleMap = window.__DEBUG_ZONE_RULE_MAP;
          console.log('[ZoneDebug] zoneRuleMap available in window:', {
            hasSelectedZone: !!zoneRuleMap[selectedZone],
            keys: Object.keys(zoneRuleMap)
          });
          
          // Check if the selected zone is in the map and has data
          if (zoneRuleMap[selectedZone]) {
            const mapData = zoneRuleMap[selectedZone];
            console.log(`[ZoneDebug] ${selectedZone} in window map:`, {
              hasRules: Array.isArray(mapData.rules) && mapData.rules.length > 0,
              ruleCount: Array.isArray(mapData.rules) ? mapData.rules.length : 0,
              specialWaterCount: Array.isArray(mapData.specialWaters) ? mapData.specialWaters.length : 0
            });
          }
        } else {
          console.log('[ZoneDebug] zoneRuleMap not available in window');
        }
      } catch (err) {
        console.log('[ZoneDebug] Error accessing zoneRuleMap:', err);
      }
    }
  }, [selectedZone, zoneData, isLoading, error]);

  // This component doesn't render anything
  return <>{children}</>;
};

export default ZoneDebugProvider;
