'use client';

import React from 'react';
import { Filter, Download } from 'lucide-react';
import { FilterState, Registration } from '@/types';
import { exportToCSV, exportToPDF } from '@/lib/firestore';

interface FiltersProps {
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  data: Registration[];
}

export const Filters: React.FC<FiltersProps> = ({ filter, onFilterChange, data }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center mb-4">
        <Filter className="w-5 h-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
      </div>
      
      <div className="grid md:grid-cols-6 gap-4">
        <input
          type="text"
          placeholder="Search by name, email, school..."
          value={filter.search}
          aria-label="Search registrations"
          onChange={(e) => onFilterChange({ ...filter, search: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        
        <select
          value={filter.class}
          onChange={(e) => onFilterChange({ ...filter, class: e.target.value })}
          aria-label="Filter by class"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">All Classes</option>
          <option value="9th">9th</option>
          <option value="10th">10th</option>
          <option value="11th">11th</option>
          <option value="12th">12th</option>
        </select>
        
        <select
          value={filter.attendingParent}
          onChange={(e) => onFilterChange({ ...filter, attendingParent: e.target.value })}
          aria-label="Filter by accompanying parent"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">All Parents</option>
          <option value="Father">Father</option>
          <option value="Mother">Mother</option>
          <option value="Both">Both</option>
          <option value="Others">Others</option>
        </select>

        <select
          value={filter.paymentStatus}
          onChange={(e) => onFilterChange({ ...filter, paymentStatus: e.target.value })}
          aria-label="Filter by payment status"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">All Payment Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="not-completed">Not Completed</option>
        </select>

        <button
          onClick={() => exportToCSV(data)}
          className="flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-5 h-5 mr-2" />
          Export CSV
        </button>

        <button
          onClick={() => exportToPDF(data)}
          className="flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-5 h-5 mr-2" />
          Export PDF
        </button>
      </div>
    </div>
  );
};