'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Download, RotateCcw } from 'lucide-react';

const ActionsSidebar = ({ attendanceList, onExport, onReset }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
        <div className="space-y-3">
          <button
            onClick={onExport}
            disabled={attendanceList.length === 0}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={onReset}
            disabled={attendanceList.length === 0}
            className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Today
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-3 border-b">
            <span className="text-gray-600">Marked Present</span>
            <span className="text-2xl font-bold text-green-600">{attendanceList.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Efficiency</span>
            <span className="text-lg font-semibold text-blue-600">100%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ActionsSidebar;