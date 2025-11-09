'use client';
import { motion } from 'framer-motion';
import { RegistrationForm } from '@/components/register/RegistrationForm';

export default function RegisterPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: 'url(/bg.jpg)' }}
    >
      <div className="min-h-screen bg-black/50 backdrop-blur-sm">
        <RegistrationForm />
      </div>
    </motion.div>
  );
}