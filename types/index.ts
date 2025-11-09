export interface Registration {
  id?: string;
  studentName: string;
  mobile: string;
  whatsapp: string;
  email: string;
  class: string;
  school: string;
  fatherName: string;
  fathermobile: string;
  motherName: string;
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
