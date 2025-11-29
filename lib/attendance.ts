// lib/firebase/attendance.ts
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc,
  doc,
  Timestamp,
  getDoc 
} from 'firebase/firestore';
import { db } from './firebase';

// Student interface
export interface Student {
  id: string;
  studentName: string;
  class: string;
  school: string;
  email?: string;
  mobile?: string;
  program?: string;
  registrationId?: string;
  gender?: string;
}

// Attendance record interface
export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  school: string;
  email: string;
  date: string;
  timestamp: Timestamp;
  attendingParent: string;
  parentVerified: boolean;
  program: string;
  registrationId: string;
  gender?: string;
}

/**
 * Get student by registration ID (exact match)
 */
export const getStudentByRegistrationId = async (registrationId: string): Promise<{
  success: boolean;
  student?: Student;
  message?: string;
}> => {
  try {
    const docRef = doc(db, 'registrations', registrationId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return {
        success: false,
        message: 'Student registration not found'
      };
    }
    
    const data = docSnap.data();
    const student: Student = {
      id: docSnap.id,
      studentName: data.studentName || data.name || data.fullName || data.student_name || 'Unknown',
      gender: data.gender || data.student_gender || 'N/A',
      class: data.class || data.grade || data.standard || data.student_class || 'N/A',
      school: data.school || data.schoolName || data.student_school || 'N/A',
      email: data.email || data.studentEmail || data.student_email || '',
      mobile: data.mobile || data.phone || data.contactNumber || data.student_mobile || '',
      program: data.program || data.event || data.student_program || 'Cosmic Confluence',
      registrationId: docSnap.id
    };
    
    return {
      success: true,
      student
    };
  } catch (error) {
    console.error('Error fetching student by registration ID:', error);
    return {
      success: false,
      message: 'Error fetching student data'
    };
  }
};

/**
 * Get all students from registrations collection for partial matching
 */
export const getAllRegisteredStudents = async (): Promise<{
  success: boolean;
  students?: Student[];
  message?: string;
}> => {
  try {
    const registrationsRef = collection(db, 'registrations');
    const querySnapshot = await getDocs(registrationsRef);
    
    const students: Student[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const student: Student = {
        id: doc.id,
        studentName: data.studentName || data.name || data.fullName || data.student_name || 'Unknown',
        gender: data.gender || data.student_gender || 'N/A',
        class: data.class || data.grade || data.standard || data.student_class || 'N/A',
        school: data.school || data.schoolName || data.student_school || 'N/A',
        email: data.email || data.studentEmail || data.student_email || '',
        mobile: data.mobile || data.phone || data.contactNumber || data.student_mobile || '',
        program: data.program || data.event || data.student_program || 'Cosmic Confluence',
        registrationId: doc.id
      };
      
      students.push(student);
    });

    console.log(`Fetched ${students.length} students from registrations`);
    
    return {
      success: true,
      students
    };
  } catch (error) {
    console.error('Error fetching all students:', error);
    return {
      success: false,
      message: 'Failed to fetch student data from registrations'
    };
  }
};

/**
 * Get student by QR code (first 7 digits of registration ID)
 */
export const getStudentByQRCode = async (qrCode: string): Promise<{
  success: boolean;
  student?: Student;
  message?: string;
  exactMatch?: boolean;
}> => {
  try {
    // Clean the input - take only first 7 alphanumeric characters
    const cleanQRCode = qrCode.replace(/[^a-zA-Z0-9]/g, '').substring(0, 7);
    
    if (cleanQRCode.length < 3) {
      return {
        success: false,
        message: 'Please enter at least 3 characters for student ID'
      };
    }

    console.log(`Searching for student with ID starting with: ${cleanQRCode}`);

    // First, try exact match with the full ID
    const exactMatchResult = await getStudentByRegistrationId(cleanQRCode);
    if (exactMatchResult.success && exactMatchResult.student) {
      console.log(`Exact match found: ${exactMatchResult.student.studentName}`);
      return {
        success: true,
        student: exactMatchResult.student,
        exactMatch: true
      };
    }

    // If exact match fails, search for documents where ID starts with these 7 digits
    const allStudentsResult = await getAllRegisteredStudents();
    
    if (!allStudentsResult.success || !allStudentsResult.students) {
      return {
        success: false,
        message: 'Failed to fetch student data from registration database'
      };
    }

    // Find students whose registration ID starts with the first 7 digits
    const matchingStudents = allStudentsResult.students.filter(student =>
      student.id.toLowerCase().startsWith(cleanQRCode.toLowerCase())
    );

    console.log(`Found ${matchingStudents.length} partial matches for: ${cleanQRCode}`);

    if (matchingStudents.length === 0) {
      return {
        success: false,
        message: `No registered student found with ID starting with: ${cleanQRCode}`
      };
    }

    if (matchingStudents.length > 1) {
      console.warn(`Multiple students found with ID starting with: ${cleanQRCode}`);
      // Return the first match, but log the ambiguity
      const selectedStudent = matchingStudents[0];
      return {
        success: true,
        student: selectedStudent,
        exactMatch: false,
        message: `Multiple matches found. Using: ${selectedStudent.studentName}`
      };
    }

    // Single match found
    return {
      success: true,
      student: matchingStudents[0],
      exactMatch: false
    };
    
  } catch (error) {
    console.error('Error getting student by QR code:', error);
    return {
      success: false,
      message: 'Error fetching student data from registration database'
    };
  }
};

