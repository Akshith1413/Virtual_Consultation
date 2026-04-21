import React from "react";
import { Activity, BrainCircuit, Languages, Users } from "lucide-react";

export default function WhyItMattersSection() {
  return (
    <section className="bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-850 dark:to-gray-900 py-20 px-4 md:px-10 lg:px-20 relative overflow-hidden">
      {/* Subtle background pattern for dark mode */}
      <div className="absolute inset-0 hidden dark:block opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CiAgPHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGQ9Ik0zMCAzMG0tMjggMGEyOCwy4wIDAgMSwxIDU2IDBhMjggMjggMCAxLTEgLTU2IDAiIHN0cm9rZT0iIzM3NDE0YSIgc3Ryb2tlLXdpZHRoPSIwLjUiIGZpbGw9Im5vbmUiLz4KPC9zdmc+')]"></div>
      </div>
      
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <h2 className="text-4xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-10">
          Why This <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">Matters</span>
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto mt-4">
          <strong className="dark:text-white">According to the World Health Organization</strong>, over{" "}
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold ">60% of people globally</span>{" "}
          suffer from lifestyle-related health issues due to poor tracking of diet,
          sleep, and exercise.&nbsp;
          <br /><br />
          <a
            href="https://www.who.int/news-room/fact-sheets/detail/physical-activity"
            className="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            target="_blank"
            rel="noreferrer"
          >
            Source: WHO
          </a>
        </p>

        {/* Comparison */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {/* Existing Solutions */}
          <div className="bg-white dark:bg-gray-800/80 dark:backdrop-blur-sm p-8 rounded-2xl shadow hover:shadow-xl dark:shadow-gray-900/30 dark:hover:shadow-red-900/20 transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700/50 group">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-13 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
              The Problem with Existing Apps
            </h3>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300 text-xl">
              <li className="flex items-start mb-6">
                <span className="text-red-500 dark:text-red-400 mr-2">•</span>
                <span>Generic tracking without personalized recommendations</span>
              </li>
              <li className="flex items-start mb-6">
                <span className="text-red-500 dark:text-red-400 mr-2">•</span>
                <span>No emotional engagement or real-time feedback</span>
              </li>
              <li className="flex items-start mb-6">
                <span className="text-red-500 dark:text-red-400 mr-2">•</span>
                <span>Limited language and accessibility options</span>
              </li>
              <li className="flex items-start mb-6">
                <span className="text-red-500 dark:text-red-400 mr-2">•</span>
                <span>Weak integration with devices and IoT</span>
              </li>
            </ul>
          </div>

          {/* Our Solution */}
          <div className="bg-indigo-50 dark:bg-gradient-to-br dark:from-indigo-900/30 dark:to-purple-900/30 p-8 rounded-2xl shadow hover:shadow-xl dark:shadow-gray-900/30 dark:hover:shadow-indigo-900/20 transition-all duration-300 transform hover:-translate-y-1 border border-indigo-100 dark:border-indigo-700/30 group">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-blue mb-9 group-hover:text-black-600 dark:group-hover:text-blue-600 transition-colors">
              How We're Different
            </h3>
            <ul className="space-y-8 text-gray-700 dark:text-black-300">
              <li className="flex items-start gap-6 group-hover:translate-x-1 transition-transform">
                <div className="bg-indigo-100 dark:bg-blue-900 p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <BrainCircuit className="w-6 h-6 text-indigo-600 dark:text-blue-200" />
                </div>
                <span>AI-powered personalized health assistant with predictive analytics</span>
              </li>
              <li className="flex items-start gap-6 group-hover:translate-x-1 transition-transform">
                <div className="bg-indigo-100 dark:bg-blue-900 p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6 text-indigo-600 dark:text-blue-200" />
                </div>
                <span className="dark:text-black-400">Real-time posture correction and daily plan adjustments</span>
              </li>
              <li className="flex items-start gap-6 group-hover:translate-x-1 transition-transform">
                <div className="bg-indigo-100 dark:bg-blue-900 p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <Languages className="w-6 h-6 text-indigo-600 dark:text-blue-200" />
                </div>
                <span>Multilingual support for global accessibility</span>
              </li>
              <li className="flex items-start gap-6 group-hover:translate-x-1 transition-transform">
                <div className="bg-indigo-100 dark:bg-blue-900 p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-indigo-600 dark:text-blue-200" />
                </div>
                <span>Engaging, inclusive community with trainers & experts</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Call to action for dark mode */}
        <div className="mt-17 block dark:block">
          <p className="text-gray-500 text-xl dark:text-gray-400">
            Join thousands of users who have transformed their health journey with our AI-powered platform
          </p>
        </div>
      </div>
    </section>
  );
}
 
 
 
 
 
 
 

// minor tweak for clarity

// minor tweak for clarity
