import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Mail, Lock, User, Chrome, AlertCircle, CheckCircle2 } from 'lucide-react';
import fullLogoImage from '../../imports/Flaire_name_logo_updated.png';
import { CursorGlow, FloatingParticles, FadeInView } from './motion-utils';
import { useAuth } from '../../context/auth-context';

export function Auth() {
  const { login, register } = useAuth();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  // Real-time validation flags (only show errors after the user has typed something)
  const usernameInvalid = signupUsername.length > 0 && (signupUsername.length < 3 || signupUsername.length > 32);
  const passwordInvalid = signupPassword.length > 0 && signupPassword.length < 8;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    setError(''); setLoading(true);
    try {
      await login(loginEmail, loginPassword);
    } catch (err: any) {
      setError(err.message ?? 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupFirstName || !signupUsername || !signupEmail || !signupPassword) return;
    if (signupUsername.length < 3 || signupUsername.length > 32) {
      setError('Username must be 3–32 characters.');
      return;
    }
    if (signupPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError(''); setSuccess(''); setLoading(true);
    try {
      await register(signupEmail, signupUsername, signupPassword, signupFirstName);
      // Account created — do NOT auto-login. Send the user to the login tab
      // to sign in with their new credentials.
      setSuccess('Account created! Please log in with your new credentials.');
      setLoginEmail(signupEmail);
      setLoginPassword('');
      setActiveTab('login');
      // Clear the signup form
      setSignupFirstName('');
      setSignupUsername('');
      setSignupEmail('');
      setSignupPassword('');
    } catch (err: any) {
      setError(err.message ?? 'Registration failed. Try a different email or username.');
    } finally {
      setLoading(false);
    }
  };

  // Clear banners whenever the user switches tabs manually.
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setError('');
    if (value === 'signup') setSuccess('');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'radial-gradient(circle at center, #F5F0F6 0%, #E8D5EC 40%, #CDADD0 70%, #A5D3CF 100%)' }}
    >
      <CursorGlow color="rgba(180, 140, 191, 0.18)" size={500} />
      <FloatingParticles count={15} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Welcome */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="flex justify-center mb-4">
            
          </div>
          <motion.img
            src={fullLogoImage}
            alt="Flaire"
            className="mb-0 mx-auto h-25 max-w-[280px]"
            style={{ mixBlendMode: 'multiply' }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* Auth Card */}
        <FadeInView delay={0.3}>
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.3 }}
        >
        <Card className="border-0 shadow-2xl" style={{ boxShadow: '0 20px 60px rgba(114, 147, 187, 0.12)' }}>
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Welcome</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Find Rhythm in the Unpredictable</p>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                {success && (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 mb-4">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    {success}
                  </div>
                )}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full mt-6"
                    size="lg"
                    disabled={loading}
                    style={{ backgroundColor: '#7293BB' }}
                  >
                    {loading ? 'Logging in…' : 'Log In'}
                  </Button>
                </form>
                <div className="mt-4 text-center">
                  <button 
                    className="text-sm text-muted-foreground hover:underline"
                    style={{ color: '#7293BB' }}
                  >
                    Forgot password?
                  </button>
                </div>
              </TabsContent>

              {/* Signup Form */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-firstname">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-firstname"
                        type="text"
                        placeholder="Your first name"
                        className="pl-10"
                        value={signupFirstName}
                        onChange={(e) => setSignupFirstName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-username"
                        type="text"
                        placeholder="e.g. flaire_maya"
                        className={`pl-10 ${usernameInvalid ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                        value={signupUsername}
                        onChange={(e) => setSignupUsername(e.target.value)}
                        required
                      />
                    </div>
                    {usernameInvalid ? (
                      <p className="text-xs text-red-500">Username must be 3–32 characters</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">3–32 characters</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        className={`pl-10 ${passwordInvalid ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                      />
                    </div>
                    {passwordInvalid ? (
                      <p className="text-xs text-red-500">Password must be at least 8 characters</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                    )}
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full mt-6"
                    size="lg"
                    disabled={loading}
                    style={{ backgroundColor: '#7293BB' }}
                  >
                    {loading ? 'Creating account…' : 'Create Account'}
                  </Button>
                </form>
                <p className="text-xs text-center text-muted-foreground mt-4">
                  By signing up, you agree to our compassionate care philosophy
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        </motion.div>
        </FadeInView>

        {/* Footer */}
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <p className="text-sm text-white/80 text-[#fffffff0]">Understand your body, One day at a time</p>
        </motion.div>
      </div>
    </div>
  );
}