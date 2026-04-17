import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Auth } from './components/auth';
import { Dashboard } from './components/dashboard';

interface User {
  email: string;
  name: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for saved user in localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('flaireUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('flaireUser');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (email: string, name: string) => {
    const newUser = { email, name };
    setUser(newUser);
    // Save to localStorage for persistence
    localStorage.setItem('flaireUser', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('flaireUser');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: '#7293BB' }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-2xl text-white">🌸</span>
          </motion.div>
          <h1 className="text-2xl font-semibold" style={{ color: '#7293BB' }}>
            Flaire
          </h1>
          <p className="text-sm text-muted-foreground mt-2">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // Show auth page if not logged in
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  // Show dashboard if logged in
  return <Dashboard userName={user.name} onLogout={handleLogout} />;
}
