// components/attendance/QRCamera.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';

interface QRScannerProps {
  onScan: (studentId: string) => void;
  isScanning: boolean;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, isScanning }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative bg-black rounded-xl overflow-hidden w-full"
    >
      <motion.div
        className="w-full py-16 md:py-24 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900"
      >
        <div className="text-center text-white p-4 md:p-6">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-gray-600"
          >
            <Camera className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
          </motion.div>
          <p className="text-base md:text-lg font-bold mb-2">QR Scanner</p>
          <p className="text-xs md:text-sm text-gray-400">Camera feature coming soon</p>
          {isScanning && (
            <p className="text-xs text-blue-400 mt-3">Scanning: {isScanning ? 'Active' : 'Inactive'}</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QRScanner;