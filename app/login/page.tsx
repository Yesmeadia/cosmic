'use client';

import { motion } from 'framer-motion';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center px-6"
    >
      <LoginForm />
    </motion.div>
  );
}