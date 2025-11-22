// components/attendance/ActionsSidebar.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Download, Users, TrendingUp } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '@/contexts/AuthContext';

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  school: string;
  timestamp: Date;
  attendingParent: string;
  parentVerified: boolean;
  program: string;
}

interface ActionsSidebarProps {
  attendanceList: AttendanceRecord[];
  onExport: () => void;
}

const ActionsSidebar: React.FC<ActionsSidebarProps> = ({ 
  attendanceList, 
  onExport
}) => {
  const { user } = useAuth();
  
  const stats = {
    total: attendanceList.length,
    withParents: attendanceList.filter(record => record.attendingParent !== 'None').length,
    withoutParents: attendanceList.filter(record => record.attendingParent === 'None').length,
    parentParticipation: attendanceList.filter(record => record.parentVerified).length,
  };

  // Calculate total participation count
  const totalParticipation = attendanceList.reduce((total, record) => {
    let count = 1; // Student
    if (record.attendingParent !== 'None') {
      if (record.attendingParent === 'Both') {
        count += 2; // Both parents
      } else {
        count += 1; // One parent
      }
    }
    return total + count;
  }, 0);

  const handlePDFExport = async () => {
    const doc = new jsPDF();
    
    // Load and add logo
    let logoLoaded = false;
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      
      // Wait for logo to load
      await new Promise<void>((resolve, reject) => {
        logoImg.onload = () => {
          try {
            // Try to add the logo
            doc.addImage(logoImg, 'PNG', 14, 10, 25, 25);
            logoLoaded = true;
            console.log('Logo loaded successfully');
            resolve();
          } catch (err) {
            console.error('Error adding logo to PDF:', err);
            resolve();
          }
        };
        logoImg.onerror = (err) => {
          console.warn('Logo not found at /cosmic.png, continuing without it');
          resolve();
        };
        // Set source after setting up handlers
        logoImg.src = '/cosmic.png';
        
        // Timeout after 3 seconds
        setTimeout(() => {
          if (!logoLoaded) {
            console.warn('Logo loading timeout');
            resolve();
          }
        }, 3000);
      });
    } catch (error) {
      console.error('Error loading logo:', error);
    }
    
    // Add header text (positioned to right of logo)
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('YES INDIA FOUNDATION', 45, 18);
    
    doc.setFontSize(14);
    doc.text('Cosmic Confluence - Attendance Report', 45, 26);
    
    // Add date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })}`, 14, 42);

    // Create stats boxes layout
    const pageWidth = doc.internal.pageSize.getWidth();
    const boxWidth = (pageWidth - 28 - 6) / 4; // 14mm margin on each side, 2mm gap between boxes
    const boxHeight = 18;
    const startY = 50;
    const startX = 14;

    // Stats data
    const statsData = [
      { label: 'Total Students', value: stats.total.toString(), color: [34, 197, 94] }, // green
      { label: 'With Parents', value: stats.withParents.toString(), color: [59, 130, 246] }, // blue
      { label: 'Without Parents', value: stats.withoutParents.toString(), color: [249, 115, 22] }, // orange
      { label: 'Total Participation', value: totalParticipation.toString(), color: [168, 85, 247] } // purple
    ];

    // Draw boxes
    statsData.forEach((stat, index) => {
      const boxX = startX + (index * (boxWidth + 2));
      
      // Box border
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.roundedRect(boxX, startY, boxWidth, boxHeight, 2, 2, 'S');
      
      // Label
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const labelWidth = doc.getTextWidth(stat.label);
      doc.text(stat.label, boxX + (boxWidth - labelWidth) / 2, startY + 6);
      
      // Value
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
      const valueWidth = doc.getTextWidth(stat.value);
      doc.text(stat.value, boxX + (boxWidth - valueWidth) / 2, startY + 14);
    });

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Add table
    autoTable(doc, {
      startY: startY + boxHeight + 8,
      head: [['S.No', 'Student ID', 'Name', 'Class', 'School', 'Accompanied By', 'Parent Participating', 'Time']],
      body: attendanceList.map((record, idx) => [
        idx + 1,
        record.studentId.substring(0, 7),
        record.studentName,
        record.class,
        record.school,
        record.attendingParent,
        record.parentVerified ? 'Yes' : 'No',
        record.timestamp.toLocaleTimeString('en-IN')
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
      didDrawPage: (data: any) => {
        const pageCount = doc.getNumberOfPages();
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        
        // Add "Generated by" after table on first page only
        if (data.pageNumber === 1 && (user?.email || user?.displayName)) {
          const userName = user.displayName || user.email || 'Unknown User';
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(80, 80, 80);
          const userText = `Generated by: ${userName}`;
          const userTextWidth = doc.getTextWidth(userText);
          const tableEndY = (data as any).cursor?.y || data.settings.startY + 20;
          doc.text(userText, (pageWidth - userTextWidth) / 2, tableEndY + 8);
        }
        
        // Add footer with generation time
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        
        // Footer text
        const generatedTime = new Date().toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        const footerText = `Generated on: ${generatedTime}`;
        const footerWidth = doc.getTextWidth(footerText);
        
        doc.text(footerText, (pageWidth - footerWidth) / 2, pageHeight - 10);
        
        // Page number
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          pageWidth - 30,
          pageHeight - 10
        );
      }
    });

    doc.save(`attendance-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-6"
    >
      {/* Actions Card */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border-2 border-gray-100">
        <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
          Quick Actions
        </h3>
        <div className="space-y-3">
          <button
            onClick={onExport}
            disabled={attendanceList.length === 0}
            className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl text-sm md:text-base font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 md:gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100"
          >
            <Download className="w-4 h-4 md:w-5 md:h-5" />
            Export CSV
          </button>
          <button
            onClick={handlePDFExport}
            disabled={attendanceList.length === 0}
            className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm md:text-base font-semibold hover:from-blue-600 hover:to-blue-700 transition-all disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 md:gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100"
          >
            <Download className="w-4 h-4 md:w-5 md:h-5" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border-2 border-gray-100">
        <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-2 h-6 bg-purple-600 rounded-full"></div>
          Today&apos;s Summary
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-600" />
              <span className="text-sm md:text-base text-gray-600">Total Present</span>
            </div>
            <span className="text-xl md:text-2xl font-bold text-green-600">
              {stats.total}
            </span>
          </div>
          
          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm md:text-base text-gray-600">With Parents</span>
            </div>
            <span className="text-lg md:text-xl font-bold text-blue-600">
              {stats.withParents}
            </span>
          </div>
          
          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-600" />
              <span className="text-sm md:text-base text-gray-600">Without Parents</span>
            </div>
            <span className="text-lg md:text-xl font-bold text-orange-600">
              {stats.withoutParents}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-sm md:text-base text-gray-600">Parent Participation</span>
            </div>
            <span className="text-lg md:text-xl font-bold text-purple-600">
              {stats.parentParticipation}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ActionsSidebar;