import { IconMap, IconList, IconAdjustments } from '@tabler/icons-react';
import { useResponsive } from '../../../shared/hooks/useResponsive';
import { useZoneState } from '../../zones/hooks/useZoneState';

interface MobileNavBarProps {
  onOpenSidebar: () => void;
  showRegulationsPanel: boolean;
  setShowRegulationsPanel: (show: boolean) => void;
}

const MobileNavBar = ({ 
  onOpenSidebar, 
  showRegulationsPanel, 
  setShowRegulationsPanel 
}: MobileNavBarProps) => {
  const { isMobile } = useResponsive();
  const { selectedZone } = useZoneState();
  
  // Don't render on desktop
  if (!isMobile) return null;
  
  // Don't show if no zone is selected
  if (!selectedZone) return null;

  const navButtonStyle = (active: boolean) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    color: active ? '#70d670' : '#e0ffe0',
    height: 60,
    flex: 1,
    cursor: 'pointer',
    userSelect: 'none' as const
  });
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      height: 60,
      backgroundColor: 'rgba(28, 31, 28, 0.95)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      borderTop: '1px solid #444',
      zIndex: 1200
    }}>
      <div 
        onClick={onOpenSidebar}
        style={navButtonStyle(false)}
      >
        <IconAdjustments size={24} />
        <span style={{ fontSize: 12, marginTop: 2 }}>Filters</span>
      </div>
      
      <div 
        onClick={() => setShowRegulationsPanel(false)}
        style={navButtonStyle(!showRegulationsPanel)}
      >
        <IconMap size={24} />
        <span style={{ fontSize: 12, marginTop: 2 }}>Map</span>
      </div>
      
      <div 
        onClick={() => setShowRegulationsPanel(true)}
        style={navButtonStyle(showRegulationsPanel)}
      >
        <IconList size={24} />
        <span style={{ fontSize: 12, marginTop: 2 }}>Rules</span>
      </div>
    </div>
  );
};

export default MobileNavBar;