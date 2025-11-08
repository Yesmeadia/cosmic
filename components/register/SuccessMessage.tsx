'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export const SuccessMessage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
        </motion.div>

        <h2 className="text-3xl font-bold text-gray-800 mb-3">
          Registration Successful!
        </h2>
        <p className="text-gray-600 mb-2">
          Thank you for registering with us.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          We&apos;ll send you a confirmation email shortly.
        </p>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.5, duration: 3 }}
          className="h-1 bg-gradient-to-r from-indigo-600 to-green-600 rounded-full mb-4"
        />
        <p className="text-sm text-gray-400">Redirecting to home...</p>
      </motion.div>
    </motion.div>
  );
};
