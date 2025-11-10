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

  // Add header
  const pageWidth = doc.internal.pageSize.getWidth();
  const logoWidth = 20;
  const logoHeight = 15;
  const logoX = 10;
  const logoY = 10;
  
  // doc.addImage(cosmicLogoUrl, 'PNG', logoX, logoY, logoWidth, logoHeight); // Uncomment and provide cosmicLogoUrl if you have the image data

  // Add "Registration Details" heading in center
  // Title - COSMIC CONFLUENCE
doc.setTextColor(102, 51, 153); // Deep purple (RGB)
doc.setFontSize(16);
doc.setFont(undefined, 'bold');
doc.text('COSMIC CONFLUENCE', pageWidth / 2, logoY + logoHeight / 2, {
  align: 'center',
  baseline: 'middle'
});

// Subtitle - REGISTRATION DETAILS
doc.setTextColor(60, 60, 60); // Dark gray
doc.setFontSize(14);
doc.setFont(undefined, 'normal');
doc.text('REGISTRATION DETAILS', pageWidth / 2, logoY + logoHeight / 2 + 8, {
  align: 'center',
  baseline: 'middle'
});


  // Store the Y position after header for the table
  const startY = logoY + logoHeight + 5;

  autoTable(doc, {
    head: [[ 'Student Name', 'Mobile', 'WhatsApp', 'Email', 'Class', 'School', 'Father Name', 'Mother Name', 'Attending Parent', 'Timestamp']],
    body: data.map(row => [
      row.studentName,
      row.mobile,
      row.whatsapp,
      row.email,
      row.class,
      row.school,
      row.fatherName,
      row.motherName,
      row.attendingParent,
      new Date(row.timestamp).toLocaleString()
    ]),
    startY: startY,
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { top: startY, right: 10, bottom: 20, left: 10 },
    didDrawPage: function(data) {
      // Footer on each page
      const pageCount = doc.getNumberOfPages();
      const currentPage = data.pageNumber;
      
      // Generated time and date in center
      const generatedAt = new Date().toLocaleString();
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Generated on: ${generatedAt}`, 
        pageWidth / 2, 
        doc.internal.pageSize.getHeight() - 10, 
        { align: 'center' }
      );

      // Page number on left
      doc.text(
        `Page ${currentPage} of ${pageCount}`, 
        10, 
        doc.internal.pageSize.getHeight() - 10, 
        { align: 'left' }
      );
    }
  });
  
  doc.save(`registrations_${Date.now()}.pdf`);
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
    const { markedAsSpamAt, originalId, ...registrationData } = spamData;
    
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
    'Mobile',
    'WhatsApp',
    'Email',
    'Class',
    'School',
    'Father Name',
    'Mother Name',
    'Attending Parent',
    'Payment Status',
    'Transaction Reference',
    'Timestamp',
    'Last Updated'
  ];

  const rows = data.map(reg => [
    reg.isWaitlist ? 'Waitlist' : 'Confirmed',
    reg.studentName,
    reg.mobile,
    reg.whatsapp,
    reg.email,
    reg.class,
    reg.school,
    reg.fatherName,
    reg.motherName,
    reg.attendingParent,
    reg.paymentStatus,
    reg.transactionReference || 'N/A',
    new Date(reg.timestamp).toLocaleString(),
    reg.updatedAt ? new Date(reg.updatedAt).toLocaleString() : 'N/A'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
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