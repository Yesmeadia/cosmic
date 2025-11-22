// components/attendance/ParentAccompaniment.jsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  X,
} from 'lucide-react';

const ParentAccompaniment = ({ 
  student, 
  onConfirm, 
  onCancel, 
  isLoading = false 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedParent, setSelectedParent] = useState('');
  const [isParentVerified, setIsParentVerified] = useState(false);
  const [customParent, setCustomParent] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Memoized parent options to prevent unnecessary re-renders
  const parentOptions = useMemo(
    () => [
      { key: 'Father', color: 'from-blue-400 to-blue-600' },
      { key: 'Mother', color: 'from-pink-400 to-pink-600' },
      { key: 'Both', color: 'from-purple-400 to-purple-600' },
      { key: 'Other', color: 'from-orange-400 to-orange-600' },
      { key: 'None', color: 'from-gray-400 to-gray-600' },
    ],
    []
  );

  // Safe mobile detection with SSR compatibility
  useEffect(() => {
    setHasMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Initialize selected parent from student data
  useEffect(() => {
    if (student?.attendingParent) {
      setSelectedParent(student.attendingParent);
    } else {
      setSelectedParent('None');
    }
  }, [student]);

  // Validate student data
  const isValidStudent = useMemo(() => {
    return Boolean(
      student?.id && 
      student?.studentName && 
      student?.class && 
      student?.school && 
      student?.mobile
    );
  }, [student]);

  // Handle confirmation with validation
  const handleConfirm = useCallback(() => {
    if (!isValidStudent) {
      console.error('Invalid student data');
      return;
    }

    let finalParentType = selectedParent;
    if (selectedParent === 'Other' && customParent.trim()) {
      finalParentType = customParent.trim();
    }

    onConfirm({
      attendingParent: finalParentType,
      parentVerified: isParentVerified,
      program: student?.program || 'Cosmic Confluence',
    });
  }, [selectedParent, customParent, isParentVerified, student, onConfirm, isValidStudent]);

  // Safe backdrop click handler
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onCancel();
    }
  }, [isLoading, onCancel]);

  // Keyboard event handler for accessibility
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && !isLoading) {
      onCancel();
    }
  }, [isLoading, onCancel]);

  // Add global keyboard listener
  useEffect(() => {
    if (hasMounted) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown, hasMounted]);

  // Step 1: Student Verification
  const Step1Verification = useCallback(
    () => (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
        role="tabpanel"
        aria-labelledby="step1-title"
      >
        {/* Student Information Card */}
        <div 
          className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 space-y-3"
          data-testid="student-info-card"
        >
          <div className="text-center">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
              Student Verification
            </p>
            <p className="text-lg font-bold text-gray-900 truncate" title={student?.studentName}>
              {student?.studentName || 'N/A'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white rounded-lg p-2 text-center shadow-sm">
              <p className="font-semibold text-gray-500">Class</p>
              <p className="font-bold text-gray-900 truncate" title={student?.class}>
                {student?.class || 'N/A'}
            </p>
            </div>
            <div className="bg-white rounded-lg p-2 text-center shadow-sm">
              <p className="font-semibold text-gray-500">School</p>
              <p className="font-bold text-gray-900 truncate" title={student?.school}>
                {student?.school || 'N/A'}
              </p>
            </div>
            <div className="bg-white rounded-lg p-2 text-center shadow-sm">
              <p className="font-semibold text-gray-500">Mobile Number</p>
              <p className="font-bold text-blue-600 truncate" title={student?.mobile}>
                {student?.mobile || 'N/A'}
              </p>
            </div>
            <div className="bg-white rounded-lg p-2 text-center shadow-sm">
              <p className="font-semibold text-gray-500">ID</p>
              <p className="font-bold text-gray-900 truncate" title={student?.id}>
                {student?.id?.substring(0, 7) || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            aria-label="Cancel verification"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            disabled={isLoading || !isValidStudent}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Proceed to parent selection"
          >
            Next
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>
      </motion.div>
    ),
    [student, onCancel, isLoading, isValidStudent]
  );

  // Step 2: Parent Accompaniment Selection
  const Step2Accompaniment = useCallback(() => {
    const isConfirmDisabled = 
      isLoading || 
      (selectedParent === 'Other' && !customParent.trim());

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
        role="tabpanel"
        aria-labelledby="step2-title"
      >
        {/* Parent Selection Grid */}
        <div 
          className={`grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}
          role="radiogroup"
          aria-labelledby="parent-selection-label"
        >
          <span id="parent-selection-label" className="sr-only">
            Select accompanying parent
          </span>
          {parentOptions.map((option) => (
            <motion.button
              key={option.key}
              type="button"
              onClick={() => setSelectedParent(option.key)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className={`relative p-3 rounded-lg transition-all duration-200 overflow-hidden ${
                selectedParent === option.key
                  ? `bg-gradient-to-br ${option.color} shadow scale-105`
                  : 'bg-white border border-gray-200 hover:border-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              role="radio"
              aria-checked={selectedParent === option.key}
              aria-label={`Select ${option.key}`}
            >
              <div className="relative z-10 text-center">
                <div
                  className={`text-sm font-bold ${
                    selectedParent === option.key
                      ? 'text-white'
                      : 'text-gray-900'
                  }`}
                >
                  {option.key}
                </div>
              </div>

              {selectedParent === option.key && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 bg-white rounded-full p-0.5"
                  aria-hidden="true"
                >
                  <CheckCircle className="w-3 h-3 text-green-500" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Custom Parent Input */}
        <AnimatePresence mode="wait">
          {selectedParent === 'Other' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-orange-50 border border-orange-200 rounded-lg p-3"
            >
              <label 
                htmlFor="customParent" 
                className="block text-xs font-semibold text-gray-900 mb-2"
              >
                Specify relationship:
              </label>
              <input
                id="customParent"
                type="text"
                value={customParent}
                onChange={(e) => setCustomParent(e.target.value)}
                placeholder="e.g., Grandfather, Aunt, Family Friend"
                autoFocus
                disabled={isLoading}
                maxLength={50}
                className="w-full px-3 py-2 border border-orange-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                aria-required="true"
                aria-describedby="custom-parent-hint"
              />
              <p id="custom-parent-hint" className="sr-only">
                Please specify your relationship to the student
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Parent Participation Checkbox */}
        <AnimatePresence mode="wait">
          {selectedParent !== 'None' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-300 rounded-lg p-3"
            >
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isParentVerified}
                  onChange={(e) => setIsParentVerified(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 text-yellow-600 rounded focus:ring-1 focus:ring-yellow-500 mt-0.5 flex-shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                  aria-describedby="parent-participation-hint"
                />
                <div className="flex-1 min-w-0">
                  <span className="block font-bold text-yellow-900 text-xs mb-1">
                    Parent(s) also participating
                  </span>
                  <p 
                    id="parent-participation-hint" 
                    className="text-yellow-800 text-xs leading-relaxed"
                  >
                    Check if accompanying parent(s) will participate in activities.
                  </p>
                </div>
              </label>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            disabled={isLoading}
            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            aria-label="Go back to student verification"
          >
            <ChevronLeft className="w-3 h-3" aria-hidden="true" />
            Back
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white text-sm rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            aria-label={isConfirmDisabled ? 'Please fill all required fields to confirm' : 'Confirm parent accompaniment'}
          >
            {isLoading ? (
              <>
                <div 
                  className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" 
                  aria-hidden="true"
                />
                <span>Processing</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3 h-3" aria-hidden="true" />
                Confirm
              </>
            )}
          </button>
        </div>
      </motion.div>
    );
  }, [
    isMobile,
    selectedParent,
    parentOptions,
    isParentVerified,
    customParent,
    isLoading,
    handleConfirm,
  ]);

  // Don't render until mounted (SSR compatibility)
  if (!hasMounted) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 md:p-4 z-50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      data-testid="parent-accompaniment-modal"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3, type: 'spring', damping: 25 }}
        className="bg-white rounded-xl md:rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Background */}
        <div 
          className="h-20 relative overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: 'url(/bg.jpg)' }}
          role="banner"
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
          
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-4">
            <h1 id="modal-title" className="text-lg md:text-xl font-bold drop-shadow">
              {currentStep === 1 ? 'STUDENT VERIFICATION' : 'ACCOMPANIMENT'}
            </h1>
            <p className="text-xs text-white/90 mt-0.5 font-medium">
              {currentStep === 1 ? 'Verify student details' : 'Select accompanying person'}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
            {[1, 2].map((step) => (
              <motion.div
                key={step}
                className={`h-1 rounded-full transition-all duration-300 ${
                  currentStep >= step ? 'bg-white w-5' : 'bg-white/40 w-1'
                }`}
                aria-hidden="true"
              />
            ))}
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="absolute top-2 right-2 text-white hover:bg-white/20 p-1 rounded-full transition-all z-20 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            {currentStep === 1 ? (
              <Step1Verification key="step1" />
            ) : (
              <Step2Accompaniment key="step2" />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default React.memo(ParentAccompaniment);