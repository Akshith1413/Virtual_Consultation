import React, { useState, useCallback, useMemo, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, ContactShadows, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getBodyInsights } from '../services/aiService';
import '../styles/BodyInsights.css';

/* ═══════════════════════════════════════════════════
   SECTION 1 — MODEL CONFIG & BODY REGION MAPPING
   ═══════════════════════════════════════════════════ */

const MODEL_URL = '/models/body.glb';
const DRACO_PATH = '/draco/';

/* Map anatomical mesh names → our body regions.
   The Z-Anatomy model uses descriptive names like "Pectoralis Major",
   "Biceps Brachii", "Skull", etc. We group them by body region. */
const classifyMesh = (name) => {
  const n = name.toLowerCase();

  // HEAD
  if (n.includes('skull') || n.includes('cranium') || n.includes('mandible') ||
    n.includes('maxilla') || n.includes('frontal') || n.includes('temporal') ||
    n.includes('parietal') || n.includes('occipital') || n.includes('sphenoid') ||
    n.includes('zygomatic') || n.includes('nasal') || n.includes('ethmoid') ||
    n.includes('lacrimal') || n.includes('vomer') || n.includes('palatine') ||
    n.includes('hyoid') || n.includes('masseter') || n.includes('temporalis') ||
    n.includes('pterygoid') || n.includes('bucc') || n.includes('orbicularis_oculi') ||
    n.includes('orbicularis_oris') || n.includes('eye') || n.includes('brain') ||
    n.includes('cerebr') || n.includes('cerebel') || n.includes('thalamus') ||
    n.includes('hypothalamus') || n.includes('pituitary') || n.includes('pineal') ||
    n.includes('head') || n.includes('face') || n.includes('nose') ||
    n.includes('ear') || n.includes('auricul') || n.includes('pinna') || n.includes('meatus') ||
    n.includes('concha') || n.includes('tongue') || n.includes('scalp') ||
    n.includes('mouth') || n.includes('tooth') || n.includes('teeth') ||
    n.includes('dens') || n.includes('dentes') || n.includes('gingiv') ||
    n.includes('lip') || n.includes('labi') || n.includes('oris') ||
    n.includes('palat') || n.includes('oral') || n.includes('jaw') ||
    n.includes('mentalis') || n.includes('zygomaticus') || n.includes('facial')
  ) return 'head';

  // NECK
  if (n.includes('cervic') || n.includes('neck') || n.includes('sternocleidomastoid') ||
    n.includes('scalene') || n.includes('platysma') || n.includes('thyroid') ||
    n.includes('larynx') || n.includes('pharynx') || n.includes('trachea') ||
    n.includes('hyoid') || n.includes('vocal') || n.includes('epiglottis') ||
    n.includes('cricoid')
  ) return 'head'; // Group neck with head instead of chest for better locality around the jaw

  // CHEST / THORAX
  if (n.includes('pectoral') || n.includes('thorax') || n.includes('thoracic') ||
    n.includes('rib') || n.includes('sternum') || n.includes('clavicle') ||
    n.includes('scapula') || n.includes('intercostal') || n.includes('serratus') ||
    n.includes('heart') || n.includes('cardiac') || n.includes('lung') ||
    n.includes('pulmonary') || n.includes('bronch') || n.includes('diaphragm') ||
    n.includes('aorta') || n.includes('vena_cava') || n.includes('esophag') ||
    n.includes('chest') || n.includes('breast') || n.includes('mammary')
  ) return 'chest';

  // ABDOMEN / PELVIS
  if (n.includes('abdom') || n.includes('rectus_abdominis') || n.includes('obliq') ||
    n.includes('transvers') || n.includes('liver') || n.includes('hepat') ||
    n.includes('stomach') || n.includes('gastric') || n.includes('spleen') ||
    n.includes('pancrea') || n.includes('kidney') || n.includes('renal') ||
    n.includes('intestin') || n.includes('colon') || n.includes('cecum') ||
    n.includes('appendix') || n.includes('duoden') || n.includes('jejun') ||
    n.includes('ileum') || n.includes('sigmoid') || n.includes('rectum') ||
    n.includes('bladder') || n.includes('uterus') || n.includes('ovary') ||
    n.includes('prostate') || n.includes('testes') || n.includes('pelvi') ||
    n.includes('iliac') || n.includes('sacr') || n.includes('coccyx') ||
    n.includes('lumbar') || n.includes('psoas') || n.includes('iliacus') ||
    n.includes('gluteus') || n.includes('gluteal') || n.includes('hip')
  ) return 'abdomen';

  // SPINE
  if (n.includes('vertebr') || n.includes('spine') || n.includes('spinal') ||
    n.includes('erector') || n.includes('multifid') || n.includes('rotat')
  ) return 'abdomen'; // Group spine with abdomen

  // ARMS
  if (n.includes('humer') || n.includes('bicep') || n.includes('tricep') ||
    n.includes('brachi') || n.includes('deltoid') || n.includes('shoulder') ||
    n.includes('radius') || n.includes('ulna') || n.includes('forearm') ||
    n.includes('wrist') || n.includes('carp') || n.includes('metacarp') ||
    n.includes('phalanx') || n.includes('phalang') || n.includes('finger') ||
    n.includes('thumb') || n.includes('hand') || n.includes('palm') ||
    n.includes('supinator') || n.includes('pronator') || n.includes('flexor') ||
    n.includes('extensor') || n.includes('arm') || n.includes('elbow') ||
    n.includes('olecranon') || n.includes('anconeus')
  ) return 'arms';

  // LEGS
  if (n.includes('femur') || n.includes('femoral') || n.includes('patella') ||
    n.includes('tibia') || n.includes('fibula') || n.includes('quad') ||
    n.includes('hamstring') || n.includes('semitendin') || n.includes('semimembran') ||
    n.includes('biceps_femoris') || n.includes('vastus') || n.includes('rectus_femoris') ||
    n.includes('sartorius') || n.includes('gracilis') || n.includes('adductor') ||
    n.includes('knee') || n.includes('meniscus') || n.includes('cruciate') ||
    n.includes('calcaneus') || n.includes('talus') || n.includes('tarsal') ||
    n.includes('metatars') || n.includes('plantar') || n.includes('ankle') ||
    n.includes('foot') || n.includes('toe') || n.includes('achilles') ||
    n.includes('gastrocnem') || n.includes('soleus') || n.includes('tibialis') ||
    n.includes('peroneus') || n.includes('fibularis') || n.includes('calf') ||
    n.includes('leg') || n.includes('thigh') || n.includes('shin')
  ) return 'legs';

  // Default — group uncategorized meshes with abdomen (central body)
  return 'abdomen';
};

