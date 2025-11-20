// components/ManualQRInput.jsx
'use client';

import React, { useState } from 'react';

const ManualQRInput = ({ onScan, isLoading }) => {
  const [qrValue, setQrValue] = useState('');

  const handleSubmit = () => {
    if (qrValue.trim()) {
      onScan(qrValue.trim());
      setQrValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={qrValue}
        onChange={(e) => setQrValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Enter QR code or Student ID (first 7 digits)..."
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        autoFocus
        disabled={isLoading}
      />
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : 'Mark Attendance'}
      </button>
    </div>
  );
};

export default ManualQRInput;