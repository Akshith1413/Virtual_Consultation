import React from "react";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Heart, ArrowRight } from "lucide-react";

export default function CTAandFooter() {
  return (
    <>
      {/* Call to Action Section */}
      <section className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:bg-gradient-to-r dark:from-gray-900 dark:via-gray-850 dark:to-gray-900 py-20 px-4 md:px-10 lg:px-20 text-center relative overflow-hidden">
        {/* Subtle background pattern for dark mode */}
        <div className="absolute inset-0 hidden dark:block opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CiAgPHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGQ9Ik0zMCAzMG0tMjggMGEyOCwyOCAwIDEsMSA1NiwwYTI4LDI4IDAgMSwxIC01NiwwIiBzdHJva2U9IiMzNzQxNGEiIHN0cm9rZS13aWR0aD0iMC41IiBmaWxsPSJub25lIi8+Cjwvc3ZnPg==')]"></div>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-3 bg-white dark:bg-gray-800 rounded-full px-4 py-2 mb-15 shadow-sm dark:shadow-gray-900/50">
            <Heart className="text-rose-500 dark:text-rose-400" size={16} fill="currentColor" />
            <span className="text-medium font-medium text-gray-700 dark:text-gray-300">Join 10,000+ healthy users</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-8">
            Start Your Health <span className="bg-gradient-to-r from-purple-500 to-cyan-600 dark:from-purple-400 dark:to-cyan-500 bg-clip-text text-transparent">Journey</span> Today
          </h2>
          <p className="text-lg mt-4 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Join thousands of people taking control of their wellness with our AI-powered health tracker.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-purple-500 to-cyan-600 hover:from-purple-600 hover:to-cyan-700 dark:from-purple-500 dark:to-cyan-600 dark:hover:from-purple-600 dark:hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg dark:shadow-teal-900/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
              Get Started Now <ArrowRight size={18} />
            </button>
            <button className="bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-gray-700 font-semibold py-3 px-6 rounded-xl shadow-sm hover:shadow-md dark:hover:shadow-gray-900/30 transition-all transform hover:-translate-y-0.5">
              Join the Beta
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-950 border-t border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 py-12 px-4 md:px-10 lg:px-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-gray-800 dark:text-white text-xl font-bold mb-4 flex items-center gap-2">
              <div className="bg-gradient-to-r from-purple-500 to-cyan-600 dark:from-purple-400 dark:to-cyan-500 p-2 rounded-lg">
                <Heart size={20} className="text-white" fill="currentColor" />
              </div>
              AETHERA HEALTH
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              AI-powered health assistant for a better, healthier you.
            </p>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">"Transformed my wellness routine in just 2 weeks!"</p>
              <p className="text-xs font-medium mt-1 text-gray-700 dark:text-gray-300">- Sarah K.</p>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-gray-800 dark:text-white font-semibold mb-4 text-lg">Quick Links</h4>
            <ul className="space-y-3 text-sm">
    <li>
      <a href="#features" className="hover:text-purple-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2 group">
        <div className="w-1.5 h-1.5 bg-purple-400 dark:bg-blue-300 rounded-full group-hover:scale-125 transition-transform mt-1"></div>
        <p className="dark:text-indigo-400">Features</p>
      </a>
    </li>
    <li>
      <a href="#testimonials" className="hover:text-purple-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2 group">
        <div className="w-1.5 h-1.5 bg-purple-400 dark:bg-blue-300 rounded-full group-hover:scale-125 transition-transform mt-1"></div>
        <p className="dark:text-indigo-400">Testimonials</p>
      </a>
    </li>
    <li>
      <a href="#security" className="hover:text-purple-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2 group">
        <div className="w-1.5 h-1.5 bg-purple-400 dark:bg-blue-300 rounded-full group-hover:scale-125 transition-transform mt-1"></div>
        <p className="dark:text-indigo-400">Security</p>
      </a>
    </li>
    <li>
      <a href="#contact" className="hover:text-purple-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2 group">
        <div className="w-1.5 h-1.5 bg-purple-400 dark:bg-blue-300 rounded-full group-hover:scale-125 transition-transform mt-1"></div>
        <p className="dark:text-indigo-400">Contact</p>
      </a>
    </li>
  </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-gray-800 dark:text-white font-semibold mb-4 text-lg">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors group">
                <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg group-hover:scale-110 transition-transform mt-1">
                  <Mail size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors dark:text-blue-200">support@aetherahealth.ai</span>
              </li>
              <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors group">
                <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <Phone size={16} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors dark:text-blue-200">+1 (800) AETHERA-HEALTH</span>
              </li>
              <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors group">
                <div className="bg-amber-100 dark:bg-amber-900/40 p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <MapPin size={16} className="text-amber-600 dark:text-amber-400" />
                </div>
                <span className="group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors dark:text-blue-200">San Francisco, CA</span>
              </li>
            </ul>
          </div>

          {/* Socials & Newsletter */}
          <div>
            <h4 className="text-gray-800 dark:text-white font-semibold mb-4 text-lg">Stay Connected</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Subscribe to our wellness newsletter</p>
            <div className="flex gap-2 mb-6">
              <input 
                type="email" 
                placeholder="Your email" 
                className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 dark:focus:ring-teal-500 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <button className="bg-purple-500 dark:bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-600 dark:hover:bg-purple-700 transition-colors transform hover:scale-105">
                <Mail size={16} />
              </button>
            </div>
            <div className="flex gap-4">
              <a href="#" className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm hover:shadow-md dark:hover:shadow-gray-900/50 transition-all transform hover:-translate-y-1">
                <Facebook className="text-blue-600 dark:text-blue-400" size={18} />
              </a>
              <a href="#" className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm hover:shadow-md dark:hover:shadow-gray-900/50 transition-all transform hover:-translate-y-1">
                <Twitter className="text-sky-500 dark:text-sky-400" size={18} />
              </a>
              <a href="#" className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm hover:shadow-md dark:hover:shadow-gray-900/50 transition-all transform hover:-translate-y-1">
                <Instagram className="text-rose-500 dark:text-rose-400" size={18} />
              </a>
            </div>
          </div>
        </div>

       
        
      </footer>
    </>
  );
}
 
 
 


// minor tweak for clarity