/* Medical specialty-linked organ data for the detail panel */
const ORGAN_DATA = {
  brain: {
    name: 'Brain', emoji: '🧠', specialty: 'Neurology & Neurosurgery',
    overview: 'Command center with 86 billion neurons, controlling thought, memory, emotion, and every bodily process.',
    metrics: [{ value: '86B', label: 'Neurons' }, { value: '100K', label: 'Miles Vessels' }, { value: '20%', label: 'Body Energy' }],
    doctors: [
      { name: 'Dr. Anika Sharma', spec: 'Neurologist, 15 yrs', rating: 4.9, initials: 'AS', bg: '#6366f1', status: 'online' },
      { name: 'Dr. James Morton', spec: 'Neurosurgeon, 22 yrs', rating: 4.8, initials: 'JM', bg: '#3b82f6', status: 'online' },
      { name: 'Dr. Priya Nair', spec: 'Neuropsychiatrist, 10 yrs', rating: 4.7, initials: 'PN', bg: '#8b5cf6', status: 'busy' },
    ],
    conditions: [{ name: 'Migraine', color: '#f87171' }, { name: 'Epilepsy', color: '#fbbf24' }, { name: 'Stroke', color: '#ef4444' }, { name: "Alzheimer's", color: '#a78bfa' }, { name: 'Concussion', color: '#fb923c' }, { name: 'Brain Fog', color: '#94a3b8' }],
  },
  eyes: {
    name: 'Eyes', emoji: '👁️', specialty: 'Ophthalmology',
    overview: 'Each eye has 2 million working parts, processes 36K bits of info per hour, and can distinguish 10 million colors.',
    metrics: [{ value: '2M', label: 'Parts' }, { value: '576', label: 'Megapixels' }, { value: '10M', label: 'Colors' }],
    doctors: [
      { name: 'Dr. Raj Patel', spec: 'Ophthalmologist, 18 yrs', rating: 4.9, initials: 'RP', bg: '#3b82f6', status: 'online' },
      { name: 'Dr. Elena Voss', spec: 'Retina Specialist, 14 yrs', rating: 4.8, initials: 'EV', bg: '#06b6d4', status: 'busy' },
      { name: 'Dr. Ken Nakamura', spec: 'LASIK Surgeon, 20 yrs', rating: 4.7, initials: 'KN', bg: '#6366f1', status: 'offline' },
    ],
    conditions: [{ name: 'Myopia', color: '#60a5fa' }, { name: 'Glaucoma', color: '#ef4444' }, { name: 'Cataracts', color: '#94a3b8' }, { name: 'Dry Eye', color: '#fbbf24' }, { name: 'Macular Degen.', color: '#a78bfa' }, { name: 'Conjunctivitis', color: '#f87171' }],
  },
  heart: {
    name: 'Heart', emoji: '❤️', specialty: 'Cardiology',
    overview: 'Beats 100,000 times daily, pumps 2,000 gallons of blood through 60,000 miles of vessels.',
    metrics: [{ value: '100K', label: 'Beats/Day' }, { value: '2K', label: 'Gallons/Day' }, { value: '60K', label: 'Miles' }],
    doctors: [
      { name: 'Dr. Sarah Chen', spec: 'Cardiologist, 20 yrs', rating: 4.9, initials: 'SC', bg: '#ef4444', status: 'online' },
      { name: 'Dr. Michael Ross', spec: 'Cardiac Surgeon, 25 yrs', rating: 4.9, initials: 'MR', bg: '#dc2626', status: 'online' },
      { name: 'Dr. Fatima Al-Rashid', spec: 'Electrophysiologist, 12 yrs', rating: 4.8, initials: 'FA', bg: '#f87171', status: 'busy' },
    ],
    conditions: [{ name: 'Heart Attack', color: '#ef4444' }, { name: 'Arrhythmia', color: '#f59e0b' }, { name: 'Heart Failure', color: '#dc2626' }, { name: 'Hypertension', color: '#f87171' }, { name: 'Valve Disease', color: '#a78bfa' }, { name: 'Coronary Artery', color: '#fb923c' }],
  },
  lungs: {
    name: 'Lungs', emoji: '🫁', specialty: 'Pulmonology',
    overview: '300 million alveoli, 70m² surface area. 20,000 breaths daily processing 2,100 gallons of air.',
    metrics: [{ value: '300M', label: 'Alveoli' }, { value: '20K', label: 'Breaths/Day' }, { value: '70m²', label: 'Surface' }],
    doctors: [
      { name: 'Dr. Robert Klein', spec: 'Pulmonologist, 19 yrs', rating: 4.8, initials: 'RK', bg: '#0ea5e9', status: 'online' },
      { name: 'Dr. Lisa Wang', spec: 'Thoracic Surgeon, 16 yrs', rating: 4.9, initials: 'LW', bg: '#06b6d4', status: 'online' },
      { name: 'Dr. Ahmed Hassan', spec: 'Sleep Medicine, 11 yrs', rating: 4.7, initials: 'AH', bg: '#38bdf8', status: 'offline' },
    ],
    conditions: [{ name: 'Asthma', color: '#38bdf8' }, { name: 'COPD', color: '#fb923c' }, { name: 'Pneumonia', color: '#ef4444' }, { name: 'Bronchitis', color: '#fbbf24' }, { name: 'Lung Cancer', color: '#dc2626' }, { name: 'Sleep Apnea', color: '#a78bfa' }],
  },
  breasts: {
    name: 'Breasts', emoji: '🎀', specialty: 'Gynecology & Oncology', gender: 'female',
    overview: 'Crucial glandular tissue for regular self-examination. Seeking specialized help early is critical for symptoms like pain or lumps.',
    metrics: [{ value: 'Annual', label: 'Screening' }, { value: 'High', label: 'Treatability' }, { value: '1 in 8', label: 'Risk Factor' }],
    doctors: [
      { name: 'Dr. Emily Chen', spec: 'Breast Specialist, 15 yrs', rating: 4.9, initials: 'EC', bg: '#ec4899', status: 'online' },
      { name: 'Dr. Sarah Jenkins', spec: 'Gynecologist, 12 yrs', rating: 4.8, initials: 'SJ', bg: '#db2777', status: 'online' },
      { name: 'Dr. Michael Torres', spec: 'Oncologist, 20 yrs', rating: 4.9, initials: 'MT', bg: '#be185d', status: 'busy' },
    ],
    conditions: [{ name: 'Breast Pain', color: '#ec4899' }, { name: 'Lump/Cyst', color: '#db2777' }, { name: 'Fibroadenoma', color: '#f472b6' }, { name: 'Mastitis', color: '#be185d' }],
  },
  chest_muscles: {
    name: 'Chest / Pectorals', emoji: '💪', specialty: 'General & Sports Medicine', gender: 'male',
    overview: 'The pectoral muscles support arm movement and deep breathing.',
    metrics: [{ value: 'Major', label: 'Muscles' }, { value: 'High', label: 'Mobility' }, { value: 'Crucial', label: 'Core Support' }],
    doctors: [
      { name: 'Dr. Marcus Johnson', spec: 'Sports Med, 16 yrs', rating: 4.9, initials: 'MJ', bg: '#dc2626', status: 'online' },
      { name: 'Dr. Anna Petrov', spec: 'Orthopedic, 19 yrs', rating: 4.8, initials: 'AP', bg: '#ef4444', status: 'online' }
    ],
    conditions: [{ name: 'Strained Pectoral', color: '#ef4444' }, { name: 'Costochondritis', color: '#f87171' }]
  },
  stomach: {
    name: 'Stomach & Digestive', emoji: '🔶', specialty: 'Gastroenterology',
    overview: 'Holds 1.5L, produces 2L acid daily. The gut lining renews every 3-4 days and has its own nervous system.',
    metrics: [{ value: '1.5L', label: 'Capacity' }, { value: '2L', label: 'Acid/Day' }, { value: '3-4d', label: 'Renewal' }],
    doctors: [
      { name: 'Dr. Olivia Peters', spec: 'GI Specialist, 17 yrs', rating: 4.8, initials: 'OP', bg: '#f97316', status: 'online' },
      { name: 'Dr. David Kim', spec: 'GI Surgeon, 21 yrs', rating: 4.9, initials: 'DK', bg: '#ea580c', status: 'busy' },
      { name: 'Dr. Maria Lopez', spec: 'Hepatologist, 13 yrs', rating: 4.7, initials: 'ML', bg: '#fb923c', status: 'online' },
    ],
    conditions: [{ name: 'GERD', color: '#fb923c' }, { name: 'Gastritis', color: '#f87171' }, { name: 'Ulcers', color: '#ef4444' }, { name: 'IBS', color: '#fbbf24' }, { name: "Crohn's", color: '#a78bfa' }, { name: 'Food Poisoning', color: '#4ade80' }],
  },
  liver: {
    name: 'Liver', emoji: '🟤', specialty: 'Hepatology',
    overview: '500+ vital functions, filters 1.4L blood per minute. Can regenerate after losing 75% of its mass.',
    metrics: [{ value: '500+', label: 'Functions' }, { value: '1.4L', label: 'Blood/Min' }, { value: '75%', label: 'Regen' }],
    doctors: [
      { name: 'Dr. Thomas Reed', spec: 'Hepatologist, 20 yrs', rating: 4.9, initials: 'TR', bg: '#92400e', status: 'online' },
      { name: 'Dr. Suki Tanaka', spec: 'Transplant Surgeon, 24 yrs', rating: 4.8, initials: 'ST', bg: '#78350f', status: 'online' },
      { name: 'Dr. Grace Obi', spec: 'GI Specialist, 11 yrs', rating: 4.7, initials: 'GO', bg: '#a3764f', status: 'offline' },
    ],
    conditions: [{ name: 'Hepatitis', color: '#ef4444' }, { name: 'Cirrhosis', color: '#a3764f' }, { name: 'Fatty Liver', color: '#fbbf24' }, { name: 'Liver Cancer', color: '#dc2626' }, { name: 'Jaundice', color: '#fde047' }, { name: 'Gallstones', color: '#94a3b8' }],
  },
  kidneys: {
    name: 'Kidneys', emoji: '🫘', specialty: 'Nephrology',
    overview: 'Filters 200L of blood daily. 1 million nephrons per kidney. Regulates BP, electrolytes, red blood cells.',
    metrics: [{ value: '200L', label: 'Blood/Day' }, { value: '1M', label: 'Nephrons' }, { value: '24/7', label: 'Filter' }],
    doctors: [
      { name: 'Dr. William Park', spec: 'Nephrologist, 18 yrs', rating: 4.9, initials: 'WP', bg: '#7c3aed', status: 'online' },
      { name: 'Dr. Nina Gupta', spec: 'Transplant, 15 yrs', rating: 4.8, initials: 'NG', bg: '#8b5cf6', status: 'busy' },
      { name: 'Dr. Carlos Rivera', spec: 'Urologist, 19 yrs', rating: 4.7, initials: 'CR', bg: '#6d28d9', status: 'online' },
    ],
    conditions: [{ name: 'Kidney Stones', color: '#fbbf24' }, { name: 'Chronic Kidney', color: '#ef4444' }, { name: 'UTI', color: '#f87171' }, { name: 'PKD', color: '#c084fc' }, { name: 'Nephritis', color: '#fb923c' }, { name: 'Renal Failure', color: '#dc2626' }],
  },
  spine: {
    name: 'Spine & Back', emoji: '🦴', specialty: 'Orthopedics',
    overview: '33 vertebrae, 31 nerve pairs, 120+ muscles. Protects the spinal cord and enables movement.',
    metrics: [{ value: '33', label: 'Vertebrae' }, { value: '120+', label: 'Muscles' }, { value: '31', label: 'Nerve Pairs' }],
    doctors: [
      { name: 'Dr. Andrew Blake', spec: 'Spine Surgeon, 22 yrs', rating: 4.9, initials: 'AB', bg: '#475569', status: 'online' },
      { name: 'Dr. Yuki Sato', spec: 'Orthopedic, 17 yrs', rating: 4.8, initials: 'YS', bg: '#64748b', status: 'online' },
      { name: 'Dr. Helen Brooks', spec: 'Physiotherapist, 12 yrs', rating: 4.7, initials: 'HB', bg: '#334155', status: 'busy' },
    ],
    conditions: [{ name: 'Herniated Disc', color: '#f87171' }, { name: 'Scoliosis', color: '#fb923c' }, { name: 'Spinal Stenosis', color: '#fbbf24' }, { name: 'Sciatica', color: '#ef4444' }, { name: 'Osteoporosis', color: '#94a3b8' }, { name: 'Back Pain', color: '#a78bfa' }],
  },
  shoulders: {
    name: 'Shoulders & Arms', emoji: '💪', specialty: 'Sports Medicine',
    overview: 'Most mobile joint — 4 joints, 30+ muscles, 360° rotation. Arms contain 64 bones and hundreds of muscles.',
    metrics: [{ value: '4', label: 'Joints' }, { value: '30+', label: 'Muscles' }, { value: '360°', label: 'Rotation' }],
    doctors: [
      { name: 'Dr. Marcus Johnson', spec: 'Sports Med, 16 yrs', rating: 4.9, initials: 'MJ', bg: '#dc2626', status: 'online' },
      { name: 'Dr. Anna Petrov', spec: 'Orthopedic, 19 yrs', rating: 4.8, initials: 'AP', bg: '#ef4444', status: 'online' },
      { name: 'Dr. Chris Lam', spec: 'Physiotherapist, 10 yrs', rating: 4.7, initials: 'CL', bg: '#b91c1c', status: 'busy' },
    ],
    conditions: [{ name: 'Rotator Cuff', color: '#ef4444' }, { name: 'Frozen Shoulder', color: '#60a5fa' }, { name: 'Tennis Elbow', color: '#fbbf24' }, { name: 'Carpal Tunnel', color: '#fb923c' }, { name: 'Fractures', color: '#94a3b8' }, { name: 'Tendinitis', color: '#a78bfa' }],
  },
  knees: {
    name: 'Legs & Knees', emoji: '🦵', specialty: 'Orthopedics',
    overview: 'Largest joint bearing 6× body weight. 4 major ligaments, 2 menisci. Legs contain the strongest muscles.',
    metrics: [{ value: '6x', label: 'Force' }, { value: '4', label: 'Ligaments' }, { value: '2', label: 'Menisci' }],
    doctors: [
      { name: "Dr. Patrick O'Brien", spec: 'Knee Specialist, 21 yrs', rating: 4.9, initials: 'PO', bg: '#0891b2', status: 'online' },
      { name: 'Dr. Mei Lin Zhou', spec: 'Sports Med, 14 yrs', rating: 4.8, initials: 'MZ', bg: '#06b6d4', status: 'online' },
      { name: 'Dr. Frank Miller', spec: 'Joint Replace, 23 yrs', rating: 4.7, initials: 'FM', bg: '#155e75', status: 'offline' },
    ],
    conditions: [{ name: 'ACL Tear', color: '#ef4444' }, { name: 'Arthritis', color: '#22d3ee' }, { name: 'Meniscus Tear', color: '#fbbf24' }, { name: "Runner's Knee", color: '#fb923c' }, { name: 'Plantar Fasciitis', color: '#8b5cf6' }, { name: 'Ankle Sprain', color: '#f87171' }],
  },
  female_pelvis: {
    name: 'Pelvis & Reproductive', emoji: '🩻', specialty: 'Gynecology & Urology', gender: 'female',
    overview: 'Contains the bladder and reproductive organs. Crucial for urological and reproductive health.',
    metrics: [{ value: '3', label: 'Fused Bones' }, { value: 'Annual', label: 'Screening' }, { value: 'Base', label: 'Spine' }],
    doctors: [
      { name: 'Dr. Maria Gonzalez', spec: 'Gynecologist, 22 yrs', rating: 4.9, initials: 'MG', bg: '#db2777', status: 'online' },
      { name: 'Dr. Sarah Jenkins', spec: 'OB/GYN, 12 yrs', rating: 4.8, initials: 'SJ', bg: '#ec4899', status: 'online' },
      { name: 'Dr. Keith Richards', spec: 'Urologist, 15 yrs', rating: 4.7, initials: 'KR', bg: '#7c3aed', status: 'busy' },
    ],
    conditions: [{ name: 'Pelvic Pain', color: '#db2777' }, { name: 'Endometriosis', color: '#ec4899' }, { name: 'UTI', color: '#4f46e5' }, { name: 'PCOS', color: '#f472b6' }],
  },
  male_pelvis: {
    name: 'Pelvis & Reproductive', emoji: '🩻', specialty: 'Urology', gender: 'male',
    overview: 'Contains the prostate, bladder, and reproductive organs. Crucial for urological health.',
    metrics: [{ value: '3', label: 'Fused Bones' }, { value: 'Annual', label: 'Prostate Check' }, { value: 'Base', label: 'Spine' }],
    doctors: [
      { name: 'Dr. Jason Wu', spec: 'Urologist, 18 yrs', rating: 4.8, initials: 'JW', bg: '#4f46e5', status: 'online' },
      { name: 'Dr. Brian Clark', spec: 'Andrologist, 14 yrs', rating: 4.7, initials: 'BC', bg: '#3b82f6', status: 'busy' }
    ],
    conditions: [{ name: 'Prostatitis', color: '#4f46e5' }, { name: 'BPH', color: '#3b82f6' }, { name: 'UTI', color: '#6366f1' }, { name: 'Kidney Stones', color: '#8b5cf6' }],
  },
  nose: {
    name: 'Nose & Sinuses', emoji: '👃', specialty: 'Otolaryngology (ENT)',
    overview: 'Filters, warms, and humidifies over 20,000 breaths of air daily. Crucial for smell and resonance.',
    metrics: [{ value: '20K', label: 'Breaths/Day' }, { value: '10K', label: 'Scents' }, { value: '4', label: 'Sinus Pairs' }],
    doctors: [
      { name: 'Dr. Alan Gupta', spec: 'ENT Specialist, 17 yrs', rating: 4.8, initials: 'AG', bg: '#0891b2', status: 'online' },
      { name: 'Dr. Rebecca Stone', spec: 'Rhinologist, 12 yrs', rating: 4.9, initials: 'RS', bg: '#06b6d4', status: 'online' }
    ],
    conditions: [{ name: 'Sinusitis', color: '#0891b2' }, { name: 'Deviated Septum', color: '#06b6d4' }, { name: 'Allergies', color: '#22d3ee' }]
  },
  mouth: {
    name: 'Mouth & Jaw', emoji: '👄', specialty: 'Dentistry & OMS',
    overview: 'The beginning of the digestive tract, essential for speech, chewing, and initial chemical digestion.',
    metrics: [{ value: '32', label: 'Teeth' }, { value: '10K', label: 'Taste Buds' }, { value: 'Strong', label: 'Jaw Muscle' }],
    doctors: [
      { name: 'Dr. Clara Miles', spec: 'Oral Surgeon, 15 yrs', rating: 4.9, initials: 'CM', bg: '#fbbf24', status: 'online' },
      { name: 'Dr. Henry Ford', spec: 'Dentist, 20 yrs', rating: 4.8, initials: 'HF', bg: '#f59e0b', status: 'busy' }
    ],
    conditions: [{ name: 'TMJ', color: '#f59e0b' }, { name: 'Cavities', color: '#fbbf24' }, { name: 'Gingivitis', color: '#fcd34d' }]
  },
  ears: {
    name: 'Ears & Hearing', emoji: '👂', specialty: 'Audiology & ENT',
    overview: 'Responsible for hearing and maintaining bodily balance. Contains the smallest bones in the human body.',
    metrics: [{ value: '3', label: 'Ossicles' }, { value: '20-20k Hz', label: 'Range' }, { value: 'Vital', label: 'Balance' }],
    doctors: [
      { name: 'Dr. Simon Lee', spec: 'Audiologist, 14 yrs', rating: 4.8, initials: 'SL', bg: '#8b5cf6', status: 'online' },
      { name: 'Dr. Alan Gupta', spec: 'ENT Specialist, 17 yrs', rating: 4.8, initials: 'AG', bg: '#7c3aed', status: 'offline' }
    ],
    conditions: [{ name: 'Tinnitus', color: '#8b5cf6' }, { name: 'Ear Infection', color: '#a78bfa' }, { name: 'Vertigo', color: '#7c3aed' }]
  },
  neck: {
    name: 'Neck & Thyroid', emoji: '🗣️', specialty: 'Endocrinology',
    overview: 'Supports the head and houses the thyroid gland, which controls metabolism, heart rate, and temperature.',
    metrics: [{ value: '7', label: 'Vertebrae' }, { value: 'Vital', label: 'Hormones' }, { value: 'Core', label: 'Metabolism' }],
    doctors: [
      { name: 'Dr. Julia Chen', spec: 'Endocrinologist, 19 yrs', rating: 4.9, initials: 'JC', bg: '#ec4899', status: 'online' }
    ],
    conditions: [{ name: 'Hypothyroidism', color: '#ec4899' }, { name: 'Neck Strain', color: '#f472b6' }]
  },
  intestines: {
    name: 'Intestines', emoji: '🌭', specialty: 'Gastroenterology',
    overview: 'Over 25 feet long, responsible for absorbing 90% of nutrients and housing the gut microbiome.',
    metrics: [{ value: '25ft', label: 'Length' }, { value: '90%', label: 'Absorption' }, { value: 'Trillions', label: 'Bacteria' }],
    doctors: [
      { name: 'Dr. Olivia Peters', spec: 'GI Specialist, 17 yrs', rating: 4.8, initials: 'OP', bg: '#f97316', status: 'online' }
    ],
    conditions: [{ name: 'IBS', color: '#fb923c' }, { name: "Crohn's", color: '#f97316' }, { name: 'Celiac', color: '#fdba74' }]
  },
  skin: {
    name: 'Skin', emoji: '✋', specialty: 'Dermatology',
    overview: 'The largest organ, protecting the body from microbes, regulating temperature, and permitting sensations.',
    metrics: [{ value: '20 sq.ft', label: 'Area' }, { value: '15%', label: 'Body Weight' }, { value: '3', label: 'Layers' }],
    doctors: [
      { name: 'Dr. Samira Khan', spec: 'Dermatologist, 12 yrs', rating: 4.9, initials: 'SK', bg: '#10b981', status: 'online' }
    ],
    conditions: [{ name: 'Eczema', color: '#10b981' }, { name: 'Melanoma', color: '#059669' }, { name: 'Psoriasis', color: '#34d399' }]
  },
  vascular: {
    name: 'Vascular System', emoji: '🩸', specialty: 'Vascular Surgery',
    overview: 'A 60,000-mile network of arteries, veins, and capillaries transporting blood, oxygen, and nutrients.',
    metrics: [{ value: '60K Miles', label: 'Length' }, { value: 'Vital', label: 'Transport' }, { value: '5L', label: 'Blood Vol' }],
    doctors: [
      { name: 'Dr. Michael Ross', spec: 'Vascular Surgeon, 25 yrs', rating: 4.9, initials: 'MR', bg: '#ef4444', status: 'online' }
    ],
    conditions: [{ name: 'DVT', color: '#ef4444' }, { name: 'Varicose Veins', color: '#dc2626' }]
  },
  nerves: {
    name: 'Nervous System', emoji: '⚡', specialty: 'Neurology',
    overview: 'The body\'s electrical wiring, transmitting signals between the brain and the rest of the body at up to 268 mph.',
    metrics: [{ value: '268 mph', label: 'Signal Speed' }, { value: '43 Pairs', label: 'Major Nerves' }],
    doctors: [
      { name: 'Dr. Anika Sharma', spec: 'Neurologist, 15 yrs', rating: 4.9, initials: 'AS', bg: '#6366f1', status: 'online' }
    ],
    conditions: [{ name: 'Neuropathy', color: '#6366f1' }, { name: 'Sciatica', color: '#4f46e5' }, { name: 'Pinched Nerve', color: '#818cf8' }]
  }
};

