// components/attendance/AttendanceList.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Check, Search, Filter } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  school: string;
  email: string;
  date: string;
  timestamp: Date;
  attendingParent: string;
  parentVerified: boolean;
  program: string;
  gender?: string;
}

interface AttendanceListProps {
  attendanceList?: AttendanceRecord[];
}

const AttendanceList: React.FC<AttendanceListProps> = ({ attendanceList = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [parentFilter, setParentFilter] = useState('All');

  const totalParticipation = useMemo(() => {
    return attendanceList.reduce((total, record) => {
      let count = 1;
      if (record.attendingParent !== 'None') {
        if (record.attendingParent === 'Both') {
          count += 2;
        } else {
          count += 1;
        }
      }
      return total + count;
    }, 0);
  }, [attendanceList]);

  const parentTypeCounts = useMemo(() => {
    const counts = {
      Father: 0,
      Mother: 0,
      Both: 0,
      Other: 0,
      None: 0,
      All: attendanceList.length
    };

    attendanceList.forEach(record => {
      if (['Father', 'Mother', 'Both', 'None'].includes(record.attendingParent)) {
        counts[record.attendingParent as keyof typeof counts]++;
      } else {
        counts.Other++;
      }
    });

    return counts;
  }, [attendanceList]);

  const filteredRecords = useMemo(() => {
    return attendanceList.filter(record => {
      const matchesSearch = 
        record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.class.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = 
        parentFilter === 'All' || 
        (parentFilter === 'Father' && record.attendingParent === 'Father') ||
        (parentFilter === 'Mother' && record.attendingParent === 'Mother') ||
        (parentFilter === 'Both' && record.attendingParent === 'Both') ||
        (parentFilter === 'None' && record.attendingParent === 'None') ||
        (parentFilter === 'Other' && !['Father', 'Mother', 'Both', 'None'].includes(record.attendingParent));

      return matchesSearch && matchesFilter;
    });
  }, [attendanceList, searchTerm, parentFilter]);

  const getParticipationCount = (record: AttendanceRecord): number => {
    if (record.attendingParent === 'None') {
      return 1;
    } else if (record.attendingParent === 'Both') {
      return 3;
    } else {
      return 2;
    }
  };

  const parentFilters = [
    { key: 'All', label: 'All Records', count: parentTypeCounts.All },
    { key: 'Father', label: 'Father', count: parentTypeCounts.Father },
    { key: 'Mother', label: 'Mother', count: parentTypeCounts.Mother },
    { key: 'Both', label: 'Both Parents', count: parentTypeCounts.Both },
    { key: 'Other', label: 'Others', count: parentTypeCounts.Other },
    { key: 'None', label: 'None', count: parentTypeCounts.None },
  ];

  if (attendanceList.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden"
    >
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 md:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-white" />
            <h2 className="text-base md:text-lg font-bold text-white">Attendance Records</h2>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 md:px-4 py-2 border border-white/30">
            <div className="text-center">
              <div className="text-white text-xs md:text-sm font-medium">Total Participation</div>
              <div className="text-white text-xl md:text-2xl font-bold">{totalParticipation}</div>
              <div className="text-white/80 text-xs">
                {attendanceList.length} student(s) + {totalParticipation - attendanceList.length} accompanying
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 px-4 md:px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, ID, or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
            {parentFilters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setParentFilter(filter.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  parentFilter === filter.key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-3 h-3" />
                {filter.label}
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  parentFilter === filter.key
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 px-4 md:px-6 py-2 border-b border-blue-100">
        <div className="flex justify-between items-center text-xs md:text-sm">
          <span className="text-blue-800 font-medium">
            Showing {filteredRecords.length} of {attendanceList.length} records
          </span>
          {parentFilter !== 'All' && (
            <span className="text-blue-600">
              Filtered by: {parentFilters.find(f => f.key === parentFilter)?.label}
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Accompanied By</th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participation</th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRecords.map((record, idx) => (
              <motion.tr
                key={record.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="hover:bg-gray-50"
              >
                <td className="px-3 md:px-6 py-4 text-sm font-medium text-gray-900">{idx + 1}</td>
                <td className="px-3 md:px-6 py-4 text-sm font-mono text-gray-600">
                  {record.studentId.substring(0, 7)}
                </td>
                <td className="px-3 md:px-6 py-4 text-sm font-medium text-gray-900">{record.studentName}</td>
                <td className="px-3 md:px-6 py-4 text-sm text-gray-600">{record.class}</td>
                <td className="px-3 md:px-6 py-4">
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {record.attendingParent}
                    </span>
                    {record.parentVerified && (
                      <span className="block text-xs text-blue-600 font-medium mt-0.5">
                        Also participating
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 md:px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {getParticipationCount(record)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {getParticipationCount(record) === 1 ? 'person' : 'people'}
                    </span>
                  </div>
                </td>
                <td className="px-3 md:px-6 py-4 text-sm text-gray-600">
                  {record.timestamp.toLocaleTimeString('en-IN')}
                </td>
                <td className="px-3 md:px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-2 md:px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                    <Check className="w-3 h-3" />
                    Present
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-16 h-16 mx-auto text-gray-300 mb-3" />
            <p className="text-lg font-medium">No records found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AttendanceList;