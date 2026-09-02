export interface Booking {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // "10:00 - 11:00", etc.
  pillar: string; // "Compliance Mastery", etc.
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  calendarEventId?: string;
  createdAt: any; // Firestore Timestamp or ServerTimestamp
  updatedAt: any;
}

export interface BookingDraft {
  saveProgressOptIn?: boolean;
  fullName?: string;
  email?: string;
  company?: string;
  message?: string;
  selectedPillar?: string;
  bookingMode?: 'direct' | 'calendly';
  notes?: string;
  savedAt?: string;
}

export interface Pillar {
  id: string;
  title: string;
  icon: string;
  description: string;
  details: string[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
}
