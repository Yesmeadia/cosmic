'use client';

import React from 'react';
import { motion } from 'framer-motion';

const AttendanceFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="mt-8 sm:mt-12 border-t border-gray-200 bg-white"
    >
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs sm:text-sm text-blue-900">
            © {currentYear} YES INDIA FOUNDATION. All Rights Reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default AttendanceFooter;