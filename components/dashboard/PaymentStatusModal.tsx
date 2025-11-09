
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Registration } from '@/types';
import { updatePaymentStatus } from '@/lib/firestore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface PaymentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration | null;
  onUpdate: () => void;
}

export const PaymentStatusModal: React.FC<PaymentStatusModalProps> = ({
  isOpen,
  onClose,
  registration,
  onUpdate
}) => {
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'paid' | 'not-completed'>('pending');
  const [transactionRef, setTransactionRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (registration) {
      setSelectedStatus(registration.paymentStatus || 'pending'); // Ensure a default value
      setTransactionRef(registration.transactionReference || ''); 
    }
  }, [registration]);

  const handleSubmit = async () => {
    if (!registration?.id) return;

    // Validate transaction reference if status is 'paid'
    if (selectedStatus === 'paid' && !transactionRef.trim()) {
      alert('Please enter a transaction reference number for paid status');
      return;
    }

    setIsSubmitting(true);

    const result = await updatePaymentStatus(
      registration.id,
      selectedStatus,
      selectedStatus === 'paid' ? transactionRef : undefined
    );

    setIsSubmitting(false);

    if (result.success) {
      onUpdate();
      onClose();
    } else {
      alert('Error updating payment status. Please try again.');
    }
  };

  if (!isOpen || !registration) return null;

  const statusOptions = [
    {
      value: 'pending' as const,
      label: 'Pending',
      icon: Clock,
      color: 'yellow',
      gradient: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-700'
    },
    {
      value: 'paid' as const,
      label: 'Paid',
      icon: CheckCircle,
      color: 'green',
      gradient: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      textColor: 'text-green-700'
    },
    {
      value: 'not-completed' as const,
      label: 'Not Completed',
      icon: XCircle,
      color: 'red',
      gradient: 'from-red-500 to-rose-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      textColor: 'text-red-700'
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white">Update Payment Status</h2>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Student Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Registration Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Student Name</p>
                  <p className="font-medium text-gray-900">{registration.studentName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{registration.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Class</p>
                  <p className="font-medium text-gray-900">{registration.class}</p>
                </div>
                <div>
                  <p className="text-gray-500">School</p>
                  <p className="font-medium text-gray-900">{registration.school}</p>
                </div>
              </div>
            </div>


{/* Current Status */}
<div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
  <p className="text-sm text-indigo-600 font-medium mb-1">Current Status</p>
  <div className="flex items-center gap-2">
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
      (registration.paymentStatus || 'pending') === 'paid' ? 'bg-green-100 text-green-700' :
      (registration.paymentStatus || 'pending') === 'pending' ? 'bg-yellow-100 text-yellow-700' :
      'bg-red-100 text-red-700'
    }`}>
      {(registration.paymentStatus || 'pending').toUpperCase()}
    </span>
    {registration.transactionReference && (
      <span className="text-sm text-gray-600">
        Ref: {registration.transactionReference}
      </span>
    )}
  </div>
</div>

            {/* Status Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select New Payment Status
              </label>
              <div className="grid gap-3">
                {statusOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedStatus(option.value)}
                    className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      selectedStatus === option.value
                        ? `${option.borderColor} ${option.bgColor}`
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${option.gradient}`}>
                      <option.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`font-semibold ${
                        selectedStatus === option.value ? option.textColor : 'text-gray-900'
                      }`}>
                        {option.label}
                      </p>
                      <p className="text-sm text-gray-500">
                        {option.value === 'pending' && 'Payment is awaiting confirmation'}
                        {option.value === 'paid' && 'Payment has been completed successfully'}
                        {option.value === 'not-completed' && 'Payment was not completed or cancelled'}
                      </p>
                    </div>
                    {selectedStatus === option.value && (
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${option.gradient} flex items-center justify-center`}>
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Transaction Reference Input */}
            <AnimatePresence>
              {selectedStatus === 'paid' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Input
                    label="Transaction Reference Number"
                    type="text"
                    required
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="Enter transaction reference (e.g., TXN123456789)"
                    className="font-mono"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    This reference number will be saved with the payment record for future reference.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Status'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};