import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * DayNightCycle: Adjusts scene lighting based on real-world time.
 * Morning = warm gold, Afternoon = bright white, Evening = purple/orange, Night = cool blue
 */
export default function DayNightCycle() {
  const dirLightRef = useRef();
  const ambientRef = useRef();
  const hour = new Date().getHours();

  const config = useMemo(() => {
    if (hour >= 6 && hour < 12) {
      // Morning - warm golden
      return {
        dirColor: '#fbbf24',
        dirIntensity: 1.0,
        ambientColor: '#fef3c7',
        ambientIntensity: 0.5,
        dirPos: [5, 3, 5],
      };
    } else if (hour >= 12 && hour < 17) {
      // Afternoon - bright white/blue
      return {
        dirColor: '#ffffff',
        dirIntensity: 1.2,
        ambientColor: '#e0f2fe',
        ambientIntensity: 0.5,
        dirPos: [0, 10, 5],
      };
    } else if (hour >= 17 && hour < 20) {
      // Evening - purple/orange sunset
      return {
        dirColor: '#f97316',
        dirIntensity: 0.8,
        ambientColor: '#fecaca',
        ambientIntensity: 0.4,
        dirPos: [-5, 2, 3],
      };
    } else {
      // Night - cool blue/indigo
      return {
        dirColor: '#6366f1',
        dirIntensity: 0.4,
        ambientColor: '#312e81',
        ambientIntensity: 0.3,
        dirPos: [-3, 5, -3],
      };
    }
  }, [hour]);

  return (
    <>
      <directionalLight
        ref={dirLightRef}
        position={config.dirPos}
        color={config.dirColor}
        intensity={config.dirIntensity}
      />
      <ambientLight
        ref={ambientRef}
        color={config.ambientColor}
        intensity={config.ambientIntensity}
      />
    </>
  );
}
 
 
 
 
 
 
 

// minor tweak for clarity

// minor tweak for clarity
