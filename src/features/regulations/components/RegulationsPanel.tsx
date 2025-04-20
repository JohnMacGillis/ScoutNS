import { useRef, useEffect } from 'react';
import { Text, Divider } from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';
import { useZoneState } from '../../zones/hooks/useZoneState';
import { useWaterState } from '../../waters/hooks/useWaterState';
import { FishingRule, SpecialWater } from '../../../shared/types';

// Color mapping for different regulation types
const regulationColors: Record<string, string> = {
  'catch-release': '#ff9900',   // Orange
  'fly-only': '#29a329',        // Green
  'special-season': '#9966ff',  // Purple
  'closed': '#ff3333',          // Red
  'extended-season': '#3399ff', // Blue
  'special-limit': '#ffcc00'    // Yellow
};

// Display names for regulation types
const regulationNames: Record<string, string> = {
  'catch-release': 'Catch & Release',
  'fly-only': 'Fly Fishing Only',
  'special-season': 'Special Season',
  'closed': 'Closed to Angling',
  'extended-season': 'Extended Season',
  'special-limit': 'Special Limits'
};

interface RegulationsPanelProps {
  findMatchingSpecialWater: (rule: FishingRule) => SpecialWater | null;
  getRegulationColor: (type: string) => string;
}

const RegulationsPanel = ({ findMatchingSpecialWater, getRegulationColor }: RegulationsPanelProps) => {
  console.log("[RegPanel] Rendering RegulationsPanel component");

  // Use type assertion to bypass TypeScript errors
  const zoneState = useZoneState() as any;
  const { selectedZone, zoneData, isLoading, setSelectedZone } = zoneState;

  // Access these properties from zoneState directly with fallbacks
  const showRegulationsPanel = zoneState.showRegulationsPanel === undefined ? true : zoneState.showRegulationsPanel;
  const setShowRegulationsPanel = zoneState.setShowRegulationsPanel || (() => {});

  const { selectedWater, selectedWaterRule, setSelectedWater, setSelectedWaterRule } = useWaterState();
  const flyoutRef = useRef<HTMLDivElement | null>(null);
  const specialWatersRuleRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Log current state on each render
  console.log("[RegPanel] State:", {
    selectedZone,
    hasZoneData: !!zoneData,
    zoneDataZone: zoneData?.zone || "none",
    isLoading,
    showRegulationsPanel,
    hasSelectedWater: !!selectedWater,
    hasSelectedWaterRule: !!selectedWaterRule
  });

  // Log when the component mounts/unmounts
  useEffect(() => {
    console.log("[RegPanel] Component mounted");

    return () => {
      console.log("[RegPanel] Component unmounted");
    };
  }, []);

  // Handle rule selection
  const handleRuleClick = (rule: FishingRule, _index: number) => {
    console.log("[RegPanel] Rule clicked:", rule);

    // If it's the same rule, toggle off
    if (selectedWaterRule && rule.area === selectedWaterRule.area) {
      console.log("[RegPanel] Deselecting current rule");
      setSelectedWaterRule(null);
      setSelectedWater(null);
    } else {
      console.log("[RegPanel] Selecting new rule");
      setSelectedWaterRule(rule);

      // Find matching special water on the map
      const matchingWater = findMatchingSpecialWater(rule);
      console.log("[RegPanel] Matching water found:", !!matchingWater);

      if (matchingWater) {
        setSelectedWater(matchingWater);
      } else {
        setSelectedWater(null);
      }
    }
  };

  // Debug: Check if panel should be rendered
  if (!selectedZone) {
    console.log("[RegPanel] Not rendering - selectedZone is empty");
    return null;
  }

  console.log("[RegPanel] Panel should be visible - continuing render");

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
    console.log("[RegPanel] Rendering loading state");
    return (
      <div
        ref={(el) => {
          flyoutRef.current = el;
          console.log("[RegPanel] Flyout ref set:", !!el);
        }}
        className="flyout-panel"
        style={{
          ...panelStyles,
          border: '2px solid #4a7a4a' // Make loading state more visible for debugging
        }}
      >
        <div
          onClick={() => {
            console.log("[RegPanel] Close button clicked (loading state)");
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

  console.log("[RegPanel] Rendering full panel");
  return (
    <div
      ref={(el) => {
        flyoutRef.current = el;
        console.log("[RegPanel] Flyout ref set:", !!el);
      }}
      className="flyout-panel"
      style={panelStyles}
    >
      {/* Close Button */}
      <div
        onClick={() => {
          console.log("[RegPanel] Close button clicked");
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
      {zoneData.specialWaters && zoneData.specialWaters.length > 0 && (
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
          {zoneData.specialWaters.map((rule: FishingRule, idx: number) => {
            if (!rule) return null;

            // Check if there's a matching special water marker for this rule
            const matchingWater = findMatchingSpecialWater(rule);
            const hasMarker = matchingWater !== null;
            const isHighlighted = selectedWaterRule?.area === rule.area;

            // Get regulation type
            let regulationType = matchingWater?.regulationType || 'special-season';

            // Get the color safely
            const ruleColor = getRegulationColor(regulationType);

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
                    : '1px solid #3e5c3e',
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 12,
                  cursor: hasMarker ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  position: 'relative'
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
                  opacity: 0.8
                }} />

                {/* Map pin icon for clickable rules */}
                {hasMarker && (
                  <div style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    color: ruleColor
                  }}>
                    <IconMapPin size={16} />
                  </div>
                )}

                <div style={{ marginLeft: 6 }}>
                  <Text size="sm" style={{ fontWeight: 600, color: '#d0ffd0' }}>
                    {rule.species ? rule.species.join(', ') : 'Various species'}
                  </Text>
                  <Text size="sm"><strong>Area:</strong> {rule.area || 'Special area'}</Text>
                  <Text size="sm"><strong>Season:</strong> {rule.season || 'Check regulations'}</Text>
                  <Text size="sm"><strong>Bag Limit:</strong> {rule.bagLimit || 'Check regulations'}</Text>
                  <Text size="sm"><strong>Notes:</strong> {rule.notes || 'No additional notes'}</Text>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RegulationsPanel;
