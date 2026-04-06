import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html, Float } from '@react-three/drei';

/**
 * WellnessTree3D — Complete rewrite with recursive branching algorithm.
 * Tree size/health reflects the user's overall health score.
 * Branches for different health aspects, fruits for metric completion.
 */

function Branch({ start, length, angle, angleZ, depth, maxDepth, healthScore }) {
  const meshRef = useRef();

  if (depth > maxDepth) return null;

  const thickness = 0.06 * Math.pow(0.65, depth);
  const endY = length;

  // Branch color: brown for trunk, green transitioning for higher branches
  const color = depth < 2 ? '#8b4513' : depth < 3 ? '#6b8e23' : '#228b22';

  // Scaling factor based on health score (0–100)
  const scaleFactor = 0.5 + (healthScore / 100) * 0.5;

  // Generate child branches
  const childBranches = useMemo(() => {
    if (depth >= maxDepth) return [];
    const branches = [];
    const numChildren = depth < 2 ? 3 : 2;
    const spread = 0.4 + depth * 0.15;

    for (let i = 0; i < numChildren; i++) {
      const childAngle = (i / (numChildren - 1 || 1) - 0.5) * spread * 2;
      const childAngleZ = (Math.random() - 0.5) * spread;
      branches.push({
        angle: childAngle,
        angleZ: childAngleZ,
        length: length * (0.65 + Math.random() * 0.1),
      });
    }
    return branches;
  }, [depth, maxDepth, length]);

  // Leaf at tip
  const showLeaf = depth >= maxDepth - 1;
  const leafHue = healthScore > 70 ? '#22c55e' : healthScore > 40 ? '#eab308' : '#ef4444';

  return (
    <group rotation={[0, 0, angle]}>
      {/* Branch cylinder */}
      <mesh position={[0, length / 2, 0]}>
        <cylinderGeometry args={[thickness * 0.6, thickness, length, 6]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.05}
          roughness={0.8}
        />
      </mesh>

      {/* Children at branch tip */}
      <group position={[0, length, 0]}>
        {childBranches.map((child, i) => (
          <group key={i} rotation={[child.angleZ, 0, 0]}>
            <Branch
              start={[0, 0, 0]}
              length={child.length * scaleFactor}
              angle={child.angle}
              angleZ={child.angleZ}
              depth={depth + 1}
              maxDepth={maxDepth}
              healthScore={healthScore}
            />
          </group>
        ))}

        {/* Leaves/fruits at tips */}
        {showLeaf && (
          <Float speed={2 + Math.random() * 2} rotationIntensity={0.2} floatIntensity={0.3}>
            <mesh position={[(Math.random() - 0.5) * 0.1, 0.1, (Math.random() - 0.5) * 0.1]}>
              <sphereGeometry args={[0.06 + Math.random() * 0.04, 8, 8]} />
              <meshStandardMaterial
                color={leafHue}
                emissive={leafHue}
                emissiveIntensity={0.3}
                transparent
                opacity={0.85}
              />
            </mesh>
          </Float>
        )}
      </group>
    </group>
  );
}

export default function WellnessTree3D({ healthScore = 75, healthMetrics = [], onBranchClick }) {
  const groupRef = useRef();
  const maxDepth = Math.min(Math.floor(2 + (healthScore / 100) * 3), 5);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Root / Ground disc */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 24]} />
        <meshStandardMaterial color="#3f2d1a" roughness={1} />
      </mesh>

      {/* Main trunk + branches */}
      <Branch
        start={[0, 0, 0]}
        length={0.8}
        angle={0}
        angleZ={0}
        depth={0}
        maxDepth={maxDepth}
        healthScore={healthScore}
      />

      {/* Additional side branches */}
      <group rotation={[0, Math.PI * 0.5, 0]}>
        <Branch
          start={[0, 0, 0]}
          length={0.55}
          angle={0.6}
          angleZ={0}
          depth={1}
          maxDepth={maxDepth}
          healthScore={healthScore}
        />
      </group>
      <group rotation={[0, Math.PI * 1.2, 0]}>
        <Branch
          start={[0, 0, 0]}
          length={0.5}
          angle={-0.5}
          angleZ={0}
          depth={1}
          maxDepth={maxDepth}
          healthScore={healthScore}
        />
      </group>

      {/* Ambient glow beneath tree */}
      <pointLight
        color={healthScore > 70 ? '#22c55e' : healthScore > 40 ? '#eab308' : '#ef4444'}
        intensity={0.6}
        distance={4}
        decay={2}
        position={[0, 0.5, 0]}
      />
    </group>
  );
} 
 
 
 
 
 
