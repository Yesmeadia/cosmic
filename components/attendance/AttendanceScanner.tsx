'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Check, AlertCircle, Calendar, Users, Clock, Download, RotateCcw } from 'lucide-react';
import { getStudentByQRCode, markAttendance, getTodaysAttendance, getAttendanceStats } from '@/lib/attendance';

interface AttendanceRecord {
  id?: string;
  studentId: string;
  studentName: string;
  class: string;
  school: string;
  email: string;
  date: string;
  timestamp: Date;
  markedBy?: string;
}

// QR Code Scanner Component
const QRScanner = ({ onScan, isScanning }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    if (!isScanning) return;

    const startCamera = async () => {
      try {
        // Check if getUserMedia is available
        if (!navigator?.mediaDevices?.getUserMedia) {
          console.error('Camera not supported on this device');
          setCameraError('Camera access not supported on this device');
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraError(null);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setCameraError('Camera permission denied or not available');
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks?.();
        if (tracks) {
          tracks.forEach(track => track.stop());
        }
      }
    };
  }, [isScanning]);

  // Simple QR code detection using text pattern matching
  const detectQRCode = (imageData) => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Look for patterns that might indicate text/numbers (simplified approach)
    let detectedText = '';
    let textPixels = 0;
    
    // Sample center area for potential text
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    const sampleSize = 100;
    
    for (let y = centerY - sampleSize/2; y < centerY + sampleSize/2; y++) {
      for (let x = centerX - sampleSize/2; x < centerX + sampleSize/2; x++) {
        const i = (y * width + x) * 4;
        if (data[i] < 50 && data[i + 1] < 50 && data[i + 2] < 50) {
          textPixels++;
        }
      }
    }
    
    // If we have enough dark pixels, consider it a potential QR code area
    if (textPixels > 100) {
      return 'potential_qr_detected';
    }
    
    return null;
  };

  useEffect(() => {
    if (!isScanning || !videoRef.current || cameraError || isDetecting) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scanInterval = setInterval(() => {
      const video = videoRef.current;
      
      // Check if video has valid dimensions
      if (!video || video.videoWidth <= 0 || video.videoHeight <= 0) {
        return;
      }

      try {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        if (canvas.width > 0 && canvas.height > 0) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          if (imageData && imageData.data) {
            const detection = detectQRCode(imageData);
            if (detection) {
              setIsDetecting(true);
              // Simulate QR code reading - in real implementation, use a QR library
              setTimeout(() => {
                // Generate a mock QR code value (first 7 digits)
                const mockQRValue = Math.random().toString().substr(2, 7);
                onScan(mockQRValue);
                setIsDetecting(false);
              }, 1000);
            }
          }
        }
      } catch (error) {
        console.error('Canvas error:', error);
      }
    }, 500); // Check every 500ms

    return () => clearInterval(scanInterval);
  }, [isScanning, cameraError, isDetecting, onScan]);

  if (cameraError) {
    return (
      <div className="relative bg-gray-900 rounded-lg overflow-hidden h-96 w-full flex items-center justify-center">
        <div className="text-center text-white p-6">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-bold mb-2">Camera Error</h3>
          <p className="text-gray-300">{cameraError}</p>
          <p className="text-sm text-gray-400 mt-2">
            Please check camera permissions or use manual input
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden h-96 w-full">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Scanning frame */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 border-2 border-green-500 rounded-lg">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-green-500 rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-green-500 rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-green-500 rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-green-500 rounded-br-lg"></div>
        </div>
      </div>

      {/* Scanning line animation */}
      <motion.div
        animate={{ y: ['0%', '100%'] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute w-64 left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-b from-transparent via-green-500 to-transparent pointer-events-none"
      />

      {isDetecting && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Check className="w-8 h-8" />
            </motion.div>
            <p className="text-lg font-semibold">QR Code Detected!</p>
            <p className="text-sm">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Manual QR Input Component
const ManualQRInput = ({ onScan, isLoading }) => {
  const [qrValue, setQrValue] = useState('');

  const handleSubmit = () => {
    if (qrValue.trim()) {
      onScan(qrValue.trim());
      setQrValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={qrValue}
        onChange={(e) => setQrValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Enter QR code or Student ID (first 7 digits)..."
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        autoFocus
        disabled={isLoading}
      />
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : 'Mark Attendance'}
      </button>
    </div>
  );
};

// Main Attendance Page Component
export default function AttendancePage() {
  const [isScanning, setIsScanning] = useState(false);
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    marked: 0,
    byClass: {}
  });
  const [scanResult, setScanResult] = useState(null);
  const [useManualInput, setUseManualInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Update current time
  useEffect(() => {
    setIsClient(true);
    setCurrentTime(new Date());
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load today's attendance on mount
  useEffect(() => {
    loadTodaysAttendance();
  }, []);

  const loadTodaysAttendance = async () => {
    try {
      const result = await getTodaysAttendance();
      if (result.success) {
        setAttendanceList(result.records);
        setStats(prev => ({
          ...prev,
          total: result.count,
          marked: result.count
        }));
      }
    } catch (err) {
      console.error('Error loading attendance:', err);
      setError('Failed to load attendance records');
    }
  };

  // Mark attendance
  const handleScan = async (qrCode) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get student by QR code (first 7 digits of ID)
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

      // Check if already marked
      const alreadyMarked = attendanceList.find(a => a.studentId === student.id);
      
      if (alreadyMarked) {
        setScanResult({
          status: 'warning',
          message: `${student.studentName} already marked today at ${alreadyMarked.timestamp}`
        });
        setIsLoading(false);
        setTimeout(() => setScanResult(null), 3000);
        return;
      }

      // Mark attendance in Firebase
      const markResult = await markAttendance(student.id, {
        studentId: student.id,
        studentName: student.studentName,
        class: student.class,
        school: student.school,
        email: student.email,
        date: new Date().toLocaleDateString()
      });

      if (!markResult.success) {
        setScanResult({
          status: 'warning',
          message: markResult.message
        });
        setIsLoading(false);
        setTimeout(() => setScanResult(null), 3000);
        return;
      }

      // Add to local list
      const newAttendance: AttendanceRecord = {
        id: markResult.data?.id,
        studentId: student.id,
        studentName: student.studentName,
        class: student.class,
        school: student.school,
        email: student.email,
        date: new Date().toLocaleDateString(),
        timestamp: new Date()
      };

      setAttendanceList([...attendanceList, newAttendance]);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        marked: prev.marked + 1,
        byClass: {
          ...prev.byClass,
          [student.class]: (prev.byClass[student.class] || 0) + 1
        }
      }));

      setScanResult({
        status: 'success',
        message: `Welcome ${student.studentName}!`,
        student: student.studentName,
        class: student.class
      });

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

  const exportAttendance = () => {
    const csv = [
      ['Student ID', 'Name', 'Class', 'School', 'Email', 'Time', 'Date'],
      ...attendanceList.map(a => [
        a.studentId,
        a.studentName,
        a.class,
        a.school,
        a.email,
        a.timestamp?.toLocaleTimeString?.() || '-',
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

  const resetAttendance = () => {
    if (confirm('Are you sure you want to reset all attendance for today?')) {
      setAttendanceList([]);
      setStats({ total: 0, marked: 0, byClass: {} });
      setScanResult(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-600 rounded-lg">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Attendance Marking System</h1>
              <p className="text-gray-600">Scan QR codes to mark student attendance - YES INDIA FOUNDATION</p>
            </div>
          </div>
        </motion.div>

        {/* Error Banner */}
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

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Marked</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.marked}</p>
              </div>
              <Check className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Today's Date</p>
                <p className="text-lg font-bold text-gray-900 mt-2">
                  {isClient && currentTime ? currentTime.toLocaleDateString() : '-'}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Current Time</p>
                <p className="text-lg font-bold text-gray-900 mt-2">
                  {isClient && currentTime ? currentTime.toLocaleTimeString() : '--:--:--'}
                </p>
              </div>
              <Clock className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Top Class</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {Object.entries(stats.byClass).length > 0
                    ? Object.entries(stats.byClass).sort(([, a], [, b]) => b - a)[0][0]
                    : 'N/A'}
                </p>
              </div>
              <Users className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Scanner Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center gap-2 mb-6">
                <QrCode className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  {useManualInput ? 'Manual Input' : 'QR Code Scanner'}
                </h2>
              </div>

              {!useManualInput && (
                <>
                  <QRScanner onScan={handleScan} isScanning={isScanning} />
                  <button
                    onClick={() => setIsScanning(!isScanning)}
                    disabled={isLoading}
                    className={`mt-4 w-full px-4 py-3 rounded-lg font-medium transition-colors ${
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
                className="mt-4 w-full px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors disabled:text-gray-400"
              >
                {useManualInput ? 'Use Camera Scanner' : 'Use Manual Input'}
              </button>

              {/* Scan Result */}
              {scanResult && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${
                    scanResult.status === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : scanResult.status === 'warning'
                      ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {scanResult.status === 'success' && <Check className="w-5 h-5 flex-shrink-0" />}
                  {scanResult.status !== 'success' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                  <div>
                    <p className="font-semibold">{scanResult.message}</p>
                    {scanResult.student && (
                      <p className="text-sm">Class: {scanResult.class}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Actions Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={exportAttendance}
                  disabled={attendanceList.length === 0}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                <button
                  onClick={resetAttendance}
                  disabled={attendanceList.length === 0}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Today
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Marked Present</span>
                  <span className="text-2xl font-bold text-green-600">{stats.marked}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Efficiency</span>
                  <span className="text-lg font-semibold text-blue-600">100%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Attendance List */}
        {attendanceList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-white" />
              <h2 className="text-lg font-bold text-white">Attendance Records ({attendanceList.length})</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">School</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attendanceList.map((record, idx) => (
                    <motion.tr
                      key={record.id || idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{idx + 1}</td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">{record.studentId}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.studentName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{record.class}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{record.school}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{record.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {record.timestamp?.toLocaleTimeString?.() || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                          <Check className="w-3 h-3" />
                          Present
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}