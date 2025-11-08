'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, School, DollarSign, Clock } from 'lucide-react';
import { Stats } from '@/types';

interface StatsCardsProps {
  stats: Stats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-gray-500 text-sm font-medium">Total Registrations</h3>
          <Users className="w-8 h-8 text-indigo-600" />
        </div>
        <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-gray-500 text-sm font-medium">Paid</h3>
          <DollarSign className="w-8 h-8 text-green-600" />
        </div>
        <p className="text-3xl font-bold text-green-600">
          {stats.byPaymentStatus?.paid || 0}
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-gray-500 text-sm font-medium">Pending</h3>
          <Clock className="w-8 h-8 text-yellow-600" />
        </div>
        <p className="text-3xl font-bold text-yellow-600">
          {stats.byPaymentStatus?.pending || 0}
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-gray-500 text-sm font-medium">Not Completed</h3>
          <School className="w-8 h-8 text-red-600" />
        </div>
        <p className="text-3xl font-bold text-red-600">
          {stats.byPaymentStatus?.['not-completed'] || 0}
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-green-100 text-sm font-medium">Total Revenue</h3>
          <DollarSign className="w-8 h-8 text-white" />
        </div>
        <p className="text-3xl font-bold">
          AED {(stats.byPaymentStatus?.paid || 0) * 100}
        </p>
        <p className="text-green-100 text-sm mt-1">
          ({stats.byPaymentStatus?.paid || 0} × AED 100)
        </p>
      </motion.div>
    </div>
  );
};