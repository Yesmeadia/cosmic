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
      className="relative flex items-center justify-center min-h-screen px-6 md:px-12 text-white"
      style={{
        backgroundImage: 'url(/bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/60" /> {/* optional overlay for better text contrast */}

      <div className="relative z-10 container mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-6">
            <Image
              src="/cosmic.png"
              alt="Cosmic Confluence"
              width={500}
              height={200}
              className="rounded-lg"
              priority
            />
          </div>

          <p className="text-xl mb-8 leading-relaxed">
            An event of talks and interaction by two prodigies of India - the Little Einstein Mr. Sarim Khan and Grant Awardee from George Mason University -USA, Mr. Habel Anwar - verily energizing sessions for the secondary level Science enthusiast students, especially in Quantum Physics and Astro-Physics.
          </p>

          <Button onClick={() => router.push('/register')} className="mt-4">
            Register Now →
          </Button>
        </motion.div>

        {/* Right Side Placeholder (for future image/animation/etc.) */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative hidden md:block"
        >
          {/* You can add an image, animation, or decorative element here */}
        </motion.div>
      </div>
    </section>
  );
};
