import { useResponsive } from '../../../shared/hooks/useResponsive';

const Header = () => {
  const { isMobile } = useResponsive();
  
  return (
    <div style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: isMobile ? 60 : 100, 
      backgroundColor: 'rgba(28, 31, 28, 0.85)', 
      backdropFilter: 'blur(8px)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      borderBottom: '1px solid #444',
      zIndex: 1001 
    }}>
      <img 
        src="/images/logo.png" 
        alt="ScoutNS Logo" 
        style={{ height: isMobile ? 90 : 160 }} 
      />
    </div>
  );
};

export default Header;