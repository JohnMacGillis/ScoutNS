import React, { useEffect } from 'react';
import { Source, Layer, useMap } from 'react-map-gl';

// Regulation color mapping
const regulationColors: Record<string, string> = {
  'catch-release': '#ff9900',   // Orange
  'fly-only': '#29a329',        // Green
  'special-season': '#9966ff',  // Purple
  'closed': '#ff3333',          // Red
  'extended-season': '#3399ff', // Blue
  'special-limit': '#ffcc00',   // Yellow
  'default': '#70d670'          // Default green
};

interface RiverSectionProps {
  id: string;
  coordinates: [number, number][];
  regulationType?: string;
  name: string;
  onClick: () => void;
  selected: boolean;
  isMobile?: boolean;
}

const RiverSection: React.FC<RiverSectionProps> = ({ 
  id, 
  coordinates, 
  regulationType = 'default', 
  name, 
  onClick, 
  selected,
  isMobile = false
}) => {
  // Get map instance
  const { current: map } = useMap();
  
  // Generate unique IDs for sources and layers
  const sourceId = `river-${id.toLowerCase().replace(/\s+/g, '-')}`;
  const lineLayerId = `${sourceId}-layer`;
  const labelLayerId = `${sourceId}-label-layer`;
  const pointsLayerId = `${sourceId}-points-layer`;

  // Get color based on regulation type
  const lineColor = selected ? '#ffffff' : (regulationColors[regulationType] || regulationColors.default);

  // Setup click handlers
  useEffect(() => {
    if (!map) return;

    // Function to handle clicks on the river or its points
    const handleMapClick = (e: { originalEvent: MouseEvent }) => {
      e.originalEvent.stopPropagation();
      console.log(`[River] ${name} was clicked`);
      onClick();
    };

    // Wait for layers to be available
    const setupClickHandlers = () => {
      try {
        // Check if layers exist
        const hasLineLayer = map.getLayer(lineLayerId);
        const hasPointsLayer = map.getLayer(pointsLayerId);
        
        if (hasLineLayer && hasPointsLayer) {
          // Clean up any existing handlers first
          map.off('click', lineLayerId, handleMapClick);
          map.off('click', pointsLayerId, handleMapClick);
          
          // Add new click handlers
          map.on('click', lineLayerId, handleMapClick);
          map.on('click', pointsLayerId, handleMapClick);
          console.log(`[River] Click handlers set up for ${name}`);
        } else {
          // Retry if layers aren't available yet
          setTimeout(setupClickHandlers, 100);
        }
      } catch (err) {
        console.error(`[River] Error setting up click handlers for ${name}:`, err);
      }
    };

    setupClickHandlers();

    // Cleanup function
    return () => {
      if (map) {
        try {
          map.off('click', lineLayerId, handleMapClick);
          map.off('click', pointsLayerId, handleMapClick);
        } catch (err) {
          console.error(`[River] Error removing click handlers for ${name}:`, err);
        }
      }
    };
  }, [map, lineLayerId, pointsLayerId, name, onClick]);

  // Create GeoJSON data for the line
  const lineData = {
    type: 'Feature',
    properties: {
      id,
      name,
      regulationType,
      selected
    },
    geometry: {
      type: 'LineString',
      coordinates
    }
  };

  // Find the middle point for the label
  const middleIndex = Math.floor(coordinates.length / 2);
  const labelPoint = coordinates[middleIndex];

  // Create GeoJSON for the label point
  const labelPointData = {
    type: 'Feature',
    properties: {
      id: `${id}-label`,
      name,
      regulationType,
      selected
    },
    geometry: {
      type: 'Point',
      coordinates: labelPoint
    }
  };

  // Create GeoJSON for vertex points along the river
  const vertexPointsData = {
    type: 'FeatureCollection',
    features: coordinates.map((coordinate, index) => ({
      type: 'Feature',
      properties: {
        id: `${id}-point-${index}`,
        name,
        regulationType,
        selected
      },
      geometry: {
        type: 'Point',
        coordinates: coordinate
      }
    }))
  };

  // Adjust sizes for mobile
  const lineWidth = selected ? (isMobile ? 6 : 5) : (isMobile ? 4 : 3);
  const pointRadius = selected ? (isMobile ? 5 : 4) : (isMobile ? 4 : 3);
  const textSize = isMobile ? 14 : 12;

  return (
    <>
      {/* Line Source - without onClick */}
      <Source
        id={sourceId}
        type="geojson"
        data={lineData}
      >
        <Layer
          id={lineLayerId}
          type="line"
          paint={{
            'line-color': lineColor,
            'line-width': lineWidth,
            'line-opacity': selected ? 0.9 : 0.7
          }}
          layout={{
            'line-cap': 'round',
            'line-join': 'round'
          }}
        />
      </Source>

      {/* Label Source */}
      <Source id={`${sourceId}-label`} type="geojson" data={labelPointData}>
        {selected && (
          <Layer
            id={labelLayerId}
            type="symbol"
            layout={{
              'text-field': name,
              'text-size': textSize,
              'text-anchor': 'center',
              'text-offset': [0, 0],
              'text-justify': 'center',
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'text-allow-overlap': true
            }}
            paint={{
              'text-color': '#ffffff',
              'text-halo-color': '#000000',
              'text-halo-width': 1.5
            }}
          />
        )}
      </Source>

      {/* Vertex Points Source - without onClick */}
      <Source
        id={`${sourceId}-points`}
        type="geojson"
        data={vertexPointsData}
      >
        <Layer
          id={pointsLayerId}
          type="circle"
          paint={{
            'circle-radius': pointRadius,
            'circle-color': lineColor,
            'circle-opacity': 0.8,
            'circle-stroke-width': selected ? 2 : 1,
            'circle-stroke-color': '#ffffff'
          }}
        />
      </Source>
    </>
  );
};

export default RiverSection;