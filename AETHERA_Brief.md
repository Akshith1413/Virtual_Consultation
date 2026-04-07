# AETHERA — Project Brief
### Virtual Health Consultation Platform

---

## What Is AETHERA?

AETHERA is an all-in-one digital health platform that combines AI-powered health assistance, 3D body exploration, doctor appointment scheduling, nutrition tracking, supplement management, and virtual doctor communication — all in one place. It is built to make personal healthcare smarter, simpler, and more accessible.

---

## Key Pages & Features

| Page | What It Does |
|---|---|
| **3D Landing Page** | Cinematic scroll-driven 3D homepage — camera moves through floating "islands" showcasing features |
| **Welcome Portal** | Post-login home screen with personalised greeting and 4 navigation cards, animated 3D background |
| **Dashboard** | Daily health overview — metrics tracking (sleep, mood, energy, weight, water), AI risk scores, reminders |
| **AI Hub** | Symptom checker, health risk assessment, nutrition analyser, mood tracker, AI health chat |
| **Body Insights** | Interactive 3D human body model — click any region to get health info and specialist recommendations |
| **Appointments** | Full doctor appointment scheduling with status tracking, reminders, and insurance details |
| **Chat / Video / Voice** | Secure doctor consultation via chat room, video call, or voice call — all within the platform |
| **Nutrition Tracker** | Food logging, recipe creation, meal planning, calorie/macro charts, nutritional goal tracking |
| **Supplements** | Supplement schedule, daily intake tracking, adherence score, AI interaction checker |
| **Health Profile** | User's personal medical data — powers all AI personalisation across the platform |
| **Communities** | Discover and join verified health groups; AI recommends groups based on your health profile |

---

## AI Features at a Glance

- **Symptom Checker** — Identifies symptoms from plain text, matches conditions, suggests specialists
- **Health Risk Score** — Calculates risk across 5 categories: cardiovascular, metabolic, respiratory, mental health, nutritional
- **AI Chat** — Conversational health assistant using Meta's Llama 3.2 model via Hugging Face
- **Nutrition Analyser** — Detects food items from a sentence and calculates macros (supports Indian foods)
- **Mood & Sentiment Analysis** — Analyses how the user feels using RoBERTa sentiment model
- **Data Correlation** — Finds patterns across health data (e.g., "Your energy is 28% higher when you sleep 7+ hours")
- **Supplement Interactions** — Checks for unsafe combinations in the user's supplement list
- **Group Recommendations** — AI suggests health communities based on the user's conditions and goals

---

## What Makes It Unique

1. **3D Everything** — Immersive landing page + clickable 3D anatomical body model (rare in health platforms)
2. **Real AI** — Uses actual biomedical NER, large language models, and sentiment analysis — not just rule-based logic
3. **Fully Integrated** — Appointments, AI, nutrition, supplements, communication, community — one platform
4. **Deeply Personalised** — All AI features adapt to the user's own health profile
5. **Premium Design** — Glassmorphism, micro-animations, smooth transitions — feels like a top-tier product
6. **End-to-End Flow** — From symptom → AI analysis → specialist recommendation → appointment booking → doctor chat

---

## Technology Stack

| Area | Tools Used |
|---|---|
| Frontend | React.js, Framer Motion, Tailwind CSS |
| 3D Engine | Three.js, React Three Fiber |
| Charts | Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| AI Models | Hugging Face (Llama 3.2, RoBERTa, BioNER) |
| Auth | JWT (JSON Web Tokens) |

---

## User Flow (In Brief)

**Visit site → 3D landing page → Register/Login → Welcome Portal → Choose section → Use AI / Book appointment / Track health / Consult doctor → All data saved and used to personalise the experience**

---

## The Problem AETHERA Solves

