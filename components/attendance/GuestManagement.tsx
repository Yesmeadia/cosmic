// components/attendance/GuestManagement.tsx
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Users, Search, Filter, Clock, CheckCircle, LogOut, X } from 'lucide-react';
import GuestManualInput from './GuestManualInput';
import GuestExport from './GuestExport';
import { getTodaysGuestEntries, checkInGuest, checkOutGuest, searchGuests } from '@/lib/guestManagement';

interface GuestRecord {
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

interface GuestStats {
  totalGuests: number;
  checkedIn: number;
  checkedOut: number;
  pending: number;
}

const GuestManagement: React.FC = () => {
  const [guestList, setGuestList] = useState<GuestRecord[]>([]);
  const [stats, setStats] = useState<GuestStats>({
    totalGuests: 0,
    checkedIn: 0,
    checkedOut: 0,
    pending: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [attendedByInput, setAttendedByInput] = useState<{ [key: string]: string }>({});
  const [selectedGuest, setSelectedGuest] = useState<GuestRecord | null>(null);
  const [quickActionSearchResults, setQuickActionSearchResults] = useState<GuestRecord[]>([]);

  useEffect(() => {
    loadTodaysGuests();
  }, []);

  const loadTodaysGuests = async () => {
    setIsLoading(true);
    try {
      const result = await getTodaysGuestEntries();
      if (result.success && result.records) {
        const records = result.records.map(record => ({
          ...record,
          checkInTime: record.checkInTime instanceof Date ? record.checkInTime : new Date(record.checkInTime),
          checkOutTime: record.checkOutTime ? (record.checkOutTime instanceof Date ? record.checkOutTime : new Date(record.checkOutTime)) : undefined,
        }));
        setGuestList(records);
        updateStats(records);
      }
    } catch (err) {
      console.error('Error loading guests:', err);
      setError('Failed to load guest records');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStats = (records: GuestRecord[]) => {
    const stats: GuestStats = {
      totalGuests: records.length,
      checkedIn: records.filter(r => r.status === 'checked-in').length,
      checkedOut: records.filter(r => r.status === 'checked-out').length,
      pending: records.filter(r => r.status === 'pending').length,
    };
    setStats(stats);
  };

  const handleMainSearch = async (searchTerm: string) => {
    setSearchTerm(searchTerm);
    if (searchTerm.length < 1) {
      loadTodaysGuests();
      return;
    }

    setIsLoading(true);
    try {
      const result = await searchGuests(searchTerm);
      if (result.success) {
        const records = result.guests.map(guest => ({
          ...guest,
          checkInTime: guest.checkInTime instanceof Date ? guest.checkInTime : new Date(guest.checkInTime),
          checkOutTime: guest.checkOutTime ? (guest.checkOutTime instanceof Date ? guest.checkOutTime : new Date(guest.checkOutTime)) : undefined,
        }));
        setGuestList(records);
      }
    } catch (err) {
      console.error('Error searching guests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickActionSearch = async (searchTerm: string) => {
    if (searchTerm.length < 1) {
      setQuickActionSearchResults([]);
      return;
    }

    try {
      const result = await searchGuests(searchTerm);
      if (result.success) {
        const records = result.guests.map(guest => ({
          ...guest,
          checkInTime: guest.checkInTime instanceof Date ? guest.checkInTime : new Date(guest.checkInTime),
          checkOutTime: guest.checkOutTime ? (guest.checkOutTime instanceof Date ? guest.checkOutTime : new Date(guest.checkOutTime)) : undefined,
        }));
        setQuickActionSearchResults(records);
      }
    } catch (err) {
      console.error('Error searching guests:', err);
    }
  };

  const handleCheckIn = async (guestId: string, guestName: string) => {
    const attendedBy = attendedByInput[guestId];
    if (!attendedBy?.trim()) {
      setError('Please enter who attended to this guest');
      return;
    }

    setIsLoading(true);
    try {
      const result = await checkInGuest(guestId, attendedBy);
      if (result.success) {
        setSuccessMessage(`${guestName} checked in successfully!`);
        setAttendedByInput(prev => ({ ...prev, [guestId]: '' }));
        setSelectedGuest(null);
        await loadTodaysGuests();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.error || 'Failed to check in guest');
      }
    } catch (err) {
      setError('Error checking in guest');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async (guestId: string, guestName: string) => {
    setIsLoading(true);
    try {
      const result = await checkOutGuest(guestId);
      if (result.success) {
        setSuccessMessage(`${guestName} checked out successfully!`);
        await loadTodaysGuests();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.error || 'Failed to check out guest');
      }
    } catch (err) {
      setError('Error checking out guest');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestScan = async (guestId: string, guestName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const foundGuest = guestList.find(g => g.id === guestId || g.id.startsWith(guestId));
      
      if (!foundGuest) {
        setError(`Guest not found with ID: ${guestId}`);
        setTimeout(() => setError(null), 3000);
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error processing guest scan:', err);
      setError('Error processing Guest ID. Please try again.');
      setTimeout(() => setError(null), 3000);
      setIsLoading(false);
    }
  };

  const handleGuestVerified = async (guest: GuestRecord) => {
    setIsLoading(true);
    
    try {
      const result = await checkInGuest(guest.id, 'Self-Verified');
      
      if (result.success) {
        setSuccessMessage(`✓ ${guest.guestName} marked as attended!`);
        await loadTodaysGuests();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.error || 'Failed to mark guest');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      setError('Error marking guest attended');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGuests = useMemo(() => {
    return guestList.filter(guest => {
      const matchesFilter = statusFilter === 'All' || guest.status === statusFilter;
      return matchesFilter;
    });
  }, [guestList, statusFilter]);

  const getStatusBadge = (status: string) => {
    const variants = {
      'checked-in': { bg: 'bg-green-100', border: 'border-green-200', text: 'text-green-800', icon: CheckCircle },
      'checked-out': { bg: 'bg-gray-100', border: 'border-gray-200', text: 'text-gray-800', icon: LogOut },
      'pending': { bg: 'bg-yellow-100', border: 'border-yellow-200', text: 'text-yellow-800', icon: Clock },
    };
    
    const variant = variants[status as keyof typeof variants] || variants.pending;
    const Icon = variant.icon;

    return (
      <motion.span
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border ${variant.bg} ${variant.border} ${variant.text}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {status === 'checked-in' ? 'Checked In' : status === 'checked-out' ? 'Checked Out' : 'Pending'}
      </motion.span>
    );
  };

  const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <motion.div
      whileHover={{ y: -4 }}
      className={`bg-gradient-to-br ${color} rounded-xl p-4 shadow-lg border border-white/20`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-xs font-medium uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="p-3 bg-white/20 rounded-lg">
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 md:px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-3"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="p-2 bg-white/20 rounded-lg"
            >
            </motion.div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Guest Management</h2>
              <p className="text-white/80 text-xs md:text-sm">Track and manage check-ins</p>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <StatCard label="Total" value={stats.totalGuests} icon={Users} color="from-blue-500 to-blue-600" />
            <StatCard label="Checked In" value={stats.checkedIn} icon={CheckCircle} color="from-green-500 to-green-600" />
            <StatCard label="Checked Out" value={stats.checkedOut} icon={LogOut} color="from-slate-500 to-slate-600" />
            <StatCard label="Pending" value={stats.pending} icon={Clock} color="from-amber-500 to-amber-600" />
          </div>
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 md:px-6 py-3 bg-red-50 border-b border-red-200 flex items-center gap-2 text-red-800"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm flex-1">{error}</p>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 md:px-6 py-3 bg-green-50 border-b border-green-200 flex items-center gap-2 text-green-800"
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{successMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filter */}
      <div className="bg-gray-50 px-4 md:px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by guest name, phone, or ID..."
                value={searchTerm}
                onChange={(e) => handleMainSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-all"
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {['All', 'pending', 'checked-in', 'checked-out'].map((filter) => (
              <motion.button
                key={filter}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStatusFilter(filter)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  statusFilter === filter
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Manual Input Section & Table Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6">
        {/* Manual Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg p-4 md:p-6 sticky top-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-green-600 rounded-full"></div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900">Quick Actions</h3>
            </div>
            
            <GuestManualInput 
              onGuestFound={(guest) => handleGuestScan(guest.id, guest.guestName)}
              onGuestVerified={(guest) => handleGuestVerified(guest as GuestRecord)}
              isLoading={isLoading}
              onSearch={handleQuickActionSearch}
              searchResults={quickActionSearchResults}
            />

            {selectedGuest && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-white rounded-lg border border-green-200 space-y-3"
              >
                <p className="text-gray-600 text-sm font-medium">Mark as checked in:</p>
                <p className="text-gray-900 font-bold text-base">{selectedGuest.guestName}</p>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Attended by..."
                    value={attendedByInput[selectedGuest.id] || ''}
                    onChange={(e) => setAttendedByInput(prev => ({ ...prev, [selectedGuest.id]: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCheckIn(selectedGuest.id, selectedGuest.guestName)}
                      disabled={isLoading}
                      className="flex-1 px-3 py-2 bg-green-600 text-white font-semibold rounded-lg text-sm hover:bg-green-700 disabled:bg-gray-400"
                    >
                      Confirm
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedGuest(null)}
                      className="flex-1 px-3 py-2 bg-gray-300 text-gray-900 font-semibold rounded-lg text-sm hover:bg-gray-400"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={loadTodaysGuests}
              disabled={isLoading}
              className="mt-4 w-full px-4 py-2.5 text-sm md:text-base text-green-600 font-semibold hover:bg-green-50 rounded-lg transition-colors duration-200 disabled:text-gray-400 border border-green-200"
            >
              Refresh List
            </motion.button>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    <th className="px-3 md:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Guest ID</th>
                    <th className="px-3 md:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                    <th className="px-3 md:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Phone</th>
                    <th className="px-3 md:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-3 md:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Time</th>
                    <th className="px-3 md:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  <AnimatePresence>
                    {filteredGuests.map((guest, idx) => (
                      <motion.tr
                        key={guest.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-green-50 transition-colors"
                      >
                        <td className="px-3 md:px-6 py-4 text-sm font-mono text-gray-700 font-semibold">{guest.id.substring(0, 7)}</td>
                        <td className="px-3 md:px-6 py-4 text-sm font-medium text-gray-900">{guest.guestName}</td>
                        <td className="px-3 md:px-6 py-4 text-sm text-gray-600">{guest.guestPhone}</td>
                        <td className="px-3 md:px-6 py-4">{getStatusBadge(guest.status)}</td>
                        <td className="px-3 md:px-6 py-4 text-sm text-gray-600">
                          {guest.status === 'checked-in' && guest.checkInTime
                            ? new Date(guest.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                            : guest.status === 'checked-out' && guest.checkOutTime
                            ? new Date(guest.checkOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                            : '-'}
                        </td>
                        <td className="px-3 md:px-6 py-4">
                          <div className="flex gap-2">
                            {guest.status === 'pending' && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedGuest(guest)}
                                className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors"
                                title="Check In"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </motion.button>
                            )}
                            {guest.status === 'checked-in' && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCheckOut(guest.id, guest.guestName)}
                                className="p-2 bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-lg transition-colors"
                                title="Check Out"
                              >
                                <LogOut className="w-4 h-4" />
                              </motion.button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>

              {filteredGuests.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 text-gray-400"
                >
                  <Users className="w-16 h-16 mx-auto text-gray-300 mb-4 opacity-50" />
                  <p className="text-lg font-semibold text-gray-600">No guests found</p>
                  <p className="text-sm mt-2 text-gray-500">Try adjusting your search or filter criteria</p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Export Section */}
      <GuestExport guestList={guestList} stats={stats} />
    </motion.div>
  );
};

export default GuestManagement;