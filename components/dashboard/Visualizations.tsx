'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Stats } from '@/types';

interface VisualizationsProps {
  stats: Stats;
}

export const Visualizations: React.FC<VisualizationsProps> = ({ stats }) => {
  return (
    <div className="grid md:grid-cols-3 gap-6 mt-8">
      {/* Class Distribution */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Class Distribution
        </h3>
        <div className="space-y-3">
          {Object.entries(stats.byClass).map(([cls, count]) => (
            <div key={cls}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Class {cls}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {count} ({Math.round((count / stats.total) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / stats.total) * 100}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Parent Attendance */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Parent Attendance
        </h3>
        <div className="space-y-3">
          {Object.entries(stats.byParent).map(([parent, count]) => (
            <div key={parent}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {parent}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {count} ({Math.round((count / stats.total) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / stats.total) * 100}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="bg-gradient-to-r from-pink-600 to-purple-600 h-2 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Status */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Payment Status
        </h3>
        <div className="space-y-3">
          {Object.entries(stats.byPaymentStatus || {}).map(([status, count]) => {
            const colorMap = {
              paid: 'from-green-500 to-emerald-500',
              pending: 'from-yellow-500 to-orange-500',
              'not-completed': 'from-red-500 to-rose-500'
            };

            const labelMap = {
              paid: 'Paid',
              pending: 'Pending',
              'not-completed': 'Not Completed'
            };

            return (
              <div key={status}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {labelMap[status as keyof typeof labelMap]}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {count} ({Math.round((count / stats.total) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / stats.total) * 100}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className={`bg-gradient-to-r ${colorMap[status as keyof typeof colorMap]} h-2 rounded-full`}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Revenue Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total Revenue</span>
            <span className="text-2xl font-bold text-green-600">
              AED {(stats.byPaymentStatus?.paid || 0) * 100}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Based on {stats.byPaymentStatus?.paid || 0} paid registrations @ AED 100 each
          </p>
        </div>
      </div>
    </div>
  );
};