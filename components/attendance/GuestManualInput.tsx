// components/attendance/GuestManualInput.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, User, CheckCircle, XCircle } from 'lucide-react';

interface Guest {
  id: string;
  guestName: string;
  guestPhone: string;
  status: string;
}

interface GuestManualInputProps {
  onGuestFound?: (guest: Guest) => void;
  onGuestVerified?: (guest: Guest) => void;
  isLoading: boolean;
  onSearch?: (searchTerm: string) => void;
  searchResults?: Guest[];
}

const GuestManualInput: React.FC<GuestManualInputProps> = ({ 
  onGuestFound,
  onGuestVerified,
  isLoading,
  onSearch,
  searchResults = []
}) => {
  const [idValue, setIdValue] = useState('');
  const [foundGuest, setFoundGuest] = useState<Guest | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'input' | 'verify' | 'success'>('input');
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = () => {
    if (idValue.trim()) {
      onSearch?.(idValue.trim());
      setShowResults(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit();
    }
  };

  const handleInputChange = (value: string) => {
    setIdValue(value);
    if (onSearch && value.length >= 1) {
      onSearch(value);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleGuestSelect = (guest: Guest) => {
    setFoundGuest(guest);
    setVerificationStep('verify');
    setIdValue('');
    setShowResults(false);
    onGuestFound?.(guest);
  };

  const handleVerifyConfirm = () => {
    if (foundGuest) {
      setVerificationStep('success');
      onGuestVerified?.(foundGuest);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setFoundGuest(null);
        setVerificationStep('input');
      }, 2000);
    }
  };

  const handleVerifyCancel = () => {
    setFoundGuest(null);
    setVerificationStep('input');
    setIdValue('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked-in':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'checked-out':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    }
  };

  return (
    <div className="space-y-4" ref={searchRef}>
      {/* Input Step */}
      {verificationStep === 'input' && (
        <>
          <div className="relative">
            <input
              type="text"
              value={idValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter Guest ID or search..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm md:text-base disabled:opacity-50"
              autoFocus
              disabled={isLoading}
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            
            {isLoading && (
              <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-72 overflow-y-auto top-16">
              {searchResults.map((guest) => (
                <button
                  key={guest.id}
                  onClick={() => handleGuestSelect(guest)}
                  className="w-full p-3 text-left hover:bg-green-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm md:text-base text-gray-900">
                        {guest.guestName}
                      </p>
                      <p className="text-xs md:text-sm text-gray-600 mt-0.5">
                        Phone: {guest.guestPhone}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {guest.id.substring(0, 7)}
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded border ${getStatusColor(guest.status)}`}>
                        {guest.status === 'checked-in' ? 'In' : guest.status === 'checked-out' ? 'Out' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Quick Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || !idValue.trim()}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-xl text-sm md:text-base font-semibold hover:bg-green-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Searching...
              </div>
            ) : (
              'Search Guest'
            )}
          </button>
        </>
      )}

      {/* Verification Step */}
      {verificationStep === 'verify' && foundGuest && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border-2 border-green-300 rounded-xl p-4 md:p-6 bg-gradient-to-br from-green-50 to-emerald-50"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-green-700" />
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="text-xs md:text-sm text-gray-600 font-medium mb-1">VERIFY GUEST</p>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{foundGuest.guestName}</h3>
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                ID: {foundGuest.id.substring(0, 7)}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-2">Phone: {foundGuest.guestPhone}</p>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleVerifyConfirm}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg text-sm md:text-base font-semibold hover:bg-green-700 transition-all disabled:bg-gray-400 shadow-lg flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Confirm & Mark Attended
            </button>
            <button
              onClick={handleVerifyCancel}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Success Step */}
      {verificationStep === 'success' && foundGuest && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border-2 border-green-400 rounded-xl p-4 md:p-6 bg-gradient-to-br from-green-100 to-emerald-100"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-14 h-14 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg md:text-xl font-bold text-green-800">✓ Marked Attended</p>
            <p className="text-sm text-green-700 mt-2">{foundGuest.guestName}</p>
            <p className="text-xs text-green-600 mt-1">
              Time: {new Date().toLocaleTimeString('en-IN')}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Add motion import
import { motion } from 'framer-motion';

export default GuestManualInput;