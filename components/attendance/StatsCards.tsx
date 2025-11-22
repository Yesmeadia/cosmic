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
  totalParticipation?: number;
}

interface StatCard {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  subtitle?: string;
  isDateTime?: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, currentTime, isClient, totalParticipation = 0 }) => {
  const { parentCount, percentage } = useMemo(() => {
    const solo = stats.byParent ? Number(stats.byParent['None']) || 0 : 0;
    const withParent = Number(stats.marked) - solo;
    const pct = stats.marked > 0 ? Math.round((withParent / stats.marked) * 100) : 0;
    
    return {
      parentCount: withParent,
      percentage: pct,
    };
  }, [stats]);

  const cards: StatCard[] = useMemo(() => [
    {
      title: 'Total Marked',
      value: stats.marked || 0,
      icon: Check,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200',
    },
    {
      title: 'With Parents',
      value: parentCount || 0,
      icon: UserCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 border-purple-200',
      subtitle: `${percentage}% of total`,
    },
    {
      title: 'Total Participation',
      value: totalParticipation || 0,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 border-indigo-200',
      subtitle: `${stats.marked || 0} student(s) + ${Math.max(0, totalParticipation - (stats.marked || 0))} accompanying`,
    },
    {
      title: "Today's Date",
      value: isClient && currentTime ? currentTime.toLocaleDateString('en-IN') : '-',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200',
      isDateTime: true,
    },
    {
      title: 'Current Time',
      value: isClient && currentTime ? currentTime.toLocaleTimeString('en-IN') : '--:--:--',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-200',
      isDateTime: true,
    },
  ], [stats.marked, parentCount, percentage, totalParticipation, isClient, currentTime]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 lg:grid-cols-5 md:grid-cols-3 gap-3 sm:gap-4 mb-8"
    >
      {cards.map((card, idx) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.1 }}
          className={`${card.bgColor} rounded-xl border-2 p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow ${
            card.isDateTime ? 'col-span-2 sm:col-span-1' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                {card.title}
              </p>
              <p className={`text-lg sm:text-xl font-bold ${card.color} mb-1`}>
                {card.value}
              </p>
              {card.subtitle && (
                <p className="text-xs text-gray-500">{card.subtitle}</p>
              )}
            </div>
            <div className={`p-2 rounded-lg ${card.color} bg-white bg-opacity-50`}>
              <card.icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StatsCards;