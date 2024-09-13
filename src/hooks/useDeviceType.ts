// src/hooks/useDeviceType.ts
import { useState, useEffect } from 'react';

const useDeviceType = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // 768px is a common mobile breakpoint

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile;
};

export default useDeviceType;