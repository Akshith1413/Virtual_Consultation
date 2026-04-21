import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { theme = 'light' } = useTheme() || {};

  return (
    <footer className={`py-4 border-t ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
        &copy; {new Date().getFullYear()} AETHERA HEALTH. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
 
 
 
 
 
 
 
 
 
 
 
 
 
