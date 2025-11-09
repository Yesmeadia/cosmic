'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock } from 'lucide-react';

interface SuccessMessageProps {
  isWaitlist?: boolean;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ isWaitlist = false }) => {
  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed flex items-center justify-center px-4"
      style={{ backgroundImage: 'url(/bg.jpg)' }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-12 text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            {isWaitlist ? (
              <Clock className="w-24 h-24 text-amber-500 mx-auto mb-6" />
            ) : (
              <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
            )}
          </motion.div>
          
          <h2 className={`text-3xl font-bold mb-3 ${isWaitlist ? 'text-amber-600' : 'text-gray-800'}`}>
            {isWaitlist ? 'Added to Waitlist!' : 'Registration Successful!'}
          </h2>
          
          {isWaitlist ? (
            <>
              <p className="text-gray-700 mb-3 font-medium">
                Thank you for registering with us.
              </p>
              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-amber-800 text-sm mb-2">
                  <strong>Regular registrations are currently full (100/100).</strong>
                </p>
                <p className="text-amber-700 text-sm">
                  You have been added to our waitlist. We will notify you via email and WhatsApp if a spot becomes available.
                </p>
              </div>
              <p className="text-gray-500 text-sm mb-8">
                We&apos;ll keep you updated on your waitlist status.
              </p>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-2">
                Thank you for registering with us.
              </p>
              <p className="text-gray-500 text-sm mb-8">
                We&apos;ll send you a confirmation email shortly.
              </p>
            </>
          )}
          
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.5, duration: 3 }}
            className={`h-1 rounded-full mb-4 ${
              isWaitlist 
                ? 'bg-gradient-to-r from-amber-500 to-orange-600' 
                : 'bg-gradient-to-r from-indigo-600 to-green-600'
            }`}
          />
          <p className="text-sm text-gray-400">Redirecting to home...</p>
        </motion.div>
      </motion.div>
    </div>
  );
};