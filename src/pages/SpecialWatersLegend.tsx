import React from 'react';

// Color mapping for different regulation types
const regulationColors = {
  'catch-release': '#ff9900',   // Orange
  'fly-only': '#29a329',        // Green
  'special-season': '#9966ff',  // Purple
  'closed': '#ff3333',          // Red
  'extended-season': '#3399ff', // Blue
  'special-limit': '#ffcc00'    // Yellow
};

// Display names for regulation types
const regulationNames = {
  'catch-release': 'Catch & Release',
  'fly-only': 'Fly Fishing Only',
  'special-season': 'Special Season',
  'closed': 'Closed to Angling',
  'extended-season': 'Extended Season',
  'special-limit': 'Special Limits'
};

const SpecialWatersLegend: React.FC = () => {
  return (
    <div 
      style={{
        position: 'absolute',
        bottom: 30,
        right: 10,
        backgroundColor: 'rgba(18, 22, 18, 0.85)',
        padding: 12,
        borderRadius: 8,
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        maxWidth: 180,
        border: '1px solid #444'
      }}
    >
      <div style={{ color: '#e0ffe0', fontWeight: 700, fontSize: 12, marginBottom: 8, borderBottom: '1px solid #444', paddingBottom: 4 }}>
        SPECIAL WATERS
      </div>
      
      {Object.entries(regulationColors).map(([type, color]) => (
        <div key={type} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
          <div 
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: color,
              border: '1px solid rgba(255, 255, 255, 0.7)',
              marginRight: 8
            }}
          />
          <span style={{ color: '#e0ffe0', fontSize: 11 }}>
            {regulationNames[type as keyof typeof regulationNames]}
          </span>
        </div>
      ))}
    </div>
  );
};

export default SpecialWatersLegend;