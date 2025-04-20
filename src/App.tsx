import { useState } from 'react';
import { ZoneStateProvider } from './features/zones/hooks/useZoneState';
import { WaterStateProvider } from './features/waters/hooks/useWaterState';
import Header from './features/ui/components/Header';
import SidebarPanel from './features/ui/components/SidebarPanel';
import MapContainer from './features/map/components/MapContainer';
import RegulationsPanel from './features/regulations/components/RegulationsPanel';
import { getRegulationColor } from './shared/utils/colorUtils';
import { findMatchingSpecialWater } from './features/waters/services/waterUtils';
import specialWatersData from './data/specialWatersData';
import { FishingRule } from './shared/types';
import ZoneDebugProvider from './features/debug/components/ZoneDebugProvider';
import { zoneRuleMap } from './data/zoneRuleMap'

// Force access to all zones to ensure data is included and hydrated
['RFA 1', 'RFA 2', 'RFA 3', 'RFA 4', 'RFA 5', 'RFA 6'].forEach(zone => {
  console.log(`[App] Forcing zoneRuleMap access for ${zone}:`, zoneRuleMap[zone]);
});


const App = () => {
  const [mode, setMode] = useState<'fishing' | 'hunting'>('fishing');
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const [showSpecialWaters, setShowSpecialWaters] = useState(true);

  return (
    <ZoneStateProvider>
      <WaterStateProvider>
        <ZoneDebugProvider>
          <div style={{ height: '100vh', width: '100%', position: 'relative', backgroundColor: '#121612', fontFamily: 'Chakra Petch, sans-serif' }}>
            <Header />

            <SidebarPanel
              mode={mode}
              setMode={setMode}
              selectedSpecies={selectedSpecies}
              setSelectedSpecies={setSelectedSpecies}
              showSpecialWaters={showSpecialWaters}
              setShowSpecialWaters={setShowSpecialWaters}
            />

            <MapContainer
              specialWatersData={specialWatersData}
              showSpecialWaters={showSpecialWaters}
              mode={mode}
            />

            <RegulationsPanel
              findMatchingSpecialWater={(rule: FishingRule) => {
                // Return the matching special water or null, never undefined
                const result = findMatchingSpecialWater(rule, specialWatersData);
                return result || null;
              }}
              getRegulationColor={getRegulationColor}
            />
          </div>
        </ZoneDebugProvider>
      </WaterStateProvider>
    </ZoneStateProvider>
  );
};

export default App;
