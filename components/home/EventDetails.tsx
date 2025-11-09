'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

const details = [
  { icon: Calendar, title: 'Date', value: 'November 30, 2025', color: 'indigo' },
  { icon: Clock, title: 'Time', value: '9:00 AM - 1:00 PM', color: 'purple' },
  { icon: MapPin, title: 'Venue', value: 'Grand Arena, Al-Wahda Mall, Abu Dhabi', color: 'pink' },
  { icon: Users, title: 'Expected', value: 'Only For 100 participants', color: 'blue' }
];

export const EventDetails: React.FC = () => {
  return (
    <section className="container mx-auto px-6 py-16">
      <motion.h3
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="text-3xl font-bold text-center text-white mb-12"
      >
        Event Highlights
      </motion.h3>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {details.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
          >
            <item.icon className={`w-10 h-10 text-${item.color}-600 mb-4`} />
            <h4 className="text-gray-500 text-sm font-medium mb-1">{item.title}</h4>
            <p className="text-gray-800 font-bold text-lg">{item.value}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
