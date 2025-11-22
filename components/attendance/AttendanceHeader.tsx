'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { QrCode } from 'lucide-react';

const AttendanceHeader: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 sm:mb-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-2 sm:p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg w-fit"
        >
          <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </motion.div>
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Attendance Marking System
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 sm:mt-2">
            Scan QR codes to mark student attendance - YES INDIA FOUNDATION
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AttendanceHeader;