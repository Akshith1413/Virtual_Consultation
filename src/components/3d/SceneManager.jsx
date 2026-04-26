import React, { useRef, useCallback, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * SceneManager: handles smooth camera transitions between "island" positions.
 * Used on the landing page for scroll-driven camera flight.
 */
export default function SceneManager({ activeIsland = 0, islands = [], transitionSpeed = 2.0 }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0, 8));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    if (islands[activeIsland]) {
      const island = islands[activeIsland];
      targetPos.current.set(...(island.cameraPos || [0, 0, 8]));
      targetLookAt.current.set(...(island.lookAt || [0, 0, 0]));
    }
  }, [activeIsland, islands]);

  useFrame((_, delta) => {
    // Smooth camera position interpolation
    camera.position.lerp(targetPos.current, delta * transitionSpeed);

    // Smooth look-at interpolation
    currentLookAt.current.lerp(targetLookAt.current, delta * transitionSpeed);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

/**
 * Island position configurations for the landing page.
 * Each island defines where it exists in 3D space and where the camera should be.
 */
export const ISLAND_CONFIGS = [
  {
    id: 'hero',
    position: [0, 0, 0],
    cameraPos: [0, 1, 12],
    lookAt: [0, 0, 0],
  },
  {
    id: 'features',
    position: [25, -2, -10],
    cameraPos: [25, 0, 2],
    lookAt: [25, -2, -10],
  },
  {
    id: 'body',
    position: [-25, 3, -25],
    cameraPos: [-25, 5.5, -13],
    lookAt: [-25, 4.5, -25],
  },
  {
    id: 'ai',
    position: [0, 8, -45],
    cameraPos: [0, 10, -35],
    lookAt: [0, 8, -45],
  },
  {
    id: 'testimonials',
    position: [30, 0, -60],
    cameraPos: [30, 2, -50],
    lookAt: [30, 0, -60],
  },
  {
    id: 'cta',
    position: [0, -3, -80],
    cameraPos: [0, 0, -70],
    lookAt: [0, -3, -80],
  },
];
