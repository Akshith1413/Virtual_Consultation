import React from "react";
import { Briefcase, Clock, Coffee, BarChart3, HeartPulse } from "lucide-react";

export default function PersonaWorkingAdults() {
  return (
    <section className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-850 dark:to-gray-900 py-20 px-4 md:px-10 lg:px-20 relative overflow-hidden">
      {/* Subtle background pattern for dark mode */}
      <div className="absolute inset-0 hidden dark:block opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CiAgPHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGQ9Ik0zMCAzMG0tMjggMGEyOCwyOCAwIDEsMSA1NiwwYTI4LDI4IDAgMSwxIC01NiwwIiBzdHJva2U9IiMzNzQxNGEiIHN0cm9rZS13aWR0aD0iMC41IiBmaWxsPSJub25lIi8+Cjwvc3ZnPg==')]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-28 relative z-10">
        
        {/* Left Content */}
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white">
            For Busy Professionals Who Care About Their <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">Health</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg mt-8">
            Juggling deadlines, meetings, and personal life can make wellness feel impossible. 
            Our AI-powered tracker helps you stay fit, energized, and focused — without disrupting your workday.
          </p>

          {/* Feature List */}
          <ul className="mt-8 space-y-6">
            <li className="flex items-start gap-7 group">
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">Smart Time Management</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  AI schedules quick workouts and reminders around your calendar so you never miss a beat.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-7 group">
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">Stress & Sleep Tracking</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Get real-time alerts when burnout patterns appear and receive recovery tips.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-7 group">
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Coffee className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">Office-Friendly Workouts</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Desk stretches, posture correction, and quick cardio — all doable in 5–10 minutes.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-7 group">
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-6 h-6" />
              </div>  
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">Performance Reports</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Visual progress reports keep you motivated and show tangible health gains.
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Right Image */}
        <div className="flex justify-center relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-3xl opacity-20 dark:opacity-30 blur-xl"></div>
          <img
            src="https://learnenglish.britishcouncil.org/sites/podcasts/files/RS4967_78781313-hig.jpg"
            alt="Working Professional using Health Tracker"
            className="rounded-3xl shadow-lg dark:shadow-2xl dark:shadow-gray-900/50 relative z-10 border border-gray-200 dark:border-gray-700"
          />
        </div>
      </div>
    </section>
  );
}
