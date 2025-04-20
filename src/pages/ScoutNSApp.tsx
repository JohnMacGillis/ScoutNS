import { useState, useEffect, useRef } from 'react';
import Map, { NavigationControl, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Text, Divider, Switch } from '@mantine/core'; // Removed ScrollArea
import { IconChevronLeft, IconChevronRight, IconFish, IconDeer, IconMapPin } from '@tabler/icons-react'; // Removed IconInfoCircle
import './customSwitch.css';
import zone1Rules from '../data/zone1_fishing_rules.json';
import zone2Rules from '../data/zone2_fishing_rules.json';
import zone3Rules from '../data/zone3_fishing_rules.json';
import zone4Rules from '../data/zone4_fishing_rules.json';
import zone5Rules from '../data/zone5_fishing_rules.json';
import zone6Rules from '../data/zone6_fishing_rules.json';
import specialWatersData from '../data/specialWatersData';
import { SpecialWater, PointSpecialWater, LinearSpecialWater, ZoneInfo, FishingRule } from './types';
import PulsingMarker from '../features/waters/components/PulsingMarker';
import RiverSection from '../features/waters/components/RiverSection';

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

function ScoutNSApp() {
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [mode, setMode] = useState<'fishing' | 'hunting'>('fishing');
  const [zoneData, setZoneData] = useState<any>(null);
  const [activeZoneInfo, setActiveZoneInfo] = useState<ZoneInfo | null>(null);
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showSpecialWaters, setShowSpecialWaters] = useState(true);
  const [selectedSpecialWater, setSelectedSpecialWater] = useState<SpecialWater | null>(null);
  const [selectedSpecialWaterRule, setSelectedSpecialWaterRule] = useState<FishingRule | null>(null);
  const [highlightedRuleIndex, setHighlightedRuleIndex] = useState<number | null>(null);
  const specialWatersRuleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const flyoutRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);

  const fishingZones = ['RFA 1', 'RFA 2', 'RFA 3', 'RFA 4', 'RFA 5', 'RFA 6'];
  const fishingSpecies = ['Brook Trout', 'Smallmouth Bass', 'Rainbow Trout', 'Brown Trout', 'Chain Pickerel', 'White Perch', 'Yellow Perch'];
  const huntingZones = ['Zone A', 'Zone B', 'Zone C'];
  const huntingSpecies = ['White-tailed Deer', 'Ducks'];

  // Safe function to get color with proper typing
  const getRegulationColor = (type: string): string => {
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
  

  useEffect(() => {
    if (mode === 'fishing') {
      fetch('/geojson/fishing-counties.geojson')
        .then(res => res.json())
        .then(setZoneData);
    } else {
      setZoneData(null);
    }
  }, [mode]);

  useEffect(() => {
    if (!selectedZone) {
      setActiveZoneInfo(null);
      return;
    }

    // Get the zone rules based on the selected zone
    let zoneRules;
    let zoneNotes = "";

    switch(selectedZone) {
      case 'RFA 1':
        zoneRules = zone1Rules;
        break;
      case 'RFA 2':
        zoneRules = zone2Rules;
        break;
      case 'RFA 3':
        zoneRules = zone3Rules;
        break;
      case 'RFA 4':
        zoneRules = zone4Rules;
        break;
      case 'RFA 5':
        zoneRules = zone5Rules;
        break;
      case 'RFA 6':
        zoneRules = zone6Rules;
        break;
      default:
        return;
    }

    // Process rules the same way for all zones
    const rules = zoneRules.rules;
    const specialWaters = zoneRules.specialWaters || [];
    zoneNotes = zoneRules.notes;
    
    // Filter rules based on selected species
    const filteredRules = selectedSpecies.length 
      ? rules.filter((rule: any) => rule.species.some((s: string) => selectedSpecies.includes(s)))
      : rules;
    
    const filteredSpecialWaters = selectedSpecies.length
      ? specialWaters.filter((water: any) => water.species.some((s: string) => selectedSpecies.includes(s)))
      : specialWaters;

    setActiveZoneInfo({
      zone: selectedZone,
      notes: zoneNotes,
      rules: filteredRules,
      specialWaters: filteredSpecialWaters
    });
    
  }, [selectedZone, selectedSpecies]);

  // Clear selected special water when zone changes
  useEffect(() => {
    setSelectedSpecialWater(null);
    setSelectedSpecialWaterRule(null);
    setHighlightedRuleIndex(null);
  }, [selectedZone]);

  // Scroll to highlighted rule when it changes
  useEffect(() => {
    if (highlightedRuleIndex !== null && specialWatersRuleRefs.current[highlightedRuleIndex]) {
      setTimeout(() => {
        if (highlightedRuleIndex !== null) {
          specialWatersRuleRefs.current[highlightedRuleIndex]?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 100);
    }
  }, [highlightedRuleIndex]);

  useEffect(() => {
    if (selectedSpecialWater && highlightedRuleIndex !== null) {
      // Delay scrolling to ensure UI has updated
      const timer = setTimeout(() => {
        if (highlightedRuleIndex !== null && specialWatersRuleRefs.current[highlightedRuleIndex]) {
          specialWatersRuleRefs.current[highlightedRuleIndex]?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [selectedSpecialWater, highlightedRuleIndex]);

  useEffect(() => {
    // Only proceed if we have everything we need
    if (selectedSpecialWater && activeZoneInfo && activeZoneInfo.specialWaters) {
      console.log("Finding rule for:", selectedSpecialWater.name);
      
      // Find rule index
      const ruleIndex = findMatchingRuleIndex(selectedSpecialWater);
      
      if (ruleIndex !== null && ruleIndex >= 0) {
        console.log("Setting highlight for index:", ruleIndex);
        // Update state
        setHighlightedRuleIndex(ruleIndex);
        setSelectedSpecialWaterRule(activeZoneInfo.specialWaters[ruleIndex]);
        
        // Try multiple times to scroll, with increasing delays
        [300, 600, 1000].forEach(delay => {
          setTimeout(() => {
            if (ruleIndex !== null && specialWatersRuleRefs.current[ruleIndex]) {
              console.log(`Scrolling attempt at ${delay}ms`);
              // Make sure the element is visible
              const flyoutPanel = document.querySelector('.flyout-panel'); // Add this class to your flyout panel div
              if (flyoutPanel) {
                // Ensure the flyout panel itself is scrolled into view if needed
                flyoutPanel.scrollIntoView({ behavior: 'auto', block: 'start' });
                
                // Then scroll to the specific rule
                specialWatersRuleRefs.current[ruleIndex]?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center'
                });
              }
            }
          }, delay);
        });
      }
    }
  }, [selectedSpecialWater, activeZoneInfo]);
  

  const handleZoneClick = (zoneId: string) => {
    setSelectedZone(zoneId);
    setSelectedSpecialWater(null);
    setSelectedSpecialWaterRule(null);
    setHighlightedRuleIndex(null);
  };

  // Find the matching rule index for a special water
  const findMatchingRuleIndex = (water: SpecialWater) => {
    if (!activeZoneInfo?.specialWaters || !activeZoneInfo.specialWaters.length) {
      console.log("No specialWaters in activeZoneInfo");
      return null;
    }
    
    let index = -1;
    
    // Strategy 1: Exact area match
    index = activeZoneInfo.specialWaters.findIndex(
      (rule: any) => rule?.area === water.area
    );
    
    if (index !== -1) {
      console.log("Found via exact area match:", water.area);
      return index;
    }
    
    // Strategy 2: Partial area inclusion
    index = activeZoneInfo.specialWaters.findIndex(
      (rule: any) => {
        if (!rule?.area || !water.area) return false;
        return rule.area.includes(water.area) || water.area.includes(rule.area);
      }
    );
    
    if (index !== -1) {
      console.log("Found via partial area match:", water.area);
      return index;
    }
    
    // Strategy 3: Name-based matching
    if (water.name) {
      // Try the full name
      index = activeZoneInfo.specialWaters.findIndex(
        (rule: any) => rule?.area && rule.area.includes(water.name)
      );
      
      if (index !== -1) {
        console.log("Found via name in area:", water.name);
        return index;
      }
      
      // Try base name (without section info)
      const baseName = water.name.split('-')[0].trim();
      index = activeZoneInfo.specialWaters.findIndex(
        (rule: any) => rule?.area && rule.area.includes(baseName)
      );
      
      if (index !== -1) {
        console.log("Found via base name:", baseName);
        return index;
      }
      
      // Try with lakes, rivers, etc.
      const commonNames = [
        baseName,
        baseName + " Lake", 
        baseName + " River",
        baseName + " Pond",
        baseName + " Brook"
      ];
      
      for (const name of commonNames) {
        index = activeZoneInfo.specialWaters.findIndex(
          (rule: any) => rule?.area && rule.area.includes(name)
        );
        
        if (index !== -1) {
          console.log("Found via common name pattern:", name);
          return index;
        }
      }
    }
    
    // Strategy 4: Keywords in name
    if (water.name) {
      // Get keywords from name (excluding common words)
      const keywords = water.name
        .split(/[-\s]+/)
        .filter(word => 
          word.length > 3 && 
          !['lake', 'river', 'pond', 'section', 'upper', 'lower', 'middle'].includes(word.toLowerCase())
        );
      
      for (const keyword of keywords) {
        index = activeZoneInfo.specialWaters.findIndex(
          (rule: any) => rule?.area && rule.area.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (index !== -1) {
          console.log("Found via keyword match:", keyword);
          return index;
        }
      }
    }
    
    // No match found
    console.log("No match found for:", water.name, water.area);
    return null;
  };

  // Find special water for a rule
  const findMatchingSpecialWater = (rule: any) => {
    if (!selectedZone || !specialWatersData || !specialWatersData[selectedZone as keyof typeof specialWatersData]) return null;
    
    return specialWatersData[selectedZone as keyof typeof specialWatersData].find((water: any) => {
      if (!water || !water.area || !rule.area) return false;
      return rule.area.includes(water.area) || water.area.includes(rule.area);
    });
  };

  // Handle special water selection
  const handleSpecialWaterClick = (waterPoint: SpecialWater) => {
    console.log("Clicked on water:", waterPoint.name); // Debug log
    
    // If it's the same point, toggle off
    if (selectedSpecialWater && selectedSpecialWater.id === waterPoint.id) {
      setSelectedSpecialWater(null);
      setSelectedSpecialWaterRule(null);
      setHighlightedRuleIndex(null);
    } else {
      setSelectedSpecialWater(waterPoint);
      
      // If zone not already selected, select it
      if (selectedZone !== waterPoint.area.split(' ').pop()?.replace(/[()]/g, '')) {
        // Extract zone from the area name if possible
        const zoneMatch = waterPoint.area.match(/RFA \d/);
        if (zoneMatch && zoneMatch[0]) {
          console.log("Setting zone to:", zoneMatch[0]); // Debug log
          setSelectedZone(zoneMatch[0]);
          
          // Since setting zone is asynchronous, we need a different approach
          // We'll use the updated useEffect to handle this case
        } else {
          // Find zone in waterPoint area or use current zone
          console.log("No zone match in area, using current zone:", selectedZone); // Debug log
        }
      } else {
        // Zone is already correctly set, find and highlight the rule immediately
        const ruleIndex = findMatchingRuleIndex(waterPoint);
        console.log("Found rule index:", ruleIndex); // Debug log
        
        if (ruleIndex !== null && ruleIndex >= 0 && activeZoneInfo?.specialWaters) {
          console.log("Setting highlight to rule:", activeZoneInfo.specialWaters[ruleIndex]?.area); // Debug log
          setHighlightedRuleIndex(ruleIndex);
          setSelectedSpecialWaterRule(activeZoneInfo.specialWaters[ruleIndex]);
          
          // Force scroll after a delay
          setTimeout(() => {
            console.log("Attempting to scroll to element:", ruleIndex); // Debug log
            const element = specialWatersRuleRefs.current[ruleIndex];
            if (element) {
              element.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
              });
              console.log("Scroll executed"); // Debug log
            } else {
              console.log("Element not found for scrolling"); // Debug log
            }
          }, 500);
        } else {
          console.log("No matching rule found"); // Debug log
          setHighlightedRuleIndex(null);
          setSelectedSpecialWaterRule(null);
        }
      }
      
      // Pan to the point
      if (waterPoint.featureType === 'point') {
        mapRef.current?.flyTo({
          center: waterPoint.coordinates,
          zoom: 12,
          duration: 1000
        });
      } else if (waterPoint.featureType === 'linear') {
        // Calculate center point of the line
        const coords = waterPoint.coordinates;
        const midIndex = Math.floor(coords.length / 2);
        mapRef.current?.flyTo({
          center: coords[midIndex],
          zoom: 11,
          duration: 1000
        });
      }
    }
  };
  

  // Handle rule selection
  const handleRuleClick = (rule: any, index: number) => {
    // If it's the same rule, toggle off
    if (selectedSpecialWaterRule && rule.area === selectedSpecialWaterRule.area) {
      setSelectedSpecialWaterRule(null);
      setSelectedSpecialWater(null);
      setHighlightedRuleIndex(null);
    } else {
      setSelectedSpecialWaterRule(rule);
      setHighlightedRuleIndex(index);
      
      // Find matching special water on the map
      const matchingWater = findMatchingSpecialWater(rule);
      if (matchingWater) {
        setSelectedSpecialWater(matchingWater);
        
        // Pan to the water on the map
        if (matchingWater.featureType === 'point') {
          mapRef.current?.flyTo({
            center: matchingWater.coordinates,
            zoom: 12,
            duration: 1000
          });
        } else if (matchingWater.featureType === 'linear') {
          // Calculate center point of the line
          const coords = matchingWater.coordinates;
          const midIndex = Math.floor(coords.length / 2);
          mapRef.current?.flyTo({
            center: coords[midIndex],
            zoom: 11,
            duration: 1000
          });
        }
      } else {
        setSelectedSpecialWater(null);
      }
    }
  };

  // This function is now used internally where needed
  // Removed unused standalone function

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative', backgroundColor: '#121612', fontFamily: 'Chakra Petch, sans-serif' }}>
      {/* Header */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 100, backgroundColor: 'rgba(28, 31, 28, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #444', zIndex: 1001 }}>
        <img src="/images/logo.png" alt="ScoutNS Logo" style={{ height: 160 }} />
        <div style={{ position: 'absolute', left: 20 }}>
          <div onClick={() => setSidebarVisible(prev => !prev)} style={{ cursor: 'pointer', backgroundColor: '#2a322a', color: '#e0ffe0', borderRadius: 14, padding: '4px 10px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 0 4px rgba(0,0,0,0.4)' }}>
            {sidebarVisible ? <IconChevronLeft size={16} /> : <IconChevronRight size={16} />}
            {sidebarVisible ? 'Hide Panel' : 'Show Panel'}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div style={{
        position: 'absolute', top: 100, left: 0, width: 240, height: 'calc(100% - 100px)', padding: 14,
        backgroundColor: 'rgba(29, 35, 29, 0.7)', borderRight: '1px solid #444', backdropFilter: 'blur(6px)',
        overflowY: 'auto', transition: 'opacity 0.3s ease, visibility 0.3s ease',
        color: '#e0ffe0', opacity: sidebarVisible ? 1 : 0, visibility: sidebarVisible ? 'visible' : 'hidden',
        zIndex: 1000
      }}>
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text size="sm" style={{ fontWeight: 600 }}>Hunting or Fishing:</Text>
          <div className="slider" onClick={() => setMode(mode === 'fishing' ? 'hunting' : 'fishing')} style={{ width: 120, height: 40, backgroundColor: '#2a322a', borderRadius: 20, position: 'relative', cursor: 'pointer' }}>
            <div className={`thumb ${mode}`} style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#70d670', position: 'absolute', top: 2, left: mode === 'fishing' ? 2 : 'calc(100% - 38px)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'left 0.3s ease' }}>
              {mode === 'fishing' ? <IconFish size={22} /> : <IconDeer size={22} />}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Zone</label>
          <select value={selectedZone} onChange={(e) => handleZoneClick(e.target.value)} style={{
            width: '100%', padding: '8px 10px', borderRadius: 6,
            backgroundColor: '#2a322a', color: '#e0ffe0', border: '1px solid #444', fontSize: 13, fontWeight: 600
          }}>
            <option value="">Select zone</option>
            {(mode === 'fishing' ? fishingZones : huntingZones).map(zone => (
              <option key={zone} value={zone}>{zone}</option>
            ))}
          </select>
        </div>

        {mode === 'fishing' && (
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ fontWeight: 600 }}>Show Special Waters</label>
            <Switch 
              checked={showSpecialWaters} 
              onChange={(e) => setShowSpecialWaters(e.currentTarget.checked)}
              color="teal"
              size="sm"
            />
          </div>
        )}

        <Divider my="md" label="Species" />
        <div>
          {(mode === 'fishing' ? fishingSpecies : huntingSpecies).map(species => (
            <label key={species} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
              {mode === 'fishing' ? <IconFish size={16} style={{ marginRight: 8 }} /> : <IconDeer size={16} style={{ marginRight: 8 }} />}
              <input
                type="checkbox"
                value={species}
                checked={selectedSpecies.includes(species)}
                onChange={(e) =>
                  setSelectedSpecies(prev =>
                    e.target.checked ? [...prev, species] : prev.filter(s => s !== species)
                  )
                }
                style={{ marginRight: 10, transform: 'scale(1.1)', accentColor: '#70d670' }}
              /> {species}
            </label>
          ))}
        </div>
      </div>

      {/* Flyout Panel */}
      {activeZoneInfo && (
        <div
          ref={flyoutRef}
          className="flyout-panel"
          style={{
            position: 'absolute',
            top: 120,
            right: 0,
            width: 360,
            bottom: 20,
            overflowY: 'auto',
            backgroundColor: 'rgba(18,22,18,0.85)',
            color: '#e0ffe0',
            padding: 20,
            borderTopLeftRadius: 12,
            borderBottomLeftRadius: 12,
            boxShadow: '-4px 0 12px rgba(0,0,0,0.4)',
            zIndex: 1100,
            backdropFilter: 'blur(10px)',
            scrollBehavior: 'smooth'
          }}
        >
          {/* Close Button */}
          <div 
            onClick={() => setActiveZoneInfo(null)}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: 'rgba(75, 95, 75, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              zIndex: 1101,
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(100, 130, 100, 0.8)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(75, 95, 75, 0.6)'}
          >
            <span style={{ color: '#e0ffe0', fontSize: 18, fontWeight: 700, lineHeight: 1 }}>×</span>
          </div>
          
          <Text style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{activeZoneInfo.zone}</Text>

          {activeZoneInfo.notes && (
            <Text size="sm" style={{ marginBottom: 12 }}>
              <strong>Note:</strong> {activeZoneInfo.notes}
            </Text>
          )}

          {/* Special Waters Legend (only shown when special waters are enabled) */}
          {mode === 'fishing' && showSpecialWaters && selectedZone && (
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
                      {regulationNames[type]}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special water details notification banner when a water is selected */}
          {selectedSpecialWater && selectedSpecialWaterRule && (
            <div style={{
              backgroundColor: selectedSpecialWater.regulationType ? 
                getRegulationColor(selectedSpecialWater.regulationType) : '#70d670',
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
                  {selectedSpecialWater.name}
                </Text>
                <Text size="xs">
                  {selectedSpecialWater.regulationType ? 
                    (regulationNames[selectedSpecialWater.regulationType as keyof typeof regulationNames] || selectedSpecialWater.regulationType) : 
                    'Special Water'}
                </Text>
                <Text size="xs" style={{ marginTop: 4 }}>
                  See highlighted special waters section below for regulations
                </Text>
              </div>
            </div>
          )}

          {/* General Rules */}
          {activeZoneInfo.rules && activeZoneInfo.rules.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <Text size="sm" style={{ fontWeight: 700, marginBottom: 8, borderBottom: '1px solid #444' }}>
                General Rules
              </Text>
              {activeZoneInfo.rules.map((rule: any, idx: number) => (
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
          {activeZoneInfo.specialWaters && activeZoneInfo.specialWaters.length > 0 && (
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
              {activeZoneInfo.specialWaters.map((rule: any, idx: number) => {
                if (!rule) return null;
                
                // Check if there's a matching special water marker for this rule
                const matchingWater = findMatchingSpecialWater(rule);
                const hasMarker = matchingWater !== null;
                const isHighlighted = idx === highlightedRuleIndex;
                
                // Get regulation type - from matching water if available, otherwise determine from rule
                let regulationType = 'special-season'; // Default fallback
                
                if (hasMarker && matchingWater && matchingWater.regulationType) {
                  regulationType = matchingWater.regulationType;
                } else {
                  // Determine from rule properties if no matching water
                  if (rule.bagLimit === 'Catch and release only') {
                    regulationType = 'catch-release';
                  } else if (rule.notes && rule.notes.toLowerCase().includes('artificial fly only')) {
                    regulationType = 'fly-only';
                  } else if (rule.season === 'Closed all year' || rule.bagLimit === 'Closed all year') {
                    regulationType = 'closed';
                  } else if (rule.season === 'Open all year') {
                    regulationType = 'extended-season';
                  } else if (rule.bagLimit && rule.bagLimit.includes('only one')) {
                    regulationType = 'special-limit';
                  }
                }
                
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
      )}

      {/* Map */}
      <Map
        ref={mapRef}
        initialViewState={{ latitude: 45.081, longitude: -63.0, zoom: 7 }}
        mapStyle="mapbox://styles/mapbox/outdoors-v12"
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        onLoad={() => setMapLoaded(true)}
        onClick={(e) => {
          if (!mapLoaded) return;
          const features = mapRef.current?.queryRenderedFeatures(e.point, { layers: ['fishing-zone-fill'] });
          if (features && features.length > 0) {
            const clickedZone = features[0].properties.zone;
            handleZoneClick(clickedZone);
          }
        }}
        onMouseMove={(e) => {
          if (!mapLoaded) return;
          const features = mapRef.current?.queryRenderedFeatures(e.point, { layers: ['fishing-zone-fill'] });
          if (features && features.length > 0) {
            setHoveredZoneId(features[0].properties.zone);
          } else {
            setHoveredZoneId(null);
          }
        }}
      >
        <NavigationControl position="top-right" />
        {zoneData && (
          <Source id="fishing-zones" type="geojson" data={zoneData}>
            <Layer
              id="fishing-zone-fill"
              type="fill"
              paint={{
                'fill-color': '#3a4f3a',
                'fill-opacity': [
                  'case',
                  ['==', ['get', 'zone'], hoveredZoneId],
                  0.45,
                  0.25
                ]
              }}
            />
            <Layer
              id="fishing-zone-outline"
              type="line"
              paint={{
                'line-color': '#000000',
                'line-width': 2
              }}
            />
          </Source>
        )}

        {/* Display Special Waters */}
        {mapLoaded && mode === 'fishing' && showSpecialWaters && (
          <>
            {/* If zone is selected, show only that zone's special waters */}
            {selectedZone && specialWatersData && specialWatersData[selectedZone as keyof typeof specialWatersData] ? (
              <>
                {/* Render point features - with proper type filtering */}
                {specialWatersData[selectedZone as keyof typeof specialWatersData]
                  .filter((water: SpecialWater): water is PointSpecialWater => 
                    water && water.featureType === 'point'
                  )
                  .map((water: PointSpecialWater) => (
                    <PulsingMarker
                      key={water.id}
                      water={water}
                      onClick={() => handleSpecialWaterClick(water)}
                      selected={selectedSpecialWater?.id === water.id}
                    />
                  ))}
                
                {/* Render linear features - with proper type filtering */}
                {specialWatersData[selectedZone as keyof typeof specialWatersData]
                  .filter((water: SpecialWater): water is LinearSpecialWater => 
                    water && water.featureType === 'linear'
                  )
                  .map((water: LinearSpecialWater) => (
                    <RiverSection
                      key={water.id}
                      id={water.id}
                      coordinates={water.coordinates}
                      regulationType={water.regulationType}
                      name={water.name}
                      onClick={() => handleSpecialWaterClick(water)}
                      selected={selectedSpecialWater?.id === water.id}
                    />
                  ))}
              </>
            ) : (
              // If no zone selected or data not available, show nothing
              null
            )}
          </>
        )}
      </Map>
    </div>
  );
}

export default ScoutNSApp;
