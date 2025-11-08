'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
    >
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin Login</h2>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@event.com"
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Signing in...' : 'Login'}
        </Button>
      </form>

      <button
        onClick={() => router.push('/')}
        className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 w-full text-center"
      >
        ← Back to Home
      </button>
    </motion.div>
  );
};