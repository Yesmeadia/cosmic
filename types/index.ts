export interface Registration {
  id?: string;
  studentName: string;
  mobile: string;
  whatsapp: string;
  email: string;
  class: string;
  school: string;
  place: string;
  fatherName: string;
  fathermobile: string;
  motherName: string;
  registrationId: string;
  attendingParent: 'Father' | 'Mother' | 'Both' | 'Others';
  paymentStatus: 'pending' | 'paid' | 'not-completed';
  transactionReference?: string;
  timestamp: string;
  updatedAt?: string;
  gender?: string;
  isWaitlist?: boolean;
}

export interface User {
  uid: string;
  email: string;
}

export interface FilterState {
  class: string;
  attendingParent: string;
  search: string;
  paymentStatus: string;
}

export interface Stats {
  total: number;
  byClass: Record<string, number>;
  byParent: Record<string, number>;
  byPaymentStatus: {
    paid: number;
    pending: number;
    'not-completed': number;
    [key: string]: number;
  };
  waitlistCount?: number;
}

export interface AttendanceRecord {
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

export interface AttendanceStats {
  total: number;
  byClass: Record<string, number>;
  bySchool: Record<string, number>;
}