'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { CheckCircle, Briefcase, Zap, Star, Award, Users2 } from 'lucide-react';

const features = [
  { 
    title: 'Career Guidance', 
    desc: 'Expert counseling sessions for your future path',
    icon: Briefcase
  },
  { 
    title: 'Interactive Workshops', 
    desc: 'Hands-on learning in various subjects',
    icon: Zap
  },
  { 
    title: 'Networking', 
    desc: 'Connect with peers and industry professionals',
    icon: Users2
  },
  { 
    title: 'Skill Development', 
    desc: 'Enhance your academic and soft skills',
    icon: Star
  },
  { 
    title: 'Certificates', 
    desc: 'Receive participation certificates',
    icon: Award
  }
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const sectionHeader = (badge: string, title: string, subtitle: string) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="text-center mb-14"
  >
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold uppercase tracking-wider mb-4"
    >
      {badge}
    </motion.span>
    <motion.h2
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
      className="text-5xl md:text-6xl font-bold text-white mb-3"
    >
      {title}
    </motion.h2>
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="text-gray-400 text-base max-w-2xl mx-auto"
    >
      {subtitle}
    </motion.p>
  </motion.div>
);

export const Features: React.FC = () => {
  return (
    <section className="py-20 px-6 border-b border-white/5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto">
        {sectionHeader(" EXPERIENCE", "What You'll Experience", "Transformative opportunities await")}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group"
              >
                <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 h-full relative overflow-hidden">
                  <div className="absolute -top-8 -right-8 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors duration-300"></div>
                  
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4 border border-blue-400/30 relative z-10"
                  >
                    <Icon className="w-6 h-6 text-blue-400" />
                  </motion.div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    {feature.desc}
                  </p>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2 text-green-400 text-xs font-medium"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Included</span>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};