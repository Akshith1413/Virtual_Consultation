/**
 * AI Service — Frontend API wrapper for all AI endpoints
 */
import axios from 'axios';

const AI_BASE = '/ai';

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key) {
  const item = cache.get(key);
  if (item && Date.now() - item.time < CACHE_TTL) return item.data;
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, time: Date.now() });
}

// ─── 1. AI Chat ──────────────────────────────────────────────────
export async function sendChatMessage(message, sessionId = null) {
  const { data } = await axios.post(`${AI_BASE}/chat`, { message, sessionId });
  return data;
}

export async function getChatHistory(sessionId = null) {
  const params = sessionId ? { sessionId } : {};
  const { data } = await axios.get(`${AI_BASE}/chat/history`, { params });
  return data;
}

export async function clearChatHistory() {
  const { data } = await axios.delete(`${AI_BASE}/chat/history`);
  return data;
}

// ─── 2. Symptom Checker ──────────────────────────────────────────
export async function checkSymptoms(symptoms) {
  const { data } = await axios.post(`${AI_BASE}/symptom-check`, { symptoms });
  return data;
}

// ─── 3. Health Risk ──────────────────────────────────────────────
export async function getHealthRisk() {
  const cacheKey = 'health-risk';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const { data } = await axios.get(`${AI_BASE}/health-risk`);
  setCache(cacheKey, data);
  return data;
}

// ─── 4. Supplement Interactions ──────────────────────────────────
export async function checkSupplementInteractions(supplement1, supplement2) {
  const body = supplement1 && supplement2 ? { supplement1, supplement2 } : {};
  const { data } = await axios.post(`${AI_BASE}/supplement-interactions`, body);
  return data;
}

// ─── 5. Nutrition Analyzer ───────────────────────────────────────
export async function analyzeNutrition(text) {
  const { data } = await axios.post(`${AI_BASE}/analyze-nutrition`, { text });
  return data;
}

// ─── 6. Mood Analysis ────────────────────────────────────────────
export async function analyzeMood(text) {
  const { data } = await axios.post(`${AI_BASE}/mood-analysis`, { text });
  return data;
}

// ─── 7. Health Insights ──────────────────────────────────────────
export async function getHealthInsights() {
  const cacheKey = 'health-insights';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const { data } = await axios.get(`${AI_BASE}/health-insights`);
  setCache(cacheKey, data);
  return data;
}

// ─── 8. Appointment Pre-screening ────────────────────────────────
export async function prescreenAppointment(concern) {
  const { data } = await axios.post(`${AI_BASE}/appointment-prescreen`, { concern });
  return data;
}

// ─── 9. Body Insights ────────────────────────────────────────────
export async function getBodyInsights(organ) {
  const cacheKey = `body-${organ}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const { data } = await axios.get(`${AI_BASE}/body-insights/${organ}`);
  setCache(cacheKey, data);
  return data;
}

export async function getAllBodyInsights() {
  const cacheKey = 'body-all';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const { data } = await axios.get(`${AI_BASE}/body-insights`);
  setCache(cacheKey, data);
  return data;
}

// ─── 10. Group Recommendations ───────────────────────────────────
export async function getGroupRecommendations() {
  const cacheKey = 'group-recs';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const { data } = await axios.get(`${AI_BASE}/group-recommendations`);
  setCache(cacheKey, data);
  return data;
}

// ─── AI Status ───────────────────────────────────────────────────
export async function getAIStatus() {
  const { data } = await axios.get(`${AI_BASE}/status`);
  return data;
}

// ─── Utility ─────────────────────────────────────────────────────
export function clearAICache() {
  cache.clear();
}
 
 
 
 

// minor tweak for clarity
