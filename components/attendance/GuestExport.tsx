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
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;

      let yPosition = margin;

      // Title
      pdf.setFontSize(18);
      pdf.setTextColor(31, 115, 76); // Green color
      pdf.text('Guest Management Report', margin, yPosition);
      yPosition += 10;

      // Date and Summary
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Report Generated: ${new Date().toLocaleString('en-IN')}`, margin, yPosition);
      yPosition += 5;
      pdf.text(`Report Type: ${exportType === 'all' ? 'All Guests' : 'Attended Only'}`, margin, yPosition);
      yPosition += 8;

      // Statistics Box
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Summary Statistics:', margin, yPosition);
      yPosition += 6;

      pdf.setFontSize(9);
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(margin, yPosition, contentWidth / 2 - 2, 25);
      
      const statsText = [
        `Total Guests: ${stats.totalGuests}`,
        `Checked In: ${stats.checkedIn}`,
        `Checked Out: ${stats.checkedOut}`,
        `Pending: ${stats.pending}`,
      ];

      let statsY = yPosition + 3;
      statsText.forEach(text => {
        pdf.text(text, margin + 3, statsY);
        statsY += 5;
      });

      yPosition += 30;

      // Table Headers
      const headers = ['ID', 'Guest Name', 'Phone', 'Status', 'Check-in', 'Check-out', 'Attended By', 'Date'];
      const colWidths = [12, 25, 18, 18, 22, 22, 25, 18];
      
      pdf.setFillColor(31, 115, 76);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'bold');

      let xPosition = margin;
      headers.forEach((header, idx) => {
        pdf.text(header, xPosition, yPosition);
        xPosition += colWidths[idx];
      });

      yPosition += 7;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 2;

      // Table Data
      pdf.setTextColor(0, 0, 0);
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(8);

      let pageCount = 1;

      filteredGuests.forEach((guest, idx) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 15) {
          pdf.addPage();
          yPosition = margin;
          pageCount++;
          
          // Repeat headers on new page
          pdf.setFillColor(31, 115, 76);
          pdf.setTextColor(255, 255, 255);
          pdf.setFont(undefined, 'bold');
          
          xPosition = margin;
          headers.forEach((header, idx) => {
            pdf.text(header, xPosition, yPosition);
            xPosition += colWidths[idx];
          });
          
          yPosition += 5;
          pdf.setDrawColor(200, 200, 200);
          pdf.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 2;
          
          pdf.setTextColor(0, 0, 0);
          pdf.setFont(undefined, 'normal');
        }

        // Row data
        const rowData = [
          guest.id.substring(0, 7),
          guest.guestName,
          guest.guestPhone,
          guest.status === 'checked-in' ? 'Checked In' : guest.status === 'checked-out' ? 'Checked Out' : 'Pending',
          guest.checkInTime ? new Date(guest.checkInTime).toLocaleTimeString('en-IN') : '-',
          guest.checkOutTime ? new Date(guest.checkOutTime).toLocaleTimeString('en-IN') : '-',
          guest.attendedBy || '-',
          guest.date,
        ];

        xPosition = margin;
        rowData.forEach((data, idx) => {
          // Alternate row background
          if (idx === 0) {
            if (idx % 2 === 0) {
              pdf.setFillColor(240, 240, 240);
              pdf.rect(margin, yPosition - 3, contentWidth, 4, 'F');
            }
          }
          
          const text = String(data).length > 15 ? String(data).substring(0, 12) + '...' : String(data);
          pdf.text(text, xPosition + 1, yPosition);
          xPosition += colWidths[idx];
        });

        yPosition += 4;
      });

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        `Page ${pageCount} | Generated on ${new Date().toLocaleString('en-IN')}`,
        pageWidth / 2,
        pageHeight - 5,
        { align: 'center' }
      );

      // Save PDF
      pdf.save(`guests-${exportType}-${new Date().toISOString().split('T')[0]}.pdf`);

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

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">📊 Info:</span> Both formats include guest details, attendance status, check-in/out times, and timestamps. Use CSV for data analysis or PDF for printing/sharing reports.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default GuestExport;