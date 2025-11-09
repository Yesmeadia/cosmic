'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { onAuthChange } from '@/lib/auth';
import { getRegistrationsWithStats } from '@/lib/firestore';
import { Registration, FilterState, Stats } from '@/types';
import { Header } from '@/components/dashboard/Header';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { Filters } from '@/components/dashboard/Filters';
import { RegistrationTable } from '@/components/dashboard/DataTable';
import { Visualizations } from '@/components/dashboard/Visualizations';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PaymentStatusModal } from '@/components/dashboard/PaymentStatusModal';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    byClass: {},
    byParent: {},
    byPaymentStatus: { paid: 0, pending: 0, 'not-completed': 0 },
    waitlistCount: 0
  });
  const [filter, setFilter] = useState<FilterState>({
    class: '',
    attendingParent: '',
    search: '',
    paymentStatus: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (!user) {
        router.push('/login');
      } else {
        loadData();
      }
    });
    return () => unsubscribe();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { registrations, stats } = await getRegistrationsWithStats();
      setRegistrations(registrations);
      setStats(stats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPayment = (registration: Registration) => {
    setSelectedRegistration(registration);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRegistration(null);
  };

  const handleUpdateSuccess = () => {
    loadData(); // Reload data after update
    handleCloseModal(); // Close modal
  };

  const filteredData = registrations.filter(reg => {
    if (filter.class && reg.class !== filter.class) return false;
    if (filter.attendingParent && reg.attendingParent !== filter.attendingParent) return false;
    if (filter.paymentStatus && reg.paymentStatus !== filter.paymentStatus) return false;
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      return (
        reg.studentName?.toLowerCase().includes(searchLower) ||
        reg.email?.toLowerCase().includes(searchLower) ||
        reg.school?.toLowerCase().includes(searchLower) ||
        reg.transactionReference?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Header />
        
        <div className="container mx-auto px-6 py-8">
          <StatsCards stats={stats} />
          <Filters filter={filter} onFilterChange={setFilter} data={filteredData} />
          <RegistrationTable 
            registrations={filteredData}
            onUpdate={loadData}
            onEditPayment={handleEditPayment}
          />
          <Visualizations stats={stats} />
        </div>
      </motion.div>

      <PaymentStatusModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        registration={selectedRegistration}
        onUpdate={handleUpdateSuccess}
      />

      <footer className="text-center text-semibold text-blue-900 py-4">
        &copy; {new Date().getFullYear()} YES INDIA FOUNDATION. All rights reserved.
      </footer>
    </>
  );
}