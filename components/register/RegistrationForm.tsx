'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle, Home } from 'lucide-react';
import { StudentInfo } from './StudentInfo';
import { ParentInfo } from './ParentInfo';
import { SuccessMessage } from './SuccessMessage';
import { addRegistration, getRegistrationCount } from '@/lib/firestore';

export const RegistrationForm: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isWaitlist, setIsWaitlist] = useState(false);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [step1Valid, setStep1Valid] = useState(false);
  const [step2Valid, setStep2Valid] = useState(false);
  const [paymentAgreed, setPaymentAgreed] = useState(false);

  const [formData, setFormData] = useState({
    studentName: '',
    mobile: '',
    whatsapp: '',
    email: '',
    class: '',
    school: '',
    place: '', // ⭐ Added place field
    fatherName: '',
    motherName: '',
    attendingParent: '',
    fathermobile: '',
    gender: '',
    whatsappSameAsMobile: false
  });

  useEffect(() => {
    // Fetch current registration count
    const fetchCount = async () => {
      try {
        const count = await getRegistrationCount();
        setRegistrationCount(count);
      } catch (error) {
        console.error('Error fetching count:', error);
      }
    };
    fetchCount();
  }, []);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step1Valid) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Final validation check
    if (!step1Valid || !step2Valid || !paymentAgreed) {
      alert('Please fill in all required fields and agree to the payment terms before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check current count before submission
      const currentCount = await getRegistrationCount();
      const isWaitlistRegistration = currentCount >= 100;

      const result = await addRegistration({
        ...formData,
        attendingParent: formData.attendingParent as 'Father' | 'Mother' | 'Both' | 'Others',
        isWaitlist: isWaitlistRegistration,
        registrationId: ''
      });

      if (result.success) {
        setIsWaitlist(isWaitlistRegistration);
        setSubmitted(true);
        // Redirect after 5 seconds
        setTimeout(() => router.push('/'), 5000);
      } else {
        alert('Error submitting form. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Error submitting form. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return <SuccessMessage isWaitlist={isWaitlist} />;
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed py-8 px-4"
      style={{ backgroundImage: 'url(/bg.jpg)' }}
    >
      <div className="min-h-screen bg-black/40 backdrop-blur-sm absolute inset-0" />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Registration Status Banner */}
        {registrationCount >= 100 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-amber-500/95 backdrop-blur-md rounded-xl shadow-lg p-4 border-2 border-amber-600"
          >
            <p className="text-center text-white font-semibold">
              ⚠️ Regular registrations are full ({registrationCount}/100). New registrations will be added to the waitlist.
            </p>
          </motion.div>
        )}

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold transition-all shadow-lg ${
            currentStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-white/90 text-gray-600'
          }`}>
            {currentStep > 1 ? <CheckCircle className="w-6 h-6" /> : '1'}
          </div>
          <div className={`h-1 w-12 rounded-full transition-all ${currentStep >= 2 ? 'bg-indigo-600' : 'bg-white/50'}`} />
          <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold transition-all shadow-lg ${
            currentStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-white/90 text-gray-600'
          }`}>
            2
          </div>
        </div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-8 md:p-12">
            {/* Step 1: Student Info */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <StudentInfo
                  formData={formData}
                  onChange={handleChange}
                  onValidationChange={setStep1Valid}
                />
              </motion.div>
            )}

            {/* Step 2: Parent Info */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <ParentInfo
                  formData={formData}
                  onChange={handleChange}
                  onValidationChange={setStep2Valid}
                />

                {/* Payment Agreement Checkbox */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-8 pt-8 border-t-2 border-gray-200"
                >
                  <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={paymentAgreed}
                      onChange={(e) => setPaymentAgreed(e.target.checked)}
                      className="w-5 h-5 text-indigo-600 border-gray-300 rounded cursor-pointer mt-0.5 flex-shrink-0"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      By submission, I agree to pay AED 100 soon.
                    </span>
                  </label>
                  {!paymentAgreed && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-xs text-amber-600 text-center font-medium"
                    >
                      ⚠️ Please agree to the payment terms to proceed with submission
                    </motion.p>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-12">
              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={handleBack}
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
                  disabled={!step1Valid}
                  className="flex-1 py-3 px-6 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !step2Valid || !paymentAgreed}
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

            {/* Validation Status Message */}
            {currentStep === 1 && !step1Valid && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200"
              >
                <p className="text-sm text-amber-700 text-center">
                  ⚠️ Please fill in all fields correctly to proceed to the next step
                </p>
              </motion.div>
            )}
            {currentStep === 2 && !step2Valid && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200"
              >
                <p className="text-sm text-amber-700 text-center">
                  ⚠️ Please fill in all fields correctly to submit the form
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Back to Home Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex justify-center"
        >
          <button
            onClick={() => router.push('/')}
            className="group relative px-8 py-3 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/20 hover:border-white/50 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Home className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform" />
            <span className="relative z-10">Back to Home</span>
          </button>
        </motion.div>

        {/* Footer Info */}
        <footer className="text-center text-semibold text-white/80 mt-4 drop-shadow-lg">
          &copy; {new Date().getFullYear()} YES India Foundation. All rights reserved.
        </footer>
      </div>
    </div>
  );
};