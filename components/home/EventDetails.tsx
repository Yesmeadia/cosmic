'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, Award, Star, GraduationCap, Rocket } from 'lucide-react';

interface Presenter {
  name: string;
  photo: string;
  bio: string;
  role: string;
  achievement: string;
}

interface EventDetail {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
}

const presenters: Presenter[] = [
  {
    name: 'Sarim Khan',
    photo: '/1.png',
    bio: 'The Little Einstein, a young prodigy from India excelling in advanced scientific concepts and innovation.',
    role: 'Young Prodigy',
    achievement: 'Scientific Innovator'
  },
  {
    name: 'Habel Anwar',
    photo: '/2.png',
    bio: 'Grant Awardee from George Mason University, USA, known for his groundbreaking research in astrophysics and quantum mechanics.',
    role: 'Research Scholar',
    achievement: 'George Mason University'
  }
];

const eventDetailsData: EventDetail[] = [
  { icon: Calendar, title: 'Date', value: 'November 30, 2025' },
  { icon: Clock, title: 'Time', value: '9:00 AM - 1:00 PM' },
  { icon: MapPin, title: 'Venue', value: 'Grand Arena, Al-Wahda Mall, Abu Dhabi' },
  { icon: Users, title: 'Expected', value: 'Only For 100 participants' }
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30, 
    scale: 0.9 
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.6, 
      ease: "easeOut" 
    },
  },
};

const imageVariants: Variants = {
  hidden: { 
    scale: 1.1, 
    opacity: 0 
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { 
      duration: 0.8, 
      ease: "easeOut" 
    }
  },
  hover: {
    scale: 1.05,
    transition: { 
      duration: 0.4 
    }
  }
};

interface SectionHeaderProps {
  badge: string;
  title: string;
  subtitle: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ badge, title, subtitle }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="text-center mb-20"
  >
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-300 text-sm font-semibold uppercase tracking-wider mb-6"
    >
      <Star className="w-4 h-4" />
      {badge}
    </motion.span>
    <motion.h2
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
      className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-4"
    >
      {title}
    </motion.h2>
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed"
    >
      {subtitle}
    </motion.p>
  </motion.div>
);

export const EventDetails: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/30">
      {/* PRESENTERS SECTION */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeader 
            badge="FEATURED SPEAKERS" 
            title="Meet Our Presenters" 
            subtitle="Extraordinary minds pushing the boundaries of science and innovation" 
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto"
          >
            {presenters.map((presenter, idx) => (
              <motion.div
                key={presenter.name}
                variants={itemVariants}
                whileHover="hover"
                className="group relative"
              >
                {/* Background Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-700 opacity-0 group-hover:opacity-100" />
                
                {/* Main Card */}
                <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-white/5 group-hover:border-white/10 transition-all duration-500">
                  
                  {/* Content Layout */}
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    
                    {/* Image Container */}
                    <motion.div 
                      className="relative flex-shrink-0"
                      variants={imageVariants}
                    >
                      {/* Outer Glow Ring */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                      
                      {/* Image with Gradient Border */}
                      <div className="relative p-1 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-2xl">
                        <motion.img
                          src={presenter.photo}
                          alt={presenter.name}
                          width={200}
                          height={240}
                          className="w-[200px] h-[240px] object-cover rounded-xl relative z-10 bg-gray-700"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.3 }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDIwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xMDAgMTIwTDE0MCA4MEwxMDAgNDBMNjAgODBMMTAwIDEyMFoiIGZpbGw9IiA2QjcyOEYiLz4KPC9zdmc+';
                          }}
                        />
                        
                        {/* Shine Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/0 rounded-xl z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                      
                      {/* Decorative Elements */}
                      <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.5 + idx * 0.2, duration: 0.5 }}
                        className="absolute -top-2 -right-2 z-30"
                      >
                        <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-2 rounded-full shadow-lg">
                          <Award className="w-4 h-4 text-white" />
                        </div>
                      </motion.div>
                    </motion.div>

                    {/* Text Content */}
                    <div className="flex-1 text-center md:text-left">
                      {/* Role Badge */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 mb-4"
                      >
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        <span className="text-blue-300 text-xs font-semibold uppercase tracking-wide">
                          {presenter.role}
                        </span>
                      </motion.div>

                      {/* Name */}
                      <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + idx * 0.1 }}
                        className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300"
                      >
                        {presenter.name}
                      </motion.h3>

                      {/* Achievement */}
                      <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 + idx * 0.1 }}
                        className="text-amber-400 text-sm font-semibold mb-4 flex items-center gap-2 justify-center md:justify-start"
                      >
                        {presenter.name === 'Sarim Khan' ? (
                          <>
                            <Rocket className="w-4 h-4" />
                            {presenter.achievement}
                          </>
                        ) : (
                          <>
                            <GraduationCap className="w-4 h-4" />
                            {presenter.achievement}
                          </>
                        )}
                      </motion.p>

                      {/* Bio */}
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + idx * 0.1 }}
                        className="text-gray-300 leading-relaxed mb-6 text-sm md:text-base"
                      >
                        {presenter.bio}
                      </motion.p>

                      {/* Specialized Tags */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.6 + idx * 0.1 }}
                        className="flex flex-wrap gap-3 justify-center md:justify-start"
                      >
                        {presenter.name === 'Sarim Khan' ? (
                          <>
                            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                              <Star className="w-3 h-3 text-green-400" />
                              <span className="text-green-300 text-xs font-medium">Young Genius</span>
                            </div>
                            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30">
                              <Rocket className="w-3 h-3 text-blue-400" />
                              <span className="text-blue-300 text-xs font-medium">Innovation</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
                              <GraduationCap className="w-3 h-3 text-purple-400" />
                              <span className="text-purple-300 text-xs font-medium">Research</span>
                            </div>
                            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30">
                              <Award className="w-3 h-3 text-amber-400" />
                              <span className="text-amber-300 text-xs font-medium">Grant Awardee</span>
                            </div>
                          </>
                        )}
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* EVENT DETAILS SECTION */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <SectionHeader 
            badge="EVENT INFO" 
            title="Event Highlights" 
            subtitle="Join us for an exclusive gathering of brilliant minds and groundbreaking ideas" 
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {eventDetailsData.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group"
                >
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/80 backdrop-blur-xl rounded-2xl p-8 border border-white/5 hover:border-white/10 transition-all duration-500 h-full relative overflow-hidden">
                    {/* Animated Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Animated Side Bar */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-500" />
                    
                    <Icon className="w-10 h-10 text-blue-400 mb-4 group-hover:scale-110 group-hover:text-purple-400 transition-all duration-300 relative z-10" />
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 relative z-10">{item.title}</p>
                    <p className="text-white font-bold text-lg relative z-10">{item.value}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </div>
  );
};