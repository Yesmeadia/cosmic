// lib/guestManagement.ts
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  getDoc,
  writeBatch,
} from 'firebase/firestore';

export interface Guest {
  id: string;
  guestName: string;
  guestPhone: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  status: 'checked-in' | 'checked-out' | 'pending';
  attendedBy?: string;
  notes?: string;
  date: string;
  createdAt: Date;
}

export interface GuestRecord {
  id: string;
  guestName: string;
  guestPhone: string;
  checkInTime: Date;
  checkOutTime?: Date;
  status: string;
  attendedBy?: string;
  notes?: string;
  date: string;
}

// Create initial guest data (for testing/seeding)
export const createInitialGuestData = async () => {
  const guestsBatch = Array.from({ length: 20 }, (_, i) => ({
    guestName: `GUEST ${i + 1}`,
    guestPhone: `${9000000000 + i}`,
  }));

  const guestsRef = collection(db, 'guests');
  
  try {
    // Check if guests already exist
    const snapshot = await getDocs(guestsRef);
    
    // If guests already exist, don't create duplicates
    if (snapshot.size > 0) {
      console.log(`ℹ️ Guests already exist in database (${snapshot.size} guests found)`);
      return { success: true, message: `Guests already exist (${snapshot.size} guests)` };
    }

    // Create all 20 guests
    for (const guest of guestsBatch) {
      await addDoc(guestsRef, {
        ...guest,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        createdAt: Timestamp.now(),
      });
    }
    
    console.log('✅ Successfully created GUEST 1 to GUEST 20');
    return { success: true, message: 'Guest data created successfully - GUEST 1 to 20' };
  } catch (error) {
    console.error('Error creating guest data:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Get all guests
export const getAllGuests = async () => {
  try {
    const guestsRef = collection(db, 'guests');
    const snapshot = await getDocs(guestsRef);
    
    const guests: GuestRecord[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        guestName: data.guestName,
        guestPhone: data.guestPhone,
        checkInTime: data.checkInTime?.toDate?.() || new Date(),
        checkOutTime: data.checkOutTime?.toDate?.(),
        status: data.status,
        attendedBy: data.attendedBy,
        notes: data.notes,
        date: data.date,
      } as GuestRecord;
    });

    return { success: true, guests };
  } catch (error) {
    console.error('Error fetching guests:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error', guests: [] };
  }
};

// Get today's guest entries
export const getTodaysGuestEntries = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const guestsRef = collection(db, 'guests');
    const q = query(guestsRef, where('date', '==', today));
    const snapshot = await getDocs(q);
    
    const guests: GuestRecord[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        guestName: data.guestName,
        guestPhone: data.guestPhone,
        checkInTime: data.checkInTime?.toDate?.() || new Date(),
        checkOutTime: data.checkOutTime?.toDate?.(),
        status: data.status,
        attendedBy: data.attendedBy,
        notes: data.notes,
        date: data.date,
      } as GuestRecord;
    });

    return { success: true, records: guests };
  } catch (error) {
    console.error('Error fetching today\'s guests:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error', records: [] };
  }
};

// Check-in a guest
export const checkInGuest = async (guestId: string, attendedBy: string) => {
  try {
    const guestRef = doc(db, 'guests', guestId);
    await updateDoc(guestRef, {
      status: 'checked-in',
      checkInTime: Timestamp.now(),
      attendedBy,
    });
    return { success: true, message: 'Guest checked in successfully' };
  } catch (error) {
    console.error('Error checking in guest:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Check-out a guest
export const checkOutGuest = async (guestId: string) => {
  try {
    const guestRef = doc(db, 'guests', guestId);
    await updateDoc(guestRef, {
      status: 'checked-out',
      checkOutTime: Timestamp.now(),
    });
    return { success: true, message: 'Guest checked out successfully' };
  } catch (error) {
    console.error('Error checking out guest:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Search guests
export const searchGuests = async (searchTerm: string) => {
  try {
    const allGuests = await getAllGuests();
    if (!allGuests.success) {
      return { success: false, guests: [] };
    }

    const filtered = allGuests.guests.filter(guest =>
      guest.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.guestPhone.includes(searchTerm) ||
      guest.id.includes(searchTerm)
    );

    return { success: true, guests: filtered };
  } catch (error) {
    console.error('Error searching guests:', error);
    return { success: false, guests: [] };
  }
};

// Update guest
export const updateGuest = async (guestId: string, updates: Partial<Guest>) => {
  try {
    const guestRef = doc(db, 'guests', guestId);
    await updateDoc(guestRef, updates);
    return { success: true, message: 'Guest updated successfully' };
  } catch (error) {
    console.error('Error updating guest:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Delete guest
export const deleteGuest = async (guestId: string) => {
  try {
    await deleteDoc(doc(db, 'guests', guestId));
    return { success: true, message: 'Guest deleted successfully' };
  } catch (error) {
    console.error('Error deleting guest:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Get guest statistics
export const getGuestStats = async () => {
  try {
    const result = await getAllGuests();
    if (!result.success) {
      return { success: false, stats: null };
    }

    const guests = result.guests;
    const stats = {
      total: guests.length,
      checkedIn: guests.filter(g => g.status === 'checked-in').length,
      checkedOut: guests.filter(g => g.status === 'checked-out').length,
      pending: guests.filter(g => g.status === 'pending').length,
    };

    return { success: true, stats };
  } catch (error) {
    console.error('Error getting guest stats:', error);
    return { success: false, stats: null };
  }
};

// Export guests to CSV
export const exportGuestsToCSV = (guests: GuestRecord[]) => {
  const headers = ['Guest ID', 'Guest Name', 'Phone', 'Status', 'Check-in Time', 'Check-out Time', 'Attended By', 'Notes', 'Date'];
  
  const rows = guests.map(guest => [
    guest.id.substring(0, 7),
    guest.guestName,
    guest.guestPhone,
    guest.status,
    guest.checkInTime ? new Date(guest.checkInTime).toLocaleTimeString('en-IN') : '-',
    guest.checkOutTime ? new Date(guest.checkOutTime).toLocaleTimeString('en-IN') : '-',
    guest.attendedBy || '-',
    guest.notes || '-',
    guest.date,
  ]);

  const csv = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `guests-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);

  return { success: true, message: 'Guests exported successfully' };
};