import { useState, useEffect } from 'react';
import { ZoneStateProvider } from './features/zones/hooks/useZoneState';
import { WaterStateProvider } from './features/waters/hooks/useWaterState';
import Header from './features/ui/components/Header';
import SidebarPanel from './features/ui/components/SidebarPanel';
import MapContainer from './features/map/components/MapContainer';
import RegulationsPanel from './features/regulations/components/RegulationsPanel';
import MobileNavBar from './features/ui/components/MobileNavBar';
import { getRegulationColor } from './shared/utils/colorUtils';
import { findMatchingSpecialWater } from './features/waters/services/waterUtils';
import specialWatersData from './data/specialWatersData';
import { FishingRule } from './shared/types';
import ZoneDebugProvider from './features/debug/components/ZoneDebugProvider';
import { zoneRuleMap } from './data/zoneRuleMap';
import { useResponsive } from './shared/hooks/useResponsive';
import './App.css';

// Force access to all zones to ensure data is included and hydrated
['RFA 1', 'RFA 2', 'RFA 3', 'RFA 4', 'RFA 5', 'RFA 6'].forEach(zone => {
  console.log(`[App] Forcing zoneRuleMap access for ${zone}:`, zoneRuleMap[zone]);
});

// Make specialWatersData available globally for components that need it
(window as any).specialWatersData = specialWatersData;

const App = () => {
  const { isMobile } = useResponsive();
  const [mode, setMode] = useState<'fishing' | 'hunting'>('fishing');
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const [showSpecialWaters, setShowSpecialWaters] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(!isMobile);
  const [showRegulationsPanel, setShowRegulationsPanel] = useState(false);

  // Close sidebar on mobile when component mounts
  useEffect(() => {
    if (isMobile) {
      setSidebarVisible(false);
    }
  }, [isMobile]);

  // Handle opening the sidebar (for mobile nav)
  const handleOpenSidebar = () => {
    setSidebarVisible(true);
    // If on mobile, hide regulations panel when sidebar opens
    if (isMobile) {
      setShowRegulationsPanel(false);
    }
  };

  return (
    <ZoneStateProvider>
      <WaterStateProvider>
        <ZoneDebugProvider>
          <div 
            className="app-container"
            style={{ 
              height: '100vh', 
              width: '100%', 
              position: 'relative', 
              backgroundColor: '#121612', 
              fontFamily: 'Chakra Petch, sans-serif',
              paddingBottom: isMobile ? 60 : 0 // Make space for mobile nav bar
            }}
          >
            <Header />

            <SidebarPanel
              mode={mode}
              setMode={setMode}
              selectedSpecies={selectedSpecies}
              setSelectedSpecies={setSelectedSpecies}
              showSpecialWaters={showSpecialWaters}
              setShowSpecialWaters={setShowSpecialWaters}
              sidebarVisible={sidebarVisible}
              setSidebarVisible={setSidebarVisible}
            />

            <MapContainer
              specialWatersData={specialWatersData}
              showSpecialWaters={showSpecialWaters}
              mode={mode}
            />

            {(showRegulationsPanel || !isMobile) && (
              <RegulationsPanel
                findMatchingSpecialWater={(rule: FishingRule) => {
                  // Return the matching special water or null, never undefined
                  const result = findMatchingSpecialWater(rule, specialWatersData);
                  return result || null;
                }}
                getRegulationColor={getRegulationColor}
                selectedSpecies={selectedSpecies}
              />
            )}

            {/* Mobile navigation bar - only shows on mobile */}
            <MobileNavBar 
              onOpenSidebar={handleOpenSidebar}
              showRegulationsPanel={showRegulationsPanel} 
              setShowRegulationsPanel={setShowRegulationsPanel}
            />
          </div>
        </ZoneDebugProvider>
      </WaterStateProvider>
    </ZoneStateProvider>
  );
};

export default App;