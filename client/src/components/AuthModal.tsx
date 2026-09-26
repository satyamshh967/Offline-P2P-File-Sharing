import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  User as UserIcon, 
  ArrowRight, 
  Radio, 
  Check, 
  AlertCircle,
  Wifi,
  Sparkles
} from 'lucide-react';
import { authService } from '../services/auth';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (user: User) => void;
  onClose?: () => void;
  canDismiss?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
  canDismiss = false
}) => {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('satyam');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('drive123');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [avatarColor, setAvatarColor] = useState<string>('#2563eb');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const avatarColors = [
    '#2563eb', // Blue
    '#7c3aed', // Purple
    '#db2777', // Pink
    '#e11d48', // Rose
    '#ea580c', // Orange
    '#d97706', // Amber
    '#059669', // Emerald
    '#0891b2', // Cyan
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Please enter your full name');
        if (!email.trim() || !email.includes('@')) throw new Error('Please enter a valid email address');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        if (password !== confirmPassword) throw new Error('Passwords do not match');

        const user = await authService.register(username, name, email, password, avatarColor);
        onSuccess(user);
      } else {
        if (!username.trim() || !password) throw new Error('Please enter your username and password');
        const user = await authService.login(username, password);
        onSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const guest = authService.continueAsGuest();
    onSuccess(guest);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="p-8 sm:p-10 space-y-6">
          {/* Google Drive Logo & Header */}
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md border border-slate-100 bg-white mb-4">
              <img 
                src="/logo.png" 
                alt="Drive P2P Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {isRegister ? 'Create your Drive Account' : 'Sign in to Drive P2P'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              to continue to your offline peer-to-peer cloud
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Satyam Sharma"
                    className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">
                {isRegister ? 'Username' : 'Username or Email'}
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={isRegister ? "satyam" : "satyam or satyam@offline.p2p"}
                  className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="satyam@offline.p2p"
                    className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isRegister && (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1.5 block">Choose Avatar Color</label>
                  <div className="flex items-center gap-2">
                    {avatarColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setAvatarColor(color)}
                        style={{ backgroundColor: color }}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                          avatarColor === color ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'hover:scale-105'
                        }`}
                      >
                        {avatarColor === color && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {!isRegister && (
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Demo account: <strong>satyam</strong> / <strong>drive123</strong></span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle between Register and Login */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            {isRegister ? (
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError('');
                }}
                className="font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                Already have an account? Sign in
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError('');
                }}
                className="font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                Create account
              </button>
            )}

            <button
              type="button"
              onClick={handleGuestLogin}
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
              <span>Offline Guest</span>
            </button>
          </div>
        </div>

        {/* Google Style Footer */}
        <div className="px-8 py-3.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Drive P2P Security</span>
          <div className="flex items-center gap-3">
            <span>Offline Ready</span>
            <span>•</span>
            <span>Zero Cloud</span>
          </div>
        </div>
      </div>
    </div>
  );
};
