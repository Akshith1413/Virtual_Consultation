import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * ParticleTrail: Mouse movement leaves a glowing particle trail in 3D.
 * Trail color matches current section theme.
 */
export default function ParticleTrail({ color = '#818cf8', maxParticles = 100 }) {
  const pointsRef = useRef();
  const trail = useRef([]);
  const prevMouse = useRef(new THREE.Vector2());

  useFrame((state) => {
    if (!pointsRef.current) return;

    const mouse = state.pointer;
    const dx = mouse.x - prevMouse.current.x;
    const dy = mouse.y - prevMouse.current.y;
    const moved = Math.abs(dx) + Math.abs(dy) > 0.002;

    if (moved) {
      // Add new particle at mouse position
      const x = mouse.x * 5;
      const y = mouse.y * 3;
      const z = (Math.random() - 0.5) * 0.5;

      trail.current.push({
        x, y, z,
        life: 1.0,
        vx: dx * 2,
        vy: dy * 2,
        vz: (Math.random() - 0.5) * 0.1,
      });

      if (trail.current.length > maxParticles) {
        trail.current.shift();
      }
    }

    prevMouse.current.set(mouse.x, mouse.y);

    // Update particles
    const positions = [];
    const colors = [];
    const baseColor = new THREE.Color(color);

    for (let i = trail.current.length - 1; i >= 0; i--) {
      const p = trail.current[i];
      p.life -= 0.015;
      p.x += p.vx * 0.01;
      p.y += p.vy * 0.01;
      p.z += p.vz * 0.01;
      p.vx *= 0.98;
      p.vy *= 0.98;

      if (p.life <= 0) {
        trail.current.splice(i, 1);
        continue;
      }

      positions.push(p.x, p.y, p.z);
      const c = baseColor.clone();
      colors.push(c.r, c.g, c.b);
    }

    if (positions.length > 0) {
      const posArray = new Float32Array(positions);
      const colArray = new Float32Array(colors);
      pointsRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      pointsRef.current.geometry.setAttribute('color', new THREE.BufferAttribute(colArray, 3));
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
 
 
 
 
 
 
