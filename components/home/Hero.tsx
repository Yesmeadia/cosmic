'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '../ui/Button';

export const Hero: React.FC = () => {
  const router = useRouter();

  return (
    <section className="container mx-auto px-6 py-20">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-5xl font-bold text-gray-800 mb-6">
            Transform Your Future at
            <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              EduFest 2025
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join us for an inspiring educational event featuring workshops, seminars, 
            and interactive sessions designed for students from classes 9th to 12th.
          </p>
          <Button onClick={() => router.push('/register')}>
            Register Now →
          </Button>
        </motion.div>

        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
            <Image
              src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600"
              alt="Students learning"
              className="rounded-xl w-full"
              width={600}
              height={400}
              priority
            />
        </motion.div>
      </div>
    </section>
  );
};