import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react';
import jsQR from 'jsqr';

interface ScannedRecord {
  id: string;
  data: string;
  timestamp: Date;
  status: 'success' | 'error';
}

interface BarcodeProps {
  onScan?: (data: string) => void;
  isScanning?: boolean;
}

export default function BarcodeScanner({ onScan, isScanning: externalIsScanning }: BarcodeProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scannedCodesRef = useRef<Set<string>>(new Set());

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    if (externalIsScanning !== undefined) {
      setIsScanning(externalIsScanning);
    }
  }, [externalIsScanning]);

  useEffect(() => {
    if (!isScanning) return;

    const startScanning = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            scanFrame();
          };
        }
      } catch (error) {
        showNotification('Camera access denied', 'error');
        setIsScanning(false);
      }
    };

    const scanFrame = () => {
      if (!videoRef.current || !canvasRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
        animationIdRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      
      ctx?.drawImage(videoRef.current, 0, 0);
      const imageData = ctx?.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      if (imageData) {
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && !scannedCodesRef.current.has(code.data)) {
          scannedCodesRef.current.add(code.data);
          handleScan(code.data);
          
          // Clear the cache after 2 seconds to allow re-scanning
          setTimeout(() => {
            scannedCodesRef.current.delete(code.data);
          }, 2000);
        }
      }
      
      animationIdRef.current = requestAnimationFrame(scanFrame);
    };

    startScanning();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isScanning]);

  const handleScan = (data: string) => {
    if (data.trim()) {
      showNotification(`Scanned: ${data}`, 'success');
      if (onScan) {
        onScan(data.trim());
      }
    }
  };



  return (
    <div className="w-full">
      <div className="relative">
        {/* Barcode Scanner */}
        {isScanning && (
          <motion.div
            className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden mb-6 border-2 border-slate-700 aspect-video"
          >
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-64 h-32 border-2 border-blue-500 rounded-lg shadow-lg shadow-blue-500/50"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-lg ${
              notification.type === 'success'
                ? 'bg-green-500/90 text-white'
                : 'bg-red-500/90 text-white'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
