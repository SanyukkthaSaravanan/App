import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Heart, Mail, Lock, User, Chrome } from 'lucide-react';
import fullLogoImage from '../../imports/Flaire_name_logo_updated.png';
import { CursorGlow, FloatingParticles, FadeInView } from './motion-utils';

interface AuthProps {
  onLogin: (email: string, name: string) => void;
}

export function Auth({ onLogin }: AuthProps) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail && loginPassword) {
      // Mock login - just use email as name for simplicity
      const name = loginEmail.split('@')[0];
      onLogin(loginEmail, name);
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupName && signupEmail && signupPassword) {
      onLogin(signupEmail, signupName);
    }
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
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
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
                  <Button
                    type="submit"
                    className="w-full mt-6"
                    size="lg"
                    style={{ backgroundColor: '#7293BB' }}
                  >
                    Log In
                  </Button>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-muted-foreground">or</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={() => {
                      // Mock Google login
                      onLogin('google.user@example.com', 'Google User');
                    }}
                  >
                    <Chrome className="mr-2 h-5 w-5" />
                    Log In with Google
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
                    <Label htmlFor="signup-name">Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Your name"
                        className="pl-10"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        required
                      />
                    </div>
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
                        className="pl-10"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full mt-6"
                    size="lg"
                    style={{ backgroundColor: '#7293BB' }}
                  >
                    Create Account
                  </Button>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-muted-foreground">or</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={() => {
                      // Mock Google signup
                      onLogin('google.user@example.com', 'Google User');
                    }}
                  >
                    <Chrome className="mr-2 h-5 w-5" />
                    Sign Up with Google
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