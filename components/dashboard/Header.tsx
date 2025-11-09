'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth';

export const Header: React.FC = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Logo */}
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden bg-gray-50 shadow-sm">
              <img 
                src="/logob.png" 
                alt="Company Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Admin Dashboard
            </h1>
          </div>

          {/* Logout Button - Redesigned */}
          <button
            onClick={handleLogout}
            className="group relative flex items-center gap-2 px-5 py-2.5 
                       bg-gradient-to-r from-rose-500 to-red-600 
                       hover:from-red-600 hover:to-red-700 
                       text-white font-semibold text-sm 
                       rounded-xl shadow-md hover:shadow-xl 
                       transition-all duration-300 ease-out
                       transform hover:-translate-y-0.5 active:scale-95"
          >
            <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:rotate-180" />
            <span>Logout</span>
            {/* subtle glow effect */}
            <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 bg-white transition-opacity duration-300" />
          </button>
        </div>
      </div>
    </header>
  );
};
