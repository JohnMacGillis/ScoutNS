import React, { useEffect, useRef } from 'react';
import { Marker } from 'react-map-gl';
import { PointSpecialWater } from '../../../shared/types';

interface PulsingMarkerProps {
  water: PointSpecialWater;
  onClick?: () => void;
  selected?: boolean;
  size?: number; // Scale factor for marker size
}

// Color mapping for different regulation types
const regulationColors: Record<string, string> = {
  'catch-release': '#ff9900',   // Orange
  'fly-only': '#29a329',        // Green
  'special-season': '#9966ff',  // Purple
  'closed': '#ff3333',          // Red
  'extended-season': '#3399ff', // Blue
  'special-limit': '#ffcc00'    // Yellow
};

const PulsingMarker: React.FC<PulsingMarkerProps> = ({ 
  water, 
  onClick, 
  selected = false,
  size = 1 // Default scale factor
}) => {
  const markerRef = useRef<HTMLDivElement>(null);
  
  // Get appropriate color based on regulation type
  const getMarkerColor = (type?: string): string => {
    if (!type) return '#70d670'; // Default green
    return regulationColors[type] || '#70d670';
  };
  
  const markerColor = getMarkerColor(water.regulationType);
  
  // Base size values - will be multiplied by size factor
  const baseSize = selected ? 18 : 12;
  const actualSize = Math.round(baseSize * size);
  
  // Apply pulsing animation when marker is selected
  useEffect(() => {
    if (markerRef.current) {
      if (selected) {
        markerRef.current.classList.add('pulsing');
      } else {
        markerRef.current.classList.remove('pulsing');
      }
    }
  }, [selected]);
  
  return (
    <Marker
      longitude={water.coordinates[0]}
      latitude={water.coordinates[1]}
      anchor="center"
      onClick={onClick}
    >
      <div 
        ref={markerRef}
        style={{
          width: actualSize,
          height: actualSize,
          borderRadius: '50%',
          backgroundColor: markerColor,
          border: `2px solid ${selected ? 'white' : 'rgba(255,255,255,0.7)'}`,
          boxShadow: '0 0 4px rgba(0,0,0,0.4)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          opacity: selected ? 1 : 0.8
        }}
        title={water.name}
      />
    </Marker>
  );
};

export default PulsingMarker;