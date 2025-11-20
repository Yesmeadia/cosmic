'use client';

import React from 'react';
import { Users, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface AttendanceStatsProps {
  total: number;
  byClass: Record<string, number>;
}

export const AttendanceStatsCards: React.FC<AttendanceStatsProps> = ({ 
  total, 
  byClass 
}) => {
  const topClass = Object.entries(byClass)
    .sort(([, a], [, b]) => b - a)[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Total Present Today</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{total}</p>
          </div>
          <Users className="w-12 h-12 text-blue-500 opacity-20" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Top Class</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {topClass ? topClass[0] : 'N/A'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {topClass ? `${topClass[1]} students` : '-'}
            </p>
          </div>
          <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Today&lsquo;s Date</p>
            <p className="text-xl font-bold text-gray-900 mt-2">
              {new Date().toLocaleDateString()}
            </p>
          </div>
          <Calendar className="w-12 h-12 text-purple-500 opacity-20" />
        </div>
      </div>
    </motion.div>
  );
};