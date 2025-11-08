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
    <div className="bg-white shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center text-red-600 hover:text-red-800 font-medium transition-colors"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
