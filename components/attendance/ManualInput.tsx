// components/attendance/ManualInput.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, User, School, BookOpen } from 'lucide-react';

interface Student {
  id: string;
  studentName: string;
  class: string;
  school: string;
}

interface ManualQRInputProps {
  onScan: (data: string) => void;
  isLoading: boolean;
  onSearch?: (searchTerm: string) => void;
  searchResults?: Student[];
}

const ManualInput: React.FC<ManualQRInputProps> = ({ 
  onScan, 
  isLoading,
  onSearch,
  searchResults = []
}) => {
  const [qrValue, setQrValue] = useState('');
  const [showResults, setShowResults] = useState(false);
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
    if (qrValue.trim()) {
      onScan(qrValue.trim());
      setQrValue('');
      setShowResults(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit();
    }
  };

  const handleInputChange = (value: string) => {
    setQrValue(value);
    if (onSearch && value.length >= 2) {
      onSearch(value);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleStudentSelect = (student: Student) => {
    onScan(student.id);
    setQrValue('');
    setShowResults(false);
  };

  return (
    <div className="space-y-4" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={qrValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter Student ID or search..."
          className="w-full px-4 py-2.5 md:py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm md:text-base disabled:opacity-50 pr-12"
          autoFocus
          disabled={isLoading}
        />
        <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
        
        {isLoading && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((student) => (
            <button
              key={student.id}
              onClick={() => handleStudentSelect(student)}
              className="w-full p-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm md:text-base text-gray-900 truncate">
                    {student.studentName}
                  </p>
                  <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1">
                    <BookOpen className="w-3 h-3" />
                    <span>{student.class}</span>
                    <School className="w-3 h-3 ml-1" />
                    <span className="truncate">{student.school}</span>
                  </div>
                </div>
                <div className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded hidden md:block">
                  {student.id.substring(0, 7)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Quick Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isLoading || !qrValue.trim()}
        className="w-full px-4 py-2.5 md:py-3 bg-blue-600 text-white rounded-xl text-sm md:text-base font-semibold hover:bg-blue-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Validating...
          </div>
        ) : (
          'Mark Attendance'
        )}
      </button>
    </div>
  );
};

export default ManualInput;