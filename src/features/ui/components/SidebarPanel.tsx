import { useState, useEffect } from 'react';
import { Text, Divider, Switch, Modal, Button } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconFish, IconDeer } from '@tabler/icons-react';
import { useZoneState } from '../../zones/hooks/useZoneState';
import { useResponsive } from '../../../shared/hooks/useResponsive';

interface SidebarPanelProps {
  mode: 'fishing' | 'hunting';
  setMode: (mode: 'fishing' | 'hunting') => void;
  selectedSpecies: string[];
  setSelectedSpecies: React.Dispatch<React.SetStateAction<string[]>>;
  showSpecialWaters: boolean;
  setShowSpecialWaters: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarVisible: boolean;
  setSidebarVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarPanel = ({
  mode,
  setMode,
  selectedSpecies,
  setSelectedSpecies,
  showSpecialWaters,
  setShowSpecialWaters,
  sidebarVisible,
  setSidebarVisible
}: SidebarPanelProps) => {
  const { selectedZone, setSelectedZone } = useZoneState();
  const { isMobile } = useResponsive();
  
  // State for coming soon modal
  const [comingSoonModalOpen, setComingSoonModalOpen] = useState(false);

  const fishingZones = ['RFA 1', 'RFA 2', 'RFA 3', 'RFA 4', 'RFA 5', 'RFA 6'];
  const fishingSpecies = ['Brook Trout', 'Smallmouth Bass', 'Rainbow Trout', 'Brown Trout', 'Chain Pickerel', 'White Perch', 'Yellow Perch'];
  const huntingZones = ['Zone A', 'Zone B', 'Zone C'];
  const huntingSpecies = ['White-tailed Deer', 'Ducks'];

  // On mobile, auto-collapse sidebar when zone is selected
  useEffect(() => {
    if (isMobile && selectedZone) {
      setSidebarVisible(false);
    }
  }, [selectedZone, isMobile, setSidebarVisible]);

  // Modified toggle handler
  const handleModeToggle = () => {
    if (mode === 'fishing') {
      // Show coming soon modal instead of changing modes
      setComingSoonModalOpen(true);
    } else {
      // Allow switching back to fishing
      setMode('fishing');
    }
  };

  // Handler for species checkbox changes
  const handleSpeciesChange = (species: string, checked: boolean) => {
    if (checked) {
      setSelectedSpecies(prev => [...prev, species]);
    } else {
      setSelectedSpecies(prev => prev.filter(s => s !== species));
    }
  };

  // Open sidebar when zone is selected (desktop only)
  useEffect(() => {
    if (selectedZone && !isMobile) {
      console.log("Zone selected, opening sidebar");
      setSidebarVisible(true);
    }
  }, [selectedZone, isMobile, setSidebarVisible]);

  return (
    <>
      {/* Toggle button - Positioned for both mobile and desktop */}
      <div style={{ 
        position: 'absolute', 
        top: isMobile ? 70 : 110, 
        left: sidebarVisible ? (isMobile ? 'calc(100% - 50px)' : 250) : 20, 
        zIndex: 1001,
        transition: 'left 0.3s ease'
      }}>
        <div 
          onClick={() => setSidebarVisible(prev => !prev)} 
          style={{ 
            cursor: 'pointer', 
            backgroundColor: '#2a322a', 
            color: '#e0ffe0', 
            borderRadius: 14, 
            padding: '4px 10px', 
            fontSize: 12, 
            fontWeight: 600, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 6, 
            boxShadow: '0 0 4px rgba(0,0,0,0.4)' 
          }}
        >
          {sidebarVisible ? <IconChevronLeft size={16} /> : <IconChevronRight size={16} />}
          {sidebarVisible ? 'Hide Panel' : 'Show Panel'}
        </div>
      </div>

      {/* Sidebar Panel - Adapts for mobile */}
      <div style={{
        position: 'absolute', 
        top: isMobile ? 0 : 100, 
        left: 0, 
        width: isMobile ? '100%' : 240, 
        height: isMobile ? '100%' : 'calc(100% - 100px)', 
        padding: 14,
        paddingTop: isMobile ? 70 : 14, // Extra space for header on mobile
        backgroundColor: isMobile ? 'rgba(29, 35, 29, 0.95)' : 'rgba(29, 35, 29, 0.7)', 
        borderRight: '1px solid #444', 
        backdropFilter: 'blur(6px)',
        overflowY: 'auto', 
        transition: 'transform 0.3s ease, opacity 0.3s ease', 
        color: '#e0ffe0', 
        transform: sidebarVisible ? 'translateX(0)' : 'translateX(-100%)',
        opacity: sidebarVisible ? 1 : 0,
        zIndex: isMobile ? 1002 : 1000, // Higher z-index on mobile to ensure it sits on top
      }}>
        {/* Mobile close button (X) that appears at the top right */}
        {isMobile && (
          <div 
            onClick={() => setSidebarVisible(false)}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: 'rgba(75, 95, 75, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 1003
            }}
          >
            <span style={{ color: '#e0ffe0', fontSize: 18, fontWeight: 700, lineHeight: 1 }}>×</span>
          </div>
        )}

        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text size="sm" style={{ fontWeight: 600 }}>Hunting or Fishing:</Text>
          <div 
            className="slider" 
            onClick={handleModeToggle} 
            style={{ 
              width: 120, 
              height: 40, 
              backgroundColor: '#2a322a', 
              borderRadius: 20, 
              position: 'relative', 
              cursor: 'pointer' 
            }}
          >
            <div 
              className={`thumb ${mode}`} 
              style={{ 
                width: 36, 
                height: 36, 
                borderRadius: '50%', 
                backgroundColor: '#70d670', 
                position: 'absolute', 
                top: 2, 
                left: mode === 'fishing' ? 2 : 'calc(100% - 38px)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                transition: 'left 0.3s ease' 
              }}
            >
              {mode === 'fishing' ? <IconFish size={22} /> : <IconDeer size={22} />}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ 
            display: 'block', 
            fontWeight: 600, 
            marginBottom: 6,
            fontSize: isMobile ? 16 : 14
          }}>
            Zone
          </label>
          <select 
            value={selectedZone} 
            onChange={(e) => setSelectedZone(e.target.value)} 
            style={{
              width: '100%', 
              padding: isMobile ? '10px 12px' : '8px 10px', 
              borderRadius: 6,
              backgroundColor: '#2a322a', 
              color: '#e0ffe0', 
              border: '1px solid #444', 
              fontSize: isMobile ? 16 : 13, 
              fontWeight: 600,
              height: isMobile ? 44 : 'auto' // Larger touch target on mobile
            }}
          >
            <option value="">Select zone</option>
            {(mode === 'fishing' ? fishingZones : huntingZones).map(zone => (
              <option key={zone} value={zone}>{zone}</option>
            ))}
          </select>
        </div>

        {mode === 'fishing' && (
          <div style={{ 
            marginBottom: 16, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: isMobile ? '6px 0' : 0 // Larger touch area on mobile
          }}>
            <label style={{ 
              fontWeight: 600,
              fontSize: isMobile ? 16 : 14 
            }}>
              Show Special Waters
            </label>
            <Switch 
              checked={showSpecialWaters} 
              onChange={(e) => setShowSpecialWaters(e.currentTarget.checked)}
              color="teal"
              size={isMobile ? "md" : "sm"}
            />
          </div>
        )}

        <Divider my="md" label={<span style={{ fontSize: isMobile ? 16 : 14 }}>Species</span>} />
        <div>
          {(mode === 'fishing' ? fishingSpecies : huntingSpecies).map(species => (
            <label 
              key={species} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: isMobile ? 12 : 6,
                minHeight: isMobile ? 36 : 'auto', // Larger touch target on mobile
                padding: isMobile ? '4px 0' : 0
              }}
            >
              {mode === 'fishing' ? <IconFish size={16} style={{ marginRight: 8 }} /> : <IconDeer size={16} style={{ marginRight: 8 }} />}
              <input
                type="checkbox"
                value={species}
                checked={selectedSpecies.includes(species)}
                onChange={(e) => handleSpeciesChange(species, e.target.checked)}
                style={{ 
                  marginRight: 10, 
                  transform: 'scale(1.1)', 
                  accentColor: '#70d670',
                  width: isMobile ? 20 : 14,
                  height: isMobile ? 20 : 14
                }}
              /> 
              <span style={{ fontSize: isMobile ? 16 : 14 }}>{species}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Simple Coming Soon Modal */}
      <Modal
        opened={comingSoonModalOpen}
        onClose={() => setComingSoonModalOpen(false)}
        title=""
        centered
        size={isMobile ? "xs" : "sm"}
        padding="xl"
        styles={{
          overlay: {
            backdropFilter: 'blur(5px)',
            backgroundColor: 'rgba(18, 22, 18, 0.75)'
          },
          content: {
            backgroundColor: 'rgba(29, 35, 29, 0.95)',
            color: '#e0ffe0',
            borderRadius: 12,
            border: '1px solid #4a7a4a',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
          },
          header: {
            display: 'none'
          },
          close: {
            color: '#a0ffa0',
            '&:hover': {
              backgroundColor: 'rgba(160, 255, 160, 0.1)'
            }
          }
        }}
      >
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <IconDeer size={56} style={{ color: '#70d670', margin: '0 auto 20px' }} />
          
          <Text style={{ fontSize: isMobile ? 20 : 22, fontWeight: 700, marginBottom: 12, color: '#a0ffa0' }}>
            Hunting Mode Coming Soon
          </Text>
          
          <Text style={{ fontSize: isMobile ? 14 : 15, lineHeight: 1.5, marginBottom: 24, opacity: 0.9 }}>
            We're working on bringing you hunting regulations and features. Check back soon!
          </Text>
          
          <Button 
            onClick={() => setComingSoonModalOpen(false)}
            styles={{
              root: {
                backgroundColor: '#70d670',
                color: '#121612',
                padding: isMobile ? '8px 32px' : '6px 24px',
                fontSize: isMobile ? 16 : 14,
                '&:hover': {
                  backgroundColor: '#5bc45b'
                }
              }
            }}
          >
            Got it
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default SidebarPanel;