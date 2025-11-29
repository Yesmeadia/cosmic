// components/attendance/AttendanceSection.tsx (Updated)
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle} from 'lucide-react';
import AttendanceHeader from './AttendanceHeader';
import Footer from './Footer';
import StatsCards from './StatsCards';
import QRScanner from './QRCamera';
import ManualQRInput from './ManualInput';
import ParentAccompaniment from './ParentAccompaniment';
import AttendanceList from './AttendanceList';
import ActionsSidebar from './ActionsSidebar';
import GuestManagement from './GuestManagement';
import { 
  getStudentByQRCode, 
  markAttendance, 
  getTodaysAttendance,
  searchStudents
} from '@/lib/attendance';

interface Student {
  id: string;
  studentName: string;
  class: string;
  school: string;
  email?: string;
  mobile?: string;
  program?: string;
  gender?: string;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  school: string;
  email: string;
  date: string;
  timestamp: Date;
  attendingParent: string;
  parentVerified: boolean;
  program: string;
  gender?: string;
}

interface ScanResult {
  status: 'success' | 'warning' | 'error';
  message: string;
  student?: string;
  class?: string;
}

interface Stats {
  total: number;
  marked: number;
  byClass: Record<string, number>;
  byParent: Record<string, number>;
}

type TabType = 'attendance' | 'guests';

const AttendanceSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('attendance');
  const [isScanning, setIsScanning] = useState(false);
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    marked: 0,
    byClass: {},
    byParent: {}
  });
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [useManualInput, setUseManualInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showParentModal, setShowParentModal] = useState(false);
  const [searchResults, setSearchResults] = useState<Student[]>([]);

  useEffect(() => {
    setIsClient(true);
    setCurrentTime(new Date());
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadTodaysAttendance();
  }, []);

  const totalParticipation = useMemo(() => {
    return attendanceList.reduce((total, record) => {
      let count = 1;
      if (record.attendingParent !== 'None') {
        if (record.attendingParent === 'Both') {
          count += 2;
        } else {
          count += 1;
        }
      }
      return total + count;
    }, 0);
  }, [attendanceList]);

  const loadTodaysAttendance = async () => {
    try {
      const result = await getTodaysAttendance();
      if (result.success && result.records) {
        const records: AttendanceRecord[] = result.records.map((record: any) => ({
          ...(record as AttendanceRecord),
          timestamp: record.timestamp?.toDate?.() || new Date()
        }));
        
        setAttendanceList(records);
        updateStats(records);
      }
    } catch (err) {
      console.error('Error loading attendance:', err);
      setError('Failed to load attendance records');
    }
  };

  const updateStats = (records: AttendanceRecord[]) => {
    const byClass: Record<string, number> = {};
    const byParent: Record<string, number> = {};

    records.forEach(record => {
      byClass[record.class] = (byClass[record.class] || 0) + 1;
      byParent[record.attendingParent] = (byParent[record.attendingParent] || 0) + 1;
    });

    setStats({
      total: records.length,
      marked: records.length,
      byClass,
      byParent
    });
  };

  const handleSearch = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const result = await searchStudents(searchTerm);
      if (result.success && result.students) {
        setSearchResults(result.students);
      }
    } catch (err) {
      console.error('Error searching students:', err);
    }
  };

  const handleScan = async (qrCode: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const studentResult = await getStudentByQRCode(qrCode);
      
      if (!studentResult.success || !studentResult.student) {
        setScanResult({
          status: 'error',
          message: `Student not found with ID: ${qrCode}`
        });
        setIsLoading(false);
        setTimeout(() => setScanResult(null), 3000);
        return;
      }

      const student = studentResult.student;

      const alreadyMarked = attendanceList.find(a => a.studentId === student.id);
      
      if (alreadyMarked) {
        setScanResult({
          status: 'warning',
          message: `${student.studentName} already marked today at ${alreadyMarked.timestamp.toLocaleTimeString()}`
        });
        setIsLoading(false);
        setTimeout(() => setScanResult(null), 3000);
        return;
      }

      setSelectedStudent(student);
      setShowParentModal(true);

    } catch (err) {
      console.error('Error processing scan:', err);
      setError('Error processing Barcode. Please try again.');
      setScanResult({
        status: 'error',
        message: 'Error processing Barcode. Please try again.'
      });
      setTimeout(() => setScanResult(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleParentConfirm = async (parentData: {
    attendingParent: string;
    parentVerified: boolean;
    program: string;
  }) => {
    if (!selectedStudent) return;

    setIsLoading(true);
    
    try {
      const markResult = await markAttendance(selectedStudent.id, {
        studentId: selectedStudent.id,
        studentName: selectedStudent.studentName,
        class: selectedStudent.class,
        school: selectedStudent.school,
        email: selectedStudent.email || '',
        date: new Date().toISOString().split('T')[0],
        attendingParent: parentData.attendingParent,
        parentVerified: parentData.parentVerified,
        program: parentData.program
      });

      if (!markResult.success) {
        setScanResult({
          status: 'warning',
          message: markResult.message || 'Failed to mark attendance'
        });
        setIsLoading(false);
        setShowParentModal(false);
        setSelectedStudent(null);
        setTimeout(() => setScanResult(null), 3000);
        return;
      }

      const newAttendance: AttendanceRecord = {
        id: markResult.id || Date.now().toString(),
        studentId: selectedStudent.id,
        studentName: selectedStudent.studentName,
        class: selectedStudent.class,
        school: selectedStudent.school,
        email: selectedStudent.email || '',
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date(),
        attendingParent: parentData.attendingParent,
        parentVerified: parentData.parentVerified,
        program: parentData.program,
        gender: selectedStudent.gender
      };

      const updatedList = [...attendanceList, newAttendance];
      setAttendanceList(updatedList);
      updateStats(updatedList);

      setScanResult({
        status: 'success',
        message: `Welcome ${selectedStudent.studentName}!`,
        student: selectedStudent.studentName,
        class: selectedStudent.class
      });

      setShowParentModal(false);
      setSelectedStudent(null);

      setTimeout(() => setScanResult(null), 3000);

    } catch (err) {
      console.error('Error marking attendance:', err);
      setError('Error marking attendance. Please try again.');
      setScanResult({
        status: 'error',
        message: 'Error marking attendance. Please try again.'
      });
      setTimeout(() => setScanResult(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleParentCancel = () => {
    setShowParentModal(false);
    setSelectedStudent(null);
  };

  const handleExport = () => {
    const csv = [
      ['Student ID', 'Name', 'Gender', 'Class', 'School', 'Email', 'Accompanied By', 'Parent Participating', 'Time', 'Date'],
      ...attendanceList.map(a => [
        a.studentId,
        a.studentName,
        a.gender || 'N/A',
        a.class,
        a.school,
        a.email,
        a.attendingParent,
        a.parentVerified ? 'Yes' : 'No',
        a.timestamp.toLocaleTimeString(),
        a.date
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        <AttendanceHeader />

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 md:mb-6 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 md:gap-3 text-red-800 text-sm md:text-base"
          >
            <AlertCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <p className="flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 font-medium text-sm"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-2 bg-white rounded-lg shadow-md p-1">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'attendance'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Student Attendance
          </button>
          <button
            onClick={() => setActiveTab('guests')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'guests'
                ? 'bg-green-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Guest Management
          </button>
        </div>

        <StatsCards 
          stats={stats} 
          currentTime={currentTime} 
          isClient={isClient}
          totalParticipation={totalParticipation}
        />

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2"
              >
                <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 lg:p-8">
                  <div className="flex items-center gap-2 mb-4 md:mb-6">
                    <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                    <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
                      {useManualInput ? 'Manual Input' : 'Barcode Scanner'}
                    </h2>
                  </div>

                  {!useManualInput ? (
                    <>
                      <QRScanner 
                        onScan={handleScan} 
                        isScanning={isScanning} 
                      />
                      <button
                        onClick={() => setIsScanning(!isScanning)}
                        disabled={isLoading}
                        className={`mt-4 w-full px-4 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-semibold transition-all duration-200 ${
                          isScanning
                            ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg'
                            : 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                        } disabled:bg-gray-400 disabled:cursor-not-allowed`}
                      >
                        {isScanning ? 'Stop Scanning' : 'Start Scanning'}
                      </button>
                    </>
                  ) : (
                    <ManualQRInput 
                      onScan={handleScan} 
                      isLoading={isLoading}
                      onSearch={handleSearch}
                      searchResults={searchResults}
                    />
                  )}

                  <button
                    onClick={() => {
                      setIsScanning(false);
                      setUseManualInput(!useManualInput);
                      setSearchResults([]);
                    }}
                    disabled={isLoading}
                    className="mt-4 w-full px-4 py-2 text-sm md:text-base text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition-colors duration-200 disabled:text-gray-400 border border-blue-200"
                  >
                    {useManualInput ? 'Use Camera Scanner' : 'Use Manual Input'}
                  </button>

                  {scanResult && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-4 md:mt-6 p-3 md:p-4 rounded-lg flex items-center gap-2 md:gap-3 text-sm md:text-base ${
                        scanResult.status === 'success'
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : scanResult.status === 'warning'
                          ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0 ${
                        scanResult.status === 'success' ? 'bg-green-500' :
                        scanResult.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="font-semibold">{scanResult.message}</p>
                        {scanResult.student && (
                          <p className="text-xs md:text-sm opacity-90">Class: {scanResult.class}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              <ActionsSidebar
                attendanceList={attendanceList}
                onExport={handleExport}
              />
            </div>

            <AttendanceList attendanceList={attendanceList} />
          </>
        )}

        {/* Guests Tab */}
        {activeTab === 'guests' && (
          <GuestManagement />
        )}

        {showParentModal && selectedStudent && (
          <ParentAccompaniment
            student={selectedStudent}
            onConfirm={handleParentConfirm}
            onCancel={handleParentCancel}
            isLoading={isLoading}
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AttendanceSection;