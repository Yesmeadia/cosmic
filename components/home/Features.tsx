'use client';

import React from 'react';
import { motion } from 'framer-motion';

const features = [
  { title: 'Career Guidance', desc: 'Expert counseling sessions for your future career path' },
  { title: 'Interactive Workshops', desc: 'Hands-on learning experiences in various subjects' },
  { title: 'Networking', desc: 'Connect with peers and industry professionals' },
  { title: 'Skill Development', desc: 'Enhance your academic and soft skills' },
  { title: 'Certificates', desc: 'Receive participation certificates' }
];

export const Features: React.FC = () => {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-6">
        <motion.h3
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center text-gray-800 mb-12"
        >
          What You&#39;ll Experience
        </motion.h3>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-xl border-2 border-indigo-100 hover:border-indigo-300 transition-all"
            >
              <h4 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h4>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};