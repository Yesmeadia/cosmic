'use client';

import React from 'react';
import { User } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface StudentFormData {
  studentName: string;
  mobile: string;
  whatsapp: string;
  email: string;
  class: string;
  school: string;
  gender: string;
  whatsappSameAsMobile: boolean;
}

interface StudentInfoProps {
  formData: StudentFormData;
  onChange: (field: keyof StudentFormData, value: StudentFormData[keyof StudentFormData]) => void;
}

const classOptions = [
  { value: '9th', label: '9th' },
  { value: '10th', label: '10th' },
  { value: '11th', label: '11th' },
  { value: '12th', label: '12th' }
];

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
];

export const StudentInfo: React.FC<StudentInfoProps> = ({ formData, onChange }) => {
  const safeFormData = {
    studentName: formData.studentName ?? '',
    mobile: formData.mobile ?? '',
    whatsapp: formData.whatsapp ?? '',
    email: formData.email ?? '',
    class: formData.class ?? '',
    school: formData.school ?? '',
    gender: formData.gender ?? '',
    whatsappSameAsMobile: formData.whatsappSameAsMobile ?? false,
  };

  const handleWhatsAppCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    onChange('whatsappSameAsMobile', isChecked);
    if (isChecked) {
      onChange('whatsapp', safeFormData.mobile);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-100 rounded-lg">
          <User className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Student Information</h3>
          <p className="text-sm text-gray-500">Enter your basic details</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Input
          label="Full Name"
          type="text"
          required
          value={safeFormData.studentName}
          onChange={(e) => onChange('studentName', e.target.value)}
          placeholder="Enter student name"
        />
        
        <Select
          label="Gender"
          required
          options={genderOptions}
          value={safeFormData.gender}
          onChange={(e) => onChange('gender', e.target.value)}
        />
        
        <Input
          label="Mobile Number"
          type="tel"
          required
          value={safeFormData.mobile}
          onChange={(e) => onChange('mobile', e.target.value)}
          placeholder="10-digit mobile number"
          pattern="[0-9]{10}"
        />

        <div>
          <Input
            label="WhatsApp Number"
            type="tel"
            required
            value={safeFormData.whatsapp}
            onChange={(e) => onChange('whatsapp', e.target.value)}
            placeholder="10-digit WhatsApp number"
            pattern="[0-9]{10}"
            disabled={safeFormData.whatsappSameAsMobile}
          />
          <div className="flex items-center mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <input
              type="checkbox"
              id="whatsappSameAsMobile"
              checked={safeFormData.whatsappSameAsMobile}
              onChange={handleWhatsAppCheckChange}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="whatsappSameAsMobile" className="ml-3 text-sm font-medium text-gray-700 cursor-pointer">
              Same as Mobile number
            </label>
          </div>
        </div>

        <Input
          label="Email ID"
          type="email"
          required
          value={safeFormData.email}
          onChange={(e) => onChange('email', e.target.value)}
          placeholder="student@example.com"
        />

        <Select
          label="Class"
          required
          options={classOptions}
          value={safeFormData.class}
          onChange={(e) => onChange('class', e.target.value)}
        />

        <Input
          label="Name of School"
          type="text"
          required
          value={safeFormData.school}
          onChange={(e) => onChange('school', e.target.value)}
          placeholder="School name"
        />
      </div>
    </div>
  );
};