'use client';
import React, { useState } from 'react';
import { LogOut, QrCode, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOut } from '@/lib/auth';

export const Header: React.FC = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Logo */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="w-12 h-12 sm:w-16 md:w-20 sm:h-16 md:h-20 flex items-center justify-center flex-shrink-0">
              <img 
                src="/logob.png" 
                alt="Company Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">
              Cosmic Dashboard
            </h1>
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-4">
            {/* Attendance Link */}
            <Link 
              href="/attendance"
              className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 whitespace-nowrap"
            >
              <QrCode className="w-5 h-5 flex-shrink-0" />
              <span>Attendance</span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="group flex items-center gap-3 px-6 py-3 
                         bg-white border-2 border-red-500
                         hover:bg-red-500 
                         text-red-500 hover:text-white 
                         font-semibold text-sm 
                         rounded-lg shadow-sm hover:shadow-md 
                         transition-all duration-300 ease-in-out
                         transform hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu - Shown when open */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 flex flex-col gap-3 border-t border-gray-200 pt-4">
            <Link 
              href="/attendance"
              className="flex items-center gap-2 px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 w-full justify-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <QrCode className="w-5 h-5" />
              <span>Attendance</span>
            </Link>

            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="group flex items-center gap-3 px-6 py-3 
                         bg-white border-2 border-red-500
                         hover:bg-red-500 
                         text-red-500 hover:text-white 
                         font-semibold text-sm 
                         rounded-lg shadow-sm hover:shadow-md 
                         transition-all duration-300 ease-in-out
                         w-full justify-center"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};