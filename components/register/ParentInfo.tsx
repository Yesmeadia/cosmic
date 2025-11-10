'use client';
import React, { useState, useEffect } from 'react';
import { Users, AlertCircle } from 'lucide-react';
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
  onValidationChange?: (isValid: boolean) => void;
}

const attendingOptions = ['Father', 'Mother', 'Others', 'None'];

export const ParentInfo: React.FC<ParentInfoProps> = ({ formData, onChange, onValidationChange }) => {
  const [fatherMobileError, setFatherMobileError] = useState<string>('');
  const [fatherMobileTouched, setFatherMobileTouched] = useState<boolean>(false);

  const safeFormData = {
    fatherName: formData.fatherName ?? '',
    motherName: formData.motherName ?? '',
    fathermobile: formData.fathermobile ?? '',
    attendingParent: formData.attendingParent ?? '',
  };

  // Phone validation function for Indian and UAE numbers
  const validatePhone = (phone: string): { isValid: boolean; message: string; country?: string } => {
    if (!phone || phone.trim() === '') {
      return {
        isValid: false,
        message: 'Phone number is required'
      };
    }

    // Remove spaces and hyphens for validation
    const sanitized = phone.replace(/[\s-]/g, '');

    // Check for invalid characters (no letters or special chars except +)
    if (/[a-zA-Z]/.test(phone)) {
      return {
        isValid: false,
        message: 'Only numbers are allowed. No letters or special characters.'
      };
    }

    // Extract digits only (preserve + for international codes)
    const digitsOnly = sanitized.replace(/\D/g, '');

    // Indian numbers: 10 digits starting with 6-9
    if (/^[6-9]\d{9}$/.test(digitsOnly)) {
      return {
        isValid: true,
        message: 'Valid Indian mobile number',
        country: 'India'
      };
    }

    // UAE numbers with +971
    if (/^\+?971\d{9}$/.test(sanitized) || /^00971\d{9}$/.test(sanitized)) {
      return {
        isValid: true,
        message: 'Valid UAE mobile number',
        country: 'UAE'
      };
    }

    // UAE numbers starting with 05
    if (/^05\d{8}$/.test(digitsOnly)) {
      return {
        isValid: true,
        message: 'Valid UAE mobile number',
        country: 'UAE'
      };
    }

    // UAE numbers starting with 5 (9 digits total)
    if (/^5\d{8}$/.test(digitsOnly)) {
      return {
        isValid: true,
        message: 'Valid UAE mobile number',
        country: 'UAE'
      };
    }

    // Error messages
    if (digitsOnly.length < 9) {
      return {
        isValid: false,
        message: 'Phone number is too short (minimum 9 digits)'
      };
    }

    if (digitsOnly.length > 12) {
      return {
        isValid: false,
        message: 'Phone number is too long (maximum 12 digits)'
      };
    }

    return {
      isValid: false,
      message: 'Invalid format. Use Indian (10 digits starting with 6-9) or UAE (05XX XXXXXX or +971 5XX XXXXXX)'
    };
  };

  const handleFatherMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers, +, spaces, and hyphens during typing
    const sanitized = value.replace(/[^\d+\s-]/g, '');
    onChange('fathermobile', sanitized);

    if (fatherMobileTouched && sanitized) {
      const validation = validatePhone(sanitized);
      setFatherMobileError(validation.isValid ? '' : validation.message);
    }
  };

  const handleFatherMobileBlur = () => {
    setFatherMobileTouched(true);
    const value = safeFormData.fathermobile;

    if (!value) {
      setFatherMobileError("Father's mobile number is required");
    } else {
      const validation = validatePhone(value);
      setFatherMobileError(validation.isValid ? '' : validation.message);
    }
  };

  // Check form validity
  useEffect(() => {
    const isValid =
      safeFormData.fatherName.trim() !== '' &&
      safeFormData.motherName.trim() !== '' &&
      safeFormData.fathermobile.trim() !== '' &&
      !fatherMobileError &&
      safeFormData.attendingParent !== '';

    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [safeFormData, fatherMobileError, onValidationChange]);

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

        <div className="relative md:col-span-2">
          <Input
            label="Father's Mobile Number"
            type="tel"
            required
            value={safeFormData.fathermobile}
            onChange={handleFatherMobileChange}
            onBlur={handleFatherMobileBlur}
            placeholder="Mobile number"
            className={fatherMobileError && fatherMobileTouched ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          />
          {fatherMobileError && fatherMobileTouched && (
            <div className="flex items-start gap-2 mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-medium">{fatherMobileError}</p>
            </div>
          )}
          {!fatherMobileError && fatherMobileTouched && safeFormData.fathermobile && (
            <div className="flex items-start gap-2 mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-green-600 font-medium">{validatePhone(safeFormData.fathermobile).message}</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-4">
          Who will accompany the student? <span className="text-red-500">*</span>
        </label>
        <div className="grid md:grid-cols-2 gap-3">
          {attendingOptions.map((option) => (
            <label
              key={option}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.attendingParent === option
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 bg-white hover:border-purple-300'
              }`}
            >
              <input
                type="radio"
                required
                name="attendingParent"
                value={option}
                checked={safeFormData.attendingParent === option}
                onChange={(e) => onChange('attendingParent', e.target.value)}
                className="w-5 h-5 text-purple-600 cursor-pointer"
              />
              <span className={`ml-3 font-medium ${
                formData.attendingParent === option
                  ? 'text-purple-600'
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