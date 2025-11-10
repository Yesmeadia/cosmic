'use client';

import React, { useState } from 'react';
import { Registration } from '@/types';
import { Trash2, Clock, CheckCircle, XCircle, Calendar, Edit, AlertOctagon } from 'lucide-react';
import { deleteRegistration, moveToSpam } from '@/lib/firestore';

interface RegistrationTableProps {
  registrations: Registration[];
  onUpdate: () => void;
  onEditPayment?: (registration: Registration) => void;
}

export const RegistrationTable: React.FC<RegistrationTableProps> = ({ 
  registrations, 
  onUpdate,
  onEditPayment 
}) => {
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'waitlist'>('all');
  const [spamModal, setSpamModal] = useState<{ isOpen: boolean; registration: Registration | null }>({
    isOpen: false,
    registration: null
  });
  const [spamReason, setSpamReason] = useState('');

  const handleDelete = async (id: string, studentName: string) => {
    if (confirm(`Are you sure you want to delete registration for ${studentName}?`)) {
      const result = await deleteRegistration(id);
      if (result.success) {
        onUpdate();
      } else {
        alert('Failed to delete registration. Please try again.');
      }
    }
  };

  const openSpamModal = (registration: Registration) => {
    setSpamModal({ isOpen: true, registration });
    setSpamReason('');
  };

  const handleSpamSubmit = async () => {
    if (!spamModal.registration?.id) return;
    
    if (!spamReason.trim()) {
      alert('Please enter a reason for marking as spam');
      return;
    }

    const result = await moveToSpam(spamModal.registration.id, spamReason);
    if (result.success) {
      setSpamModal({ isOpen: false, registration: null });
      setSpamReason('');
      onUpdate();
    } else {
      alert('Failed to move registration to spam. Please try again.');
    }
  };

  const getPaymentBadge = (status?: string, transactionRef?: string) => {
    const styles = {
      paid: 'bg-green-100 text-green-800 border-green-300',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'not-completed': 'bg-red-100 text-red-800 border-red-300'
    };

    const icons = {
      paid: <CheckCircle className="w-4 h-4" />,
      pending: <Clock className="w-4 h-4" />,
      'not-completed': <XCircle className="w-4 h-4" />
    };

    const labels = {
      paid: 'Paid',
      pending: 'Pending',
      'not-completed': 'Not Completed'
    };

    const currentStatus = (status || 'pending') as keyof typeof styles;

    return (
      <div className="space-y-1">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${styles[currentStatus]}`}>
          {icons[currentStatus]}
          {labels[currentStatus]}
        </span>
        {currentStatus === 'paid' && transactionRef && (
          <div className="text-xs text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-200">
            Ref: {transactionRef}
          </div>
        )}
      </div>
    );
  };

  const filteredRegistrations = registrations.filter(reg => {
    if (filter === 'confirmed') return !reg.isWaitlist;
    if (filter === 'waitlist') return reg.isWaitlist;
    return true;
  });

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Filter Tabs */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            All ({registrations.length})
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === 'confirmed'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Confirmed ({registrations.filter(r => !r.isWaitlist).length})
          </button>
          <button
            onClick={() => setFilter('waitlist')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === 'waitlist'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Waitlist ({registrations.filter(r => r.isWaitlist).length})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                School
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mobile
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRegistrations.map((registration) => (
              <tr key={registration.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {registration.isWaitlist ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
                      <Clock className="w-3 h-3" />
                      Waitlist
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300">
                      <CheckCircle className="w-3 h-3" />
                      Confirmed
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {registration.id ? registration.id.toString().substring(0, 7).toUpperCase() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {registration.studentName}
                  </div>
                  <div className="text-xs text-gray-500">{registration.gender}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {registration.class}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {registration.school}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {registration.mobile}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {registration.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{registration.attendingParent}</div>
                  <div className="text-xs text-gray-500">{registration.fathermobile}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getPaymentBadge(registration.paymentStatus, registration.transactionReference)}
                    {onEditPayment && (
                      <button
                        onClick={() => onEditPayment(registration)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors flex-shrink-0"
                        title="Edit payment details"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(registration.timestamp).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openSpamModal(registration)}
                      className="text-orange-600 hover:text-orange-900 transition-colors"
                      title="Mark as spam"
                    >
                      <AlertOctagon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(registration.id!, registration.studentName)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Delete registration"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredRegistrations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No registrations found</p>
        </div>
      )}

      {/* Spam Modal */}
      {spamModal.isOpen && spamModal.registration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertOctagon className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Mark as Spam</h3>
            </div>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Student Name</p>
              <p className="text-base font-semibold text-gray-900">{spamModal.registration.studentName}</p>
              <p className="text-sm text-gray-500 mt-2">{spamModal.registration.email}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for marking as spam <span className="text-red-500">*</span>
              </label>
              <textarea
                value={spamReason}
                onChange={(e) => setSpamReason(e.target.value)}
                placeholder="e.g., Duplicate registration, Fake information, Test entry, etc."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSpamModal({ isOpen: false, registration: null });
                  setSpamReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSpamSubmit}
                disabled={!spamReason.trim()}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Mark as Spam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}