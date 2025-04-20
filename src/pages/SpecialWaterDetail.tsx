import React from 'react';
import { Text, Badge, Button } from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';
import { IconFish } from '@tabler/icons-react';
import { IconClock } from '@tabler/icons-react';
import { IconScaleOutline } from '@tabler/icons-react';
import { IconInfoCircle } from '@tabler/icons-react';
import { SpecialWater } from './types';

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

interface SpecialWaterDetailProps {
  specialWater: SpecialWater;
  rule: any;
  onClose: () => void;
  onPanToWater: () => void;
}

// Safe function to get color with proper typing
const getRegulationColor = (type?: string): string => {
  // Default color (green) if type is missing
  if (!type) return '#70d670';
  
  // If it's a valid type in our mapping, use that color
  if (type in regulationColors) {
    return regulationColors[type];
  }
  
  // Final fallback - safe green color
  return '#70d670';
};

const SpecialWaterDetail: React.FC<SpecialWaterDetailProps> = ({ 
  specialWater, 
  rule, 
  onClose, 
  onPanToWater 
}) => {
  const regulationColor = getRegulationColor(specialWater.regulationType);
  const regulationName = specialWater.regulationType && regulationNames[specialWater.regulationType] 
    ? regulationNames[specialWater.regulationType] 
    : 'Special Regulation';

  return (
    <div style={{ 
      backgroundColor: 'rgba(18, 22, 18, 0.95)', 
      color: '#e0ffe0',
      borderRadius: 8,
      padding: 16,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      border: `2px solid ${regulationColor}`,
      maxWidth: 400,
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      {/* Close button */}
      <div 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          width: 24,
          height: 24,
          borderRadius: '50%',
          backgroundColor: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 2
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>×</Text>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: regulationColor }}>
          {specialWater.name}
        </Text>
        
        <Badge 
          style={{ 
            backgroundColor: regulationColor,
            color: '#000',
            fontWeight: 600
          }}
        >
          {regulationName}
        </Badge>
      </div>

      {/* Content */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <IconMapPin size={16} style={{ marginRight: 6 }} />
          <Text size="sm">{specialWater.area}</Text>
        </div>
        
        {rule && (
          <>
            {rule.species && (
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <IconFish size={16} style={{ marginRight: 6 }} />
                <Text size="sm">{rule.species.join(', ')}</Text>
              </div>
            )}
            
            {rule.season && (
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <IconClock size={16} style={{ marginRight: 6 }} />
                <Text size="sm"><strong>Season:</strong> {rule.season}</Text>
              </div>
            )}
            
            {rule.bagLimit && (
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <IconScaleOutline size={16} style={{ marginRight: 6 }} />
                <Text size="sm"><strong>Bag Limit:</strong> {rule.bagLimit}</Text>
              </div>
            )}
            
            {rule.notes && (
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 8 }}>
                <IconInfoCircle size={16} style={{ marginRight: 6, marginTop: 3 }} />
                <Text size="sm"><strong>Notes:</strong> {rule.notes}</Text>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Actions */}
      <Button
        fullWidth
        onClick={onPanToWater}
        style={{ backgroundColor: '#2a322a', color: '#e0ffe0' }}
      >
        <IconMapPin size={16} style={{ marginRight: 6 }} /> Show on Map
      </Button>
    </div>
  );
};

export default SpecialWaterDetail;
