'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ChevronRight, ChevronLeft, X } from 'lucide-react';

interface Student {
  id: string;
  studentName: string;
  class: string;
  school: string;
  email?: string;
  mobile?: string;
  program?: string;
}

interface ParentAccompanimentProps {
  student: Student;
  onConfirm: (data: {
    attendingParent: string;
    parentVerified: boolean;
    program: string;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ParentAccompaniment: React.FC<ParentAccompanimentProps> = ({ 
  student, 
  onConfirm, 
  onCancel, 
  isLoading = false 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedParent, setSelectedParent] = useState('');
  const [isParentVerified, setIsParentVerified] = useState(false);
  const [customParent, setCustomParent] = useState('');

  const parentOptions = useMemo(() => [
    { key: 'Father', color: 'from-blue-400 to-blue-600'},
    { key: 'Mother', color: 'from-pink-400 to-pink-600'},
    { key: 'Both', color: 'from-purple-400 to-purple-600'},
    { key: 'Other', color: 'from-orange-400 to-orange-600'},
    { key: 'None', color: 'from-gray-400 to-gray-600'},
  ], []);



  const isValidStudent = useMemo(() => {
    return Boolean(student?.id && student?.studentName && student?.class && student?.school);
  }, [student]);

  const playWelcomeMessage = useCallback(() => {
    const message = `Welcome ${student.studentName} to the Cosmic Confluence`;
    
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Try to use an Indian English voice if available
    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find(voice => 
      voice.lang.startsWith('en-IN') || voice.name.includes('India')
    );
    
    if (indianVoice) {
      utterance.voice = indianVoice;
    } else {
      // Fallback to any English voice
      const englishVoice = voices.find(voice => voice.lang.startsWith('en-'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
    }
    
    window.speechSynthesis.speak(utterance);
  }, [student.studentName]);

  const handleConfirm = useCallback(() => {
    if (!isValidStudent) return;

    let finalParentType = selectedParent;
    if (selectedParent === 'Other' && customParent.trim()) {
      finalParentType = customParent.trim();
    }

    playWelcomeMessage();

    onConfirm({
      attendingParent: finalParentType,
      parentVerified: isParentVerified,
      program: student?.program || 'Cosmic Confluence',
    });
  }, [selectedParent, customParent, isParentVerified, student, onConfirm, isValidStudent, playWelcomeMessage]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onCancel();
    }
  }, [isLoading, onCancel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, onCancel]);

  const isConfirmDisabled = isLoading || (selectedParent === 'Other' && !customParent.trim());

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
      >
        <div 
          className="h-20 bg-cover bg-center relative overflow-hidden"
          style={{ backgroundImage: 'url(/bg.jpg)' }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-4">
            <h1 className="text-lg font-bold">
              {currentStep === 1 ? 'STUDENT VERIFICATION' : 'ACCOMPANIMENT'}
            </h1>
            <p className="text-sm text-white/90 mt-1">
              {currentStep === 1 ? 'Verify student details' : 'Select accompanying person'}
            </p>
          </div>

          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
            {[1, 2].map((step) => (
              <div
                key={step}
                className={`h-1 rounded-full transition-all ${
                  currentStep >= step ? 'bg-white w-6' : 'bg-white/40 w-2'
                }`}
              />
            ))}
          </div>

          <button
            onClick={onCancel}
            disabled={isLoading}
            className="absolute top-3 right-3 text-white hover:bg-white/20 p-1 rounded-full transition-all disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {currentStep === 1 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 space-y-3">
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                      Student Verification
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {student.studentName}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                      <p className="font-semibold text-gray-500">Class</p>
                      <p className="font-bold text-gray-900">{student.class}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                      <p className="font-semibold text-gray-500">School</p>
                      <p className="font-bold text-gray-900">{student.school}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                      <p className="font-semibold text-gray-500">Mobile</p>
                      <p className="font-bold text-blue-600">{student.mobile || 'N/A'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                      <p className="font-semibold text-gray-500">ID</p>
                      <p className="font-bold text-gray-900">{student.id.substring(0, 7)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={onCancel}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={isLoading || !isValidStudent}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {parentOptions.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setSelectedParent(option.key)}
                      disabled={isLoading}
                      aria-label={`Select ${option.key} as accompanying parent`}
                      className={`relative p-4 rounded-xl transition-all ${
                        selectedParent === option.key
                          ? `bg-gradient-to-br ${option.color} text-white shadow-lg`
                          : 'bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-900'
                      } disabled:opacity-50`}
                    >
                      <div className="text-center">
                        <div className="font-semibold text-sm">{option.key}</div>
                      </div>
                      
                      {selectedParent === option.key && (
                        <div className="absolute -top-1 -right-1 bg-white rounded-full p-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {selectedParent === 'Other' && (
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Specify relationship:
                    </label>
                    <input
                      type="text"
                      value={customParent}
                      onChange={(e) => setCustomParent(e.target.value)}
                      placeholder="e.g., Grandfather, Aunt, Guardian..."
                      autoFocus
                      disabled={isLoading}
                      className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm disabled:opacity-50"
                    />
                  </div>
                )}

                {selectedParent !== 'None' && (
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isParentVerified}
                        onChange={(e) => setIsParentVerified(e.target.checked)}
                        disabled={isLoading}
                        className="w-5 h-5 text-yellow-600 rounded focus:ring-2 focus:ring-yellow-500 mt-0.5 flex-shrink-0"
                      />
                      <div>
                        <span className="block font-bold text-yellow-900 text-sm">
                          Parent(s) also participating
                        </span>
                        <p className="text-yellow-800 text-xs mt-1">
                          Check if accompanying parent(s) will participate in activities
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setCurrentStep(1)}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={isConfirmDisabled}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" /> Confirm
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ParentAccompaniment;