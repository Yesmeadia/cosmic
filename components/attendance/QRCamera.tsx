// components/QRScanner.jsx
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';
import jsQR from 'jsqr';

const QRScanner = ({ onScan, isScanning }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!isScanning) return;

    const startCamera = async () => {
      try {
        if (!navigator?.mediaDevices?.getUserMedia) {
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
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraError(null);
          
          videoRef.current.onloadedmetadata = () => {
            scanQRCode();
          };
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setCameraError('Camera permission denied or not available');
      }
    };

    const scanQRCode = () => {
      if (!isScanning || !videoRef.current || cameraError) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const scanFrame = () => {
        if (!isScanning || !video.videoWidth) {
          animationFrameRef.current = requestAnimationFrame(scanFrame);
          return;
        }

        try {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code) {
            setIsDetecting(true);
            console.log('QR Code detected:', code.data);
            
            if (animationFrameRef.current) {
              cancelAnimationFrame(animationFrameRef.current);
            }
            
            onScan(code.data);
            
            setTimeout(() => {
              setIsDetecting(false);
              if (isScanning) {
                animationFrameRef.current = requestAnimationFrame(scanFrame);
              }
            }, 2000);
          } else {
            animationFrameRef.current = requestAnimationFrame(scanFrame);
          }
        } catch (error) {
          console.error('QR scanning error:', error);
          animationFrameRef.current = requestAnimationFrame(scanFrame);
        }
      };

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    };

    startCamera();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isScanning, cameraError, onScan]);

  if (cameraError) {
    return (
      <div className="relative bg-gray-900 rounded-lg overflow-hidden h-96 w-full flex items-center justify-center">
        <div className="text-center text-white p-6">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-bold mb-2">Camera Error</h3>
          <p className="text-gray-300">{cameraError}</p>
          <p className="text-sm text-gray-400 mt-2">
            Please check camera permissions or use manual input
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden h-96 w-full">
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
        <div className="w-64 h-64 border-2 border-green-500 rounded-lg">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-green-500 rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-green-500 rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-green-500 rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-green-500 rounded-br-lg"></div>
        </div>
      </div>

      {/* Scanning line animation */}
      <motion.div
        animate={{ y: ['0%', '100%'] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute w-64 left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-b from-transparent via-green-500 to-transparent pointer-events-none"
      />

      {isDetecting && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center text-white p-6"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Check className="w-10 h-10" />
            </motion.div>
            <p className="text-xl font-semibold mb-2">QR Code Detected!</p>
            <p className="text-sm text-green-300">Processing student information...</p>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;