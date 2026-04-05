import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AIIsland: Floating neural network visualization representing the AI Health Assistant.
 * Pulsing nodes with dynamic floating animations, interactive hover scaling, and live data particles traveling along connections.
 */

const AI_NODE_DESCRIPTIONS = [
  { title: "Symptom Pre-Screening", desc: "Advanced triage system analyzing symptoms to determine urgency and clinical specialty." },
  { title: "Medical Entity Extraction", desc: "NLP-driven identification of diseases, symptoms, and clinical markers from conversation." },
  { title: "Health Risk Assessment", desc: "Predictive modeling for Chronic Disease risk including Heart Health and Diabetes." },
  { title: "Nutritional Intelligence", desc: "AI analysis of caloric density, macro balance, and dietary compliance trends." },
  { title: "Personalized Wellness", desc: "Context-aware daily advice tailored to biological patterns and recovery metrics." },
  { title: "Emotional Sentiment", desc: "Analyzing linguistic patterns to monitor patient mental well-being and engagement." },
  { title: "Drug Safety Analysis", desc: "Cross-referencing supplements and medications for potential adverse interactions." },
  { title: "Automated Reporting", desc: "Summarizing consultations into structured digital health records and reports." },
  { title: "Hydration Optimization", desc: "Predictive reminders based on environmental data and physical activity levels." },
  { title: "Sleep Pattern Analysis", desc: "Decoding biometric sleep data to optimize recovery cycles and circadian health." },
  { title: "Vital Trend Forecasting", desc: "Machine learning forecasts for BMI, Heart Rate, and other physiological metrics." },
  { title: "Clinical Knowledge Hub", desc: "Real-time retrieval from vast medical knowledge bases for intuitive health queries." },
  { title: "Activity Anomalies", desc: "Neural monitoring of physical movement to detect deviations from healthy patterns." },
  { title: "Wellness Trajectory", desc: "Long-term forecasting of health goals and longevity based on behavioral data." }
];

function NeuralNode({ index, basePosition, color = '#818cf8', size = 0.20, positionsRef, hoveredNode, setHoveredNode, freezeAnimation }) {
  const meshRef = useRef();
  const timeOffset = useMemo(() => Math.random() * 100, []);
  const localTime = useRef(timeOffset);

  const isHovered = hoveredNode === index;
  const nodeData = AI_NODE_DESCRIPTIONS[index] || { title: "Neural Processing", desc: "Analyzing biological patterns." };

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Float movement accumulator
    if (!freezeAnimation) {
      localTime.current += delta;
    }

    // Always calculate position from local time to guarantee smooth pausing
    const t = localTime.current;
    meshRef.current.position.x = basePosition[0] + Math.sin(t * 0.5) * 0.2;
    meshRef.current.position.y = basePosition[1] + Math.cos(t * 0.4) * 0.2;
    meshRef.current.position.z = basePosition[2] + Math.sin(t * 0.3) * 0.2;

    // Pulse size
    const targetScale = isHovered ? 2.5 : (1 + Math.sin(state.clock.elapsedTime * 2 + basePosition[0] * 3) * 0.15);
    meshRef.current.scale.lerp(new THREE.Vector3().setScalar(targetScale), 0.1);

    // Update global positions array for line connections and particles
    if (positionsRef.current[index]) {
      positionsRef.current[index].copy(meshRef.current.position);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={basePosition}
      onPointerOver={(e) => { e.stopPropagation(); setHoveredNode(index); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); setHoveredNode(null); document.body.style.cursor = 'auto'; }}
    >
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial
        color={isHovered ? '#ffffff' : color}
        emissive={isHovered ? '#ffffff' : color}
        emissiveIntensity={isHovered ? 0.8 : 0.5}
        metalness={0.5}
        roughness={0.2}
      />
      {isHovered && (
        <Html distanceFactor={10} position={[0, size * 2.5, 0]} center zIndexRange={[100, 0]}>
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="bg-slate-900/90 border border-indigo-500/50 backdrop-blur-md rounded-xl p-4 text-left shadow-[0_0_30px_rgba(99,102,241,0.3)] w-56 pointer-events-none"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <h4 className="text-[10px] font-black tracking-wider text-indigo-300 uppercase">{nodeData.title}</h4>
              </div>
              <p className="text-[10px] text-slate-300 leading-relaxed font-semibold">
                {nodeData.desc}
              </p>
            </motion.div>
          </AnimatePresence>
        </Html>
      )}
    </mesh>
  );
}

