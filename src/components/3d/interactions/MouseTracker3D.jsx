import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * MouseTracker3D: Creates a glowing orb that follows mouse in 3D space.
 * Objects within proximity react with subtle glow increase.
 */
export default function MouseTracker3D({ color = '#818cf8', size = 0.15 }) {
  const meshRef = useRef();
  const lightRef = useRef();
  const mouse = useRef(new THREE.Vector2());
  const targetPos = useRef(new THREE.Vector3());
  const { camera, size: viewport } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));

  useFrame((state) => {
    // Get mouse position in normalized device coordinates
    mouse.current.x = (state.pointer.x);
    mouse.current.y = (state.pointer.y);

    // Project mouse to 3D plane
    raycaster.current.setFromCamera(mouse.current, camera);
    const intersectPoint = new THREE.Vector3();
    raycaster.current.ray.intersectPlane(plane.current, intersectPoint);

    if (intersectPoint && meshRef.current) {
      // Smooth follow
      targetPos.current.copy(intersectPoint);
      meshRef.current.position.lerp(targetPos.current, 0.08);

      if (lightRef.current) {
        lightRef.current.position.copy(meshRef.current.position);
      }

      // Pulse effect
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        color={color}
        intensity={0.5}
        distance={5}
        decay={2}
      />
    </group>
  );
}
 
 
 

// minor tweak for clarity

// minor tweak for clarity