/* Regions for navigation */
const REGIONS = {
  head: { name: 'Head & Brain', emoji: '🧠', organs: ['brain', 'eyes', 'ears', 'nose', 'mouth', 'neck'], color: '#a78bfa' },
  chest: { name: 'Chest & Thorax', emoji: '🫁', organs: ['heart', 'lungs', 'breasts', 'chest_muscles', 'vascular'], color: '#f87171' },
  abdomen: { name: 'Abdomen & Core', emoji: '🔶', organs: ['stomach', 'intestines', 'liver', 'spine'], color: '#fb923c' },
  pelvis: { name: 'Pelvis Area', emoji: '🩻', organs: ['female_pelvis', 'male_pelvis', 'kidneys'], color: '#c084fc' },
  arms: { name: 'Arms & Hands', emoji: '💪', organs: ['shoulders', 'skin'], color: '#fbbf24' },
  legs: { name: 'Legs & Feet', emoji: '🦵', organs: ['knees', 'nerves'], color: '#22d3ee' },
};

/* Camera presets for each region and the body overview */
const CAM = {
  body: { pos: [0, 0.9, 4.5], look: [0, 0.9, 0] },
  head: { pos: [0, 1.8, 0.8], look: [0, 1.7, 0] },
  chest: { pos: [0, 1.3, 1.0], look: [0, 1.2, 0] },
  abdomen: { pos: [0.3, 0.9, 1.0], look: [0, 0.9, 0] },
  pelvis: { pos: [0, 0.4, 0.9], look: [0, 0.4, 0] },
  arms: { pos: [0.8, 1.2, 1.2], look: [0.3, 1.1, 0] },
  legs: { pos: [0.3, 0.3, 1.5], look: [0, 0.4, 0] },
};


