'use client';

import React, { useState, useEffect } from 'react';
import { User, AlertCircle } from 'lucide-react';
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
  onValidationChange?: (isValid: boolean) => void;
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

export const StudentInfo: React.FC<StudentInfoProps> = ({ formData, onChange, onValidationChange }) => {
  const [emailError, setEmailError] = useState<string>('');
  const [emailTouched, setEmailTouched] = useState<boolean>(false);
  const [mobileError, setMobileError] = useState<string>('');
  const [mobileTouched, setMobileTouched] = useState<boolean>(false);
  const [whatsappError, setWhatsappError] = useState<string>('');
  const [whatsappTouched, setWhatsappTouched] = useState<boolean>(false);

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

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
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

  // Check if form is valid
  const checkFormValidity = () => {
    const isValid =
      safeFormData.studentName.trim() !== '' &&
      safeFormData.mobile.trim() !== '' &&
      !mobileError &&
      safeFormData.whatsapp.trim() !== '' &&
      !whatsappError &&
      safeFormData.email.trim() !== '' &&
      !emailError &&
      safeFormData.class !== '' &&
      safeFormData.school.trim() !== '' &&
      safeFormData.gender !== '';

    if (onValidationChange) {
      onValidationChange(isValid);
    }
    return isValid;
  };

  useEffect(() => {
    checkFormValidity();
  }, [formData, emailError, mobileError, whatsappError]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange('email', value);

    if (!value) {
      setEmailError('Email is required');
    } else if (!validateEmail(value)) {
      setEmailError('Please enter a valid email address (e.g., student@example.com)');
    } else {
      setEmailError('');
    }

    if (!emailTouched) setEmailTouched(true);
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    const value = safeFormData.email;

    if (!value) {
      setEmailError('Email is required');
    } else if (!validateEmail(value)) {
      setEmailError('Please enter a valid email address (e.g., student@example.com)');
    } else {
      setEmailError('');
    }
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers, +, spaces, and hyphens during typing
    const sanitized = value.replace(/[^\d+\s-]/g, '');
    onChange('mobile', sanitized);

    if (!sanitized) {
      setMobileError('Mobile number is required');
    } else {
      const validation = validatePhone(sanitized);
      setMobileError(validation.isValid ? '' : validation.message);
    }

    if (!mobileTouched) setMobileTouched(true);

    // Auto-update WhatsApp if checkbox is checked
    if (safeFormData.whatsappSameAsMobile) {
      onChange('whatsapp', sanitized);
      if (!sanitized) {
        setWhatsappError('WhatsApp number is required');
      } else {
        const validation = validatePhone(sanitized);
        setWhatsappError(validation.isValid ? '' : validation.message);
      }
      if (!whatsappTouched) setWhatsappTouched(true);
    }
  };

  const handleMobileBlur = () => {
    setMobileTouched(true);
    const value = safeFormData.mobile;

    if (!value) {
      setMobileError('Mobile number is required');
    } else {
      const validation = validatePhone(value);
      setMobileError(validation.isValid ? '' : validation.message);
    }
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers, +, spaces, and hyphens during typing
    const sanitized = value.replace(/[^\d+\s-]/g, '');
    onChange('whatsapp', sanitized);

    if (!sanitized) {
      setWhatsappError('WhatsApp number is required');
    } else {
      const validation = validatePhone(sanitized);
      setWhatsappError(validation.isValid ? '' : validation.message);
    }

    if (!whatsappTouched) setWhatsappTouched(true);
  };

  const handleWhatsappBlur = () => {
    setWhatsappTouched(true);
    const value = safeFormData.whatsapp;

    if (!value) {
      setWhatsappError('WhatsApp number is required');
    } else {
      const validation = validatePhone(value);
      setWhatsappError(validation.isValid ? '' : validation.message);
    }
  };

  const handleWhatsAppCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    onChange('whatsappSameAsMobile', isChecked);
    if (isChecked) {
      onChange('whatsapp', safeFormData.mobile);
      if (safeFormData.mobile) {
        const validation = validatePhone(safeFormData.mobile);
        setWhatsappError(validation.isValid ? '' : validation.message);
        setWhatsappTouched(true);
      }
    } else {
      onChange('whatsapp', '');
      setWhatsappError('WhatsApp number is required');
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

        <div className="relative">
          <Input
            label="Mobile Number"
            type="tel"
            required
            value={safeFormData.mobile}
            onChange={handleMobileChange}
            onBlur={handleMobileBlur}
            placeholder="Mobile number"
            className={mobileError && mobileTouched ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          />
          {mobileError && mobileTouched && (
            <div className="flex items-start gap-2 mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-medium">{mobileError}</p>
            </div>
          )}
          {!mobileError && mobileTouched && safeFormData.mobile && (
            <div className="flex items-start gap-2 mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-green-600 font-medium">{validatePhone(safeFormData.mobile).message}</p>
            </div>
          )}
        </div>

        <div>
          <div className="relative">
            <Input
              label="WhatsApp Number"
              type="tel"
              required
              value={safeFormData.whatsapp}
              onChange={handleWhatsappChange}
              onBlur={handleWhatsappBlur}
              placeholder="WhatsApp number"
              disabled={safeFormData.whatsappSameAsMobile}
              className={whatsappError && whatsappTouched && !safeFormData.whatsappSameAsMobile ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            />
            {whatsappError && whatsappTouched && !safeFormData.whatsappSameAsMobile && (
              <div className="flex items-start gap-2 mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 font-medium">{whatsappError}</p>
              </div>
            )}
            {!whatsappError && whatsappTouched && safeFormData.whatsapp && !safeFormData.whatsappSameAsMobile && (
              <div className="flex items-start gap-2 mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-green-600 font-medium">{validatePhone(safeFormData.whatsapp).message}</p>
              </div>
            )}
          </div>
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

        <div className="relative">
          <Input
            label="Email ID"
            type="email"
            required
            value={safeFormData.email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            placeholder="student@example.com"
            className={emailError && emailTouched ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          />
          {emailError && emailTouched && (
            <div className="flex items-start gap-2 mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-medium">{emailError}</p>
            </div>
          )}
          {!emailError && emailTouched && safeFormData.email && (
            <div className="flex items-start gap-2 mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-green-600 font-medium">Valid email address</p>
            </div>
          )}
        </div>

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