import React from "react";

const TESTIMONIALS = [
  {
    name: "Sarah Mitchell",
    role: "Marketing Manager",
    text: "This app fits perfectly into my busy schedule. The AI workout suggestions are a game-changer!",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
  },
  {
    name: "David Chen",
    role: "Software Engineer",
    text: "I've tried many health apps, but this one keeps me motivated. The real-time posture correction is amazing.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
  },
  {
    name: "Priya Kapoor",
    role: "HR Specialist",
    text: "From meal plans to virtual doctor consults — I feel in control of my wellness for the first time.",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    rating: 4,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-850 dark:to-gray-900 py-20 px-4 md:px-10 lg:px-20 relative overflow-hidden">
      {/* Subtle background pattern for dark mode */}
      <div className="absolute inset-0 hidden dark:block opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CiAgPHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGQ9Ik0zMCAzMG0tMjggMGEyOCwyOCAwIDEsMSA1NiwwYTI4LDI4IDAgMSwxIC01NiwwIiBzdHJva2U9IiMzNzQxNGEiIHN0cm9rZS13aWR0aD0iMC41IiBmaWxsPSJub25lIi8+Cjwvc3ZnPg==')]"></div>
      </div>
      
      {/* Floating testimonial quotes for dark mode */}
      <div className="absolute inset-0 hidden dark:block opacity-5">
        <div className="absolute top-20 left-10 text-6xl text-indigo-400/20">â</div>
        <div className="absolute bottom-40 right-12 text-6xl text-indigo-400/20">âž</div>
        <div className="absolute top-1/3 right-20 text-6xl text-indigo-400/20">â</div>
        <div className="absolute bottom-1/4 left-16 text-6xl text-indigo-400/20">âž</div>
      </div>
      
      <div className="max-w-7xl mx-auto text-center relative z-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-4">
          Loved by Our <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">Users</span>
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto mt-3">
          See what real people are saying about their experience with our Health & Fitness Tracker.
        </p>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="bg-gray-50 dark:bg-gray-800/80 dark:backdrop-blur-sm rounded-2xl p-6 shadow hover:shadow-xl dark:shadow-gray-900/30 dark:hover:shadow-indigo-900/20 transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700/50 relative overflow-hidden group"
            >
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/5 to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-700 group-hover:border-blue-400 dark:group-hover:border-blue-400 transition-colors duration-300"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {t.name}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{t.role}</p>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 italic mb-4 relative">
                  <span className="absolute -top-4 -left-2 text-medium text-blue-400">â </span>
                  {t.text}
                  <span className="absolute -bottom-3 -right-2 text-2xl text-blue-400">âž</span>
                </p>

                <div className="flex justify-center">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i} className="text-blue-400 dark:text-blue-300">★</span>
                  ))}
                  {Array.from({ length: 5 - t.rating }).map((_, i) => (
                    <span key={i} className="text-gray-300 dark:text-gray-600">★</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust indicators for dark mode */}
        <div className="mt-12 hidden dark:flex items-center justify-center gap-8 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span>500+ Active Users</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span>4.8/5 Average Rating</span>
          </div>
        </div>
      </div>
    </section>
  );
}
 
 
 
 
 
 
 
 
 
