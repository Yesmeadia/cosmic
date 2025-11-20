// components/AttendanceHeader.jsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { QrCode } from 'lucide-react';

const AttendanceHeader = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-blue-600 rounded-lg">
          <QrCode className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Marking System</h1>
          <p className="text-gray-600">Scan QR codes to mark student attendance - YES INDIA FOUNDATION</p>
        </div>
      </div>
    </motion.div>
  );
};

export default AttendanceHeader;