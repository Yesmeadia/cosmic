'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Edit } from 'lucide-react';
import { Registration } from '@/types';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface DataTableProps {
  data: Registration[];
  loading: boolean;
  onEditPayment: (registration: Registration) => void;
}

export const DataTable: React.FC<DataTableProps> = ({ data, loading, onEditPayment }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading registrations...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center text-gray-500">
        No registrations found matching your filters.
      </div>
    );
  }

  const getPaymentStatusBadge = (status: string | undefined) => {
    // Provide default value if status is undefined
    const safeStatus = status || 'pending';
    
    const styles = {
      paid: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'not-completed': 'bg-red-100 text-red-800 border-red-200'
    };
    
    const labels = {
      paid: 'PAID',
      pending: 'PENDING',
      'not-completed': 'NOT COMPLETED'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[safeStatus as keyof typeof styles] || styles.pending}`}>
        {labels[safeStatus as keyof typeof labels] || 'PENDING'}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">
          Registrations ({data.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                School
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parents
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attending
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction Ref
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((reg, idx) => (
              <motion.tr
                key={reg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {reg.studentName || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{reg.mobile || '-'}</div>
                  <div className="text-sm text-gray-500">{reg.email || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                    {reg.class || 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {reg.school || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">F: {reg.fatherName || '-'}</div>
                  <div className="text-sm text-gray-500">M: {reg.motherName || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    reg.attendingParent === 'Both' ? 'bg-green-100 text-green-800' :
                    reg.attendingParent === 'Father' ? 'bg-blue-100 text-blue-800' :
                    reg.attendingParent === 'Mother' ? 'bg-pink-100 text-pink-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {reg.attendingParent || 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPaymentStatusBadge(reg.paymentStatus)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900 font-mono">
                    {reg.transactionReference || '-'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {reg.timestamp ? new Date(reg.timestamp).toLocaleString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => onEditPayment(reg)}
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-900 font-medium transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};