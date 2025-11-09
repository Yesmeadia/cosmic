'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '../ui/Button';

export const Hero: React.FC = () => {
  const router = useRouter();
  return (
    <section 
      className="container mx-auto px-6 py-20 relative"
      style={{
        backgroundImage: 'url(/bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-6">
            <Image
              src="/cosmic.png"
              alt="Cosmic Confluence"
              width={400}
              height={100}
              className="rounded-lg"
              priority
            />
          </div>
          <p className="text-xl text-white mb-600 mb-8">
            A session of talks and interaction of 2 young prodigies in physics, from India Mr. Sarim KhanUthar Pradesh and Mr. Habel Anwar from Kerala– popular for international grants and paper presentations – verily energizing sessions for the secondary level science enthusiastic students, especially physics and astronomy.
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
        </motion.div>
      </div>
    </section>
  );
};