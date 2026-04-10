import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  checkSymptoms, getHealthRisk, analyzeNutrition,
  analyzeMood, getHealthInsights, getAIStatus
} from '../services/aiService';

const RISK_COLORS = {
  low: '#22c55e', moderate: '#f59e0b', high: '#f97316', critical: '#ef4444'
};

const RISK_BG = {
  low: 'rgba(34,197,94,0.08)', moderate: 'rgba(245,158,11,0.08)',
  high: 'rgba(249,115,22,0.08)', critical: 'rgba(239,68,68,0.08)'
};

export default function AIHub() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [status, setStatus] = useState(null);

  // Diagnosis state
  const [diagBodyPart, setDiagBodyPart] = useState('');
  const [diagSymptoms, setDiagSymptoms] = useState('');
  const [diagSeverity, setDiagSeverity] = useState(5);
  const [diagDuration, setDiagDuration] = useState('few_days');
  const [diagResult, setDiagResult] = useState(null);
  const [diagLoading, setDiagLoading] = useState(false);

  // Symptom checker state
  const [symptomText, setSymptomText] = useState('');
  const [symptomResult, setSymptomResult] = useState(null);
  const [symptomLoading, setSymptomLoading] = useState(false);

  // Risk state
  const [riskData, setRiskData] = useState(null);
  const [riskLoading, setRiskLoading] = useState(false);

  // Nutrition state
  const [nutritionText, setNutritionText] = useState('');
  const [nutritionResult, setNutritionResult] = useState(null);
  const [nutritionLoading, setNutritionLoading] = useState(false);

  // Mood state
  const [moodText, setMoodText] = useState('');
  const [moodResult, setMoodResult] = useState(null);
  const [moodLoading, setMoodLoading] = useState(false);

  // Insights state
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    getAIStatus().then(setStatus).catch(() => { });
  }, []);

  // Load risk + insights on overview
  const loadOverview = useCallback(async () => {
    try {
      setRiskLoading(true);
      setInsightsLoading(true);
      const [r, i] = await Promise.allSettled([getHealthRisk(), getHealthInsights()]);
      if (r.status === 'fulfilled') setRiskData(r.value);
      if (i.status === 'fulfilled') setInsights(i.value);
    } catch (e) { console.error(e); }
    finally { setRiskLoading(false); setInsightsLoading(false); }
  }, []);

  useEffect(() => {
    if (activeTab === 'overview') loadOverview();
  }, [activeTab, loadOverview]);

  const handleSymptomCheck = async () => {
    if (!symptomText.trim()) return;
    setSymptomLoading(true);
    try {
      const result = await checkSymptoms(symptomText);
      setSymptomResult(result);
    } catch (e) { console.error(e); }
    finally { setSymptomLoading(false); }
  };

  const handleNutrition = async () => {
    if (!nutritionText.trim()) return;
    setNutritionLoading(true);
    try {
      const result = await analyzeNutrition(nutritionText);
      setNutritionResult(result);
    } catch (e) { console.error(e); }
    finally { setNutritionLoading(false); }
  };

  const handleMood = async () => {
    if (!moodText.trim()) return;
    setMoodLoading(true);
    try {
      const result = await analyzeMood(moodText);
      setMoodResult(result);
    } catch (e) { console.error(e); }
    finally { setMoodLoading(false); }
  };

  const handleDiagnosis = async () => {
    if (!diagBodyPart || !diagSymptoms.trim()) return;
    setDiagLoading(true);
    // Simulated AI diagnosis result
    await new Promise(r => setTimeout(r, 2000));
    setDiagResult({
      bodyPart: diagBodyPart,
      possibleConditions: [
        { name: 'Tension Headache', probability: 78, severity: 'Mild', description: 'Commonly caused by stress, poor posture, or dehydration. Usually resolves with rest and OTC pain relief.', icon: '🤕' },
        { name: 'Migraine', probability: 45, severity: 'Moderate', description: 'Characterized by intense, throbbing pain often on one side. May include nausea and light sensitivity.', icon: '⚡' },
        { name: 'Sinusitis', probability: 32, severity: 'Mild', description: 'Inflammation of the sinus cavities causing pressure and pain around the forehead and cheeks.', icon: '🤧' },
      ],
      recommendations: [
        '💊 Consider OTC pain relief (Acetaminophen or Ibuprofen)',
        '💧 Increase water intake to at least 2.5L per day',
        '😴 Ensure 7-8 hours of quality sleep',
        '🧘 Practice stress-reduction techniques',
        '📋 Keep a symptom diary for your doctor visit',
      ],
      urgency: 'routine',
      suggestedSpecialist: 'General Practitioner',
      disclaimer: 'This AI diagnosis is preliminary and for informational purposes only. Always consult a healthcare professional for accurate diagnosis and treatment.',
    });
    setDiagLoading(false);
  };

  const tabs = [
    { id: 'overview', label: '🏠 Overview', icon: '📊' },
    { id: 'diagnosis', label: '🏥 AI Diagnosis', icon: '🔬' },
    { id: 'symptoms', label: '🔍 Symptom Checker', icon: '🩺' },
    { id: 'nutrition', label: '🥗 Nutrition AI', icon: '🍎' },
    { id: 'mood', label: '🧠 Mood Analysis', icon: '💭' },
  ];

  return (
    <div style={styles.container}>
      {/* Background gradient */}
      <div style={styles.bgGlow} />

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button 
            onClick={() => navigate('/portal')} 
            style={{ 
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#94a3b8', transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            <ArrowLeft size={20} />
          </button>
          <div style={styles.headerIcon}>🧠</div>
          <div>
            <h1 style={styles.title}>AI Health Center</h1>
            <p style={styles.subtitle}>
              Powered by AI
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={styles.tabBar}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : {})
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* ═══ OVERVIEW TAB ═══ */}
        {activeTab === 'overview' && (
          <div style={styles.overviewGrid}>
            {/* Risk Dashboard */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardIcon}>🛡️</span>
                <h3 style={styles.cardTitle}>Health Risk Assessment</h3>
              </div>
              {riskLoading ? (
                <div style={styles.loadingPulse}>Analyzing your health data...</div>
              ) : riskData?.categories ? (
                <div>
                  {/* Overall Score */}
                  <div style={styles.overallRisk}>
                    <div style={{
                      ...styles.riskGauge,
                      background: `conic-gradient(${RISK_COLORS[riskData.overall?.level || 'low']} ${(riskData.overall?.score || 0) * 3.6}deg, rgba(255,255,255,0.05) 0deg)`
                    }}>
                      <div style={styles.riskGaugeInner}>
                        <span style={{ fontSize: 28, fontWeight: 700, color: RISK_COLORS[riskData.overall?.level || 'low'] }}>
                          {riskData.overall?.score || 0}
                        </span>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>/ 100</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>Overall Risk</div>
                      <div style={{ fontSize: 12, color: RISK_COLORS[riskData.overall?.level || 'low'], fontWeight: 600, textTransform: 'capitalize' }}>
                        {riskData.overall?.level || 'low'}
                      </div>
                    </div>
                  </div>
                  {/* Category Bars */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                    {Object.entries(riskData.categories).map(([key, risk]) => (
                      <div key={key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: '#cbd5e1' }}>{risk.icon} {risk.label}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: RISK_COLORS[risk.level] }}>{risk.score}%</span>
                        </div>
                        <div style={styles.barTrack}>
                          <div style={{ ...styles.barFill, width: `${risk.score}%`, background: RISK_COLORS[risk.level] }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={styles.emptyState}>
                  <span style={{ fontSize: 36 }}>📋</span>
                  <p>Complete your health profile to unlock AI risk assessment</p>
                </div>
              )}
            </div>

            {/* AI Insights */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardIcon}>✨</span>
                <h3 style={styles.cardTitle}>AI Health Insights</h3>
              </div>
              {insightsLoading ? (
                <div style={styles.loadingPulse}>Generating personalized insights...</div>
              ) : insights?.insights?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {insights.insights.map((insight, i) => (
                    <div key={i} style={styles.insightCard}>
                      <div style={{ fontSize: 22 }}>{insight.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 3 }}>{insight.title}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}
                          dangerouslySetInnerHTML={{ __html: insight.description.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#a5b4fc">$1</strong>') }}
                        />
                        {insight.recommendation && (
                          <div style={{ fontSize: 11, color: '#6366f1', marginTop: 4, fontStyle: 'italic' }}>
                            💡 {insight.recommendation}
                          </div>
                        )}
                      </div>
                      {insight.confidence && (
                        <div style={{ fontSize: 10, color: '#64748b', textAlign: 'right', minWidth: 40 }}>
                          {insight.confidence}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.emptyState}>
                  <span style={{ fontSize: 36 }}>📊</span>
                  <p>Track health metrics for a few days to unlock AI insights</p>
                </div>
              )}
            </div>

            {/* Quick Feature Cards */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardIcon}>⚡</span>
                <h3 style={styles.cardTitle}>AI Features</h3>
              </div>
              <div style={styles.featureGrid}>
                {[
                  { icon: '🩺', label: 'Symptom Check', tab: 'symptoms', desc: 'AI symptom analysis' },
                  { icon: '🍎', label: 'Nutrition AI', tab: 'nutrition', desc: 'Analyze your meals' },
                  { icon: '💭', label: 'Mood Analysis', tab: 'mood', desc: 'Sentiment tracking' },
                  { icon: '💬', label: 'AI Chat', tab: null, desc: 'Click chat bubble →' },
                ].map((f, i) => (
                  <button
                    key={i}
                    onClick={() => f.tab && setActiveTab(f.tab)}
                    style={styles.featureCard}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                  >
                    <span style={{ fontSize: 28 }}>{f.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{f.label}</span>
                    <span style={{ fontSize: 11, color: '#64748b' }}>{f.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div style={styles.disclaimer}>
              ⚠️ AI-generated health insights are for informational purposes only and do not constitute medical advice. Always consult a qualified healthcare professional for diagnosis and treatment.
            </div>
          </div>
        )}

        {/* ═══ SYMPTOM CHECKER TAB ═══ */}
        {activeTab === 'symptoms' && (
          <div style={styles.singleCol}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardIcon}>🩺</span>
                <h3 style={styles.cardTitle}>AI Symptom Checker</h3>
              </div>
              <p style={styles.cardDesc}>
                Describe your symptoms in natural language. Our AI will analyze them using medical NER (Named Entity Recognition) and provide preliminary guidance.
              </p>
              <textarea
                style={styles.textarea}
                value={symptomText}
                onChange={e => setSymptomText(e.target.value)}
                placeholder="e.g., I've had a headache and fever for 3 days, with some nausea and body aches..."
                rows={4}
              />
              <button
                style={{ ...styles.primaryBtn, opacity: symptomLoading || !symptomText.trim() ? 0.5 : 1 }}
                onClick={handleSymptomCheck}
                disabled={symptomLoading || !symptomText.trim()}
              >
                {symptomLoading ? '🔄 Analyzing...' : '🔍 Analyze Symptoms'}
              </button>

              {symptomResult && (
                <div style={styles.resultSection}>
                  {/* Urgency Banner */}
                  <div style={{
                    ...styles.urgencyBanner,
                    background: `${RISK_BG[symptomResult.urgency?.level] || RISK_BG.low}`,
                    borderColor: RISK_COLORS[symptomResult.urgency?.level] || RISK_COLORS.low
                  }}>
                    <span style={{ fontSize: 24 }}>{symptomResult.urgency?.emoji || '🟢'}</span>
                    <div>
                      <div style={{ fontWeight: 600, color: RISK_COLORS[symptomResult.urgency?.level] || '#22c55e', fontSize: 14 }}>
                        {symptomResult.urgency?.label || 'Low Urgency'}
                      </div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{symptomResult.urgency?.action}</div>
                    </div>
                  </div>

                  {/* Extracted Entities */}
                  {symptomResult.extractedEntities?.symptoms?.length > 0 && (
                    <div style={styles.resultBlock}>
                      <h4 style={styles.resultLabel}>📋 Detected Symptoms</h4>
                      <div style={styles.chipRow}>
                        {symptomResult.extractedEntities.symptoms.map((s, i) => (
                          <span key={i} style={styles.chipSymptom}>{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Specialty */}
                  <div style={styles.resultBlock}>
                    <h4 style={styles.resultLabel}>🏥 Recommended Specialist</h4>
                    <div style={styles.specialtyBadge}>{symptomResult.recommendedSpecialty || 'General Practice'}</div>
                  </div>

                  {/* Possible Conditions */}
                  {symptomResult.possibleConditions?.length > 0 && (
                    <div style={styles.resultBlock}>
                      <h4 style={styles.resultLabel}>🔬 Possible Conditions</h4>
                      {symptomResult.possibleConditions.map((cond, i) => (
                        <div key={i} style={styles.conditionCard}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{cond.condition}</span>
                            <span style={{
                              fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 8,
                              background: cond.confidence > 60 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                              color: cond.confidence > 60 ? '#f87171' : '#fbbf24'
                            }}>
                              {cond.confidence}% match
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{cond.description}</div>
                          <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                            {cond.matchedSymptoms?.map((s, j) => (
                              <span key={j} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(99,102,241,0.1)', color: '#a5b4fc' }}>
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={styles.disclaimer}>
                    ⚠️ {symptomResult.disclaimer}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ NUTRITION TAB ═══ */}
        {activeTab === 'nutrition' && (
          <div style={styles.singleCol}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardIcon}>🍎</span>
                <h3 style={styles.cardTitle}>AI Nutrition Analyzer</h3>
              </div>
              <p style={styles.cardDesc}>
                Describe what you ate in plain language. AI will extract foods, estimate macros, and give nutrition advice.
              </p>
              <textarea
                style={styles.textarea}
                value={nutritionText}
                onChange={e => setNutritionText(e.target.value)}
                placeholder="e.g., I had 2 scrambled eggs with toast and a glass of orange juice for breakfast..."
                rows={3}
              />
              <button
                style={{ ...styles.primaryBtn, opacity: nutritionLoading || !nutritionText.trim() ? 0.5 : 1 }}
                onClick={handleNutrition}
                disabled={nutritionLoading || !nutritionText.trim()}
              >
                {nutritionLoading ? '🔄 Analyzing...' : '🍽️ Analyze Nutrition'}
              </button>

              {nutritionResult && (
                <div style={styles.resultSection}>
                  {/* Detected Foods */}
                  {nutritionResult.foods?.length > 0 && (
                    <div style={styles.resultBlock}>
                      <h4 style={styles.resultLabel}>🍽️ Detected Foods</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {nutritionResult.foods.map((food, i) => (
                          <div key={i} style={styles.foodItem}>
                            <div style={{ flex: 1 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', textTransform: 'capitalize' }}>
                                {food.quantity > 1 ? `${food.quantity}x ` : ''}{food.name}
                              </span>
                              <span style={{ fontSize: 11, color: '#64748b', marginLeft: 6 }}>({food.serving})</span>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#f59e0b' }}>{food.nutrition.calories} cal</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Macro Summary */}
                  {nutritionResult.totalNutrition && (
                    <div style={styles.resultBlock}>
                      <h4 style={styles.resultLabel}>📊 Macro Breakdown</h4>
                      <div style={styles.macroGrid}>
                        {[
                          { label: 'Calories', value: nutritionResult.totalNutrition.calories, unit: 'kcal', color: '#f59e0b' },
                          { label: 'Protein', value: nutritionResult.totalNutrition.protein, unit: 'g', color: '#3b82f6' },
                          { label: 'Carbs', value: nutritionResult.totalNutrition.carbs, unit: 'g', color: '#22c55e' },
                          { label: 'Fat', value: nutritionResult.totalNutrition.fat, unit: 'g', color: '#ef4444' },
                        ].map((m, i) => (
                          <div key={i} style={{ ...styles.macroCard, borderColor: m.color + '30' }}>
                            <div style={{ fontSize: 22, fontWeight: 700, color: m.color }}>{m.value}</div>
                            <div style={{ fontSize: 10, color: '#94a3b8' }}>{m.unit}</div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: '#cbd5e1', marginTop: 2 }}>{m.label}</div>
                          </div>
                        ))}
                      </div>
                      {nutritionResult.percentOfDailyTarget && (
                        <div style={{ marginTop: 12, fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
                          This meal is <strong style={{ color: '#a5b4fc' }}>{nutritionResult.percentOfDailyTarget.calories}%</strong> of your daily calorie target
                        </div>
                      )}
                    </div>
                  )}

                  {/* Suggestions */}
                  {nutritionResult.suggestions?.length > 0 && (
                    <div style={styles.resultBlock}>
                      <h4 style={styles.resultLabel}>💡 AI Suggestions</h4>
                      {nutritionResult.suggestions.map((s, i) => (
                        <div key={i} style={styles.suggestionItem}>
                          <span style={{ color: '#6366f1' }}>•</span> {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ MOOD TAB ═══ */}
        {activeTab === 'mood' && (
          <div style={styles.singleCol}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardIcon}>💭</span>
                <h3 style={styles.cardTitle}>AI Mood Analyzer</h3>
              </div>
              <p style={styles.cardDesc}>
                Write about how you're feeling today. AI will analyze your sentiment, detect emotional patterns, and provide supportive guidance.
              </p>
              <textarea
                style={styles.textarea}
                value={moodText}
                onChange={e => setMoodText(e.target.value)}
                placeholder="e.g., Today was a mixed day. I felt productive in the morning but got stressed about deadlines in the afternoon..."
                rows={5}
              />
              <button
                style={{ ...styles.primaryBtn, opacity: moodLoading || !moodText.trim() ? 0.5 : 1 }}
                onClick={handleMood}
                disabled={moodLoading || !moodText.trim()}
              >
                {moodLoading ? '🔄 Analyzing...' : '🧠 Analyze Mood'}
              </button>

              {moodResult && (
                <div style={styles.resultSection}>
                  {/* Sentiment Result */}
                  <div style={{
                    ...styles.urgencyBanner,
                    background: moodResult.sentiment?.dominant === 'positive' ? 'rgba(34,197,94,0.08)' :
                      moodResult.sentiment?.dominant === 'negative' ? 'rgba(239,68,68,0.08)' : 'rgba(99,102,241,0.08)',
                    borderColor: moodResult.sentiment?.dominant === 'positive' ? '#22c55e' :
                      moodResult.sentiment?.dominant === 'negative' ? '#ef4444' : '#6366f1'
                  }}>
                    <span style={{ fontSize: 36 }}>
                      {moodResult.sentiment?.dominant === 'positive' ? '😊' :
                        moodResult.sentiment?.dominant === 'negative' ? '😔' : '😐'}
                    </span>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#e2e8f0' }}>{moodResult.sentiment?.mood}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>
                        Confidence: {moodResult.sentiment?.confidence}% • Trend: {moodResult.moodTrend}
                      </div>
                    </div>
                  </div>

                  {/* Support Message */}
                  {moodResult.supportMessage && (
                    <div style={styles.supportCard}>
                      <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>{moodResult.supportMessage}</div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {moodResult.suggestions?.length > 0 && (
                    <div style={styles.resultBlock}>
                      <h4 style={styles.resultLabel}>💡 Recommendations</h4>
                      {moodResult.suggestions.map((s, i) => (
                        <div key={i} style={styles.suggestionItem}>
                          <span style={{ color: '#6366f1' }}>•</span> {s}
                        </div>
                      ))}
                    </div>
                  )}

                  {moodResult.recentMoodAverage !== null && (
                    <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>
                      Your 2-week mood average: <strong style={{ color: '#a5b4fc' }}>{moodResult.recentMoodAverage}/10</strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ AI DIAGNOSIS TAB ═══ */}
        {activeTab === 'diagnosis' && (
          <div style={styles.singleCol}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardIcon}>🏥</span>
                <h3 style={styles.cardTitle}>AI Preliminary Diagnosis</h3>
              </div>
              <p style={styles.cardDesc}>
                Select the affected body area, describe your symptoms, rate severity, and let AI provide a preliminary assessment.
              </p>

              {/* Body Part Selector */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#a5b4fc', marginBottom: 8 }}>Body Area</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { id: 'head', label: '🧠 Head', emoji: '🧠' },
                    { id: 'chest', label: '🫁 Chest', emoji: '🫁' },
                    { id: 'abdomen', label: '🫃 Abdomen', emoji: '🫃' },
                    { id: 'back', label: '🦴 Back', emoji: '🦴' },
                    { id: 'limbs', label: '💪 Limbs', emoji: '💪' },
                    { id: 'skin', label: '🖐️ Skin', emoji: '🖐️' },
                    { id: 'throat', label: '🗣️ Throat', emoji: '🗣️' },
                    { id: 'eyes', label: '👁️ Eyes', emoji: '👁️' },
                  ].map(bp => (
                    <button key={bp.id} onClick={() => setDiagBodyPart(bp.id)}
                      style={{
                        padding: '8px 14px', borderRadius: 10, border: '1px solid',
                        borderColor: diagBodyPart === bp.id ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)',
                        background: diagBodyPart === bp.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.02)',
                        color: diagBodyPart === bp.id ? '#c7d2fe' : '#94a3b8',
                        fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {bp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptoms */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#a5b4fc', marginBottom: 8 }}>Describe Symptoms</label>
                <textarea style={styles.textarea} value={diagSymptoms} onChange={e => setDiagSymptoms(e.target.value)}
                  placeholder="Describe what you're experiencing in detail..." rows={3}
                />
              </div>

              {/* Severity Slider */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#a5b4fc', marginBottom: 8 }}>
                  Severity: <span style={{ color: diagSeverity <= 3 ? '#22c55e' : diagSeverity <= 6 ? '#f59e0b' : '#ef4444' }}>{diagSeverity}/10</span>
                </label>
                <input type="range" min="1" max="10" value={diagSeverity} onChange={e => setDiagSeverity(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#6366f1' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b', marginTop: 4 }}>
                  <span>Mild</span><span>Moderate</span><span>Severe</span>
                </div>
              </div>

              {/* Duration */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#a5b4fc', marginBottom: 8 }}>Duration</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { id: 'today', label: 'Today' },
                    { id: 'few_days', label: 'Few Days' },
                    { id: 'week', label: '~1 Week' },
                    { id: 'weeks', label: '2+ Weeks' },
                    { id: 'month', label: '1+ Month' },
                  ].map(d => (
                    <button key={d.id} onClick={() => setDiagDuration(d.id)}
                      style={{
                        padding: '6px 14px', borderRadius: 8, border: '1px solid',
                        borderColor: diagDuration === d.id ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)',
                        background: diagDuration === d.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.02)',
                        color: diagDuration === d.id ? '#c7d2fe' : '#94a3b8',
                        fontSize: 12, cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s',
                      }}
                    >{d.label}</button>
                  ))}
                </div>
              </div>

              <button style={{ ...styles.primaryBtn, opacity: diagLoading || !diagBodyPart || !diagSymptoms.trim() ? 0.5 : 1 }}
                onClick={handleDiagnosis} disabled={diagLoading || !diagBodyPart || !diagSymptoms.trim()}
              >
                {diagLoading ? '🔄 Analyzing...' : '🏥 Get AI Diagnosis'}
              </button>

              {/* Results */}
              {diagResult && (
                <div style={styles.resultSection}>
                  {/* Urgency */}
                  <div style={{
                    ...styles.urgencyBanner,
                    background: 'rgba(34,197,94,0.08)', borderColor: '#22c55e',
                  }}>
                    <span style={{ fontSize: 24 }}>✅</span>
                    <div>
                      <div style={{ fontWeight: 600, color: '#22c55e', fontSize: 14 }}>Routine - Non-Emergency</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>Schedule a regular appointment with your doctor</div>
                    </div>
                  </div>

                  {/* Specialist */}
                  <div style={styles.resultBlock}>
                    <h4 style={styles.resultLabel}>👨‍⚕️ Suggested Specialist</h4>
                    <div style={styles.specialtyBadge}>{diagResult.suggestedSpecialist}</div>
                  </div>

                  {/* Conditions */}
                  <div style={styles.resultBlock}>
                    <h4 style={styles.resultLabel}>🔬 Possible Conditions</h4>
                    {diagResult.possibleConditions.map((cond, i) => (
                      <div key={i} style={styles.conditionCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{cond.icon} {cond.name}</span>
                          <span style={{
                            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 8,
                            background: cond.probability > 60 ? 'rgba(99,102,241,0.15)' : 'rgba(245,158,11,0.1)',
                            color: cond.probability > 60 ? '#a5b4fc' : '#fbbf24',
                          }}>
                            {cond.probability}% probability
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6, lineHeight: 1.5 }}>{cond.description}</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Severity: <span style={{ color: cond.severity === 'Mild' ? '#22c55e' : cond.severity === 'Moderate' ? '#f59e0b' : '#ef4444' }}>{cond.severity}</span></div>
                      </div>
                    ))}
                  </div>

                  {/* Recommendations */}
                  <div style={styles.resultBlock}>
                    <h4 style={styles.resultLabel}>💡 Recommendations</h4>
                    {diagResult.recommendations.map((rec, i) => (
                      <div key={i} style={styles.suggestionItem}>{rec}</div>
                    ))}
                  </div>

                  {/* Book Appointment CTA */}
                  <button onClick={() => window.location.hash = '#/appointments'}
                    style={{
                      width: '100%', padding: '14px', borderRadius: 12, border: '1px solid rgba(99,102,241,0.3)',
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.08))',
                      color: '#c7d2fe', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                      fontFamily: "'Inter', sans-serif", transition: 'all 0.2s',
                    }}
                  >
                    📅 Book Appointment with {diagResult.suggestedSpecialist}
                  </button>

                  <div style={styles.disclaimer}>⚠️ {diagResult.disclaimer}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const styles = {
  container: {
    minHeight: '100vh',
    background: '#0a0a1a',
    padding: '24px',
    position: 'relative',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  bgGlow: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'radial-gradient(ellipse at 20% 0%, rgba(99,102,241,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(168,85,247,0.06) 0%, transparent 50%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 24, position: 'relative', zIndex: 1,
    maxWidth: 1100, margin: '0 auto 24px',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 16 },
  headerIcon: {
    width: 52, height: 52, borderRadius: 16,
    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.1))',
    border: '1px solid rgba(99,102,241,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
  },
  title: { margin: 0, fontSize: 24, fontWeight: 700, color: '#e2e8f0', letterSpacing: '-0.02em' },
  subtitle: { margin: '4px 0 0', fontSize: 13, color: '#64748b' },
  statusBadge: {
    padding: '6px 14px', borderRadius: 20,
    background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
    color: '#22c55e', fontSize: 12, fontWeight: 500,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  tabBar: {
    display: 'flex', gap: 4, marginBottom: 24,
    maxWidth: 1100, margin: '0 auto 24px',
    overflowX: 'auto', position: 'relative', zIndex: 1,
    padding: '4px', borderRadius: 14,
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
  },
  tab: {
    padding: '10px 18px', borderRadius: 10, border: 'none',
    background: 'transparent', color: '#94a3b8', fontSize: 13, fontWeight: 500,
    cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
    fontFamily: "'Inter', sans-serif",
  },
  tabActive: {
    background: 'rgba(99,102,241,0.12)', color: '#c7d2fe',
    boxShadow: '0 2px 8px rgba(99,102,241,0.15)',
  },
  content: { maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 },
  overviewGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 },
  singleCol: { maxWidth: 700, margin: '0 auto' },
  card: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16, padding: 24,
    backdropFilter: 'blur(12px)',
  },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 },
  cardIcon: { fontSize: 22 },
  cardTitle: { margin: 0, fontSize: 16, fontWeight: 600, color: '#e2e8f0' },
  cardDesc: { fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 16, marginTop: 0 },
  textarea: {
    width: '100%', padding: '12px 16px', borderRadius: 12,
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#e2e8f0', fontSize: 13.5, fontFamily: "'Inter', sans-serif",
    resize: 'vertical', outline: 'none', lineHeight: 1.5,
    marginBottom: 12, boxSizing: 'border-box',
  },
  primaryBtn: {
    width: '100%', padding: '12px 24px', borderRadius: 12, border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Inter', sans-serif", transition: 'all 0.2s',
  },
  loadingPulse: {
    textAlign: 'center', padding: 32, color: '#6366f1', fontSize: 13,
    animation: 'pulse 1.5s infinite',
  },
  emptyState: {
    textAlign: 'center', padding: 32, color: '#64748b', fontSize: 13,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
  },
  overallRisk: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 },
  riskGauge: {
    width: 80, height: 80, borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  riskGaugeInner: {
    width: 60, height: 60, borderRadius: '50%', background: '#0a0a1a',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  },
  barTrack: {
    height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.04)', overflow: 'hidden',
  },
  barFill: {
    height: '100%', borderRadius: 3, transition: 'width 0.8s ease',
  },
  insightCard: {
    display: 'flex', gap: 12, padding: 12, borderRadius: 10,
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
  },
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 },
  featureCard: {
    padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.02)', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    transition: 'all 0.2s', textAlign: 'center',
  },
  resultSection: { marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 },
  urgencyBanner: {
    display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
    borderRadius: 12, border: '1px solid',
  },
  resultBlock: { display: 'flex', flexDirection: 'column', gap: 8 },
  resultLabel: { margin: 0, fontSize: 13, fontWeight: 600, color: '#a5b4fc' },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  chipSymptom: {
    padding: '4px 10px', borderRadius: 8, fontSize: 12,
    background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)',
    color: '#c7d2fe',
  },
  specialtyBadge: {
    display: 'inline-flex', padding: '8px 16px', borderRadius: 10,
    background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.08))',
    border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc',
    fontSize: 14, fontWeight: 600,
  },
  conditionCard: {
    padding: 12, borderRadius: 10,
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
  },
  macroGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },
  macroCard: {
    padding: 12, borderRadius: 10, textAlign: 'center',
    background: 'rgba(255,255,255,0.02)', border: '1px solid',
  },
  foodItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 12px', borderRadius: 8,
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
  },
  supportCard: {
    padding: 16, borderRadius: 12,
    background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)',
  },
  suggestionItem: {
    fontSize: 12, color: '#cbd5e1', padding: '4px 0',
    display: 'flex', gap: 6, lineHeight: 1.5,
  },
  disclaimer: {
    fontSize: 11, color: '#64748b', padding: '12px 16px', borderRadius: 10,
    background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)',
    lineHeight: 1.5, gridColumn: '1 / -1',
  },
};
 
 
