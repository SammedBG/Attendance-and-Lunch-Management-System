import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Utensils, UserCog, UserPlus } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isRegistering) {
        await api.post('/auth/register', { name, email, password });
        toast.success('Account created! Signing you in...');
      } else {
        toast.loading('Authenticating...', { id: 'login-toast' });
      }
      
      await login(email, password);
      toast.success('Welcome back!', { id: 'login-toast' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed', { id: 'login-toast' });
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 overflow-hidden relative">
      {/* Ambient Animated Blurred Orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-float pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px] animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[20%] right-[15%] w-[25%] h-[25%] bg-blue-500/15 rounded-full blur-[80px] animate-float pointer-events-none" style={{ animationDelay: '4s' }}></div>

      {/* Main Glass Panel */}
      <div className="glass-dark z-10 w-full max-w-5xl rounded-[2.5rem] flex flex-col md:flex-row overflow-hidden m-6 transition-all duration-700">
        
        {/* Left Presentation Side */}
        <div className="md:w-[45%] p-10 lg:p-16 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10 relative overflow-hidden bg-white/[0.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
          
          <h1 className="text-4xl lg:text-[42px] font-bold mb-6 text-white leading-tight z-10 tracking-tight">
            Lunch <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">&</span> Attendance
          </h1>
          <p className="text-base text-slate-300 mb-10 z-10 font-light leading-relaxed">
            Streamline your daily operations with an intelligent, elegant, and highly secure workspace ecosystem.
          </p>
          
          <div className="space-y-7 z-10">
            <div className="flex items-start space-x-4 opacity-80 hover:opacity-100 transition duration-300 group">
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl group-hover:scale-110 transition-transform shadow-[0_4px_20px_rgb(0,0,0,0.1)]">
                <Calendar className="h-6 w-6 text-indigo-300" />
              </div>
              <div className="pt-1">
                <h3 className="font-semibold text-white tracking-wide text-sm uppercase">Attendance Tracking</h3>
                <p className="text-slate-400 text-sm mt-0.5 font-light">Log operations smoothly.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 opacity-80 hover:opacity-100 transition duration-300 group">
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl group-hover:scale-110 transition-transform shadow-[0_4px_20px_rgb(0,0,0,0.1)]">
                <Utensils className="h-6 w-6 text-purple-300" />
              </div>
              <div className="pt-1">
                <h3 className="font-semibold text-white tracking-wide text-sm uppercase">Smart Catering</h3>
                <p className="text-slate-400 text-sm mt-0.5 font-light">Real-time lunch scaling.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 opacity-80 hover:opacity-100 transition duration-300 group">
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl group-hover:scale-110 transition-transform shadow-[0_4px_20px_rgb(0,0,0,0.1)]">
                <UserCog className="h-6 w-6 text-blue-300" />
              </div>
              <div className="pt-1">
                <h3 className="font-semibold text-white tracking-wide text-sm uppercase">Executive Dashboard</h3>
                <p className="text-slate-400 text-sm mt-0.5 font-light">High precision analytics.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Form Side */}
        <div className="md:w-[55%] p-10 lg:p-16 flex items-center justify-center bg-slate-900/40 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none"></div>
          
          <div className="w-full max-w-[380px] z-10">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-white tracking-tight">
                {isRegistering ? 'Create Profile' : 'Welcome Back'}
              </h2>
              <p className="text-slate-400 mt-2 font-light">
                {isRegistering ? 'Initialize your platform credentials' : 'Authenticate to access dashboards'}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {isRegistering && (
                <div className="space-y-1.5">
                  <label htmlFor="name" className="block text-xs font-semibold text-slate-300 uppercase tracking-widest ml-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isRegistering}
                    className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all shadow-inner"
                    placeholder="John Doe"
                  />
                </div>
              )}
              
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-semibold text-slate-300 uppercase tracking-widest ml-1">
                  Email Configuration
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all shadow-inner"
                  placeholder="name@company.com"
                />
              </div>
              
              <div className="space-y-1.5 pb-2">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-300 uppercase tracking-widest ml-1">
                  Secure Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all shadow-inner"
                  placeholder="••••••••"
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white py-4 rounded-2xl font-semibold tracking-wide transition-all duration-300 flex justify-center items-center shadow-[0_0_20px_rgb(99,102,241,0.3)] hover:shadow-[0_0_30px_rgb(99,102,241,0.5)] transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <>
                    {isRegistering ? (
                      <>
                        <UserPlus className="h-5 w-5 mr-2 opacity-80" />
                        Initialize Account
                      </>
                    ) : (
                      'Secure Login'
                    )}
                  </>
                )}
              </button>
              
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-slate-400 hover:text-white font-medium text-sm transition-colors border-b border-transparent hover:border-white pb-0.5"
                >
                  {isRegistering ? 'Already provisioned? Sign in' : 'Establish new credentials? Sign up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;