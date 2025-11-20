// app/attendance/page.jsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { QrCode, AlertCircle, Check, Volume2 } from 'lucide-react';
import {
  getStudentByQRCode,
  markAttendance,
  getTodaysAttendance,
  getAttendanceStats,
  exportAttendanceToCSV,
  AttendanceRecord as LibAttendanceRecord,
} from '@/lib/attendance';
import QRScanner from '@/components/attendance/QRCamera';
import AttendanceHeader from '@/components/attendance/AttendanceHeader';
import StatsCards from '@/components/attendance/StatsCards';
import ManualQRInput from '@/components/attendance/ManualInput';
import ActionsSidebar from '@/components/attendance/ActionsSidebar';
import AttendanceList from '@/components/attendance/AttendanceList';
import ParentAccompaniment from '@/components/attendance/ParentAccompaniment';
 
type AttendanceRecord = LibAttendanceRecord;

export default function AttendancePage() {
  const [isScanning, setIsScanning] = useState(false);
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    marked: 0,
    byClass: {},
    byParent: {},
  });
  const [scanResult, setScanResult] = useState(null);
  const [useManualInput, setUseManualInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showParentModal, setShowParentModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoized refs for performance
  const scanTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const processedStudentsRef = useRef<Set<string>>(new Set());

  // Initialize on mount
  useEffect(() => {
    setIsClient(true);
    setCurrentTime(new Date());
    loadInitialData();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load initial data with optimized parallel fetching
  const loadInitialData = useCallback(async () => {
    try {
      const [attendanceResult, statsResult] = await Promise.all([
        getTodaysAttendance(50),
        getAttendanceStats(),
      ]);

      if (attendanceResult.success && attendanceResult.records) {
        setAttendanceList(attendanceResult.records);
        // Build processed set for duplicate prevention
        processedStudentsRef.current = new Set(
          attendanceResult.records.map((r) => r.studentId)
        );
      }

      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats);
      }

      setIsInitialized(true);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load attendance data');
    }
  }, []);

  // Memoized scan handler
  const handleScan = useCallback(
    async (qrCode: string) => {
      if (isLoading || !isInitialized) return;

      // Prevent duplicate scans within 2 seconds
      const studentId = qrCode.substring(0, 7).toUpperCase();
      if (processedStudentsRef.current.has(studentId)) {
        setScanResult({
          status: 'warning',
          message: 'This student is already marked today',
        });
        setTimeout(() => setScanResult(null), 3000);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fast validation
        if (!qrCode || qrCode.length < 7) {
          setScanResult({
            status: 'error',
            message: 'Invalid QR code format',
          });
          setIsLoading(false);
          setTimeout(() => setScanResult(null), 3000);
          return;
        }

        const studentResult = await getStudentByQRCode(qrCode);

        if (!studentResult.success || !studentResult.student) {
          setScanResult({
            status: 'error',
            message: `Student not found: ${studentId}`,
          });
          setIsLoading(false);
          setTimeout(() => setScanResult(null), 3000);
          return;
        }

        // Mark as processing
        processedStudentsRef.current.add(studentId);

        setSelectedStudent(studentResult.student);
        setShowParentModal(true);
        setIsLoading(false);
      } catch (err) {
        console.error('Error processing student:', err);
        setError('Error processing student data. Please try again.');
        setScanResult({
          status: 'error',
          message: 'Error processing data',
        });
        processedStudentsRef.current.delete(studentId);
        setIsLoading(false);
        setTimeout(() => setScanResult(null), 3000);
      }
    },
    [isLoading, isInitialized]
  );

  // Optimized parent confirmation
  const handleParentConfirm = useCallback(
    async (parentData) => {
      if (!selectedStudent) return;

      setIsLoading(true);

      try {
        const markResult = await markAttendance(selectedStudent.id, {
          studentId: selectedStudent.id,
          studentName: selectedStudent.studentName,
          class: selectedStudent.class,
          school: selectedStudent.school,
          email: selectedStudent.email,
          date: new Date().toLocaleDateString(),
          attendingParent: parentData.attendingParent,
          parentVerified: parentData.parentVerified,
          program: parentData.program,
        });

        if (!markResult.success) {
          setScanResult({
            status: 'warning',
            message: markResult.message,
          });
          processedStudentsRef.current.delete(selectedStudent.id);
          setIsLoading(false);
          setTimeout(() => setScanResult(null), 3000);
          return;
        }

        // Update local state
        const newRecord: AttendanceRecord = {
          id: markResult.data?.id,
          studentId: selectedStudent.id,
          studentName: selectedStudent.studentName,
          class: selectedStudent.class,
          school: selectedStudent.school,
          email: selectedStudent.email,
          date: new Date().toLocaleDateString(),
          timestamp: new Date(),
          attendingParent: parentData.attendingParent,
          parentVerified: parentData.parentVerified,
          program: parentData.program,
        };

        setAttendanceList((prev) => [newRecord, ...prev]);

        // Update stats
        setStats((prev) => {
          const byClass = { ...prev.byClass };
          const byParent = { ...prev.byParent };

          byClass[selectedStudent.class] =
            (byClass[selectedStudent.class] || 0) + 1;
          byParent[parentData.attendingParent] =
            (byParent[parentData.attendingParent] || 0) + 1;

          return {
            ...prev,
            total: prev.total + 1,
            marked: prev.marked + 1,
            byClass,
            byParent,
          };
        });

        // Show success
        setScanResult({
          status: 'success',
          message: `Welcome ${selectedStudent.studentName}`,
          student: selectedStudent.studentName,
          class: selectedStudent.class,
          parent: parentData.attendingParent,
          parentVerified: parentData.parentVerified,
          program: parentData.program,
        });

        playWelcomeMessage(selectedStudent.studentName, parentData.program);
        setTimeout(() => setScanResult(null), 5000);
      } catch (err) {
        console.error('Error marking attendance:', err);
        setError('Error marking attendance');
        processedStudentsRef.current.delete(selectedStudent.id);
        setScanResult({
          status: 'error',
          message: 'Error marking attendance',
        });
        setTimeout(() => setScanResult(null), 3000);
      } finally {
        setIsLoading(false);
        setShowParentModal(false);
        setSelectedStudent(null);
      }
    },
    [selectedStudent]
  );

  const handleParentCancel = useCallback(() => {
    if (selectedStudent) {
      processedStudentsRef.current.delete(selectedStudent.id);
    }
    setShowParentModal(false);
    setSelectedStudent(null);
    setIsLoading(false);
  }, [selectedStudent]);

  // Play welcome message
  const playWelcomeMessage = useCallback((studentName, program = 'Cosmic Confluence') => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();

    const message = new SpeechSynthesisUtterance();
    message.text = `Welcome ${studentName} for the ${program} program`;
    message.rate = 0.9;

    // Get all available voices
    const voices = window.speechSynthesis.getVoices();

    // Try to find Indian English voices
    const indianVoice =
      voices.find(v => v.lang === 'en-IN') ||      // Native Indian English voice
      voices.find(v => v.name.toLowerCase().includes('india')) || 
      voices.find(v => v.name.toLowerCase().includes('indian')) ||
      voices.find(v => v.lang.startsWith('en'));   // fallback to any English voice

    if (indianVoice) {
      message.voice = indianVoice;
    }

    window.speechSynthesis.speak(message);
  }
}, []);


  // Export attendance
  const handleExport = useCallback(async () => {
    try {
      const csv = await exportAttendanceToCSV();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export attendance');
    }
  }, []);

  // Reset attendance
  const handleReset = useCallback(() => {
    if (confirm('Are you sure you want to reset all attendance for today?')) {
      setAttendanceList([]);
      setStats({ total: 0, marked: 0, byClass: {}, byParent: {} });
      processedStudentsRef.current.clear();
      setScanResult(null);
    }
  }, []);

  if (!isInitialized || !isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading attendance system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <AttendanceHeader />

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        <StatsCards stats={stats} currentTime={currentTime} isClient={isClient} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Scanner Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <QrCode className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg md:text-xl font-bold text-gray-900">
                  {useManualInput ? 'Manual Input' : 'QR Scanner'}
                </h2>
              </div>

              {!useManualInput && (
                <>
                  <QRScanner onScan={handleScan} isScanning={isScanning} />
                  <button
                    onClick={() => setIsScanning(!isScanning)}
                    disabled={isLoading}
                    className={`mt-4 w-full px-4 py-3 rounded-lg font-medium transition-colors text-sm md:text-base ${
                      isScanning
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    } disabled:bg-gray-400`}
                  >
                    {isScanning ? 'Stop Scanning' : 'Start Scanning'}
                  </button>
                </>
              )}

              {useManualInput && (
                <ManualQRInput onScan={handleScan} isLoading={isLoading} />
              )}

              <button
                onClick={() => {
                  setIsScanning(false);
                  setUseManualInput(!useManualInput);
                }}
                disabled={isLoading}
                className="mt-4 w-full px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors disabled:text-gray-400 text-sm md:text-base"
              >
                {useManualInput ? 'Use Camera Scanner' : 'Use Manual Input'}
              </button>

              {/* Scan Result */}
              {scanResult && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-6 p-4 rounded-lg flex items-center gap-3 text-sm md:text-base ${
                    scanResult.status === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : scanResult.status === 'warning'
                      ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {scanResult.status === 'success' ? (
                    <>
                      <Check className="w-5 h-5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold">{scanResult.message}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs md:text-sm">
                          <span>Class: {scanResult.class}</span>
                          <span>•</span>
                          <span>With: {scanResult.parent}</span>
                          {scanResult.parentVerified && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600 font-medium">
                                Parent Participating
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          playWelcomeMessage(scanResult.student, scanResult.program)
                        }
                        className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 transition-colors"
                        title="Play welcome message"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p className="font-semibold">{scanResult.message}</p>
                    </>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>

          <ActionsSidebar
            attendanceList={attendanceList}
            onExport={handleExport}
            onReset={handleReset}
          />
        </div>

        <AttendanceList attendanceList={attendanceList} />

        {showParentModal && selectedStudent && (
          <ParentAccompaniment
            student={selectedStudent}
            onConfirm={handleParentConfirm}
            onCancel={handleParentCancel}
            isLoading={isLoading}
          />
        )}
      </div>
      <footer className="text-center text-blue-900 text-bold py-6 mt-12">
        &copy; {new Date().getFullYear()} YES INDIA FOUNDATION. All Rights Reserved.
      </footer>
    </div>
  );
}