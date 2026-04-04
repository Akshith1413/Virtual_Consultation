import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Procedural DNA Double Helix using parametric tube geometry.
 * Features: rotating animation with glowing nucleotide connections.
 * Decorative element for health profile sections.
 */
function HelixStrand({ clockwise = true, color = '#818cf8' }) {
  const meshRef = useRef();

  const geometry = useMemo(() => {
    const points = [];
    const turns = 4;
    const segments = 200;
    const radius = 0.4;
    const height = 4;
    const direction = clockwise ? 1 : -1;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI * 2 * turns * direction;
      const y = (t - 0.5) * height;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      points.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 200, 0.04, 8, false);
  }, [clockwise]);

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        metalness={0.5}
        roughness={0.3}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

function NucleotideBridges({ count = 20 }) {
  const groupRef = useRef();

  const bridges = useMemo(() => {
    const result = [];
    const turns = 4;
    const height = 4;

    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      const angle1 = t * Math.PI * 2 * turns;
      const angle2 = -angle1;
      const y = (t - 0.5) * height;

      const start = new THREE.Vector3(
        Math.cos(angle1) * 0.4,
        y,
        Math.sin(angle1) * 0.4
      );
      const end = new THREE.Vector3(
        Math.cos(angle2) * 0.4,
        y,
        Math.sin(angle2) * 0.4
      );

      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      const length = start.distanceTo(end);
      const direction = new THREE.Vector3().subVectors(end, start).normalize();
      const quaternion = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction
      );

      // Alternating colors for A-T and G-C base pairs
      const pairColors = [
        ['#f472b6', '#a78bfa'], // Pink - Purple (A-T)
        ['#34d399', '#fbbf24'], // Green - Gold (G-C)
      ];
      const colorPair = pairColors[i % 2];

      result.push({ mid, length, quaternion, y, colorPair });
    }
    return result;
  }, [count]);

  useFrame((state) => {
    // Bridges can have subtle glow animation
  });

  return (
    <group ref={groupRef}>
      {bridges.map((bridge, i) => (
        <group key={i} position={bridge.mid} quaternion={bridge.quaternion}>
          {/* Left half */}
          <mesh position={[0, -bridge.length * 0.25, 0]}>
            <cylinderGeometry args={[0.02, 0.02, bridge.length * 0.45, 6]} />
            <meshStandardMaterial
              color={bridge.colorPair[0]}
              emissive={bridge.colorPair[0]}
              emissiveIntensity={0.3}
            />
          </mesh>
          {/* Right half */}
          <mesh position={[0, bridge.length * 0.25, 0]}>
            <cylinderGeometry args={[0.02, 0.02, bridge.length * 0.45, 6]} />
            <meshStandardMaterial
              color={bridge.colorPair[1]}
              emissive={bridge.colorPair[1]}
              emissiveIntensity={0.3}
            />
          </mesh>
          {/* Center node */}
          <mesh>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.4}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function DNAHelix({
  position = [0, 0, 0],
  scale = 1.0,
  rotationSpeed = 0.3,
}) {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Two intertwined strands */}
      <HelixStrand clockwise={true} color="#818cf8" />
      <HelixStrand clockwise={false} color="#f472b6" />

      {/* Nucleotide bridges connecting them */}
      <NucleotideBridges count={24} />

      {/* Ambient glow */}
      <pointLight color="#818cf8" intensity={0.8} distance={5} decay={2} />
    </group>
  );
}
 
 
 
