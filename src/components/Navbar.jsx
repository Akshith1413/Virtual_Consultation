import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMoon, FiSun, FiArrowLeft } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Check if we're not on the home page
  const showBackButton = location.pathname !== '/';

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-sm relative z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Back Button - Only show when not on home page */}
            {showBackButton && (
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-2 rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-400 transition-colors"
                aria-label="Go back"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-600" />
              </button>
            )}

            <span
              onClick={() => navigate('/')}
              className="text-xl font-semibold text-gray-800 dark:text-white cursor-pointer"
            >
              AETHERA HEALTH
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {/* Theme toggle button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/80 dark:bg-slate-700/80 backdrop-blur shadow hover:scale-110 transition-transform"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <FiMoon className="w-5 h-5 text-indigo-600" />
              ) : (
                <FiSun className="w-5 h-5 text-yellow-400" />
              )}
            </button>

            {user ? (
              <>
                <button
                  onClick={() => navigate('/ai-hub')}
                  className="px-3 py-2 text-sm font-medium text-white rounded-md"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    fontSize: '13px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(99,102,241,0.3)',
                    transition: 'all 0.2s',
                  }}
                >
                  🧠 AI Hub
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-600 hover:text-blue-600 dark:hover:text-blue-400 rounded-md bg-[#f9f9f9]"
                >
                  Profile
                </button>
                <button
                  onClick={logout}
                  className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-600 hover:text-blue-600 dark:hover:text-blue-400 rounded-md bg-[#f9f9f9]"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/signin')}
                  className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-600 hover:text-blue-600 dark:hover:text-blue-400 rounded-md bg-[#f9f9f9]"
                >
                  Sign In
                </button>
                <div
                  onClick={() => navigate('/signup')}
                  className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Sign Up
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
 
 
 
 
 
 
 

// minor tweak for clarity
