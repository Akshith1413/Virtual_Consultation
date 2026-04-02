import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * GazeSelector: Raycasting from camera center to detect gazed objects.
 * Shows a subtle ring on focused objects, dwell-to-select on hold.
 */
export default function GazeSelector({ onGaze, dwellTime = 1.5 }) {
  const ringRef = useRef();
  const gazeTimer = useRef(0);
  const currentTarget = useRef(null);
  const raycaster = useRef(new THREE.Raycaster());
  const centerScreen = useRef(new THREE.Vector2(0, 0));

  useFrame((state, delta) => {
    if (!ringRef.current) return;

    // Cast ray from center of screen
    raycaster.current.setFromCamera(centerScreen.current, state.camera);
    const intersects = raycaster.current.intersectObjects(state.scene.children, true);

    // Filter to only interactive objects (those with userData.interactive)
    const interactive = intersects.find(i => i.object.userData?.interactive);

    if (interactive) {
      const target = interactive.object;

      if (currentTarget.current === target) {
        gazeTimer.current += delta;

        // Update ring
        ringRef.current.visible = true;
        ringRef.current.position.copy(interactive.point);
        ringRef.current.lookAt(state.camera.position);

        // Progress animation
        const progress = Math.min(gazeTimer.current / dwellTime, 1);
        ringRef.current.material.opacity = 0.3 + progress * 0.4;
        ringRef.current.scale.setScalar(0.3 - progress * 0.1);

        if (gazeTimer.current >= dwellTime) {
          onGaze?.(target.userData);
          gazeTimer.current = 0;
        }
      } else {
        currentTarget.current = target;
        gazeTimer.current = 0;
      }
    } else {
      ringRef.current.visible = false;
      currentTarget.current = null;
      gazeTimer.current = 0;
    }
  });

  return (
    <mesh ref={ringRef} visible={false}>
      <ringGeometry args={[0.08, 0.12, 32]} />
      <meshBasicMaterial
        color="#818cf8"
        transparent
        opacity={0.3}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
 
 
 
 
 
 
 
 
 
 

// minor tweak for clarity