/* ═══════════════════════════════════════════════════
   SECTION 2 — CUSTOM DRACO-ENABLED GLTF LOADER
   ═══════════════════════════════════════════════════ */

/* drei's useGLTF uses DRACOLoader from CDN. We override to use our local decoder. */
function useDracoGLTF(url) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(DRACO_PATH);
    dracoLoader.setDecoderConfig({ type: 'js' });
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      url,
      (gltf) => {
        setResult(gltf);
        dracoLoader.dispose();
      },
      undefined,
      (err) => {
        console.error('GLB load error:', err);
        setError(err);
        dracoLoader.dispose();
      }
    );

    return () => { dracoLoader.dispose(); };
  }, [url]);

  return { gltf: result, error };
}

/* ═══════════════════════════════════════════════════
   SECTION 3 — 3D SCENE COMPONENTS
   ═══════════════════════════════════════════════════ */

/* Camera controller — smooth transitions */
const CameraRig = ({ targetPos, targetLook, autoRotate, resetTrigger }) => {
  const { camera } = useThree();
  const controlsRef = useRef();
  const posTarget = useRef(new THREE.Vector3(...targetPos));
  const lookTarget = useRef(new THREE.Vector3(...targetLook));
  const isAnimating = useRef(false);

  useEffect(() => {
    posTarget.current.set(...targetPos);
    lookTarget.current.set(...targetLook);
    isAnimating.current = true;
  }, [targetPos, targetLook, resetTrigger]);

  useFrame(() => {
    if (isAnimating.current) {
      camera.position.lerp(posTarget.current, 0.05);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(lookTarget.current, 0.05);
        controlsRef.current.update();
      }

      const distPos = camera.position.distanceTo(posTarget.current);
      const distTarget = controlsRef.current ? controlsRef.current.target.distanceTo(lookTarget.current) : 0;

      if (distPos < 0.05 && distTarget < 0.05) {
        isAnimating.current = false;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableDamping
      dampingFactor={0.06}
      minDistance={0.3}
      maxDistance={5}
      autoRotate={autoRotate && !isAnimating.current}
      autoRotateSpeed={0.4}
      maxPolarAngle={Math.PI * 0.88}
      minPolarAngle={Math.PI * 0.12}
      onStart={() => { isAnimating.current = false; }}
    />
  );
};

/* Loading indicator inside Canvas */
const LoadingFallback = () => (
  <Html center>
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
      padding: '30px 50px', borderRadius: '20px',
      background: 'rgba(5,8,16,0.9)', border: '1px solid rgba(56,189,248,0.15)',
      backdropFilter: 'blur(20px)',
    }}>
      <div style={{
        width: '40px', height: '40px', border: '3px solid rgba(56,189,248,0.1)',
        borderTopColor: '#38bdf8', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>
        Loading Anatomy Model...
      </div>
      <div style={{ color: '#334155', fontSize: '0.65rem' }}>7.8 MB · Z-Anatomy Dataset</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  </Html>
);

/* The actual anatomical model */
const AnatomyModel = React.memo(({ viewLevel, selectedRegion, selectedOrgan, hoveredMesh, setHoveredMesh, setHoverPos, onMeshClick }) => {
  const { gltf, error } = useDracoGLTF(MODEL_URL);
  const modelRef = useRef();
  const meshMapRef = useRef(new Map()); // meshName → { mesh, region, originalMaterial }

  // Process the model once it loads
  useEffect(() => {
    if (!gltf) return;
    const map = new Map();

    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        const region = classifyMesh(child.name);
        // Store original material
        const origMat = child.material.clone();
        child.material = child.material.clone(); // Make unique
        child.material.transparent = true;
        child.material.depthWrite = true;
        child.userData.region = region;
        child.userData.origColor = new THREE.Color().copy(child.material.color || new THREE.Color(0.6, 0.6, 0.6));
        child.userData.origEmissive = child.material.emissive ? new THREE.Color().copy(child.material.emissive) : new THREE.Color(0, 0, 0);
        map.set(child.name, { mesh: child, region, origMat });
      }
    });

    meshMapRef.current = map;
  }, [gltf]);

  // Animate mesh visibility based on view state
  useFrame(() => {
    if (!gltf) return;

    meshMapRef.current.forEach(({ mesh, region }) => {
      if (!mesh.material) return;

      let targetOpacity = 1;
      let targetEmissive = 0;

      if (viewLevel === 'region' && selectedRegion) {
        // Only show selected region
        if (region === selectedRegion) {
          targetOpacity = 1;
        } else {
          targetOpacity = 0;
        }
      } else if (viewLevel === 'organ') {
        if (region === selectedRegion) {
          targetOpacity = 1;
        } else {
          targetOpacity = 0;
        }
      }

      // Hover highlight
      if (hoveredMesh === mesh.name) {
        targetEmissive = 0.25;
      }

      // Smooth lerp opacity
      const currentOp = mesh.material.opacity;
      mesh.material.opacity = THREE.MathUtils.lerp(currentOp, targetOpacity, 0.08);
      mesh.visible = mesh.material.opacity > 0.01;

      // Emissive highlight
      if (mesh.material.emissive) {
        const hc = new THREE.Color(0.15, 0.55, 0.85); // cyan highlight
        mesh.material.emissive.lerp(
          targetEmissive > 0 ? hc : mesh.userData.origEmissive,
          0.12
        );
        mesh.material.emissiveIntensity = THREE.MathUtils.lerp(
          mesh.material.emissiveIntensity || 0,
          targetEmissive,
          0.12
        );
      }
    });
  });

  if (error) return (
    <Html center>
      <div style={{ color: '#f87171', fontSize: '0.85rem', padding: '20px', background: 'rgba(5,8,16,0.9)', borderRadius: '12px', border: '1px solid rgba(248,113,113,0.2)' }}>
        Failed to load anatomy model. Check console.
      </div>
    </Html>
  );

  if (!gltf) return <LoadingFallback />;

  return (
    <primitive
      ref={modelRef}
      object={gltf.scene}
      scale={1}
      position={[0, 0, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (e.object?.isMesh) {
          setHoveredMesh(e.object.name);
          if (setHoverPos) setHoverPos([e.point.x, e.point.y, e.point.z]);
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerMove={(e) => {
        e.stopPropagation();
        if (e.object?.isMesh && e.point) {
          if (setHoverPos) setHoverPos([e.point.x, e.point.y, e.point.z]);
        }
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHoveredMesh(null);
        if (setHoverPos) setHoverPos(null);
        document.body.style.cursor = 'grab';
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (e.object?.isMesh) {
          onMeshClick(e.object.name, e.object.userData.region);
        }
      }}
    />
  );
});
AnatomyModel.displayName = 'AnatomyModel';

/* Main 3D scene assembly */
const BodyScene = ({ viewLevel, selectedRegion, selectedOrgan, hoveredMesh, setHoveredMesh, hoverPos, setHoverPos, onMeshClick, gender, resetTrigger }) => {
  const camPreset = viewLevel === 'body' ? CAM.body
    : viewLevel === 'organ' && selectedRegion ? CAM[selectedRegion]
      : selectedRegion ? CAM[selectedRegion]
        : CAM.body;

  return (
    <>
      {/* Lighting — warm, medical-grade */}
      <ambientLight intensity={0.5} color="#f0f4ff" />
      <directionalLight position={[4, 6, 5]} intensity={0.9} color="#ffffff" castShadow />
      <directionalLight position={[-3, 4, -3]} intensity={0.3} color="#818cf8" />
      <pointLight position={[0, 2, 2]} intensity={0.4} color="#e0f2fe" distance={5} />
      <pointLight position={[0, 0, -2]} intensity={0.2} color="#c4b5fd" distance={4} />

      <CameraRig
        targetPos={camPreset.pos}
        targetLook={camPreset.look}
        autoRotate={viewLevel === 'body'}
        resetTrigger={resetTrigger}
      />

      <Suspense fallback={<LoadingFallback />}>
        <AnatomyModel
          viewLevel={viewLevel}
          selectedRegion={selectedRegion}
          selectedOrgan={selectedOrgan}
          hoveredMesh={hoveredMesh}
          setHoveredMesh={setHoveredMesh}
          setHoverPos={setHoverPos}
          onMeshClick={onMeshClick}
        />
        {hoveredMesh && hoverPos && (
          <Html position={hoverPos} center zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
            <AnimatePresence>
              <MeshTooltip meshName={hoveredMesh} gender={gender} />
            </AnimatePresence>
          </Html>
        )}
      </Suspense>

      {/* Floor */}
      <gridHelper args={[4, 20, '#111827', '#111827']} position={[0, 0, 0]} />
      <ContactShadows position={[0, 0.005, 0]} opacity={0.2} scale={4} blur={2} far={2} color="#38bdf8" />

      {/* Post-processing — subtle bloom for realism */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.6} luminanceSmoothing={0.9} intensity={0.3} />
      </EffectComposer>

      <Environment preset="studio" />
    </>
  );
};

/* ═══════════════════════════════════════════════════
   SECTION 4 — DETAIL PANEL (2D)
   ═══════════════════════════════════════════════════ */
const DetailPanel = React.memo(({ organId, onClose, onNavigate }) => {
  const data = ORGAN_DATA[organId];
  if (!data) return null;

  const handleAction = (type, name) => {
    const docParam = encodeURIComponent(name);
    if (type === 'call') onNavigate(`/voice-call/demo?doctor=${docParam}`);
    if (type === 'video') onNavigate(`/video-call/demo?doctor=${docParam}`);
    if (type === 'chat') onNavigate(`/chat/demo?doctor=${docParam}`);
  };

  const [aiInsight, setAiInsight] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoadingAi(true);
    // Use the backend's key if possible, else fallback
    const backendKey = organId.replace(/s$/, ''); // try to singularize, backend expects 'brain', 'heart'
    getBodyInsights(organId)
      .then(res => {
        if (mounted && res && res.success) setAiInsight(res);
      })
      .catch((e) => {
        // Handle 404s gracefully without breaking UI
        if (mounted) setAiInsight(null);
      })
      .finally(() => { if (mounted) setLoadingAi(false); });
    return () => { mounted = false; };
  }, [organId]);

  return (
    <motion.div className="bi-panel" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }} transition={{ type: 'spring', stiffness: 220, damping: 26 }} key={organId}>
      <div className="bi-panel-header">
        <div className="bi-panel-icon">{data.emoji}</div>
        <div style={{ flex: 1 }}>
          <div className="bi-panel-title">{data.name}</div>
          <div className="bi-panel-specialty">{data.specialty}</div>
          <p className="bi-panel-overview">{data.overview}</p>
        </div>
        <button className="bi-close-btn" onClick={onClose}>✕</button>
      </div>

      {loadingAi ? (
        <div style={{ padding: '12px', fontSize: '13px', color: '#a5b4fc', textAlign: 'center', background: 'rgba(99,102,241,0.05)', borderRadius: '12px', marginBottom: '16px' }}>
          🔄 Analyzing your health data...
        </div>
      ) : aiInsight ? (
        <div style={{ padding: '16px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🧠 AI Assessment
            </span>
            <span style={{ fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px', background: aiInsight.riskLevel === 'Low' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', color: aiInsight.riskLevel === 'Low' ? '#4ade80' : '#fbbf24' }}>
              Risk: {aiInsight.riskLevel}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5 }}>
            {aiInsight.generalAdvice}
          </div>
          {aiInsight.recentMetrics && aiInsight.recentMetrics.length > 0 && (
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#94a3b8' }}>
              Based on recent tests: {aiInsight.recentMetrics.map(m => m.type).join(', ')}
            </div>
          )}
        </div>
      ) : null}

      <div className="bi-metrics-grid">
        {data.metrics.map((m, i) => (
          <motion.div key={i} className="bi-metric-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.05 }}>
            <div className="bi-metric-value">{m.value}</div>
            <div className="bi-metric-label">{m.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="bi-quick-actions">
        <button className="bi-quick-btn primary" onClick={() => onNavigate('/appointments')}>📅 Book Appointment</button>
        <button className="bi-quick-btn secondary" onClick={() => alert('🩺 Report coming soon!')}>📋 Report</button>
      </div>

      <div className="bi-section-title">Top Specialists</div>
      <div className="bi-doctors-list">
        {data.doctors.map((doc, i) => (
          <motion.div key={i} className="bi-doctor-card" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 + i * 0.07 }}>
            <div className="bi-doctor-avatar" style={{ background: doc.bg }}>{doc.initials}<div className={`bi-doctor-status ${doc.status}`} /></div>
            <div className="bi-doctor-info">
              <div className="bi-doctor-name">{doc.name}</div>
              <div className="bi-doctor-spec">{doc.spec}</div>
              <div className="bi-doctor-rating">
                {[...Array(5)].map((_, s) => <span key={s} className="bi-star" style={{ opacity: s < Math.floor(doc.rating) ? 1 : 0.3 }}>★</span>)}
                <span className="bi-rating-num">{doc.rating}</span>
              </div>
            </div>
            <div className="bi-doctor-actions">
              <button className="bi-action-btn call" onClick={(e) => { e.stopPropagation(); handleAction('call', doc.name); }}>📞</button>
              <button className="bi-action-btn video" onClick={(e) => { e.stopPropagation(); handleAction('video', doc.name); }}>📹</button>
              <button className="bi-action-btn chat" onClick={(e) => { e.stopPropagation(); handleAction('chat', doc.name); }}>💬</button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bi-section-title">Common Conditions</div>
      <div className="bi-conditions-grid">
        {data.conditions.map((c, i) => (
          <motion.div key={i} className="bi-condition-chip" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 + i * 0.03 }}>
            <div className="bi-condition-dot" style={{ background: c.color }} />{c.name}
          </motion.div>
        ))}
      </div>

    </motion.div>
  );
});
DetailPanel.displayName = 'DetailPanel';

/* ═══════════════════════════════════════════════════
   SECTION 5 — TOOLTIP for hovered mesh
   ═══════════════════════════════════════════════════ */
const MeshTooltip = ({ meshName, gender }) => {
  if (!meshName) return null;

  const matchedOrgan = matchMeshToOrganGlobally(meshName, gender);
  const organData = matchedOrgan ? ORGAN_DATA[matchedOrgan] : null;

  // Clean up mesh name for display as fallback
  const fallbackName = meshName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\s(L|R)$/, (m) => ` (${m.trim() === 'L' ? 'Left' : 'Right'})`);

  // Prioritize the friendly organ name (e.g. "Neck & Thyroid") over the raw mesh name (e.g. "Platysma")
  const displayName = organData ? organData.name : fallbackName;

  return (
    <motion.div
      className="bi-mesh-tooltip"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span className="bi-tooltip-dot" />
        <span>{displayName}</span>
      </div>
      {organData && (
        <div style={{ paddingLeft: '12px', fontSize: '0.65rem', color: '#94a3b8', borderLeft: '2px solid rgba(56,189,248,0.3)', marginLeft: '3px' }}>
          Consult: <span style={{ color: '#38bdf8' }}>{organData.specialty}</span>
          <br />
          <em>Click to view specialists</em>
        </div>
      )}
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════
   SECTION 6 — MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════ */
const BodyInsights = () => {
  const navigate = useNavigate();
  const [viewLevel, setViewLevel] = useState('body');
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedOrgan, setSelectedOrgan] = useState(null);
  const [hoveredMesh, setHoveredMesh] = useState(null);
  const [hoverPos, setHoverPos] = useState(null);
  const [gender, setGender] = useState('female');
  const [resetTrigger, setResetTrigger] = useState(0);

  const handleRegionClick = useCallback((regionId) => {
    setViewLevel('region');
    setSelectedRegion(regionId);
    setSelectedOrgan(null);
  }, []);

  const handleOrganClick = useCallback((organId) => {
    setViewLevel('organ');
    setSelectedOrgan(organId);
  }, []);

  const handleMeshClick = useCallback((meshName, meshRegion) => {
    const matchedOrgan = matchMeshToOrganGlobally(meshName, gender);

    // Direct drill-down: If we click anywhere and it maps to a specific body part/specialty,
    // open that detail panel immediately regardless of current viewLevel.
    if (matchedOrgan) {
      setViewLevel('organ');

      // Determine the region of this organ for back-navigation semantics
      let foundRegion = meshRegion;
      for (const [rId, rData] of Object.entries(REGIONS)) {
        if (rData.organs.includes(matchedOrgan)) foundRegion = rId;
      }
      setSelectedRegion(foundRegion);
      setSelectedOrgan(matchedOrgan);
    } else {
      // If it doesn't match a specific organ tightly, fallback to the broader region
      setViewLevel('region');
      setSelectedRegion(meshRegion);
      setSelectedOrgan(null);
    }
  }, [gender]);

  const goToBody = useCallback(() => {
    setViewLevel('body');
    setSelectedRegion(null);
    setSelectedOrgan(null);
    setHoveredMesh(null);
    setResetTrigger(prev => prev + 1);
  }, []);

  const goToRegion = useCallback(() => {
    setViewLevel('region');
    setSelectedOrgan(null);
  }, []);

  return (
    <div className="bi-page">
      {/* Header */}
      <header className="bi-header">
        <div className="bi-header-left">
          <button className="bi-back-btn" onClick={() => viewLevel === 'body' ? navigate('/portal') : viewLevel === 'region' ? goToBody() : goToRegion()}>
            ←
          </button>
          <div className="bi-title-group">
            <h1>Body Insights</h1>
            <p>Real 3D anatomy · Z-Anatomy dataset · Click to explore</p>
          </div>
        </div>

        {/* Breadcrumb & Gender Split */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="bi-breadcrumb">
            <button className={`bi-crumb ${viewLevel === 'body' ? 'active' : ''}`} onClick={goToBody}>
              🏠 Full Body
            </button>
            {selectedRegion && REGIONS[selectedRegion] && (
              <>
                <span className="bi-crumb-sep">›</span>
                <button className={`bi-crumb ${viewLevel === 'region' ? 'active' : ''}`} onClick={goToRegion}>
                  {REGIONS[selectedRegion].emoji} {REGIONS[selectedRegion].name}
                </button>
              </>
            )}
            {selectedOrgan && ORGAN_DATA[selectedOrgan] && (
              <>
                <span className="bi-crumb-sep">›</span>
                <button className="bi-crumb active">
                  {ORGAN_DATA[selectedOrgan].emoji} {ORGAN_DATA[selectedOrgan].name}
                </button>
              </>
            )}
          </div>

          <div className="bi-gender-toggle">
            <button className={`bi-gender-btn ${gender === 'female' ? 'active' : ''}`} onClick={() => { setGender('female'); goToBody(); }}>
              ♀ Female
            </button>
            <button className={`bi-gender-btn ${gender === 'male' ? 'active' : ''}`} onClick={() => { setGender('male'); goToBody(); }}>
              ♂ Male
            </button>
          </div>
        </div>

        {/* Region quick-nav */}
        {viewLevel === 'body' && (
          <div className="bi-region-chips">
            {Object.entries(REGIONS).map(([id, r]) => (
              <button key={id} className="bi-region-chip" onClick={() => handleRegionClick(id)} style={{ '--chip-color': r.color }}>
                {r.emoji} {r.name}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main */}
      <main className="bi-main">
        {/* 3D Canvas */}
        <div className="bi-canvas-section">
          <Canvas camera={{ position: CAM.body.pos, fov: 45 }} gl={{ antialias: true, alpha: true }} dpr={[1, 2]}>
            <BodyScene
              viewLevel={viewLevel}
              selectedRegion={selectedRegion}
              selectedOrgan={selectedOrgan}
              hoveredMesh={hoveredMesh}
              setHoveredMesh={setHoveredMesh}
              hoverPos={hoverPos}
              setHoverPos={setHoverPos}
              onMeshClick={handleMeshClick}
              gender={gender}
            />
          </Canvas>

          {/* Instructions */}
          {/* We show the reset button regardless of viewLevel so users can rely on it if they get lost by zooming/panning, but hide core instructions on deep zoom to keep it clean */}
          <div className="bi-instructions" style={viewLevel !== 'body' ? { background: 'transparent', border: 'none', backdropFilter: 'none' } : {}}>
            {viewLevel === 'body' && (
              <>
                <div className="bi-instr-item"><span className="bi-instr-key">Drag</span> Rotate</div>
                <div className="bi-instr-item"><span className="bi-instr-key">Scroll</span> Zoom</div>
                <div className="bi-instr-item"><span className="bi-instr-key">Click</span> Explore region</div>
                <div className="bi-instr-item"><span className="bi-instr-key">Pinch</span> Mobile zoom</div>
              </>
            )}
            <button
              className="bi-reset-btn"
              onClick={(e) => { e.stopPropagation(); goToBody(); }}
              style={{
                cursor: 'pointer',
                background: 'rgba(5,8,16,0.6)',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(56,189,248,0.3)',
                color: '#38bdf8',
                fontWeight: 600,
                fontSize: '0.65rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                lineHeight: '1.2',
                marginLeft: viewLevel === 'body' ? '8px' : '0',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(56,189,248,0.1)'
              }}
              onPointerOver={(e) => e.currentTarget.style.background = 'rgba(56,189,248,0.1)'}
              onPointerOut={(e) => e.currentTarget.style.background = 'rgba(5,8,16,0.6)'}
            >
              <span style={{ fontSize: '0.8rem', marginTop: '2px' }}>↺</span>
            </button>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="bi-detail-section">
          <AnimatePresence mode="wait">
            {selectedOrgan && ORGAN_DATA[selectedOrgan] ? (
              <DetailPanel key={selectedOrgan} organId={selectedOrgan} onClose={goToRegion} onNavigate={navigate} />
            ) : viewLevel === 'region' && selectedRegion && REGIONS[selectedRegion] ? (
              <motion.div key="region-organs" className="bi-panel" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>
                <div className="bi-panel-header" style={{ marginBottom: '1.5rem' }}>
                  <div className="bi-panel-icon">{REGIONS[selectedRegion].emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div className="bi-panel-title">{REGIONS[selectedRegion].name}</div>
                    <div className="bi-panel-specialty">Select a specialty to explore</div>
                  </div>
                </div>
                <div className="bi-section-title">Specialties in this Region</div>
                <div className="bi-organ-cards">
                  {REGIONS[selectedRegion].organs.map((organId) => {
                    const o = ORGAN_DATA[organId];
                    if (!o || (o.gender && o.gender !== gender)) return null;
                    return (
                      <motion.button
                        key={organId}
                        className="bi-organ-card"
                        onClick={() => handleOrganClick(organId)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <span className="bi-organ-emoji">{o.emoji}</span>
                        <div>
                          <div className="bi-organ-name">{o.name}</div>
                          <div className="bi-organ-spec">{o.specialty}</div>
                          <div className="bi-organ-doc-count">{o.doctors.length} specialists available</div>
                        </div>
                        <span className="bi-organ-arrow">→</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" className="bi-empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="bi-empty-icon">🫀</div>
                <h2 className="bi-empty-title">Explore the Body</h2>
                <p className="bi-empty-desc">
                  Rotate the real 3D anatomy model. Click any body part, or use the region buttons above to zoom in and explore organs.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

/* Helper: match a clicked mesh name directly to an organ specialty globally */
function matchMeshToOrganGlobally(meshName, gender = 'female') {
  const n = meshName.toLowerCase();

  // Specific tight groupings first
  if (n.includes('breast') || n.includes('mammary') || n.includes('pectoral')) return gender === 'female' ? 'breasts' : 'chest_muscles';
  if (n.includes('brain') || n.includes('cerebr') || n.includes('skull') || n.includes('cranium')) return 'brain';
  if (n.includes('eye') || n.includes('orbit') || n.includes('ocul') || n.includes('pupil') || n.includes('lens')) return 'eyes';
  if (n.includes('ear') || n.includes('auditory') || n.includes('cochlea') || n.includes('tympan') || n.includes('auricl') || n.includes('pinna') || n.includes('meatus') || n.includes('concha') || n.includes('lobulo') || n.includes('acoustic')) return 'ears';
  if (n.includes('nose') || n.includes('nasal') || n.includes('olfact') || n.includes('septum') || n.includes('rhin')) return 'nose';
  if (n.includes('mouth') || n.includes('tooth') || n.includes('teeth') || n.includes('tongue') || n.includes('jaw') || n.includes('mandible') || n.includes('maxilla') || n.includes('palate') || n.includes('lip') || n.includes('gingiv') || n.includes('oral') || n.includes('oris') || n.includes('labi') || n.includes('bucc') || n.includes('mentalis') || n.includes('zygomaticus')) return 'mouth';
  if (n.includes('neck') || n.includes('thyroid') || n.includes('larynx') || n.includes('pharynx') || n.includes('cervic') || n.includes('hyoid') || n.includes('vocal') || n.includes('epiglottis') || n.includes('platysma') || n.includes('sternocleidomastoid')) return 'neck';

  if (n.includes('heart') || n.includes('cardiac') || n.includes('aort') || n.includes('ventricl') || n.includes('atrium') || n.includes('myocard')) return 'heart';
  if (n.includes('vein') || n.includes('arter') || n.includes('vena') || n.includes('capill') || n.includes('vessel') || n.includes('jugular') || n.includes('carotid')) return 'vascular';

  if (n.includes('lung') || n.includes('pulmon') || n.includes('bronch') || n.includes('diaphragm') || n.includes('pleur')) return 'lungs';

  if (n.includes('intestin') || n.includes('bowel') || n.includes('colon') || n.includes('rectu') || n.includes('duoden') || n.includes('jejun') || n.includes('ileum') || n.includes('cecum')) return 'intestines';
  if (n.includes('stomach') || n.includes('gastric') || n.includes('esophag')) return 'stomach';
  if (n.includes('liver') || n.includes('hepat') || n.includes('gall')) return 'liver';
  if (n.includes('kidney') || n.includes('renal') || n.includes('adrenal') || n.includes('ureter')) return 'kidneys';
  if (n.includes('pelvi') || n.includes('bladder') || n.includes('uterus') || n.includes('ovary') || n.includes('prostate') || n.includes('testes') || n.includes('reproductive') || n.includes('iliac')) return gender === 'female' ? 'female_pelvis' : 'male_pelvis';

  if (n.includes('skin') || n.includes('derma') || n.includes('epiderm') || n.includes('fascia')) return 'skin';
  if (n.includes('nerv') || n.includes('ganglion') || n.includes('plexus')) return 'nerves';

  // Musculoskeletal broader groupings
  if (n.includes('vertebr') || n.includes('spine') || n.includes('spinal') || n.includes('erector') || n.includes('lumbar') || n.includes('sacr')) return 'spine';
  if (n.includes('shoulder') || n.includes('deltoid') || n.includes('bicep') || n.includes('tricep') || n.includes('brachi') || n.includes('humer') || n.includes('radius') || n.includes('ulna') || n.includes('hand') || n.includes('carp') || n.includes('finger')) return 'shoulders';
  if (n.includes('femur') || n.includes('tibia') || n.includes('patella') || n.includes('knee') || n.includes('quadri') || n.includes('hamstring') || n.includes('calcaneus') || n.includes('ankle') || n.includes('foot') || n.includes('toe') || n.includes('gastroc') || n.includes('soleus')) return 'knees';

  // Fallbacks if only loosely clicked in an area
  if (n.includes('thorax') || n.includes('rib') || n.includes('sternum') || n.includes('chest')) return 'lungs';
  if (n.includes('abdom')) return 'stomach';
  if (n.includes('head') || n.includes('face')) return 'brain';
  if (n.includes('arm')) return 'shoulders';
  if (n.includes('leg') || n.includes('thigh') || n.includes('calf')) return 'knees';

  return null;
}

export default BodyInsights;
 
 
 
 
 
 
 
 
 
 
 
 
 
