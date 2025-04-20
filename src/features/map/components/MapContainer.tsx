import { useRef, useState, useEffect } from 'react';
import Map, { NavigationControl, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useZoneState } from '../../zones/hooks/useZoneState';
import { useWaterState } from '../../waters/hooks/useWaterState';
import { SpecialWater, PointSpecialWater, LinearSpecialWater } from '../../../shared/types';
import PulsingMarker from '../../waters/components/PulsingMarker';
import RiverSection from '../../waters/components/RiverSection';
import { findMatchingRuleIndex } from '../../waters/services/waterUtils';

// Declare window augmentation for TypeScript
declare global {
  interface Window {
    mapRef?: React.RefObject<any>;
  }
}

interface MapContainerProps {
  specialWatersData: Record<string, SpecialWater[]>;
  showSpecialWaters: boolean;
  mode: 'fishing' | 'hunting';
}

const MapContainer = ({
  specialWatersData,
  showSpecialWaters,
  mode
}: MapContainerProps) => {
  const zoneState = useZoneState() as any; // Use 'any' type to bypass strict checking
  const { selectedZone, setSelectedZone, zoneData } = zoneState;
  
  const { selectedWater, setSelectedWater, setSelectedWaterRule } = useWaterState();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);
  const [zoneGeoData, setZoneGeoData] = useState<any>(null);
  const mapRef = useRef<any>(null);

  // Expose map reference to window for access from other components
  useEffect(() => {
    // Make mapRef available globally so RegulationsPanel can access it
    window.mapRef = mapRef;
    
    return () => {
      // Clean up global reference when component unmounts
      window.mapRef = undefined;
    };
  }, [mapRef.current]);

  // Handle water selection
  const handleWaterClick = (water: SpecialWater) => {
    console.log("Water clicked:", water.name);

    if (selectedWater && selectedWater.id === water.id) {
      // If clicking the already selected water, deselect it
      setSelectedWater(null);
      setSelectedWaterRule(null);
    } else {
      // Select the new water
      setSelectedWater(water);

      // Ensure regulations panel is shown
      if (typeof zoneState.setShowRegulationsPanel === 'function') {
        zoneState.setShowRegulationsPanel(true);
      }

      // Find matching rule if zone data is available
      if (zoneData && zoneData.specialWaters) {
        try {
          const ruleIndex = findMatchingRuleIndex(water, zoneData.specialWaters);

          if (ruleIndex !== null && ruleIndex >= 0) {
            console.log("Found matching rule at index:", ruleIndex);
            setSelectedWaterRule(zoneData.specialWaters[ruleIndex]);
          } else {
            console.log("No matching rule found for water:", water.name);
            setSelectedWaterRule(null);
          }
        } catch (error) {
          console.error("Error finding matching rule:", error);
          setSelectedWaterRule(null);
        }
      }

      // Pan to the water feature
      if (water.featureType === 'point') {
        mapRef.current?.flyTo({
          center: water.coordinates,
          zoom: 12,
          duration: 1000
        });
      } else if (water.featureType === 'linear') {
        const coords = water.coordinates;
        const midIndex = Math.floor(coords.length / 2);
        mapRef.current?.flyTo({
          center: coords[midIndex],
          zoom: 11,
          duration: 1000
        });
      }
    }
  };

  // Load zone geo data when mode changes
  useEffect(() => {
    if (mode === 'fishing') {
      console.log("Loading fishing zones GeoJSON");
      fetch('/geojson/fishing-counties.geojson')
        .then(res => res.json())
        .then(data => {
          console.log("Loaded zone geo data:", data.features?.length || 'no features');
          setZoneGeoData(data);

          // Add a small delay to ensure the layers are properly added
          setTimeout(() => {
            console.log("Zones should be ready for interaction now");
          }, 500);
        })
        .catch(err => console.error("Error loading zone geo data:", err));
    } else {
      setZoneGeoData(null);
    }
  }, [mode]);

  // Log when selected zone changes
  useEffect(() => {
    console.log("Selected zone changed to:", selectedZone);
    if (selectedZone && specialWatersData) {
      console.log("Special waters for zone:", specialWatersData[selectedZone]?.length || 0);
    }
  }, [selectedZone, specialWatersData]);

  const handleZoneClick = (clickedZone: string) => {
    console.log("Zone clicked:", clickedZone);
    setSelectedZone(clickedZone);
    
    // Ensure regulations panel is shown when a zone is clicked
    if (typeof zoneState.setShowRegulationsPanel === 'function') {
      zoneState.setShowRegulationsPanel(true);
    }
  };

  // Don't render special waters until we have a selected zone
  const shouldShowSpecialWaters =
    mapLoaded &&
    mode === 'fishing' &&
    showSpecialWaters &&
    selectedZone &&
    specialWatersData &&
    specialWatersData[selectedZone];

  return (
    <Map
      id="main-map" // Added id for RiverSection to find the map
      ref={mapRef}
      initialViewState={{ latitude: 45.081, longitude: -63.0, zoom: 7 }}
      mapStyle="mapbox://styles/mapbox/outdoors-v12"
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
      style={{ width: '100%', height: '100%' }}
      onLoad={() => {
        console.log("Map loaded");
        setMapLoaded(true);
      }}
      onClick={(e) => {
        if (!mapLoaded) return;
        console.log("Map clicked at:", e.lngLat);

        // Make sure mapRef.current is available
        if (!mapRef.current) {
          console.error("Map reference not available");
          return;
        }

        // Check if the layer exists first
        const layers = mapRef.current.getStyle().layers || [];
        const layerExists = layers.some((layer: any) => layer.id === 'fishing-zone-fill');
        if (!layerExists) {
          console.log("Layer 'fishing-zone-fill' not found, skipping feature query");
          return;
        }

        // Query features at the clicked point
        const features = mapRef.current.queryRenderedFeatures(e.point, {
          layers: ['fishing-zone-fill']
        });

        console.log("Features at click:", features?.length || 0);

        if (features && features.length > 0) {
          // Log all properties to debug
          console.log("Feature properties:", features[0].properties);

          const clickedZone = features[0].properties.zone;
          if (clickedZone) {
            console.log("Setting zone to:", clickedZone);
            handleZoneClick(clickedZone);
          } else {
            console.log("Zone property not found in feature");
            // Try other possible property names
            const possiblePropertyNames = Object.keys(features[0].properties);
            console.log("Available properties:", possiblePropertyNames);

            // Look for any property that might contain "zone" or "RFA"
            const zoneProperty = possiblePropertyNames.find(name =>
              name.toLowerCase().includes('zone') ||
              name.toLowerCase().includes('rfa') ||
              features[0].properties[name]?.toString().includes('RFA')
            );

            if (zoneProperty) {
              const value = features[0].properties[zoneProperty];
              console.log(`Found potential zone property "${zoneProperty}" with value:`, value);
              if (value && typeof value === 'string' && (value.includes('RFA') || value.includes('Zone'))) {
                handleZoneClick(value);
              }
            }
          }
        }
      }}
      onMouseMove={(e) => {
        if (!mapLoaded || !mapRef.current) return;

        // Check if the layer exists first
        const layers = mapRef.current.getStyle().layers || [];
        const layerExists = layers.some((layer: any) => layer.id === 'fishing-zone-fill');
        if (!layerExists) return;

        const features = mapRef.current.queryRenderedFeatures(e.point, { layers: ['fishing-zone-fill'] });
        if (features && features.length > 0) {
          setHoveredZoneId(features[0].properties.zone);
        } else {
          setHoveredZoneId(null);
        }
      }}
    >
      <NavigationControl position="top-right" />

      {/* Render Zone Layers */}
      {zoneGeoData && (
        <Source id="fishing-zones" type="geojson" data={zoneGeoData}>
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
      {shouldShowSpecialWaters && (
        <>
          {/* Render point features - with proper type filtering */}
          {specialWatersData[selectedZone]
            .filter((water): water is PointSpecialWater =>
              Boolean(water) && water.featureType === 'point'
            )
            .map((water) => (
              <PulsingMarker
                key={water.id}
                water={water}
                onClick={() => handleWaterClick(water)}
                selected={selectedWater?.id === water.id}
              />
            ))}

          {/* Render linear features - with proper type filtering */}
          {specialWatersData[selectedZone]
            .filter((water): water is LinearSpecialWater =>
              Boolean(water) && water.featureType === 'linear'
            )
            .map((water) => (
              <RiverSection
                key={water.id}
                id={water.id}
                coordinates={water.coordinates}
                regulationType={water.regulationType}
                name={water.name}
                onClick={() => handleWaterClick(water)}
                selected={selectedWater?.id === water.id}
              />
            ))}
        </>
      )}
    </Map>
  );
};

export default MapContainer;