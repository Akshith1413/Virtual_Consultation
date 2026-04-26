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

// â”€â”€â”€ 1. AI Chat â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ 2. Symptom Checker â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function checkSymptoms(symptoms) {
  const { data } = await axios.post(`${AI_BASE}/symptom-check`, { symptoms });
  return data;
}

// â”€â”€â”€ 3. Health Risk â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getHealthRisk() {
  const cacheKey = 'health-risk';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const { data } = await axios.get(`${AI_BASE}/health-risk`);
  setCache(cacheKey, data);
  return data;
}

// â”€â”€â”€ 4. Supplement Interactions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function checkSupplementInteractions(supplement1, supplement2) {
  const body = supplement1 && supplement2 ? { supplement1, supplement2 } : {};
  const { data } = await axios.post(`${AI_BASE}/supplement-interactions`, body);
  return data;
}

// â”€â”€â”€ 5. Nutrition Analyzer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function analyzeNutrition(text) {
  const { data } = await axios.post(`${AI_BASE}/analyze-nutrition`, { text });
  return data;
}

// â”€â”€â”€ 6. Mood Analysis â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function analyzeMood(text) {
  const { data } = await axios.post(`${AI_BASE}/mood-analysis`, { text });
  return data;
}

// â”€â”€â”€ 7. Health Insights â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getHealthInsights() {
  const cacheKey = 'health-insights';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const { data } = await axios.get(`${AI_BASE}/health-insights`);
  setCache(cacheKey, data);
  return data;
}

// â”€â”€â”€ 8. Appointment Pre-screening â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function prescreenAppointment(concern) {
  const { data } = await axios.post(`${AI_BASE}/appointment-prescreen`, { concern });
  return data;
}

// â”€â”€â”€ 9. Body Insights â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ 10. Group Recommendations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getGroupRecommendations() {
  const cacheKey = 'group-recs';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const { data } = await axios.get(`${AI_BASE}/group-recommendations`);
  setCache(cacheKey, data);
  return data;
}

// â”€â”€â”€ AI Status â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getAIStatus() {
  const { data } = await axios.get(`${AI_BASE}/status`);
  return data;
}

// â”€â”€â”€ Utility â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function clearAICache() {
  cache.clear();
}
