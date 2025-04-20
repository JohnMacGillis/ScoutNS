import { ZoneInfo } from '../../shared/types';

export interface ZoneStateContextProps {
  selectedZone: string;
  zoneData: ZoneInfo | null;
  isLoading: boolean;
  error: Error | null;
  setSelectedZone: (zone: string) => void;
  showRegulationsPanel: boolean;  
  setShowRegulationsPanel: (show: boolean) => void;
}
