'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, Shield, Sparkles, Eye, EyeOff } from 'lucide-react';
import { signIn } from '@/lib/auth';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await signIn(email, password);
    
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Invalid credentials');
    }
    
    setLoading(false);
  };

  return (
    <div className="relative">
      {/* Glow Effect */}
      <motion.div
        animate={{
          boxShadow: [
            '0 0 60px rgba(139, 92, 246, 0.3)',
            '0 0 100px rgba(168, 85, 247, 0.4)',
            '0 0 60px rgba(139, 92, 246, 0.3)',
          ]
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute inset-0 rounded-3xl blur-xl"
      />

      <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 mx-auto mb-4 flex items-center justify-center"
          >
            <img 
              src="/cosmic.png" 
              alt="Cosmic Logo" 
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </motion.div>
          
          <h2 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            Admin Portal
          </h2>
          <p className="text-purple-200 text-sm">Secure access to your dashboard</p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 text-sm backdrop-blur-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <div className="space-y-6">
          {/* Email Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-purple-200 text-sm font-medium mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
              <motion.input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput('')}
                placeholder="admin@event.com"
                required
                whileFocus={{ scale: 1.01 }}
                className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 transition-all backdrop-blur-sm"
              />
              {focusedInput === 'email' && (
                <motion.div
                  layoutId="inputGlow"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 -z-10 blur-xl"
                />
              )}
            </div>
          </motion.div>

          {/* Password Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-purple-200 text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
              <motion.input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput('')}
                placeholder="••••••••"
                required
                whileFocus={{ scale: 1.01 }}
                className="w-full pl-12 pr-12 py-4 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 transition-all backdrop-blur-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
              {focusedInput === 'password' && (
                <motion.div
                  layoutId="inputGlow"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 -z-10 blur-xl"
                />
              )}
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            onClick={handleSubmit}
            disabled={loading}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/50 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                Signing in...
              </>
            ) : (
              <>
                Access Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>
        </div>

        {/* Back to Home Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <button
            onClick={() => router.push('/')}
            className="text-purple-300 hover:text-white text-sm font-medium transition-colors inline-flex items-center gap-1 group"
          >
            <motion.span
              className="group-hover:-translate-x-1 transition-transform"
            >
              ←
            </motion.span>
            Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
};