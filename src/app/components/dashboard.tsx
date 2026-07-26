import React, { useState } from 'react';
import { useAuth } from '../../context/auth-context';
import { motion, AnimatePresence } from 'motion/react';
import { DashboardOverview } from './dashboard-overview';
import { SymptomsView } from './symptoms-view';
import { MedicationManager } from './medication-manager';
import { DietTracker } from './diet-tracker';
import { HealthInsights } from './health-insights';
import { HealthCalendar } from './health-calendar';
import { FlareMode } from './flare-mode';
import { Settings as SettingsPage } from './settings';
import {
  LayoutDashboard,
  Activity,
  Pill,
  Apple,
  TrendingUp,
  Calendar,
  Menu,
  LogOut,
  Settings,
} from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import butterflyImage from 'figma:asset/56fc79b5210ad4c78090a1c41123eebc3fc3af82.png';

interface DashboardProps {
  userName: string;
}

export function Dashboard({ userName }: DashboardProps) {
  const { logout: onLogout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isFlareMode, setIsFlareMode] = useState(false);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'symptoms', name: 'Symptoms', icon: Activity },
    { id: 'medications', name: 'Medications', icon: Pill },
    { id: 'diet', name: 'Diet', icon: Apple },
    { id: 'calendar', name: 'Calendar', icon: Calendar },
    { id: 'insights', name: 'Insights', icon: TrendingUp },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const NavigationContent = () => (
    <nav className="space-y-1">
      {navigation.map((item, index) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setActiveTab(item.id);
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-[#7293BB] text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{item.name}</span>
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}
          </motion.button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60"
        style={{ borderBottomColor: 'rgba(0, 0, 0, 0.1)' }}
      >
        <div className="container mx-auto flex h-[77px] items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-6">
                <SheetHeader className="text-left mb-6">
                  <SheetTitle
                    className="text-2xl font-semibold m-0 p-0"
                    style={{ color: '#7293BB' }}
                  >
                    Flaire
                  </SheetTitle>
                  <SheetDescription className="text-sm text-muted-foreground mt-1">
                    Welcome, {userName}!
                  </SheetDescription>
                </SheetHeader>
                <NavigationContent />
              </SheetContent>
            </Sheet>
            <h1 className="h-10 flex items-center">
              <motion.img
                src={butterflyImage}
                alt="Flaire"
                className="h-30 w-30 mx-[0px] my-[60px]"
                style={{ mixBlendMode: 'multiply' }}
                initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ scale: 1.08, rotate: 3 }}
              />
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Welcome, <span className="font-medium text-gray-900">{userName}</span>
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="hidden lg:flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 border-r bg-white sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="p-6">
            <NavigationContent />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="container mx-auto p-4 lg:p-8 max-w-7xl">
            <AnimatePresence mode="wait">
            {isFlareMode ? (
              <motion.div key="flare" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                <FlareMode onExit={() => setIsFlareMode(false)} userName={userName} />
              </motion.div>
            ) : (
              <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}>
                {activeTab === 'dashboard' && <DashboardOverview onNavigate={setActiveTab} onEnableFlareMode={() => setIsFlareMode(true)} />}
                {activeTab === 'symptoms' && <SymptomsView />}
                {activeTab === 'medications' && <MedicationManager />}
                {activeTab === 'diet' && <DietTracker />}
                {activeTab === 'calendar' && <HealthCalendar />}
                {activeTab === 'insights' && <HealthInsights />}
                {activeTab === 'settings' && <SettingsPage />}
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 z-40">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navigation.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-600'
                }`}
                style={isActive ? { backgroundColor: '#7293BB' } : {}}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}