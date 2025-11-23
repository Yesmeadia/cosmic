import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { Registration } from '@/types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const REGISTRATION_LIMIT = 100;

// Get total registration count (excluding waitlist and spam)
export const getRegistrationCount = async (): Promise<number> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'registrations'));
    
    // Count only non-waitlist registrations
    let count = 0;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.isWaitlist) {
        count++;
      }
    });
    
    return count;
  } catch (error) {
    console.error('Error getting registration count:', error);
    return 0;
  }
};

export const exportToPDF = (data: Registration[]) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Clean white background with simple header
  
  // Main Title - COSMIC CONFLUENCE
  doc.setTextColor(102, 51, 153); // Deep purple
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('COSMIC CONFLUENCE 2025', pageWidth / 2, 15, {
    align: 'center'
  });

  // Subtitle - REGISTRATION DETAILS
  doc.setTextColor(60, 60, 60); // Dark gray
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Student Registration Report', pageWidth / 2, 23, {
    align: 'center'
  });

  // Date and count info
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const reportDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(`Generated: ${reportDate} | Total Records: ${data.length}`, pageWidth / 2, 30, {
    align: 'center'
  });

  // Separator line
  doc.setDrawColor(102, 51, 153);
  doc.setLineWidth(0.5);
  doc.line(10, 33, pageWidth - 10, 33);

  // Table starts after header
  const startY = 38;

  autoTable(doc, {
    head: [[
      'ID',
      'Student Name',
      'Class',
      'School',
      'Place',
      'Contact',
      'Email',
      'Parents',
      'Date'
    ]],
    body: data.map((row, index) => [
      `${index + 1}`,
      row.studentName || '-',
      row.class || '-',
      row.school || '-',
      row.place || '-',
      `Mobile: ${row.mobile || '-'}\nWhatsApp: ${row.whatsapp || '-'}`,
      row.email || '-',
      `Father: ${row.fatherName || '-'}\nContact: ${row.fathermobile || '-'}\nMother: ${row.motherName || '-'}\nAttending: ${row.attendingParent || '-'}`,
      new Date(row.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    ]],
    startY: startY,
    styles: {
      fontSize: 7,
      cellPadding: 2.5,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
      textColor: [40, 40, 40],
      fillColor: [255, 255, 255], // White background
      minCellHeight: 14
    },
    headStyles: {
      fillColor: [102, 51, 153], // Deep purple header
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
      valign: 'middle',
      cellPadding: 3
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255] // White background for all rows
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' }, // ID
      1: { cellWidth: 35, fontStyle: 'bold' }, // Student Name
      2: { cellWidth: 15, halign: 'center' }, // Class
      3: { cellWidth: 40 }, // School
      4: { cellWidth: 30 }, // Place
      5: { cellWidth: 32, fontSize: 6.5 }, // Contact
      6: { cellWidth: 38, fontSize: 6.5 }, // Email
      7: { cellWidth: 48, fontSize: 6.5 }, // Parents
      8: { cellWidth: 22, halign: 'center' } // Date
    },
    margin: { top: startY, right: 8, bottom: 20, left: 8 },
    didDrawPage: function(data) {
      const pageCount = doc.getNumberOfPages();
      const currentPage = data.pageNumber;
      
      // Simple footer separator line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(10, pageHeight - 15, pageWidth - 10, pageHeight - 15);
      
      // Left: Organization name
      doc.setFontSize(8);
      doc.setTextColor(102, 51, 153);
      doc.setFont('helvetica', 'bold');
      doc.text('YES INDIA FOUNDATION', 10, pageHeight - 8);
      
      // Center: Generation date
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Report Generated: ${reportDate}`, 
        pageWidth / 2, 
        pageHeight - 8, 
        { align: 'center' }
      );

      // Right: Page number
      doc.setFontSize(8);
      doc.setTextColor(102, 51, 153);
      doc.setFont('helvetica', 'bold');
      doc.text(
        `Page ${currentPage} of ${pageCount}`, 
        pageWidth - 10, 
        pageHeight - 8, 
        { align: 'right' }
      );
    }
  });
  
  doc.save(`Cosmic_Confluence_Registrations_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const addRegistration = async (data: Omit<Registration, 'id' | 'timestamp' | 'paymentStatus'> & { isWaitlist?: boolean }) => {
  try {
    // Check current count to determine if registration should be waitlisted
    const currentCount = await getRegistrationCount();
    const isWaitlist = currentCount >= REGISTRATION_LIMIT;
    
    const registrationData = {
      ...data,
      isWaitlist,
      paymentStatus: 'pending' as const,
      transactionReference: '',
      timestamp: Timestamp.now().toDate().toISOString(),
      updatedAt: Timestamp.now().toDate().toISOString(),
    };
    
    const docRef = await addDoc(collection(db, 'registrations'), registrationData);
    return { success: true, id: docRef.id, isWaitlist };
  } catch (error) {
    console.error('Error adding registration:', error);
    return { success: false, error };
  }
};

export const getRegistrations = async (): Promise<Registration[]> => {
  try {
    const q = query(collection(db, 'registrations'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const registrations: Registration[] = [];
    querySnapshot.forEach((doc) => {
      registrations.push({
        id: doc.id,
        ...doc.data()
      } as Registration);
    });
    
    return registrations;
  } catch (error) {
    console.error('Error getting registrations:', error);
    return [];
  }
};

// Get spam registrations
export const getSpamRegistrations = async (): Promise<Registration[]> => {
  try {
    const q = query(collection(db, 'spam'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const spamRegistrations: Registration[] = [];
    querySnapshot.forEach((doc) => {
      spamRegistrations.push({
        id: doc.id,
        ...doc.data()
      } as Registration);
    });
    
    return spamRegistrations;
  } catch (error) {
    console.error('Error getting spam registrations:', error);
    return [];
  }
};

// Get registrations with stats (for dashboard)
export const getRegistrationsWithStats = async () => {
  try {
    const registrations = await getRegistrations();
    
    const stats = {
      total: 0,
      byClass: {} as Record<string, number>,
      byParent: {} as Record<string, number>,
      byPaymentStatus: {
        paid: 0,
        pending: 0,
        'not-completed': 0
      },
      waitlistCount: 0
    };

    registrations.forEach((registration) => {
      stats.total++;

      // Track waitlist count
      if (registration.isWaitlist) {
        stats.waitlistCount++;
      }

      // Count by class
      if (registration.class) {
        stats.byClass[registration.class] = (stats.byClass[registration.class] || 0) + 1;
      }

      // Count by parent
      if (registration.attendingParent) {
        stats.byParent[registration.attendingParent] = 
          (stats.byParent[registration.attendingParent] || 0) + 1;
      }

      // Count by payment status
      const paymentStatus = registration.paymentStatus || 'pending';
      if (paymentStatus in stats.byPaymentStatus) {
        stats.byPaymentStatus[paymentStatus as keyof typeof stats.byPaymentStatus]++;
      }
    });

    return { registrations, stats };
  } catch (error) {
    console.error('Error getting registrations with stats:', error);
    throw error;
  }
};

export const updatePaymentStatus = async (
  registrationId: string, 
  paymentStatus: 'pending' | 'paid' | 'not-completed',
  transactionReference?: string
): Promise<{ success: boolean; error?: unknown }> => {
  try {
    const registrationRef = doc(db, 'registrations', registrationId);
    const updateData: {
      paymentStatus: 'pending' | 'paid' | 'not-completed';
      updatedAt: string;
      transactionReference?: string;
    } = {
      paymentStatus,
      updatedAt: Timestamp.now().toDate().toISOString(),
    };

    if (paymentStatus === 'paid' && transactionReference) {
      updateData.transactionReference = transactionReference;
    } else if (paymentStatus !== 'paid') {
      updateData.transactionReference = '';
    }

    await updateDoc(registrationRef, updateData);
    return { success: true };
  } catch (error) {
    console.error('Error updating payment status:', error);
    return { success: false, error };
  }
};

// Delete a registration
export const deleteRegistration = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'registrations', id));
    return { success: true };
  } catch (error) {
    console.error('Error deleting registration:', error);
    return { success: false, error };
  }
};

// Move registration to spam
export const moveToSpam = async (id: string, spamReason: string): Promise<{ success: boolean; error?: unknown }> => {
  try {
    // Get the registration data
    const registrationRef = doc(db, 'registrations', id);
    const registrationSnap = await getDoc(registrationRef);
    
    if (!registrationSnap.exists()) {
      return { success: false, error: 'Registration not found' };
    }
    
    const registrationData = registrationSnap.data();
    
    // Add to spam collection with spam metadata
    const spamData = {
      ...registrationData,
      spamReason,
      markedAsSpamAt: Timestamp.now().toDate().toISOString(),
      originalId: id
    };
    
    await addDoc(collection(db, 'spam'), spamData);
    
    // Delete from registrations
    await deleteDoc(registrationRef);
    
    return { success: true };
  } catch (error) {
    console.error('Error moving to spam:', error);
    return { success: false, error };
  }
};

// Restore from spam (optional - in case of accidental spam marking)
export const restoreFromSpam = async (spamId: string): Promise<{ success: boolean; error?: unknown }> => {
  try {
    // Get the spam data
    const spamRef = doc(db, 'spam', spamId);
    const spamSnap = await getDoc(spamRef);
    
    if (!spamSnap.exists()) {
      return { success: false, error: 'Spam entry not found' };
    }
    
    const spamData = spamSnap.data();
    
    // Remove spam-specific fields
    const { markedAsSpamAt, originalId, spamReason, ...registrationData } = spamData;
    
    // Check if we need to update waitlist status
    const currentCount = await getRegistrationCount();
    const isWaitlist = currentCount >= REGISTRATION_LIMIT;
    
    // Add back to registrations
    const restoredData = {
      ...registrationData,
      isWaitlist,
      restoredAt: Timestamp.now().toDate().toISOString(),
      updatedAt: Timestamp.now().toDate().toISOString()
    };
    
    await addDoc(collection(db, 'registrations'), restoredData);
    
    // Delete from spam
    await deleteDoc(spamRef);
    
    return { success: true };
  } catch (error) {
    console.error('Error restoring from spam:', error);
    return { success: false, error };
  }
};

// Delete spam entry permanently
export const deleteSpam = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'spam', id));
    return { success: true };
  } catch (error) {
    console.error('Error deleting spam:', error);
    return { success: false, error };
  }
};

