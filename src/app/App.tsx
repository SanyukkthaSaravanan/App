import React from 'react';
import { motion } from 'motion/react';
import { AuthProvider, useAuth } from '../context/auth-context';
import { Auth } from './components/auth';
import { Dashboard } from './components/dashboard';

function AppInner() {
  const { user, isLoading } = useAuth();

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
          <h1 className="text-2xl font-semibold" style={{ color: '#7293BB' }}>Flaire</h1>
          <p className="text-sm text-muted-foreground mt-2">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) return <Auth />;

  const displayName = user.firstName
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    : user.username;

  return <Dashboard userName={displayName} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
