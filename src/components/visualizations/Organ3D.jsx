import React from 'react';
import HeartModel from '../3d/models/HeartModel';
import LungsModel from '../3d/models/LungsModel';
import BrainModel from '../3d/models/BrainModel';
import StomachModel from '../3d/models/StomachModel';
import KidneyModel from '../3d/models/KidneyModel';

/**
 * Organ3D: Unified organ component that maps organ type to the correct procedural model.
 * Replaces the old primitive-geometry version.
 */
export default function Organ3D({ type, position, label, healthData, onClick, scale = 1 }) {
  const props = {
    position: position || [0, 0, 0],
    healthData,
    onClick,
    scale,
    interactive: true,
  };

  switch (type) {
    case 'heart':
      return <HeartModel {...props} />;
    case 'lungs':
      return <LungsModel {...props} />;
    case 'brain':
      return <BrainModel {...props} />;
    case 'stomach':
      return <StomachModel {...props} />;
    case 'kidney':
      return <KidneyModel {...props} />;
    default:
      return <HeartModel {...props} />;
  }
} 
 
 
 
