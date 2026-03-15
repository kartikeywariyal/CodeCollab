import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, User, ArrowRight, Github, X } from 'lucide-react';

export const Auth = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = location.pathname === '/signin';

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [identifier, setIdentifier] = useState(''); // email or username (login)
  const [email, setEmail] = useState('');            // email (signup only)
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const endpoint = isLogin ? '/login' : '/signup';
      const payload = isLogin
        ? { identifier, password }
        : { name, username, email, password };

      const apiUrl = import.meta.env.VITE_API_URL || 'https://codecollab-1-yuns.onrender.com';
      const response = await axios.post(`${apiUrl}${endpoint}`, payload);

      const { token, user } = response.data;

      // Store token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Update app state
      onLogin(user);

      navigate('/');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIdentifier('');
    setEmail('');
    setPassword('');
    setName('');
    setUsername('');
    setErrorMsg('');
  }, [isLogin]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md animate-fade-in z-10 relative">

        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute -top-12 right-0 text-white/50 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 p-2 rounded-full transition-all hover:scale-110 active:scale-95 z-50"
        >
          <X size={18} />
        </button>

        {/* Logo/Brand Area */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              C
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gradient">CodeCollab</h1>
          </div>
          <p className="text-white/60 text-center text-sm">
            {isLogin ? 'Welcome back, developer.' : 'Join the next generation of coding.'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-card p-8">

          {/* Tabs */}
          <div className="flex p-1 bg-black/40 rounded-xl mb-8 relative">
            <button
              onClick={() => navigate('/signin')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 z-10 ${isLogin ? 'text-white' : 'text-white/50 hover:text-white/80'
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 z-10 ${!isLogin ? 'text-white' : 'text-white/50 hover:text-white/80'
                }`}
            >
              Sign Up
            </button>

            {/* Tab Indicator Pill */}
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-surface-hover rounded-lg transition-transform duration-300 ease-out pointer-events-none border border-white/5`}
              style={{ transform: isLogin ? 'translateX(0)' : 'translateX(100%)' }}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm animate-fade-in text-center">
                {errorMsg}
              </div>
            )}

            {/* Name input (Sign Up Only) */}
            <div
              className={`transition-all duration-300 overflow-hidden ${!isLogin ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Full Name"
                  className="glass-input pl-11"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                />
              </div>
            </div>

            {/* Username input (Sign Up Only) */}
            <div
              className={`transition-all duration-300 overflow-hidden ${!isLogin ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                  <span className="text-sm font-bold">@</span>
                </div>
                <input
                  type="text"
                  placeholder="Username (e.g. kartik99)"
                  className="glass-input pl-11"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={!isLogin}
                />
              </div>
            </div>

            <div className="relative delay-100 animate-fade-in">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                <Mail size={18} />
              </div>
              {isLogin ? (
                <input
                  type="text"
                  placeholder="Email or Username"
                  className="glass-input pl-11"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              ) : (
                <input
                  type="email"
                  placeholder="Email Address"
                  className="glass-input pl-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              )}
            </div>

            <div className="relative delay-200 animate-fade-in">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                <Lock size={18} />
              </div>
              <input
                type="password"
                placeholder="Password"
                className="glass-input pl-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {isLogin && (
              <div className="flex justify-end pt-1 delay-200 animate-fade-in">
                <a href="#" className="text-xs text-primary hover:text-primary-hover transition-colors">
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full mt-6 delay-300 animate-fade-in group"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

          </form>

          <div className="mt-6 flex items-center justify-between delay-300 animate-fade-in">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs text-white/40 px-4 uppercase tracking-wider">Or continue with</span>
            <div className="h-px bg-border flex-1" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 delay-300 animate-fade-in">
            <button type="button" className="btn-secondary text-sm">
              <Github size={18} />
              GitHub
            </button>
            <button type="button" className="btn-secondary text-sm">
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
          </div>

        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-white/40 mt-8">
          By signing up, you agree to our <a href="#" className="text-white/60 hover:text-white transition-colors">Terms of Service</a> and <a href="#" className="text-white/60 hover:text-white transition-colors">Privacy Policy</a>
        </p>

      </div>
    </div>
  );
};
