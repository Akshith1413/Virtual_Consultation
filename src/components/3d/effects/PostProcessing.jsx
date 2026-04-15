import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

/**
 * Post-processing effects stack for premium visual quality.
 * Bloom for glowing elements, vignette for cinematic feel, chromatic aberration for transitions.
 */
export default function PostProcessingEffects({
  bloomIntensity = 0.8,
  vignetteStrength = 0.4,
  enableChromatic = false,
  quality = 'high',
}) {
  if (quality === 'low') return null;

  return (
    <EffectComposer multisampling={quality === 'high' ? 4 : 0}>
      <Bloom
        luminanceThreshold={0.5}
        luminanceSmoothing={0.9}
        intensity={bloomIntensity}
        mipmapBlur
      />
      <Vignette
        eskil={false}
        offset={0.1}
        darkness={vignetteStrength}
      />
      {enableChromatic && (
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.002, 0.002)}
        />
      )}
    </EffectComposer>
  );
}
 


// minor tweak for clarity
