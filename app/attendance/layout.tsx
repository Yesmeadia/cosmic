import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Attendance Marking System - YES INDIA',
  description: 'QR Code based attendance marking for YES INDIA Foundation',
};

export default function AttendanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>{children}</>
  );
}