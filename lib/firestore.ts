import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  Timestamp,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Registration } from '@/types';

const REGISTRATION_LIMIT = 100;

// Get total registration count (excluding waitlist)
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