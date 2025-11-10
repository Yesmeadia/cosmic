'use client';
import { motion } from 'framer-motion';
import { LoginForm } from '@/components/auth/LoginForm';
import { useState, useEffect } from 'react';

export default function LoginPage() {
  const floatingShapes = [
    { size: 'w-72 h-72', position: 'top-0 -left-20', delay: 0, color: 'bg-indigo-500' },
    { size: 'w-96 h-96', position: 'bottom-0 -right-32', delay: 0.5, color: 'bg-purple-500' },
    { size: 'w-56 h-56', position: 'top-1/3 right-10', delay: 1, color: 'bg-pink-500' },
  ];

  // Fixed sparkle positions that are consistent between server and client
  const fixedSparklePositions = [
    { left: '10%', top: '20%' },
    { left: '85%', top: '15%' },
    { left: '25%', top: '80%' },
    { left: '75%', top: '70%' },
    { left: '50%', top: '10%' },
    { left: '15%', top: '50%' },
    { left: '90%', top: '40%' },
    { left: '30%', top: '30%' },
    { left: '70%', top: '85%' },
    { left: '5%', top: '75%' },
    { left: '95%', top: '25%' },
    { left: '40%', top: '60%' },
    { left: '60%', top: '45%' },
    { left: '20%', top: '90%' },
    { left: '80%', top: '5%' },
    { left: '35%', top: '15%' },
    { left: '65%', top: '55%' },
    { left: '45%', top: '35%' },
    { left: '55%', top: '75%' },
    { left: '12%', top: '25%' },
  ];

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-6">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/bg.jpg)' }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Animated Background Shapes */}
      {floatingShapes.map((shape, idx) => (
        <motion.div
          key={idx}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 20,
            delay: shape.delay,
            repeat: Infinity,
            ease: "linear"
          }}
          className={`absolute ${shape.size} ${shape.position} ${shape.color} rounded-full blur-3xl`}
        />
      ))}

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

      {/* Sparkle Effects with fixed positions */}
      {fixedSparklePositions.map((position, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            y: [0, -100],
          }}
          transition={{
            duration: 3,
            delay: i * 0.3,
            repeat: Infinity,
            ease: "easeOut"
          }}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: position.left,
            top: position.top,
          }}
        />
      ))}

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm"
      >
        <LoginForm />

        {/* Footer with Cyberduce Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-purple-300/60 text-xs mb-2">
            <span>Secured with enterprise-grade encryption</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-purple-300/80 text-xs">
            <span>Design and Developed by</span>
            <div className="flex items-center gap-1">
              <img 
                src="/cyberduce-logo.png" 
                alt="Cyberduce" 
                className="h-4 w-auto opacity-80 hover:opacity-100 transition-opacity"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<span class="text-purple-400 font-semibold">Cyberduce</span>';
                  }
                }}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}