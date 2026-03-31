import React, { useState } from "react";
import {
  Pocket,
  Activity,
  Video,
  ShieldCheck,
  Calendar,
  Award,
  Zap,
  MapPin,
} from "lucide-react";

const FEATURES = [
  {
    id: "realtime",
    title: "Real-time Progress",
    short: "Live charts for steps, calories, sleep, and heart rate.",
    long: "Interactive dashboards with real-time and historical charts. Exportable reports (PDF/CSV) and scheduled reports via email.",
    icon: <Activity className="w-7 h-7" />,
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    id: "pose",
    title: "Pose Detection",
    short: "Webcam-based posture & rep tracking using CV.",
    long: "Pose estimation guides form correction and counts reps. Works with webcam or smartphone camera. Includes feedback overlays and progress scoring.",
    icon: <Zap className="w-7 h-7" />,
    gradient: "from-amber-500 to-orange-500"
  },
  {
    id: "consult",
    title: "Virtual Consultations",
    short: "Book doctors or trainers for video calls.",
    long: "Integrated telemedicine: schedule appointments, secure video calls, share health logs and get prescriptions or follow-ups.",
    icon: <Video className="w-7 h-7" />,
    gradient: "from-purple-500 to-pink-500"
  },
  {
    id: "market",
    title: "Product Marketplace",
    short: "Buy fitness gear, supplements, and plans.",
    long: "Curated marketplace with product reviews, subscription plans, and secure checkout with multiple payment options and promo codes.",
    icon: <Pocket className="w-7 h-7" />,
    gradient: "from-emerald-500 to-purple-500"
  },
  {
    id: "cert",
    title: "Certificates",
    short: "Completion certificates for training programs.",
    long: "Generate shareable certificates and badges when users complete certified programs. Option to download or share on social media.",
    icon: <Award className="w-7 h-7" />,
    gradient: "from-yellow-500 to-amber-500"
  },
  {
    id: "security",
    title: "Enterprise-Grade Security",
    short: "JWT/OAuth2.0, E2E encryption and RBAC.",
    long: "Role-based access controls for users, trainers and doctors. Encryption at rest and in transit. AI threat detection for anomalous accesses.",
    icon: <ShieldCheck className="w-7 h-7" />,
    gradient: "from-indigo-500 to-emerald-500"
  },
  {
    id: "scheduling",
    title: "Plans & Payment",
    short: "Manage subscriptions, trials, and pay-as-you-go.",
    long: "Flexible payment plans with invoicing, trials, and promo management. Secure PCI-compliant gateway integration.",
    icon: <Calendar className="w-7 h-7" />,
    gradient: "from-indigo-500 to-blue-500"
  },
  {
    id: "emergency",
    title: "Emergency Finder",
    short: "Locate nearby medical experts & services.",
    long: "Find closest clinics, hospitals, emergency contacts and share location in one tap. Integrates map & local language support for instructions.",
    icon: <MapPin className="w-7 h-7" />,
    gradient: "from-red-500 to-rose-500"
  },
];

export default function CoreFeaturesSection() {
  const [open, setOpen] = useState(null);

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-850 dark:to-gray-900 py-20 px-4 md:px-10 lg:px-20 relative overflow-hidden">
      {/* Subtle background pattern for dark mode */}
      <div className="absolute inset-0 hidden dark:block opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CiAgPHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGQ9Ik0zMCAzMG0tMjggMGEyOCwyOCAwIDEsMSA1NiwwYTI4LDI4IDAgMSwxIC01NiwwIiBzdHJva2U9IiMzNzQxNGEiIHN0cm9rZS13aWR0aD0iMC41IiBmaWxsPSJub25lIi8+Cjwvc3ZnPg==')]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Core <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">Features</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
            Everything you need to measure, improve and secure your health — built for real life and real results.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <button
              key={f.id}
              onClick={() => setOpen(f.id)}
              className="group text-left bg-[#f9f9f9] dark:bg-[#f9f9f9] dark:backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-xl dark:shadow-gray-900/30 transition-all duration-300 transform hover:-translate-y-2 focus:outline-none border border-gray-100 dark:border-gray-700/50 relative overflow-hidden "
            >
              {/* Subtle gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}></div>
              
              <div className="flex items-center gap-4 relative z-10 ">
                <div className="mb-4 bg-blue-100 dark:bg-blue-900/30 w-14 h-14 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-100">
  {f.icon}
</div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-indigo-900 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-600 text-sm mt-1">{f.short}</p>
                </div>
              </div>

              <div className="mt-5 text-sm text-indigo-600 dark:text-indigo-500 font-medium group-hover:underline flex items-center">
                Learn more 
                <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Modal */}
        {open && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(null)}
            />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 z-10 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                 <div className="bg-blue-100 dark:bg-blue-900/30 w-14 h-14 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-100">
  {FEATURES.find((x) => x.id === open)?.icon}
</div>


                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {FEATURES.find((x) => x.id === open)?.title}
                  </h3>
                </div>
                <button
                  onClick={() => setOpen(null)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mt-4">
                {FEATURES.find((x) => x.id === open)?.long}
              </p>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => setOpen(null)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setOpen(null);
                    // implement actual navigation/action in app
                  }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-500 dark:to-purple-600 dark:hover:from-indigo-600 dark:hover:to-purple-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
 
 

// minor tweak for clarity
