'use client';

import React from 'react';
import { Users } from 'lucide-react';
import { Input } from '../ui/Input';

interface ParentFormData {
  fatherName?: string;
  motherName?: string;
  fathermobile?: string;
  attendingParent?: string;
}

interface ParentInfoProps {
  formData: ParentFormData;
  onChange: (field: keyof ParentFormData, value: string) => void;
}

const attendingOptions = ['Father', 'Mother', 'Both', 'Others', 'None'];

export const ParentInfo: React.FC<ParentInfoProps> = ({ formData, onChange }) => {
  const safeFormData = {
    fatherName: formData.fatherName ?? '',
    motherName: formData.motherName ?? '',
    fathermobile: formData.fathermobile ?? '',
    attendingParent: formData.attendingParent ?? '',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-100 rounded-lg">
          <Users className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Parent Information</h3>
          <p className="text-sm text-gray-500">Help us know your parent details</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Input
          label="Father's Name"
          type="text"
          required
          value={safeFormData.fatherName}
          onChange={(e) => onChange('fatherName', e.target.value)}
          placeholder="Father's full name"
        />

        <Input
          label="Mother's Name"
          type="text"
          required
          value={safeFormData.motherName}
          onChange={(e) => onChange('motherName', e.target.value)}
          placeholder="Mother's full name"
        />

        <Input
          label="Father's Mobile Number"
          type="tel"
          required
          value={safeFormData.fathermobile}
          onChange={(e) => onChange('fathermobile', e.target.value)}
          placeholder="Mobile number"
          pattern="[0-9]{10}"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-4">
          Who will be attending the program? <span className="text-red-500">*</span>
        </label>
        <div className="grid md:grid-cols-2 gap-3">
          {attendingOptions.map((option) => (
            <label 
              key={option}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.attendingParent === option
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-indigo-300'
              }`}
            >
              <input
                type="radio"
                required
                name="attendingParent"
                value={option}
                checked={safeFormData.attendingParent === option}
                onChange={(e) => onChange('attendingParent', e.target.value)}
                className="w-5 h-5 text-indigo-600 cursor-pointer"
              />
              <span className={`ml-3 font-medium ${
                formData.attendingParent === option
                  ? 'text-indigo-600'
                  : 'text-gray-700'
              }`}>
                {option}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};