// components/attendance/QRCamera.tsx
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';
import jsQR from 'jsqr';

interface QRScannerProps {
  onScan: (data: string) => void;
  isScanning: boolean;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, isScanning }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastScanRef = useRef<string>('');
  const lastScanTimeRef = useRef<number>(0);

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const scanQRCode = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || isDetecting) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code && code.data) {
      const currentTime = Date.now();
      // Prevent duplicate scans within 3 seconds
      if (code.data === lastScanRef.current && currentTime - lastScanTimeRef.current < 3000) {
        return;
      }

      lastScanRef.current = code.data;
      lastScanTimeRef.current = currentTime;
      setIsDetecting(true);

      // Extract first 7 digits from QR code
      const qrData = code.data.replace(/\D/g, '').substring(0, 7);
      
      if (qrData.length >= 7) {
        onScan(qrData);
        setTimeout(() => setIsDetecting(false), 2000);
      } else {
        setIsDetecting(false);
      }
    }
  }, [isDetecting, onScan]);

  const startCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Camera access not supported on this device');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraError(null);

        // Start scanning interval
        scanIntervalRef.current = setInterval(() => {
          scanQRCode();
        }, 300); // Scan every 300ms
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setCameraError('Camera permission denied or not available');
    }
  }, [scanQRCode]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isScanning) {
      timeoutId = setTimeout(() => startCamera(), 0);
    } else {
      stopCamera();
    }
    return () => {
      clearTimeout(timeoutId);
      stopCamera();
    };
  }, [isScanning, startCamera, stopCamera]);

  if (cameraError) {
    return (
      <div className="relative bg-gray-900 rounded-xl overflow-hidden h-64 md:h-80 w-full flex items-center justify-center">
        <div className="text-center text-white p-4 md:p-6">
          <AlertCircle className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 text-red-400" />
          <h3 className="text-base md:text-lg font-bold mb-2">Camera Error</h3>
          <p className="text-sm md:text-base text-gray-300 mb-2">{cameraError}</p>
          <p className="text-xs md:text-sm text-gray-400">
            Please check camera permissions or use manual input
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-black rounded-xl overflow-hidden h-64 md:h-80 w-full">
      {isScanning ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Scanning frame */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-36 h-36 md:w-48 md:h-48 border-2 border-green-400 rounded-lg relative">
              <div className="absolute top-0 left-0 w-4 h-4 md:w-6 md:h-6 border-t-2 border-l-2 border-green-400 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-4 h-4 md:w-6 md:h-6 border-t-2 border-r-2 border-green-400 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 md:w-6 md:h-6 border-b-2 border-l-2 border-green-400 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 md:w-6 md:h-6 border-b-2 border-r-2 border-green-400 rounded-br-lg"></div>
            </div>
          </div>

          {/* Scanning line animation */}
          <motion.div
            animate={{ y: ['0%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute w-36 md:w-48 left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2 h-0.5 md:h-1 bg-gradient-to-b from-transparent via-green-400 to-transparent pointer-events-none"
          />

          {/* Detection overlay */}
          {isDetecting && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center text-white p-4 md:p-6"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-12 h-12 md:w-16 md:h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3"
                >
                  <Check className="w-6 h-6 md:w-8 md:h-8" />
                </motion.div>
                <p className="text-base md:text-lg font-semibold mb-1">QR Code Detected!</p>
                <p className="text-xs md:text-sm text-green-300">Processing...</p>
              </motion.div>
            </div>
          )}

          {/* Instructions */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm">
            Position QR code within frame
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <div className="text-center text-white p-4 md:p-6">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
            </div>
            <p className="text-base md:text-lg font-semibold">Camera Inactive</p>
            <p className="text-xs md:text-sm text-gray-400 mt-1">Start scanning to begin</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;