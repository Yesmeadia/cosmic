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
            <div className="w-20 h-20 flex items-center justify-center">
              <img 
                src="/logob.png" 
                alt="Company Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Cosmic Dashboard
            </h1>
          </div>

          {/* Logout Button - Redesigned */}
          <button
            onClick={handleLogout}
            className="group flex items-center gap-3 px-6 py-3 
                       bg-white border-2 border-red-500
                       hover:bg-red-500 
                       text-red-500 hover:text-white 
                       font-semibold text-sm 
                       rounded-lg shadow-sm hover:shadow-md 
                       transition-all duration-300 ease-in-out
                       transform hover:scale-105 active:scale-95"
          >
            <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};