/**
 * Search students by name, class, or school in registrations
 * Main export for searching - replaces searchStudentsInRegistrations
 */
export const searchStudents = async (searchTerm: string): Promise<{
  success: boolean;
  students?: Student[];
  message?: string;
}> => {
  try {
    const allStudentsResult = await getAllRegisteredStudents();
    
    if (!allStudentsResult.success || !allStudentsResult.students) {
      return {
        success: false,
        message: 'Failed to fetch student data from registrations'
      };
    }

    const searchLower = searchTerm.toLowerCase();
    const matchingStudents = allStudentsResult.students.filter(student =>
      student.studentName.toLowerCase().includes(searchLower) ||
      student.class.toLowerCase().includes(searchLower) ||
      student.school.toLowerCase().includes(searchLower) ||
      student.id.toLowerCase().includes(searchLower)
    );

    return {
      success: true,
      students: matchingStudents
    };
  } catch (error) {
    console.error('Error searching students:', error);
    return {
      success: false,
      message: 'Error searching students in registration database'
    };
  }
};

/**
 * Legacy export - alias for searchStudents
 * @deprecated Use searchStudents instead
 */
export const searchStudentsInRegistrations = searchStudents;

/**
 * Mark attendance with registration validation
 * FIXED: Now includes gender field
 */
export const markAttendance = async (studentId: string, data: {
  studentId: string;
  studentName: string;
  class: string;
  school: string;
  email: string;
  date: string;
  attendingParent: string;
  parentVerified: boolean;
  program: string;
  gender?: string;  //  Added gender to the interface
}): Promise<{
  success: boolean;
  id?: string;
  message?: string;
}> => {
  try {
    // First validate that the student exists in registrations
    const validationResult = await getStudentByQRCode(studentId);
    
    if (!validationResult.success || !validationResult.student) {
      return {
        success: false,
        message: validationResult.message || 'Student not found in registration database'
      };
    }

    const attendanceRef = collection(db, 'attendance');
    const docRef = await addDoc(attendanceRef, {
      ...data,
      gender: validationResult.student.gender || data.gender || 'N/A',  //  FIXED: Now saving gender
      registrationId: validationResult.student.registrationId || studentId,
      timestamp: Timestamp.now()
    });

    console.log(`Attendance marked for ${data.studentName} (Registration ID: ${validationResult.student.registrationId})`);

    return {
      success: true,
      id: docRef.id
    };
  } catch (error) {
    console.error('Error marking attendance:', error);
    return {
      success: false,
      message: 'Failed to mark attendance'
    };
  }
};

/**
 * Get today's attendance records
 */
export const getTodaysAttendance = async (): Promise<{
  success: boolean;
  records?: AttendanceRecord[];
  count?: number;
  message?: string;
}> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const attendanceRef = collection(db, 'attendance');
    const q = query(attendanceRef, where('date', '==', today));
    const querySnapshot = await getDocs(q);

    const records: AttendanceRecord[] = [];
    querySnapshot.forEach((doc) => {
      records.push({
        id: doc.id,
        ...doc.data()
      } as AttendanceRecord);
    });

    return {
      success: true,
      records: records.sort((a, b) => 
        b.timestamp.toDate().getTime() - a.timestamp.toDate().getTime()
      ),
      count: records.length
    };
  } catch (error) {
    console.error('Error getting attendance:', error);
    return {
      success: false,
      message: 'Failed to load attendance records'
    };
  }
};

/**
 * Reset today's attendance
 */
export const resetTodaysAttendance = async (): Promise<{
  success: boolean;
  message?: string;
}> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const attendanceRef = collection(db, 'attendance');
    const q = query(attendanceRef, where('date', '==', today));
    const querySnapshot = await getDocs(q);

    const deletePromises = querySnapshot.docs.map((docSnapshot) =>
      deleteDoc(doc(db, 'attendance', docSnapshot.id))
    );

    await Promise.all(deletePromises);

    return {
      success: true
    };
  } catch (error) {
    console.error('Error resetting attendance:', error);
    return {
      success: false,
      message: 'Failed to reset attendance'
    };
  }
};

/**
 * Get registration statistics
 */
export const getRegistrationStats = async (): Promise<{
  success: boolean;
  totalRegistrations?: number;
  byClass?: Record<string, number>;
  bySchool?: Record<string, number>;
  message?: string;
}> => {
  try {
    const allStudentsResult = await getAllRegisteredStudents();
    
    if (!allStudentsResult.success || !allStudentsResult.students) {
      return {
        success: false,
        message: 'Failed to fetch registration data'
      };
    }

    const byClass: Record<string, number> = {};
    const bySchool: Record<string, number> = {};

    allStudentsResult.students.forEach(student => {
      // Count by class
      byClass[student.class] = (byClass[student.class] || 0) + 1;
      
      // Count by school
      bySchool[student.school] = (bySchool[student.school] || 0) + 1;
    });

    return {
      success: true,
      totalRegistrations: allStudentsResult.students.length,
      byClass,
      bySchool
    };
  } catch (error) {
    console.error('Error getting registration stats:', error);
    return {
      success: false,
      message: 'Error fetching registration statistics'
    };
  }
};

/**
 * Quick validation for manual input
 */
export const quickValidateStudent = async (input: string): Promise<{
  success: boolean;
  student?: Student;
  message?: string;
}> => {
  return await getStudentByQRCode(input);
};

// Re-export all commonly used functions
export {
};