'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, Calendar, Users, Clock, UserCheck } from 'lucide-react';

const StatsCards = ({ stats, currentTime, isClient }) => {
  // Memoized calculations
  const { parentCount, soloCount, percentage, topClass } = useMemo(() => {
    const solo = stats.byParent ? stats.byParent['None'] || 0 : 0;
    const withParent = stats.marked - solo;
    const pct =
      stats.marked > 0 ? Math.round((withParent / stats.marked) * 100) : 0;
    const top =
      Object.entries(stats.byClass || {}).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      'N/A';

    return {
      parentCount: withParent,
      soloCount: solo,
      percentage: pct,
      topClass: top,
    };
  }, [stats]);

  const cards = [
    {
      title: 'Total Marked',
      value: stats.marked,
      icon: Check,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'With Parents',
      value: parentCount,
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
  ];

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

