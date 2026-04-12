import React from 'react';
import {
  BrainCircuit,
  MessageSquareText,
  Activity,
  AlertCircle,
} from 'lucide-react';

const features = [
  {
    icon: <BrainCircuit className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
    title: 'AI Health Assistant',
    description: 'Get diet, workout, and sleep plans tailored to your behavior patterns with real-time optimization.',
  },
  {
    icon: <MessageSquareText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
    title: 'Chat-Based NLP Coach',
    description: 'Interact with your AI assistant using natural language to receive tips, reminders, and advice instantly.',
  },
  {
    icon: <AlertCircle className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
    title: 'Health Risk Alerts',
    description: 'Receive early warnings for conditions like fatigue, burnout, or weight gain using predictive analytics.',
  },
  {
    icon: <Activity className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
    title: 'Smart Daily Insights',
    description: 'AI adapts your wellness plan daily by analyzing activity levels and sleep patterns.',
  },
];

const AIHealthAssistantSection = () => {
  return (
    <section className="bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-800 py-20 px-4 md:px-10 lg:px-20 relative">
      {/* Subtle grid pattern for dark mode */}
      <div className="absolute inset-0 hidden dark:block opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-gray-900"></div>
      </div>
      
      <div className="max-w-7xl mx-auto text-center relative z-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-6">
          Smarter Health <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">Starts Here</span>
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto mb-12">
          Experience the power of artificial intelligence in your fitness journey. From daily check-ins to predictive insights, your AI coach has your back.
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-800/70 dark:backdrop-blur-sm p-6 rounded-2xl shadow hover:shadow-md dark:shadow-gray-900/30 dark:hover:shadow-lg dark:hover:shadow-indigo-900/20 transition-all transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700/50"
            >
              <div className="mb-4 bg-indigo-100 dark:bg-indigo-900/30 w-14 h-14 rounded-full flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AIHealthAssistantSection;
 
 

// minor tweak for clarity
