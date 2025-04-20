import { useRef, useEffect } from 'react';
import { Text, Divider } from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';
import { useZoneState } from '../../zones/hooks/useZoneState';
import { useWaterState } from '../../waters/hooks/useWaterState';
import { FishingRule, SpecialWater } from '../../../shared/types';

// Import color utilities
import { regulationColors, regulationNames } from '../../../shared/utils/colorUtils';

// Directly import specialWatersData
import specialWatersData from '../../../data/specialWatersData';

interface RegulationsPanelProps {
  findMatchingSpecialWater: (rule: FishingRule) => SpecialWater | null;
  getRegulationColor: (type: string) => string;
}

// Interface for synthetic rule with optional synthetic flag
interface SyntheticRule extends FishingRule {
  synthetic?: boolean;
  waterId?: string;
}

const RegulationsPanel = ({ findMatchingSpecialWater, getRegulationColor }: RegulationsPanelProps) => {
  const zoneState = useZoneState() as any;
  const { selectedZone, zoneData, isLoading, setSelectedZone } = zoneState;
  const setShowRegulationsPanel = zoneState.setShowRegulationsPanel || (() => {});

  const { selectedWater, selectedWaterRule, setSelectedWater, setSelectedWaterRule } = useWaterState();
  const flyoutRef = useRef<HTMLDivElement | null>(null);
  const specialWatersRuleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const allRulesRef = useRef<SyntheticRule[]>([]);

  // Auto-scroll to the matching rule when selectedWaterRule changes
  useEffect(() => {
    if (selectedWaterRule && allRulesRef.current.length > 0) {
      // Find the index of the matching rule
      const ruleIndex = allRulesRef.current.findIndex(
        rule => rule.area === selectedWaterRule.area
      );

      if (ruleIndex !== -1 && specialWatersRuleRefs.current[ruleIndex]) {
        setTimeout(() => {
          specialWatersRuleRefs.current[ruleIndex]?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
      }
    }
  }, [selectedWaterRule, allRulesRef.current.length]);

  // When selectedWater changes (map water clicked), find and highlight matching rule
  useEffect(() => {
    if (selectedWater && allRulesRef.current.length > 0 && !selectedWaterRule) {
      // Try to find a matching rule for the selected water
      const matchingRule = findRuleForWater(selectedWater);
      
      if (matchingRule) {
        setSelectedWaterRule(matchingRule);
      }
    }
  }, [selectedWater, allRulesRef.current.length, selectedWaterRule]);

  // Function to find a rule that matches a selected water
  const findRuleForWater = (water: SpecialWater): FishingRule | null => {
    // Check all rules including synthetic ones
    const allRules = allRulesRef.current;
    
    // First check exact matches
    let matchingRule = allRules.find(rule => {
      // Direct match by water ID
      if ((rule as SyntheticRule).waterId === water.id) {
        return true;
      }
      
      // Exact name match
      if (rule.area && (
        rule.area === water.name ||
        rule.area === water.area
      )) {
        return true;
      }
      
      return false;
    });
    
    // If not found, try partial matching
    if (!matchingRule) {
      matchingRule = allRules.find(rule => {
        if (!rule.area || !water.name) return false;
        
        const ruleArea = rule.area.toLowerCase();
        const waterName = water.name.toLowerCase();
        const waterArea = water.area ? water.area.toLowerCase() : '';
        
        return ruleArea.includes(waterName) || 
               waterName.includes(ruleArea) ||
               (waterArea && (ruleArea.includes(waterArea) || waterArea.includes(ruleArea)));
      });
    }
    
    return matchingRule;
  };

  // Handle rule selection with map navigation
  const handleRuleClick = (rule: FishingRule, _index: number) => {
    try {
      // Find matching special water on the map
      const matchingWater = findMatchingSpecialWater(rule);

      if (matchingWater) {
        // If it's the same rule, toggle off
        if (selectedWaterRule && rule.area === selectedWaterRule.area) {
          setSelectedWaterRule(null);
          setSelectedWater(null);
        } else {
          setSelectedWaterRule(rule);
          setSelectedWater(matchingWater);

          // Navigate to the water feature on the map
          if (window.mapRef && window.mapRef.current) {
            const map = window.mapRef.current;
            if (matchingWater.featureType === 'point') {
              map.flyTo({
                center: matchingWater.coordinates,
                zoom: 12,
                duration: 1000
              });
            } else if (matchingWater.featureType === 'linear') {
              const coords = matchingWater.coordinates;
              const midIndex = Math.floor(coords.length / 2);
              map.flyTo({
                center: coords[midIndex],
                zoom: 11,
                duration: 1000
              });
            }
          }
        }
      }
    } catch (error) {
      console.error("[RegPanel] Error in rule click handler:", error);
    }
  };

  // Function to check if a rule has a corresponding water marker
  const hasMapMarker = (rule: FishingRule): boolean => {
    try {
      return !!findMatchingSpecialWater(rule);
    } catch (error) {
      return false;
    }
  };

  // Add synthetic rules for any extended season waters
  // that exist in specialWatersData but don't have entries in zoneData.specialWaters
  const getAllSpecialWaterRules = (): FishingRule[] => {
    if (!zoneData || !zoneData.specialWaters) return [];
    
    // Start with the original special waters rules
    const allRules = [...zoneData.specialWaters];
    
    // Check if we need to add any extended season waters
    if (selectedZone && specialWatersData && specialWatersData[selectedZone]) {
      // Find all extended season waters in the map data
      const extendedSeasonWaters = specialWatersData[selectedZone]
        .filter((water: any) => water.regulationType === 'extended-season');
      
      // Get all areas already in the rules (case-insensitive)
      const existingAreas = new Set(
        allRules
          .filter(rule => rule.area)
          .map(rule => rule.area.toLowerCase())
      );
      
      // Find extended season waters that don't have corresponding rules
      const missingWaters = extendedSeasonWaters.filter((water: any) => {
        const waterName = water.name.toLowerCase();
        const waterArea = water.area ? water.area.toLowerCase() : '';
        
        // Check if this water already has a rule
        return !existingAreas.has(waterName) && 
               !existingAreas.has(waterArea) &&
               // Also check if the water name is part of any existing area
               !Array.from(existingAreas).some(area => 
                 area.includes(waterName) || waterName.includes(area)
               );
      });
      
      // Create synthetic rules for the missing waters
      const syntheticRules: SyntheticRule[] = missingWaters.map((water: any) => ({
        species: ['Brook Trout', 'Rainbow Trout'],
        area: water.name,
        season: 'Open all year',
        bagLimit: '2 trout/day (Oct 1 - Mar 31)',
        notes: 'Extended Season water. Regular bag limit applies Apr 1 - Sep 30.',
        synthetic: true,
        waterId: water.id
      }));
      
      // Add the synthetic rules to the list
      allRules.push(...syntheticRules);
    }
    
    // Store all rules in the ref for access in effects
    allRulesRef.current = allRules as SyntheticRule[];
    
    return allRules;
  };

  // Debug: Check if panel should be rendered
  if (!selectedZone) {
    return null;
  }

  // Common panel styles
  const panelStyles = {
    position: 'absolute' as const,
    top: 120,
    right: 0,
    width: 360,
    bottom: 20,
    overflowY: 'auto' as const,
    backgroundColor: 'rgba(18,22,18,0.85)',
    color: '#e0ffe0',
    padding: 20,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    boxShadow: '-4px 0 12px rgba(0,0,0,0.4)',
    zIndex: 1100,
    backdropFilter: 'blur(10px)',
    scrollBehavior: 'smooth' as const
  };

  // Common close button styles
  const closeButtonStyles = {
    position: 'absolute' as const,
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: '50%',
    backgroundColor: 'rgba(75, 95, 75, 0.6)',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    zIndex: 1101,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  };

  // If we're loading or don't have data yet, show a loading state
  if (isLoading || !zoneData) {
    return (
      <div
        ref={(el) => {
          flyoutRef.current = el;
        }}
        className="flyout-panel"
        style={{
          ...panelStyles,
          border: '2px solid #4a7a4a'
        }}
      >
        <div
          onClick={() => {
            setSelectedZone('');
            if (typeof setShowRegulationsPanel === 'function') {
              setShowRegulationsPanel(false);
            }
          }}
          style={closeButtonStyles}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(100, 130, 100, 0.8)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(75, 95, 75, 0.6)'}
        >
          <span style={{ color: '#e0ffe0', fontSize: 18, fontWeight: 700, lineHeight: 1 }}>×</span>
        </div>

        <Text style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{selectedZone}</Text>
        <Text size="sm" style={{ marginBottom: 12 }}>Loading zone regulations...</Text>
      </div>
    );
  }
  
  // Get all special water rules including synthetic ones
  const allSpecialWaterRules = getAllSpecialWaterRules();
  
  return (
    <div
      ref={(el) => {
        flyoutRef.current = el;
      }}
      className="flyout-panel"
      style={panelStyles}
    >
      {/* Close Button */}
      <div
        onClick={() => {
          setSelectedZone('');
          if (typeof setShowRegulationsPanel === 'function') {
            setShowRegulationsPanel(false);
          }
        }}
        style={closeButtonStyles}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(100, 130, 100, 0.8)'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(75, 95, 75, 0.6)'}
      >
        <span style={{ color: '#e0ffe0', fontSize: 18, fontWeight: 700, lineHeight: 1 }}>×</span>
      </div>

      <Text style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{zoneData.zone}</Text>

      {zoneData.notes && (
        <Text size="sm" style={{ marginBottom: 12 }}>
          <strong>Note:</strong> {zoneData.notes}
        </Text>
      )}

      {/* Special Waters Legend */}
      <div style={{
        backgroundColor: 'rgba(46, 65, 46, 0.3)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16
      }}>
        <Text size="sm" style={{ fontWeight: 700, marginBottom: 8 }}>
          Special Waters Legend
        </Text>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {Object.entries(regulationColors).map(([type, color]) => (
            <div key={type} style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              padding: '4px 8px',
              borderRadius: 4,
              marginBottom: 4
            }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: color,
                  border: '1px solid rgba(255, 255, 255, 0.7)',
                  marginRight: 6
                }}
              />
              <Text size="xs">
                {regulationNames[type as keyof typeof regulationNames]}
              </Text>
            </div>
          ))}
        </div>
      </div>

      {/* Special water details notification banner */}
      {selectedWater && selectedWaterRule && (
        <div style={{
          backgroundColor: selectedWater.regulationType ?
            getRegulationColor(selectedWater.regulationType) : '#70d670',
          color: '#000000',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10
        }}>
          <IconMapPin size={18} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <Text size="sm" style={{ fontWeight: 700 }}>
              {selectedWater.name}
            </Text>
            <Text size="xs">
              {selectedWater.regulationType ?
                (regulationNames[selectedWater.regulationType as keyof typeof regulationNames] || selectedWater.regulationType) :
                'Special Water'}
            </Text>
            <Text size="xs" style={{ marginTop: 4 }}>
              See highlighted special waters section below for regulations
            </Text>
          </div>
        </div>
      )}

      {/* General Rules */}
      {zoneData.rules && zoneData.rules.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Text size="sm" style={{ fontWeight: 700, marginBottom: 8, borderBottom: '1px solid #444' }}>
            General Rules
          </Text>
          {zoneData.rules.map((rule: FishingRule, idx: number) => (
            <div
              key={`rule-${idx}`}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid #2e3c2e',
                borderRadius: 8,
                padding: 10,
                marginTop: 12
              }}
            >
              <Text size="xs" style={{ fontWeight: 600, color: '#c1ffc1' }}>
                {rule.species ? rule.species.join(', ') : 'Various species'}
              </Text>
              {rule.area && (
                <Text size="xs"><strong>Area:</strong> {rule.area}</Text>
              )}
              <Text size="xs"><strong>Season:</strong> {rule.season || 'Check regulations'}</Text>
              <Text size="xs"><strong>Bag Limit:</strong> {rule.bagLimit || 'Check regulations'}</Text>
              <Text size="xs"><strong>Notes:</strong> {rule.notes || 'No additional notes'}</Text>
            </div>
          ))}
        </div>
      )}

      {/* Special Waters Section */}
      {allSpecialWaterRules.length > 0 && (
        <div style={{
          marginTop: 30,
          backgroundColor: 'rgba(46, 65, 46, 0.3)',
          borderRadius: 10,
          padding: 16,
          boxShadow: '0 3px 8px rgba(0, 0, 0, 0.2)'
        }}>
          <Divider
            label={<Text size="sm" style={{ fontWeight: 700, color: '#a0ffa0' }}>SPECIAL WATERS</Text>}
            labelPosition="center"
            my="sm"
            styles={{
              label: { backgroundColor: 'transparent' },
              root: { borderTop: '2px solid #4d734d' }
            }}
          />
          {allSpecialWaterRules.map((rule: FishingRule, idx: number) => {
            if (!rule || !rule.area) return null;

            // Get the regulation type based on matching water
            const regulationType = (rule as SyntheticRule).synthetic ? 'extended-season' : 
              (findMatchingSpecialWater(rule)?.regulationType || 'special-season');
            
            // Check if this rule has a marker on the map
            const hasMarker = hasMapMarker(rule) || (rule as SyntheticRule).synthetic;
            
            const isHighlighted = selectedWaterRule?.area === rule.area;
            
            // Get the color for this regulation type
            const ruleColor = getRegulationColor(regulationType);
            
            // Determine regulation name for display
            const regulationName = regulationNames[regulationType as keyof typeof regulationNames] || 'Special Regulation';

            return (
              <div
                key={`special-${idx}`}
                ref={(el) => {
                  specialWatersRuleRefs.current[idx] = el;
                  return undefined;
                }}
                onClick={() => hasMarker && handleRuleClick(rule, idx)}
                style={{
                  backgroundColor: isHighlighted ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  border: isHighlighted
                    ? `2px solid ${ruleColor}`
                    : hasMarker 
                      ? `1px solid ${ruleColor}` 
                      : '1px solid #3e5c3e',
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 12,
                  cursor: hasMarker ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  boxShadow: isHighlighted 
                    ? `0 0 10px ${ruleColor}44` 
                    : 'none',
                }}
              >
                {/* Regulation type indicator */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: 8,
                  height: '100%',
                  backgroundColor: ruleColor,
                  borderTopLeftRadius: 7,
                  borderBottomLeftRadius: 7,
                  opacity: isHighlighted ? 1 : 0.8
                }} />

                {/* Map pin icon for clickable rules */}
                {hasMarker && (
                  <div style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    color: ruleColor,
                    animation: isHighlighted ? 'pulse 1.5s infinite' : 'none'
                  }}>
                    <IconMapPin size={16} />
                  </div>
                )}

                <div style={{ 
                  marginLeft: 14,
                  padding: '2px 0'
                }}>
                  <Text 
                    size="sm" 
                    style={{ 
                      fontWeight: isHighlighted ? 700 : 600, 
                      color: isHighlighted ? '#ffffff' : '#d0ffd0' 
                    }}
                  >
                    {rule.species ? rule.species.join(', ') : 'Various species'}
                  </Text>
                  <Text 
                    size="sm" 
                    style={{ 
                      fontWeight: isHighlighted ? 600 : 'normal' 
                    }}
                  >
                    <strong>Area:</strong> {rule.area || 'Special area'}
                  </Text>
                  <Text size="sm"><strong>Season:</strong> {rule.season || 'Check regulations'}</Text>
                  <Text size="sm"><strong>Bag Limit:</strong> {rule.bagLimit || 'Check regulations'}</Text>
                  <Text size="sm"><strong>Notes:</strong> {rule.notes || 'No additional notes'}</Text>

                  {/* Always display regulation type badge */}
                  <div style={{ 
                    display: 'inline-block',
                    backgroundColor: `${ruleColor}33`,
                    border: `1px solid ${ruleColor}`,
                    color: isHighlighted ? '#ffffff' : '#d0ffd0',
                    borderRadius: 4,
                    padding: '2px 6px',
                    fontSize: 11,
                    marginTop: 6
                  }}>
                    {regulationName}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add a style tag for the pulsing animation */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default RegulationsPanel;