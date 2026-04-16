import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Landing3D from './Landing3D';

const Home = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  // Authenticated users go to dashboard, guests see the 3D landing
  if (user) {
    return <Navigate to="/portal" replace />;
  }

  return <Landing3D />;
};

export default Home; 
 
 
 
 
 
 
 

// minor tweak for clarity
