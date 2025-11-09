'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Hero } from '@/components/home/Hero';
import { EventDetails } from '@/components/home/EventDetails';
import { Features } from '@/components/home/Features';
import { CTA } from '@/components/home/CTA';
import { FiMail, FiPhone, FiGlobe } from 'react-icons/fi'; 

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
          <div className="grid md:grid-cols-4 gap-8 mb-8 items-start">
            
            {/* Logo and Info */}
            <div className="space-y-4">
              <Image
                src="/logo.png"
                alt="YES India Foundation Logo"
                width={140}
                height={56}
                className="h-14 w-auto mx-auto md:mx-0"
              />
              <p className="text-purple-300 text-sm text-center md:text-left">
                An extraordinary event by YES India Foundation bringing excellence and innovation to young minds.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Contact</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-purple-300 text-sm hover:text-purple-200 transition-colors">
                  <FiMail className="text-purple-400 w-4 h-4" />
                  <a href="mailto:info@yesindiafoundation.com" className="hover:underline">
                    info@yesindiafoundation.com
                  </a>
                </li>
                <li className="flex items-center gap-2 text-purple-300 text-sm hover:text-purple-200 transition-colors">
                  <FiPhone className="text-purple-400 w-4 h-4" />
                  <a href="tel:+919682612659" className="hover:underline">
                    +91 968 2612 659
                  </a>
                </li>
                <li className="flex items-center gap-2 text-purple-300 text-sm hover:text-purple-200 transition-colors">
                  <FiGlobe className="text-purple-400 w-4 h-4" />
                  <a href="https://web.yesindiafoundation.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    web.yesindiafoundation.com
                  </a>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Follow Us</h3>
              <p className="text-purple-300 text-sm mb-2">#cosmicconfluence</p>
              <p className="text-purple-300 text-sm">#yesindiafoundation</p>
            </div>
          </div>

          {/* Bottom Line */}
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
