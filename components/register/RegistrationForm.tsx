'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { StudentInfo } from './StudentInfo';
import { ParentInfo } from './ParentInfo';
import { SuccessMessage } from './SuccessMessage';
import { addRegistration } from '@/lib/firestore';

export const RegistrationForm: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    mobile: '',
    whatsapp: '',
    email: '',
    class: '',
    school: '',
    fatherName: '',
    motherName: '',
    attendingParent: '',
    fathermobile: '',
    gender: '',
    whatsappSameAsMobile: false
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isStep1Valid = formData.studentName && formData.mobile && formData.email && formData.class && formData.school && formData.gender && formData.whatsapp;
  const isStep2Valid = formData.fatherName && formData.motherName && formData.fathermobile && formData.attendingParent;

  const handleNext = () => {
    if (isStep1Valid) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await addRegistration({
        ...formData,
        attendingParent: formData.attendingParent as 'Father' | 'Mother' | 'Both' | 'Others'
      });
      
      if (result.success) {
        setSubmitted(true);
        setTimeout(() => router.push('/'), 3000);
      } else {
        alert('Error submitting form. Please try again.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return <SuccessMessage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="mb-8 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold transition-all ${
            currentStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {currentStep > 1 ? <CheckCircle className="w-6 h-6" /> : '1'}
          </div>
          <div className={`h-1 w-12 ${currentStep >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold transition-all ${
            currentStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
        </div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-8 md:p-12">
            {/* Step 1: Student Info */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <StudentInfo formData={formData} onChange={handleChange} />
              </motion.div>
            )}

            {/* Step 2: Parent Info */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <ParentInfo formData={formData} onChange={handleChange} />
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-12">
              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 py-3 px-6 border-2 border-indigo-600 text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
              )}

              {currentStep === 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStep1Valid}
                  className="flex-1 py-3 px-6 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isStep2Valid}
                  className="flex-1 py-3 px-6 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Submit Registration
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Footer Info */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Your information is secure and will never be shared.
        </p>
      </div>
    </div>
  );
};