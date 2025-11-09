'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Hero } from '@/components/home/Hero';
import { EventDetails } from '@/components/home/EventDetails';
import { Features } from '@/components/home/Features';
import { CTA } from '@/components/home/CTA';
import { User, UserPlus } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-slate-900"
    >
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center"
            >
              <Image
                src="/logo.png"
                alt="Logo"
                width={120}
                height={48}
                className="h-12 w-auto"
                priority
              />
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Page Sections */}
      <Hero />
      <EventDetails />
      <Features />
      <CTA />

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-purple-500/30 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Cosmic Confluence</h3>
              <p className="text-purple-300 text-sm">
                An extraordinary event by YES India Foundation bringing excellence and innovation to young minds.
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Contact</h3>
              <p className="text-purple-300 text-sm mb-2">
                Email: info@yesindiafoundation.com
              </p>
              <p className="text-purple-300 text-sm">
                Website: www.yesindiafoundation.com
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Follow Us</h3>
              <p className="text-purple-300 text-sm mb-2">#cosmicconfluence</p>
              <p className="text-purple-300 text-sm">#yesindiafoundation</p>
            </div>
          </div>
          <div className="border-t border-purple-500/30 pt-8 text-center">
            <p className="text-purple-400 text-sm">
              © 2025 YES India Foundation. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}