// Move waitlist to confirmed (when spot opens)
export const moveWaitlistToConfirmed = async (id: string) => {
  try {
    const currentCount = await getRegistrationCount();
    
    if (currentCount >= REGISTRATION_LIMIT) {
      return { 
        success: false, 
        error: 'Registration limit reached. Cannot move from waitlist.' 
      };
    }
    
    const registrationRef = doc(db, 'registrations', id);
    await updateDoc(registrationRef, { 
      isWaitlist: false,
      updatedAt: Timestamp.now().toDate().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('Error moving from waitlist:', error);
    return { success: false, error };
  }
};

export const exportToCSV = (data: Registration[]): void => {
  const headers = [
    'Status',
    'Student Name',
    'Gender',
    'Mobile',
    'WhatsApp',
    'Email',
    'Class',
    'School',
    'Place',
    'Father Name',
    'Father Mobile',
    'Mother Name',
    'Attending Parent',
    'Payment Status',
    'Transaction Reference',
    'Date',
    'Last Updated'
  ];

  const rows = data.map(reg => [
    reg.isWaitlist ? 'Waitlist' : 'Confirmed',
    reg.studentName || '-',
    reg.gender || '-',
    reg.mobile || '-',
    reg.whatsapp || '-',
    reg.email || '-',
    reg.class || '-',
    reg.school || '-',
    reg.place || '-',
    reg.fatherName || '-',
    reg.fathermobile || '-',
    reg.motherName || '-',
    reg.attendingParent || '-',
    reg.paymentStatus || 'pending',
    reg.transactionReference || '-',
    new Date(reg.timestamp).toLocaleDateString(),
    reg.updatedAt ? new Date(reg.updatedAt).toLocaleDateString() : '-'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      // Escape fields containing commas, quotes, or newlines
      const stringCell = String(cell);
      if (stringCell.includes(',') || stringCell.includes('"') || stringCell.includes('\n')) {
        return `"${stringCell.replace(/"/g, '""')}"`;
      }
      return stringCell; // No comma here
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `registrations_${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};