| Problem | How AETHERA Addresses It |
|---|---|
| Healthcare is fragmented — too many separate apps | One unified platform for all health needs |
| AI health tools use oversimplified logic | AETHERA uses real biomedical NLP and LLM models |
| Patients don't know which specialist to see | 3D body map routes users to the right doctor by clicking the affected area |
| Hard to track diet, supplements, and sleep consistently | Integrated trackers with visual charts and daily reminders |
| Telehealth feels impersonal and generic | Personalised AI that knows your profile, conditions, and goals |
| No way to connect symptoms → action in one step | AETHERA goes symptom → analysis → recommendation → appointment → consultation |

---

## Backend Architecture

The backend is a **Node.js + Express.js** REST API server connected to a **MongoDB** database.

**How requests flow:**
```
User (Browser) → React Frontend → Axios HTTP Request → Express API → MongoDB / AI Engine → Response
```

**Key API categories handled by the backend:**
- `/auth` — Register, login, token validation
- `/health-profile` — Store and retrieve user medical data
- `/appointments` — CRUD for appointment records + reminder scheduling
- `/nutrition/*` — Food items, meals, recipes, water intake, nutritional goals
- `/supplements` + `/user-supplements` + `/intake` — Full supplement lifecycle
- `/groups` + `/community` — Health communities and membership
- `/ai/*` — Routes to the AI engine for risk scoring, chat, analysis
- `/health-metrics` — Sleep, mood, energy, weight logs

**AI Engine (aiEngine.js):**
A dedicated module that orchestrates all AI tasks. It connects to Hugging Face via the official `@huggingface/inference` SDK, and falls back to custom rule-based algorithms if the API is unavailable.

---

## Security Features

- **Password Hashing** — Passwords are never stored in plain text; hashed using bcrypt
- **JWT Authentication** — Every API request requires a valid, time-limited access token
- **Token Expiry** — Sessions expire automatically; invalid/expired tokens are rejected
- **User Data Isolation** — Each user can only access their own records (enforced at the API level)
- **End-to-End Encrypted Chat** — Doctor-patient messages are marked as encrypted
- **Input Validation** — All incoming data is validated before being saved to the database
- **Error Handling** — API errors return safe, non-revealing error messages in production

---

## Key Data Models (What Gets Stored)

| Model | Key Fields |
|---|---|
| **User** | username, email, hashed password, createdAt |
| **HealthProfile** | age, gender, height, weight, BMI, conditions, allergies, medications, activity level, sleep hours |
| **Appointment** | patient, doctor, specialty, date, time, type, status, priority, reminders, insurance |
| **HealthMetric** | userId, type (Sleep/Mood/Energy/Weight), value, recordedAt |
| **Meal** | userId, name, type, food items, total nutrition, date |
| **Recipe** | name, ingredients, servings, instructions, nutrition per serving, category, difficulty |
| **WaterIntake** | userId, amount (ml), date, time |
| **NutritionalGoals** | userId, daily calories, protein, carbs, fat, water targets |
| **UserSupplement** | userId, supplement details, dosage, frequency, times, adherence |
| **Community/Group** | groupName, category, description, members count, verified status |

---

## Future Scope

- **Wearable Integration** — Connect with fitness bands or smartwatches to auto-import sleep, heart rate, and step data
- **Real-time Doctor Chat** — Replace simulated chat with live WebSocket-based messaging
- **Lab Report Analysis** — Upload a blood test PDF and let AI explain the results in simple language
- **Medicine Reminders via SMS/Email** — Push supplement and medication reminders outside the browser
- **Prescription Management** — Store and track doctor-issued prescriptions digitally
- **Multi-language Support** — Support regional Indian languages for wider accessibility
- **Mobile App** — Convert the platform to a native app using React Native
- **Insurance Integration** — Connect with insurance providers for real-time claim status

---

## Impact Summary

> AETHERA is not just a website — it is a complete health management ecosystem. It empowers users to understand their own health through AI and 3D visualisation, take action through integrated appointment booking, stay consistent through nutrition and supplement tracking, and connect with doctors and peers through an in-platform communication suite. Every part of the platform is designed to reduce the distance between a person and good healthcare.

---

*AETHERA — Built by Akshith | Virtual Health Consultation Platform*
 
 
 
 
 
 
 
 
