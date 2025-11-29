// components/attendance/GuestExport.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, File, Loader } from 'lucide-react';
import jsPDF from 'jspdf';

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

interface GuestExportProps {
  guestList: GuestRecord[];
  stats: {
    totalGuests: number;
    checkedIn: number;
    checkedOut: number;
    pending: number;
  };
}

const GuestExport: React.FC<GuestExportProps> = ({ guestList, stats }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'all' | 'attended'>('all');

  const getFilteredGuests = () => {
    if (exportType === 'attended') {
      return guestList.filter(g => g.status === 'checked-in' || g.status === 'checked-out');
    }
    return guestList;
  };

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      const filteredGuests = getFilteredGuests();
      const headers = ['Guest ID', 'Guest Name', 'Phone', 'Status', 'Check-in Time', 'Check-out Time', 'Attended By', 'Notes', 'Date'];
      
      const rows = filteredGuests.map(guest => [
        guest.id.substring(0, 7),
        guest.guestName,
        guest.guestPhone,
        guest.status === 'checked-in' ? 'Checked In' : guest.status === 'checked-out' ? 'Checked Out' : 'Pending',
        guest.checkInTime ? new Date(guest.checkInTime).toLocaleString('en-IN') : '-',
        guest.checkOutTime ? new Date(guest.checkOutTime).toLocaleString('en-IN') : '-',
        guest.attendedBy || '-',
        guest.notes || '-',
        guest.date,
      ]);

      const csv = [
        headers.map(h => `"${h}"`).join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `guests-${exportType}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setIsExporting(false);
    }
  };

  const exportToPDF = () => {
    setIsExporting(true);
    try {
      const filteredGuests = getFilteredGuests();
      
      // Create PDF with A4 size
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;

      const addHeader = (pageNum: number) => {
        // Header background
        pdf.setFillColor(37, 99, 235); // Blue-600
        pdf.rect(0, 0, pageWidth, 35, 'F');
        
        // Company/Title
        pdf.setFontSize(24);
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Cosmic Conference 2025', margin, 15);
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Guest Attendance Report', margin, 23);
        
        // Page number
        pdf.setFontSize(10);
        pdf.text(`Page ${pageNum}`, pageWidth - margin - 15, 20);
      };

      const addFooter = (pageNum: number) => {
        // Footer line
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
        
        // Footer text
        pdf.setFontSize(8);
        pdf.setTextColor(120, 120, 120);
        pdf.text(
          `Generated on ${new Date().toLocaleString('en-IN')} | Confidential Report`,
          margin,
          pageHeight - 7
        );
        
        pdf.text(
          `Total Records: ${filteredGuests.length}`,
          pageWidth - margin - 35,
          pageHeight - 7
        );
      };

      let yPosition = 45;
      let pageCount = 1;

      // Add first page header
      addHeader(pageCount);

      // Report metadata section
      pdf.setFillColor(248, 250, 252); // Gray-50
      pdf.roundedRect(margin, yPosition, contentWidth, 28, 2, 2, 'F');
      
      yPosition += 7;
      
      // Metadata
      pdf.setFontSize(10);
      pdf.setTextColor(71, 85, 105); // Gray-600
      pdf.setFont('helvetica', 'bold');
      pdf.text('Report Details:', margin + 5, yPosition);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      
      yPosition += 6;
      pdf.text(`Report Type: ${exportType === 'all' ? 'Complete Guest Registry' : 'Attended Guests Only'}`, margin + 5, yPosition);
      
      yPosition += 5;
      pdf.text(`Report Date: ${new Date().toLocaleDateString('en-IN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, margin + 5, yPosition);
      
      yPosition += 5;
      pdf.text(`Total Records: ${filteredGuests.length}`, margin + 5, yPosition);

      yPosition += 15;

      // Statistics cards
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(30, 41, 59);
      pdf.text('Attendance Summary', margin, yPosition);
      
      yPosition += 8;

      const cardWidth = (contentWidth - 15) / 4;
      const statsData = [
        { label: 'Total Guests', value: stats.totalGuests, color: [59, 130, 246] }, // Blue
        { label: 'Checked In', value: stats.checkedIn, color: [34, 197, 94] }, // Green
        { label: 'Checked Out', value: stats.checkedOut, color: [168, 85, 247] }, // Purple
        { label: 'Pending', value: stats.pending, color: [251, 146, 60] }, // Orange
      ];

      statsData.forEach((stat, idx) => {
        const xPos = margin + (cardWidth + 5) * idx;
        
        // Card background
        pdf.setFillColor(255, 255, 255);
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(xPos, yPosition, cardWidth, 18, 2, 2, 'FD');
        
        // Colored accent bar
        pdf.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
        pdf.roundedRect(xPos, yPosition, cardWidth, 3, 1, 1, 'F');
        
        // Value
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
        pdf.text(String(stat.value), xPos + cardWidth / 2, yPosition + 11, { align: 'center' });
        
        // Label
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 116, 139);
        pdf.text(stat.label, xPos + cardWidth / 2, yPosition + 16, { align: 'center' });
      });

      yPosition += 25;

      // Table section
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(30, 41, 59);
      pdf.text('Guest Records', margin, yPosition);
      
      yPosition += 8;

      // Table headers with modern styling
      const headers = ['ID', 'Guest Name', 'Phone', 'Status', 'Check-in', 'Check-out', 'Attended By', 'Date'];
      const colWidths = [18, 35, 24, 22, 26, 26, 30, 22];
      
      pdf.setFillColor(37, 99, 235); // Blue-600
      pdf.roundedRect(margin, yPosition - 2, contentWidth, 8, 1, 1, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');

      let xPosition = margin + 2;
      headers.forEach((header, idx) => {
        pdf.text(header, xPosition + 2, yPosition + 3);
        xPosition += colWidths[idx];
      });

      yPosition += 10;

      // Table Data with modern alternating rows
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);

      filteredGuests.forEach((guest, idx) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 30) {
          addFooter(pageCount);
          pdf.addPage();
          pageCount++;
          yPosition = 45;
          
          addHeader(pageCount);
          
          // Repeat table headers
          pdf.setFillColor(37, 99, 235);
          pdf.roundedRect(margin, yPosition - 2, contentWidth, 8, 1, 1, 'F');
          
          pdf.setTextColor(255, 255, 255);
          pdf.setFont('helvetica', 'bold');
          
          xPosition = margin + 2;
          headers.forEach((header, idx) => {
            pdf.text(header, xPosition + 2, yPosition + 3);
            xPosition += colWidths[idx];
          });
          
          yPosition += 10;
          pdf.setFont('helvetica', 'normal');
        }

        // Alternating row background
        if (idx % 2 === 0) {
          pdf.setFillColor(248, 250, 252);
          pdf.rect(margin, yPosition - 3, contentWidth, 6, 'F');
        }

        // Row data
        const rowData = [
          guest.id.substring(0, 8),
          guest.guestName.length > 20 ? guest.guestName.substring(0, 18) + '...' : guest.guestName,
          guest.guestPhone,
          guest.status === 'checked-in' ? 'Checked In' : guest.status === 'checked-out' ? 'Checked Out' : 'Pending',
          guest.checkInTime ? new Date(guest.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-',
          guest.checkOutTime ? new Date(guest.checkOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-',
          (guest.attendedBy || '-').length > 18 ? (guest.attendedBy || '-').substring(0, 16) + '...' : (guest.attendedBy || '-'),
          guest.date,
        ];

        // Color-code status
        xPosition = margin + 2;
        rowData.forEach((data, colIdx) => {
          pdf.setTextColor(51, 65, 85); // Default gray
          
          // Special styling for status column
          if (colIdx === 3) {
            if (data === 'Checked In') {
              pdf.setTextColor(22, 163, 74); // Green
              pdf.setFont('helvetica', 'bold');
            } else if (data === 'Checked Out') {
              pdf.setTextColor(147, 51, 234); // Purple
              pdf.setFont('helvetica', 'bold');
            } else {
              pdf.setTextColor(234, 88, 12); // Orange
              pdf.setFont('helvetica', 'bold');
            }
          }
          
          pdf.text(String(data), xPosition + 3, yPosition);
          
          if (colIdx === 3) {
            pdf.setFont('helvetica', 'normal');
          }
          
          xPosition += colWidths[colIdx];
        });

        yPosition += 6;
      });

      // Add footer to last page
      addFooter(pageCount);

      // Save PDF
      pdf.save(`guest-report-${exportType}-${new Date().toISOString().split('T')[0]}.pdf`);

      setIsExporting(false);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 md:px-6 py-4">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-white" />
          <h2 className="text-base md:text-lg font-bold text-white">Export Guest Data</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">
        {/* Filter Options */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Select Data to Export:</p>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setExportType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                exportType === 'all'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Guests ({guestList.length})
            </button>
            <button
              onClick={() => setExportType('attended')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                exportType === 'attended'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Attended Only ({stats.checkedIn + stats.checkedOut})
            </button>
          </div>
        </div>

        {/* Export Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CSV Export */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportToCSV}
            disabled={isExporting}
            className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center mb-3">
              {isExporting ? (
                <Loader className="w-8 h-8 text-orange-600 animate-spin" />
              ) : (
                <File className="w-8 h-8 text-orange-600" />
              )}
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-1">Download CSV</h3>
            <p className="text-sm text-gray-600">
              {isExporting ? 'Generating...' : 'Excel compatible format'}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {exportType === 'all' 
                ? `${guestList.length} records` 
                : `${stats.checkedIn + stats.checkedOut} attended records`}
            </p>
          </motion.button>

          {/* PDF Export */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportToPDF}
            disabled={isExporting}
            className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center mb-3">
              {isExporting ? (
                <Loader className="w-8 h-8 text-red-600 animate-spin" />
              ) : (
                <FileText className="w-8 h-8 text-red-600" />
              )}
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-1">Download PDF</h3>
            <p className="text-sm text-gray-600">
              {isExporting ? 'Generating...' : 'Professional report format'}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {exportType === 'all' 
                ? `${guestList.length} records` 
                : `${stats.checkedIn + stats.checkedOut} attended records`}
            </p>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default GuestExport;