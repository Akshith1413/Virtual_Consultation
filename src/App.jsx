import { HashRouter as Router } from 'react-router-dom';
import { AuthProvider } from '/src/context/AuthContext.jsx';
import AuthGate from './components/AuthGate';
import AppRoutes from './routes/AppRoutes';
import AIChat from './components/AIChat';

function App() {
  return (
    <AuthProvider>
      <AuthGate>
        <Router>
          <AppRoutes />
          <AIChat />
        </Router>
      </AuthGate>
    </AuthProvider>
  );
}

export default App;
 
 

// minor tweak for clarity

// minor tweak for clarity

// minor tweak for clarity
