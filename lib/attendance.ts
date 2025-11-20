// lib/attendance.ts
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
  Query,
} from 'firebase/firestore';

export interface AttendanceRecord {
  id?: string;
  studentId: string;
  studentName: string;
  class: string;
  school: string;
  email: string;
  date: string;
  timestamp: Timestamp;
  markedBy?: string;
  attendingParent?: string;
  parentVerified?: boolean;
  program?: string;
  mobile?: string;
}

export interface Student {
  id: string;
  studentName: string;
  class: string;
  school: string;
  email: string;
  phone?: string;
  parentName?: string;
  attendingParent?: string;
  program?: string;
  mobile?: string;
}

// Mark attendance for a student with parent info
export const markAttendance = async (
  studentId: string,
  studentData: Omit<AttendanceRecord, 'id' | 'timestamp'>
): Promise<{ success: boolean; message: string; data?: AttendanceRecord }> => {
  try {
    // Check if already marked today
    const today = new Date().toLocaleDateString();
    const attendanceRef = collection(db, 'attendance');
    
    const q = query(
      attendanceRef,
      where('studentId', '==', studentId),
      where('date', '==', today)
    );

    const existingDocs = await getDocs(q);

    if (!existingDocs.empty) {
      return {
        success: false,
        message: 'Student already marked for today'
      };
    }

    // Add new attendance record
    const newRecord = await addDoc(attendanceRef, {
      ...studentData,
      timestamp: serverTimestamp(),
      date: today,
    });

    return {
      success: true,
      message: 'Attendance marked successfully',
      data: {
        id: newRecord.id,
        ...studentData,
        timestamp: Timestamp.now(),
      }
    };
  } catch (error) {
    console.error('Error marking attendance:', error);
    return {
      success: false,
      message: 'Error marking attendance. Please try again.'
    };
  }
};

// Get student by QR code (first 7 digits of ID in CAPITAL letters)
export const getStudentByQRCode = async (qrCode: string): Promise<{ success: boolean; student?: Student }> => {
  try {
    console.log('🔍 Searching for student with QR code:', qrCode);
    
    // Convert QR code to uppercase and take first 7 characters
    const searchId = qrCode.toUpperCase().substring(0, 7);
    console.log('🔍 Searching with ID:', searchId);
    
    const registrationsRef = collection(db, 'registrations');
    
    // Get all documents to search through them
    const querySnapshot = await getDocs(registrationsRef);
    
    console.log('📊 Total documents in registrations:', querySnapshot.size);
    
    // Search for document ID that starts with the first 7 uppercase digits
    const matchingDoc = querySnapshot.docs.find(doc => {
      const docId = doc.id.toUpperCase();
      console.log('📄 Checking document ID:', docId, 'against:', searchId);
      
      // Check if document ID starts with the search ID
      return docId.startsWith(searchId);
    });

    if (matchingDoc) {
      const studentData = matchingDoc.data();
      console.log('✅ Found matching student data:', studentData);
      
      // Map the student data with proper field fallbacks
      const student: Student = {
        id: matchingDoc.id, // Use the full Firebase document ID
        studentName: studentData.studentName || studentData.name || studentData.fullName || 'Unknown Student',
        class: studentData.class || studentData.grade || studentData.standard || studentData.course || 'Unknown Class',
        school: studentData.school || studentData.institution || studentData.college || studentData.university || 'Unknown School',
        email: studentData.email || studentData.studentEmail || studentData.contactEmail || '',
        phone: studentData.phone || studentData.mobile || studentData.contactNumber || studentData.phoneNumber || '',
        parentName: studentData.parentName || studentData.parentsName || studentData.guardianName || '',
        attendingParent: studentData.attendingParent || studentData.accompanyingParent || studentData.parentAttending || '',
        program: studentData.program || studentData.event || studentData.course || 'Cosmic Confluence',
        mobile: studentData.mobile || studentData.phone || studentData.contactNumber || '',
      };

      console.log('🎓 Mapped student:', student);
      return {
        success: true,
        student
      };
    }

    console.log('❌ No matching student found for ID:', searchId);
    
    // Log all available document IDs for debugging
    console.log('📋 Available document IDs:');
    querySnapshot.docs.forEach(doc => {
      console.log('  -', doc.id, '->', doc.id.toUpperCase().substring(0, 7));
    });
    
    return { success: false };

  } catch (error) {
    console.error('❌ Error fetching student:', error);
    return { success: false };
  }
};

// Get today's attendance records
export const getTodaysAttendance = async () => {
  try {
    const today = new Date().toLocaleDateString();
    const attendanceRef = collection(db, 'attendance');
    const q = query(attendanceRef, where('date', '==', today));

    const snapshot = await getDocs(q);
    const records = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AttendanceRecord[];

    return {
      success: true,
      records,
      count: records.length
    };
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return { success: false, records: [], count: 0 };
  }
};

// Get attendance statistics with parent counts
export const getAttendanceStats = async (dateRange?: { from: string; to: string }) => {
  try {
    const attendanceRef = collection(db, 'attendance');
    let q: Query;

    if (dateRange) {
      q = query(
        attendanceRef,
        where('date', '>=', dateRange.from),
        where('date', '<=', dateRange.to)
      );
    } else {
      q = query(attendanceRef);
    }

    const snapshot = await getDocs(q);
    const records = snapshot.docs.map(doc => doc.data()) as AttendanceRecord[];

    const parentCounts = records.reduce((acc, record) => {
      const parentType = record.attendingParent || 'None';
      acc[parentType] = (acc[parentType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      success: true,
      total: records.length,
      byClass: records.reduce((acc, record) => {
        const className = record.class || 'Unknown';
        acc[className] = (acc[className] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySchool: records.reduce((acc, record) => {
        const schoolName = record.school || 'Unknown';
        acc[schoolName] = (acc[schoolName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byParent: parentCounts,
    };
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    return { success: false, total: 0, byClass: {}, bySchool: {}, byParent: {} };
  }
};

// Export attendance data to CSV format
export const exportAttendanceToCSV = async (dateRange?: { from: string; to: string }): Promise<{ success: boolean; data?: string; message?: string }> => {
  try {
    const attendanceRef = collection(db, 'attendance');
    let q: Query;

    if (dateRange) {
      q = query(
        attendanceRef,
        where('date', '>=', dateRange.from),
        where('date', '<=', dateRange.to)
      );
    } else {
      q = query(attendanceRef);
    }

    const snapshot = await getDocs(q);
    const records = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AttendanceRecord[];

    if (records.length === 0) {
      return {
        success: false,
        message: 'No attendance records found for the selected date range'
      };
    }

    // Define CSV headers
    const headers = [
      'Student ID',
      'Student Name',
      'Class',
      'School',
      'Email',
      'Date',
      'Timestamp',
      'Attending Parent',
      'Parent Verified',
      'Program',
      'Marked By'
    ];

    // Convert records to CSV rows
    const csvRows = records.map(record => [
      record.studentId || '',
      record.studentName || '',
      record.class || '',
      record.school || '',
      record.email || '',
      record.date || '',
      record.timestamp?.toDate?.()?.toLocaleString() || '',
      record.attendingParent || 'None',
      record.parentVerified ? 'Yes' : 'No',
      record.program || '',
      record.markedBy || 'System'
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    return {
      success: true,
      data: csvContent
    };
  } catch (error) {
    console.error('Error exporting attendance to CSV:', error);
    return {
      success: false,
      message: 'Error exporting attendance data. Please try again.'
    };
  }
};