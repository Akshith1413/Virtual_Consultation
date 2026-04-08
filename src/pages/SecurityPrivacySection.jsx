import React from "react";
import {
  ShieldCheck,
  Lock,
  KeyRound,
  EyeOff,
  AlertTriangle,
} from "lucide-react";

const SECURITY_POINTS = [
  {
    icon: <Lock className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />,
    title: "End-to-End Encryption",
    description:
      "Your personal health data is encrypted during transmission and while stored on our servers.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: <KeyRound className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />,
    title: "Secure Login",
    description:
      "We use industry-standard JWT tokens and OAuth 2.0 for passwordless and social logins.",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: <ShieldCheck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />,
    title: "Role-Based Access",
    description:
      "Different permissions for trainers, doctors, and users ensure sensitive data is only seen by authorized personnel.",
    gradient: "from-indigo-500 to-purple-500"
  },
  {
    icon: <AlertTriangle className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />,
    title: "AI Threat Detection",
    description:
      "Our AI monitors unusual activity patterns to prevent unauthorized access or data breaches.",
    gradient: "from-amber-500 to-orange-500"
  },
  {
    icon: <EyeOff className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />,
    title: "Privacy-First Design",
    description:
      "We follow HIPAA & GDPR guidelines to give you full control over your personal data.",
    gradient: "from-indigo-500 to-blue-500"
  },
];

export default function SecurityPrivacySection() {
  return (
    <section className="bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-850 dark:to-gray-900 py-20 px-4 md:px-10 lg:px-20 relative overflow-hidden">
      {/* Subtle background pattern for dark mode */}
      <div className="absolute inset-0 hidden dark:block opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CiAgPHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGQ9Ik0zMCAzMG0tMjggMGEyOCwyOCAwIDEsMSA1NiwwYTI4LDI4IDAgMSwxIC01NiwwIiBzdHJva2U9IiMzNzQxNGEiIHN0cm9rZS13aWR0aD0iMC41IiBmaWxsPSJub25lIi8+Cjwvc3ZnPg==')]"></div>
      </div>
      
      {/* Security pattern overlay for dark mode */}
      <div className="absolute inset-0 hidden dark:block opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CiAgPHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGQ9Ik0zMCAxMG0tMiAwYTIgMiAwIDEsMSA0IDBhMiAyIDAgMSwxIC00IDAiIHN0cm9rZT0iIzM3NDE0YSIgc3Ryb2tlLXdpZHRoPSIwLjUiIGZpbGw9Im5vbmUiLz4KICA8cGF0aCBkPSJNMzAgMzBtLTIgMGEyIDIgMCAxLDEgNCAwYTIgMiAwIDEsMSAtNCAwIiBzdHJva2U9IiMzNzQxNGEiIHN0cm9rZS13aWR0aD0iMC41IiBmaWxsPSJub25lIi8+CiAgPHBhdGggZD0iTTMwIDUwbC0yIDBhMiAyIDAgMSwxIDQgMGEyIDIgMCAxLTEgLTQgMCIgc3Ryb2tlPSIjMzc0MTRhIiBzdHJva2Utd2lkdGg9IjAuNSIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGQ9Ik0xMCAzMG0tMiAwYTIgMiAwIDEsMSA0IDBhMiAyIDAgMSwxIC00IDAiIHN0cm9rZT0iIzM3NDE0YSIgc3Ryb2tlLXdpZHRoPSIwLjUiIGZpbGw9Im5vbmUiLz4KICA8cGF0aCBkPSJNNTAgMzBtLTIgMGEyIDIgMCAxLDEgNCAwYTIgMiAwIDEsMSAtNCAwIiBzdHJva2U9IiMzNzQxNGEiIHN0cm9rZS13aWR0aD0iMC41IiBmaWxsPSJub25lIi8+Cjwvc3ZnPg==')]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto text-center relative z-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-4">
          Security & Privacy You Can <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">Trust</span>
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto mt-3">
          We know your health data is sensitive. Our platform is built with
          enterprise-grade security to keep your information safe at all times.
        </p>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {SECURITY_POINTS.map((point, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800/80 dark:backdrop-blur-sm rounded-2xl p-6 shadow hover:shadow-xl dark:shadow-gray-900/30 dark:hover:shadow-indigo-900/20 transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700/50 relative overflow-hidden group"
            >
              {/* Subtle gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${point.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}></div>
              
              <div className="relative z-10">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  {point.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {point.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{point.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional trust badge for dark mode */}
        <div className="mt-12 hidden dark:block">
          <div className="inline-flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-full px-4 py-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span className="text-medium text-gray-300">Enterprise-Grade Security</span>
          </div>
        </div>
      </div>
    </section>
  );
}
 
 
 