function NeuralConnections({ connections, positionsRef }) {
  const groupRef = useRef();

  useFrame(() => {
    if (!groupRef.current || !positionsRef.current) return;
    const children = groupRef.current.children;

    connections.forEach((conn, idx) => {
      const child = children[idx];
      if (!child) return;

      const start = positionsRef.current[conn[0]];
      const end = positionsRef.current[conn[1]];

      if (!start || !end) return;

      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      child.position.copy(mid);

      const direction = new THREE.Vector3().subVectors(end, start);
      const length = direction.length();

      child.scale.set(1, length, 1);

      if (length > 0.001) {
        const quaternion = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          direction.normalize()
        );
        child.quaternion.copy(quaternion);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {connections.map(([i, j], idx) => (
        <mesh key={idx} raycast={() => null}>
          <cylinderGeometry args={[0.015, 0.015, 1, 4]} />
          <meshBasicMaterial color="#4f46e5" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function DataTravelers({ count = 25, connections, positionsRef, freezeAnimation }) {
  const pointsRef = useRef();

  const { positions, travelers } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const travelers = [];

    for (let i = 0; i < count; i++) {
      const connIdx = i % Math.max(connections.length, 1);
      travelers.push({
        connIdx,
        t: Math.random(),
        speed: 0.3 + Math.random() * 0.7,
        forward: Math.random() > 0.5,
      });
    }
    return { positions, travelers };
  }, [connections, count]);

  useFrame((state, delta) => {
    if (!pointsRef.current || connections.length === 0 || !positionsRef.current) return;
    const posArray = pointsRef.current.geometry.attributes.position.array;

    for (let i = 0; i < count; i++) {
      const tv = travelers[i];
      if (!freezeAnimation) {
        tv.t += (tv.forward ? 1 : -1) * tv.speed * delta;

        if (tv.t > 1 || tv.t < 0) {
          tv.forward = !tv.forward;
          tv.t = Math.max(0, Math.min(1, tv.t));
        }
      }

      const conn = connections[tv.connIdx % connections.length];
      if (!conn) continue;

      const start = positionsRef.current[conn[0]];
      const end = positionsRef.current[conn[1]];

      if (!start || !end) continue;

      posArray[i * 3] = start.x + (end.x - start.x) * tv.t;
      posArray[i * 3 + 1] = start.y + (end.y - start.y) * tv.t;
      posArray[i * 3 + 2] = start.z + (end.z - start.z) * tv.t;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} raycast={() => null}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#a78bfa" transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

export default function AIIsland({ position = [0, 0, 0], isActive }) {
  const groupRef = useRef();
  const [hoveredNode, setHoveredNode] = useState(null);
  const [isRegionHovered, setIsRegionHovered] = useState(false);

  const freezeAnimation = false; // Always keep neural network active for a more alive feel

  // Generate neural network node base positions
  const nodes = useMemo(() => {
    const result = [];
    const layers = [2, 3, 4, 3, 2];
    let xOffset = -4;

    for (const layerSize of layers) {
      for (let i = 0; i < layerSize; i++) {
        const y = (i - (layerSize - 1) / 2) * 1.2;
        const z = (Math.random() - 0.5) * 1.5;
        result.push([xOffset, y, z]);
      }
      xOffset += 2;
    }
    return result;
  }, []);

  // Compute static connections between nodes based on base positions
  const connections = useMemo(() => {
    const conns = [];
    for (let i = 0; i < nodes.length; i++) {
      const distances = [];
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        const dx = nodes[i][0] - nodes[j][0];
        const dy = nodes[i][1] - nodes[j][1];
        const dz = nodes[i][2] - nodes[j][2];
        distances.push({ index: j, dist: Math.sqrt(dx * dx + dy * dy + dz * dz) });
      }
      distances.sort((a, b) => a.dist - b.dist);

      for (let k = 0; k < Math.min(3, distances.length); k++) {
        if (distances[k].dist < 3.5) {
          // Avoid duplicate connections in reverse
          if (i < distances[k].index) {
            conns.push([i, distances[k].index]);
          }
        }
      }
    }
    return conns;
  }, [nodes]);

  // Global shared state for node positions updated in useFrame
  const positionsRef = useRef(nodes.map(p => new THREE.Vector3(...p)));

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Platform */}
      <mesh position={[0, -4, 0]} receiveShadow>
        <cylinderGeometry args={[7, 7.5, 0.4, 48]} />
        <meshStandardMaterial color="#1e1b4b" metalness={0.4} roughness={0.6} transparent opacity={0.2} />
      </mesh>

      <group ref={groupRef} scale={0.75} position={[0, -2, 0]}>
        {/* Neural nodes */}
        {nodes.map((pos, i) => (
          <NeuralNode
            key={i}
            index={i}
            basePosition={pos}
            color={i % 3 === 0 ? '#818cf8' : i % 3 === 1 ? '#c084fc' : '#a78bfa'}
            positionsRef={positionsRef}
            hoveredNode={hoveredNode}
            setHoveredNode={setHoveredNode}
            freezeAnimation={freezeAnimation}
          />
        ))}

        {/* Connections and Travelers */}
        <NeuralConnections connections={connections} positionsRef={positionsRef} />
        <DataTravelers count={25} connections={connections} positionsRef={positionsRef} freezeAnimation={freezeAnimation} />

        {/* Invisible backdrop to detect hovering over the general model area */}
        <mesh
          position={[0, 0, -1.5]}
          onPointerOver={(e) => { e.stopPropagation(); setIsRegionHovered(true); }}
          onPointerOut={(e) => setIsRegionHovered(false)}
        >
          <planeGeometry args={[16, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>

      {/* Main Title Background */}
      <Html center position={[0, 2, 0]} distanceFactor={12}>
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="text-center"
              style={{ pointerEvents: 'none', width: '500px' }}
            >
              <h2 className="text-4xl font-black text-white mb-4 tracking-tight">
                AI <span style={{
                  background: 'linear-gradient(135deg, #a78bfa, #c084fc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>Health Assistant</span>
              </h2>
              <p className="text-indigo-200/50 text-base max-w-md mx-auto leading-relaxed">
                Powered by neural networks that learn your patterns, predict health trends, and provide personalized wellness guidance.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </Html>

      <pointLight color="#818cf8" intensity={1} distance={15} position={[0, 2, 3]} />
    </group>
  );
}
 
 
 
 
