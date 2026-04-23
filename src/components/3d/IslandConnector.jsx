import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * IslandConnector: Glowing particle beam connections between islands.
 * Creates visual continuity during camera transitions.
 */
export default function IslandConnector({ from = [0, 0, 0], to = [0, 0, 0], color = '#6366f1', particleCount = 30 }) {
  const pointsRef = useRef();
  const lineRef = useRef();

  const { positions, data } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const data = [];

    for (let i = 0; i < particleCount; i++) {
      const t = Math.random();
      positions[i * 3] = from[0] + (to[0] - from[0]) * t;
      positions[i * 3 + 1] = from[1] + (to[1] - from[1]) * t;
      positions[i * 3 + 2] = from[2] + (to[2] - from[2]) * t;

      data.push({
        t,
        speed: 0.05 + Math.random() * 0.15,
      });
    }
    return { positions, data };
  }, [from, to, particleCount]);

  // Create the line geometry
  const lineGeometry = useMemo(() => {
    const curve = new THREE.LineCurve3(
      new THREE.Vector3(...from),
      new THREE.Vector3(...to)
    );
    const points = curve.getPoints(20);
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [from, to]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const posArray = pointsRef.current.geometry.attributes.position.array;

    for (let i = 0; i < particleCount; i++) {
      data[i].t += data[i].speed * delta;
      if (data[i].t > 1) data[i].t = 0;

      const t = data[i].t;
      // Add slight curve with sine wave offset
      const curveOffset = Math.sin(t * Math.PI) * 0.5;

      posArray[i * 3] = from[0] + (to[0] - from[0]) * t;
      posArray[i * 3 + 1] = from[1] + (to[1] - from[1]) * t + curveOffset;
      posArray[i * 3 + 2] = from[2] + (to[2] - from[2]) * t;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      {/* Faint connecting line */}
      <line ref={lineRef} geometry={lineGeometry}>
        <lineBasicMaterial color={color} transparent opacity={0.08} />
      </line>

      {/* Traveling particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={positions} count={particleCount} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color={color}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
 
 
 
 

// minor tweak for clarity

// minor tweak for clarity

// minor tweak for clarity

// minor tweak for clarity

// minor tweak for clarity
