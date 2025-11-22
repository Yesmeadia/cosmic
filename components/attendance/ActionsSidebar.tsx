// components/attendance/ActionsSidebar.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Download, RotateCcw } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  timestamp: Date;
}

interface ActionsSidebarProps {
  attendanceList: AttendanceRecord[];
  onExport: () => void;
  onReset: () => void;
}

const ActionsSidebar: React.FC<ActionsSidebarProps> = ({ 
  attendanceList, 
  onExport, 
  onReset 
}) => {
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
            type="button"
            onClick={onExport}
            disabled={attendanceList.length === 0}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            aria-label="Export attendance to CSV"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={onReset}
            disabled={attendanceList.length === 0}
            className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            aria-label="Reset today's attendance"
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
            <span className="text-2xl font-bold text-green-600">
              {attendanceList.length}
            </span>
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

// ============================================================
// components/attendance/StatsCards.tsx
'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, Calendar, Users, Clock, UserCheck, LucideIcon } from 'lucide-react';

interface Stats {
  total: number;
  marked: number;
  byClass: Record<string, number>;
  byParent: Record<string, number>;
}

interface StatsCardsProps {
  stats: Stats;
  currentTime: Date | null;
  isClient: boolean;
}

interface StatCard {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  subtitle?: string;
  isDate?: boolean;
  isTime?: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, currentTime, isClient }) => {
  // Memoized calculations
  const { parentCount, soloCount, percentage, topClass } = useMemo(() => {
    const solo = stats.byParent ? Number(stats.byParent['None']) || 0 : 0;
    const withParent = Number(stats.marked) - solo;
    const pct =
      stats.marked > 0 ? Math.round((withParent / stats.marked) * 100) : 0;
    const top =
      Object.entries(stats.byClass || {}).sort(([, a], [, b]) => Number(b) - Number(a))[0]?.[0] ||
      'N/A';
    return {
      parentCount: withParent,
      soloCount: solo,
      percentage: pct,
      topClass: top,
    };
  }, [stats]);

  const cards: StatCard[] = useMemo(() => [
    {
      title: 'Total Marked',
      value: stats.marked || 0,
      icon: Check,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'With Parents',
      value: parentCount || 0,
      icon: UserCheck,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      subtitle: `${percentage}% of total`,
    },
    {
      title: "Today's Date",
      value: isClient && currentTime ? currentTime.toLocaleDateString() : '-',
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      isDate: true,
    },
    {
      title: 'Current Time',
      value: isClient && currentTime ? currentTime.toLocaleTimeString() : '--:--:--',
      icon: Clock,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      isTime: true,
    },
    {
      title: 'Top Class',
      value: topClass,
      icon: Users,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
    },
  ], [stats.marked, parentCount, percentage, topClass, isClient, currentTime]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-8"
    >
      {cards.map((card, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.05 }}
          className={`${card.bgColor} rounded-lg shadow-md p-4 md:p-6 border border-gray-100`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wide truncate">
                {card.title}
              </p>
              <p
                className={`text-lg md:text-2xl lg:text-3xl font-bold mt-2 bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}
              >
                {card.value}
              </p>
              {card.subtitle && (
                <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
              )}
            </div>
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0 ml-2`}>
              <card.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default React.memo(StatsCards);

