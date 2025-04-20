import { useState, useEffect } from 'react';
import { Text, Divider, Switch, Modal, Button } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconFish, IconDeer } from '@tabler/icons-react';
import { useZoneState } from '../../zones/hooks/useZoneState';

interface SidebarPanelProps {
  mode: 'fishing' | 'hunting';
  setMode: (mode: 'fishing' | 'hunting') => void;
  selectedSpecies: string[];
  setSelectedSpecies: React.Dispatch<React.SetStateAction<string[]>>;
  showSpecialWaters: boolean;
  setShowSpecialWaters: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarPanel = ({
  mode,
  setMode,
  selectedSpecies,
  setSelectedSpecies,
  showSpecialWaters,
  setShowSpecialWaters
}: SidebarPanelProps) => {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const { selectedZone, setSelectedZone } = useZoneState();
  
  // State for coming soon modal
  const [comingSoonModalOpen, setComingSoonModalOpen] = useState(false);

  const fishingZones = ['RFA 1', 'RFA 2', 'RFA 3', 'RFA 4', 'RFA 5', 'RFA 6'];
  const fishingSpecies = ['Brook Trout', 'Smallmouth Bass', 'Rainbow Trout', 'Brown Trout', 'Chain Pickerel', 'White Perch', 'Yellow Perch'];
  const huntingZones = ['Zone A', 'Zone B', 'Zone C'];
  const huntingSpecies = ['White-tailed Deer', 'Ducks'];

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

  // Open sidebar when zone is selected
  useEffect(() => {
    if (selectedZone) {
      console.log("Zone selected, opening sidebar");
      setSidebarVisible(true);
    }
  }, [selectedZone]);

  return (
    <>
      {/* Toggle button */}
      <div style={{ 
        position: 'absolute', 
        top: 110, 
        left: sidebarVisible ? 250 : 20, 
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

      {/* Sidebar Panel */}
      <div style={{
        position: 'absolute', 
        top: 100, 
        left: 0, 
        width: 240, 
        height: 'calc(100% - 100px)', 
        padding: 14,
        backgroundColor: 'rgba(29, 35, 29, 0.7)', 
        borderRight: '1px solid #444', 
        backdropFilter: 'blur(6px)',
        overflowY: 'auto', 
        transition: 'transform 0.3s ease, opacity 0.3s ease', 
        color: '#e0ffe0', 
        transform: sidebarVisible ? 'translateX(0)' : 'translateX(-100%)',
        opacity: sidebarVisible ? 1 : 0,
        zIndex: 1000
      }}>
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
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Zone</label>
          <select 
            value={selectedZone} 
            onChange={(e) => setSelectedZone(e.target.value)} 
            style={{
              width: '100%', 
              padding: '8px 10px', 
              borderRadius: 6,
              backgroundColor: '#2a322a', 
              color: '#e0ffe0', 
              border: '1px solid #444', 
              fontSize: 13, 
              fontWeight: 600
            }}
          >
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
                onChange={(e) => handleSpeciesChange(species, e.target.checked)}
                style={{ marginRight: 10, transform: 'scale(1.1)', accentColor: '#70d670' }}
              /> 
              {species}
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
        size="sm"
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
          
          <Text style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: '#a0ffa0' }}>
            Hunting Mode Coming Soon
          </Text>
          
          <Text style={{ fontSize: 15, lineHeight: 1.5, marginBottom: 24, opacity: 0.9 }}>
            We're working on bringing you hunting regulations and features. Check back soon!
          </Text>
          
          <Button 
            onClick={() => setComingSoonModalOpen(false)}
            styles={{
              root: {
                backgroundColor: '#70d670',
                color: '#121612',
                padding: '6px 24px',
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