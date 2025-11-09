'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';

export const CTA: React.FC = () => {
  const router = useRouter();

  return (
    <section className="container mx-auto px-6 py-20 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
      >
        <h3 className="text-4xl font-bold text-gray-800 mb-6">Ready to Join Us?</h3>
        <p className="text-xl text-gray-600 mb-8">
          Admission: only for the firstly registered 100 students of Grades 9th to 12th. 
        </p>
        <Button 
          onClick={() => router.push('/register')}
          className="px-12 py-5 text-xl"
        >
          Register Now →
        </Button>
      </motion.div>
    </section>
  );
};