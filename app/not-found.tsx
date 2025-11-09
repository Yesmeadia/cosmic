'use client';
import { motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { Home, ArrowLeft, SearchX } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function NotFound() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [sparkles, setSparkles] = useState<{ left: string; top: string }[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    // Mark as mounted to prevent SSR mismatch
    // This effect runs only once after the initial render on the client.
    // The state update here is safe as it's not directly triggered by a prop/state change
    // that would cause a re-render loop. It's for client-side hydration.
    if (!isMounted) {
      setIsMounted(true);
    }

    // Generate random sparkle positions only on client
    const newSparkles = Array.from({ length: 15 }).map(() => ({ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }));
    setSparkles(newSparkles);
  }, [isMounted, pathname]); // Re-run if path changes or if it wasn't mounted initially

  const floatingShapes = [
    { size: 'w-72 h-72', position: 'top-0 -left-20', delay: 0, color: 'bg-indigo-500' },
    { size: 'w-96 h-96', position: 'bottom-0 -right-32', delay: 0.5, color: 'bg-purple-500' },
    { size: 'w-56 h-56', position: 'top-1/3 right-10', delay: 1, color: 'bg-pink-500' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-6">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/bg.jpg)' }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
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

      {/* Sparkle Effects - Only Render After Mount */}
      {isMounted &&
        sparkles.map((pos, i) => (
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
              delay: i * 0.2,
              repeat: Infinity,
              ease: "easeOut"
            }}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={pos}
          />
        ))}

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-2xl text-center"
      >
        {/* Glassmorphic Card */}
        <div className="relative">
          {/* Glow Effect */}
          <motion.div
            animate={{
              boxShadow: [
                '0 0 60px rgba(139, 92, 246, 0.3)',
                '0 0 100px rgba(168, 85, 247, 0.4)',
                '0 0 60px rgba(139, 92, 246, 0.3)',
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 rounded-3xl blur-xl"
          />

          <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl p-12 border border-white/20 shadow-2xl">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 mx-auto mb-6 flex items-center justify-center"
              >
                <img 
                  src="/cosmic.png" 
                  alt="Cosmic Logo" 
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              </motion.div>
            </motion.div>

            {/* 404 Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              <SearchX className="w-20 h-20 mx-auto text-purple-400" />
            </motion.div>

            {/* 404 Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-4">
                404
              </h1>
              <h2 className="text-3xl font-bold text-white mb-4">
                Page Not Found
              </h2>
              <p className="text-purple-200 text-lg mb-8 max-w-md mx-auto">
                Oops! The page you&apos;re looking for seems to have drifted into the cosmic void.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.button
                onClick={() => router.push('/')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/50 transition-all duration-300 flex items-center gap-2 group"
              >
                <Home className="w-5 h-5" />
                Go Home
              </motion.button>

              <motion.button
                onClick={() => router.back()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Go Back
              </motion.button>
            </motion.div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 text-purple-300/60 text-sm"
            >
              <p>Error Code: 404 - Page Not Found</p>
            </motion.div>
          </div>
        </div>

        {/* Bottom Decorative Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center text-purple-300/60 text-xs"
        >
          <p>Lost in space? We&apos;ll help you find your way back.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
