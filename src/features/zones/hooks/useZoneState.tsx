import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ZoneInfo } from '../../../shared/types';
import { zoneRuleMap } from '../../../data/zoneRuleMap';
import { useResponsive } from '../../../shared/hooks/useResponsive';

interface ZoneStateContextProps {
  selectedZone: string;
  zoneData: ZoneInfo | null;
  isLoading: boolean;
  error: Error | null;
  setSelectedZone: (zone: string) => void;
  showRegulationsPanel: boolean;
  setShowRegulationsPanel: (show: boolean) => void;
}

const ZoneStateContext = createContext<ZoneStateContextProps | undefined>(undefined);

export const ZoneStateProvider = ({ children }: { children: ReactNode }) => {
  const { isMobile } = useResponsive();
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [zoneData, setZoneData] = useState<ZoneInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [showRegulationsPanel, setShowRegulationsPanel] = useState<boolean>(!isMobile);

  // On mobile, when a zone is selected, show the regulations panel
  useEffect(() => {
    if (isMobile && selectedZone) {
      setShowRegulationsPanel(true);
    }
  }, [selectedZone, isMobile]);

  useEffect(() => {
    console.log('[ZoneState] useEffect triggered for selectedZone:', selectedZone);

    if (!selectedZone) {
      console.log('[ZoneState] No zone selected. Clearing zoneData.');
      setZoneData(null);
      return;
    }

    const loadZoneData = () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = zoneRuleMap[selectedZone];
        console.log(`[ZoneState] zoneRuleMap access: ${selectedZone}`, data);

        if (!data) {
          throw new Error(`No data found in zoneRuleMap for ${selectedZone}`);
        }

        const { notes, rules, specialWaters } = data;

        setZoneData({
          zone: selectedZone,
          notes,
          rules,
          specialWaters: specialWaters || [],
        });

        console.log(`[ZoneState] Loaded data for ${selectedZone}:`, {
          rulesCount: rules.length,
          specialWatersCount: specialWaters?.length ?? 0,
        });
      } catch (err) {
        console.error(`[ZoneState] Error loading data for ${selectedZone}:`, err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setZoneData(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadZoneData();
  }, [selectedZone]);

  return (
    <ZoneStateContext.Provider
      value={{
        selectedZone,
        zoneData,
        isLoading,
        error,
        setSelectedZone,
        showRegulationsPanel,
        setShowRegulationsPanel,
      }}
    >
      {children}
    </ZoneStateContext.Provider>
  );
};

export const useZoneState = () => {
  const context = useContext(ZoneStateContext);
  if (context === undefined) {
    throw new Error('useZoneState must be used within a ZoneStateProvider');
  }
  return context;
};