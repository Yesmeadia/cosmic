// components/attendance/GuestManagement.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Users, Search, Filter, Clock, CheckCircle, LogOut, QrCode } from 'lucide-react';
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
  const [useManualInput, setUseManualInput] = useState(false);

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

  const handleSearch = async (searchTerm: string) => {
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
      // Auto mark as attended with timestamp
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
    switch (status) {
      case 'checked-in':
        return <span className="inline-flex items-center gap-1 px-2 md:px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" /> Checked In</span>;
      case 'checked-out':
        return <span className="inline-flex items-center gap-1 px-2 md:px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><LogOut className="w-3 h-3" /> Checked Out</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 md:px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 md:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-white" />
            <h2 className="text-base md:text-lg font-bold text-white">Guest Management</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
              <div className="text-white text-xs font-medium">Total</div>
              <div className="text-white text-lg font-bold">{stats.totalGuests}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
              <div className="text-white text-xs font-medium">Checked In</div>
              <div className="text-white text-lg font-bold">{stats.checkedIn}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
              <div className="text-white text-xs font-medium">Checked Out</div>
              <div className="text-white text-lg font-bold">{stats.checkedOut}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
              <div className="text-white text-xs font-medium">Pending</div>
              <div className="text-white text-lg font-bold">{stats.pending}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 md:px-6 py-3 bg-red-50 border-b border-red-200 flex items-center gap-2 text-red-800">
          <AlertCircle className="w-4 h-4" />
          <p className="text-sm flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 font-medium">Dismiss</button>
        </motion.div>
      )}
      {successMessage && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 md:px-6 py-3 bg-green-50 border-b border-green-200 flex items-center gap-2 text-green-800">
          <CheckCircle className="w-4 h-4" />
          <p className="text-sm">{successMessage}</p>
        </motion.div>
      )}

      {/* Search and Filter */}
      <div className="bg-gray-50 px-4 md:px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by guest name, phone, or ID..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {['All', 'pending', 'checked-in', 'checked-out'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  statusFilter === filter
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-3 h-3" />
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
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
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg p-4 md:p-6 sticky top-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-6 bg-green-600 rounded-full"></div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900">Mark Guest</h3>
            </div>
            
            <GuestManualInput 
              onGuestFound={handleGuestScan}
              onGuestVerified={handleGuestVerified}
              isLoading={isLoading}
              onSearch={handleSearch}
              searchResults={guestList}
            />

            <button
              onClick={() => {
                setUseManualInput(!useManualInput);
                loadTodaysGuests();
              }}
              disabled={isLoading}
              className="mt-4 w-full px-4 py-2 text-sm md:text-base text-green-600 font-semibold hover:bg-green-50 rounded-lg transition-colors duration-200 disabled:text-gray-400 border border-green-200"
            >
              🔄 Refresh List
            </button>
          </div>
        </motion.div>

        {/* Table */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Guest ID</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Name</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Phone</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredGuests.map((guest) => (
                    <motion.tr key={guest.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-green-50 transition-colors">
                      <td className="px-3 md:px-6 py-4 text-sm font-mono text-gray-600 font-semibold">{guest.id.substring(0, 7)}</td>
                      <td className="px-3 md:px-6 py-4 text-sm font-medium text-gray-900">{guest.guestName}</td>
                      <td className="px-3 md:px-6 py-4 text-sm text-gray-600">{guest.guestPhone}</td>
                      <td className="px-3 md:px-6 py-4">{getStatusBadge(guest.status)}</td>
                      <td className="px-3 md:px-6 py-4 text-sm text-gray-600">
                        {guest.status === 'checked-in' && guest.checkInTime
                          ? new Date(guest.checkInTime).toLocaleTimeString('en-IN')
                          : '-'}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {filteredGuests.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                  <p className="text-lg font-medium">No guests found</p>
                  <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <GuestExport guestList={guestList} stats={stats} />
    </motion.div>
  );
};

export default GuestManagement;