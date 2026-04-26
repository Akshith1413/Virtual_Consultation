import React from "react";
import {
  Mic,
  Activity,
  Users,
  WifiOff,
  Watch,
} from "lucide-react";

const PLANNED = [
  {
    icon: <Mic className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
    title: "Voice Assistant Control",
    description: "Talk to your tracker via Alexa or Google Assistant for hands-free wellness updates.",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: <Activity className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
    title: "ML Health Predictions",
    description: "AI predicts potential health risks early and recommends preventive action.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
    title: "Community Forums",
    description: "Join like-minded users, share achievements, and take part in group challenges.",
    gradient: "from-indigo-500 to-purple-500"
  },
  {
    icon: <WifiOff className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
    title: "Offline Mode",
    description: "Access essential features even without internet connectivity.",
    gradient: "from-amber-500 to-orange-500"
  },
  {
    icon: <Watch className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
    title: "IoT Wearable & Gym Integration",
    description: "Seamlessly sync data from smartwatches, bands, and connected gym equipment.",
    gradient: "from-indigo-500 to-blue-500"
  },
];

export default function ComingSoonSection() {
  return (
    <section className="bg-indigo-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-850 dark:to-gray-900 py-20 px-4 md:px-10 lg:px-20 relative overflow-hidden">
      {/* Subtle background pattern for dark mode */}
      <div className="absolute inset-0 hidden dark:block opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CiAgPHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGQ9Ik0zMCAzMG0tMjggMGEyOCwyOCAwIDEsMSA1NiwwYTI4LDI4IDAgMSwxIC01NiwwIiBzdHJva2U9IiMzNzQxNGEiIHN0cm9rZS13aWR0aD0iMC41IiBmaWxsPSJub25lIi8+Cjwvc3ZnPg==')]"></div>
      </div>
      
      {/* Animated stars for the "Coming Soon" theme */}
      <div className="absolute inset-0 hidden dark:block opacity-30">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>
      
      <div className="max-w-7xl mx-auto text-center relative z-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-4">
          Coming <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">Soon</span> ðŸš€
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto mt-3">
          We're constantly evolving to make your health journey even smarter.
          Here's a sneak peek at what's next:
        </p>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {PLANNED.map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800/80 dark:backdrop-blur-sm p-6 rounded-2xl shadow hover:shadow-xl dark:shadow-gray-900/30 dark:hover:shadow-indigo-900/20 transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700/50 relative overflow-hidden group"
            >
              {/* Subtle gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}></div>
              
              <div className="relative z-10">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{item.description}</p>
              </div>
              
              {/* Coming soon badge */}
              <div className="absolute top-4 right-4">
                <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 text-xs font-medium rounded-full">
                  Soon
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16">
          <div className="bg-indigo-600 hover:bg-indigo-700 dark:bg-gradient-to-r dark:from-indigo-500 dark:to-purple-600 dark:hover:from-indigo-600 dark:hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-2xl shadow-md dark:shadow-lg dark:shadow-indigo-900/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center mx-auto group mb-8 w-102">
            Join the Beta Program
            <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
          
          <p className="text-gray-500 dark:text-gray-400 text-medium mt-4">
            Be the first to experience new features and help shape our product
          </p>
        </div>
      </div>
    </section>
  );
}
