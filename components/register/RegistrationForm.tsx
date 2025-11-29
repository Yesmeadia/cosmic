'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Home, Lock } from 'lucide-react';

export const RegistrationForm: React.FC = () => {
  const router = useRouter();

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed py-8 px-4"
      style={{ backgroundImage: 'url(/bg.jpg)' }}
    >
      <div className="min-h-screen bg-black/40 backdrop-blur-sm absolute inset-0" />

      <div className="max-w-3xl mx-auto relative z-10 flex flex-col items-center justify-center min-h-screen">
        {/* Closed Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 md:p-12 text-center max-w-md"
        >
          {/* Lock Icon */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div className="bg-red-100 p-6 rounded-full">
              <Lock className="w-12 h-12 text-red-600" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-gray-800 mb-4"
          >
            Registration Closed
          </motion.h1>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-gray-600 text-lg mb-6 leading-relaxed"
          >
            Thank you for your interest! Registration for this event has been closed and is no longer accepting new submissions.
          </motion.p>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mb-8"
          >
            <p className="text-sm text-amber-800">
              If you believe this is an error or have questions, please contact the YES India Foundation.
            </p>
          </motion.div>

          {/* Back to Home Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            onClick={() => router.push('/')}
            className="group relative w-full px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Back to Home</span>
          </motion.button>
        </motion.div>

        {/* Footer */}
        <footer className="text-center text-semibold text-white/80 mt-12 drop-shadow-lg absolute bottom-4">
          &copy; {new Date().getFullYear()} YES India Foundation. All rights reserved.
        </footer>
      </div>
    </div>
  );
};