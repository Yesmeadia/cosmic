import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  Timestamp,
  doc,
  updateDoc 
} from 'firebase/firestore';
import { db } from './firebase';
import { Registration } from '@/types';

export const addRegistration = async (data: Omit<Registration, 'id' | 'timestamp' | 'paymentStatus'>) => {
  try {
    const registrationData = {
      ...data,
      paymentStatus: 'pending' as const,
      transactionReference: '',
      timestamp: Timestamp.now().toDate().toISOString(),
      updatedAt: Timestamp.now().toDate().toISOString(),
    };
    
    const docRef = await addDoc(collection(db, 'registrations'), registrationData);
    return { success: true, id: docRef.id };
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

export const exportToCSV = (data: Registration[]): void => {
  const headers = [
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