import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react';

interface BarcodeProps {
  onScan?: (data: string) => void;
  isScanning?: boolean;
}

export default function BarcodeScanner({ onScan, isScanning: externalIsScanning }: BarcodeProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [scannedCode, setScannedCode] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scannedCodesRef = useRef<Set<string>>(new Set());
  const barcodeBufferRef = useRef<string>('');
  const lastScanTimeRef = useRef<number>(0);

  // Synchronize internal isScanning state with external prop
  useEffect(() => {
    if (externalIsScanning !== undefined) {
      // Use a functional update to avoid potential issues with stale closures
      setIsScanning((prevIsScanning) => externalIsScanning);
    }
  }, [externalIsScanning]);

  // Barcode detection using image analysis
  // Extract readable value from barcode pattern
  const extractBarcodeValue = (pattern: string): string | null => {
    // Code128 barcode detection - simplified
    // This looks for repeating patterns that indicate a barcode
    const numbers = pattern.split('').filter(c => /\d/.test(c)).join('');
    
    if (numbers.length >= 5) {
      return numbers;
    }

    return null;
  };

  const detectBarcode = (imageData: ImageData): string | null => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Convert to grayscale and analyze vertical lines
    const threshold = 128;
    let barcodeBuffer = '';
    
    // Sample multiple horizontal lines to detect barcode pattern
    for (let y = Math.floor(height * 0.3); y < Math.floor(height * 0.7); y += 10) {
      let linePattern = '';
      let lastPixel = 0;
      let count = 0;
      
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const gray = (r + g + b) / 3;
        
        const pixel = gray > threshold ? 1 : 0;
        
        if (pixel !== lastPixel) {
          if (count > 0) {
            linePattern += count;
          }
          count = 1;
          lastPixel = pixel;
        } else {
          count++;
        }
      }
      
      if (linePattern.length > 20) {
        barcodeBuffer = linePattern;
        break;
      }
    }

    // If we detected a barcode pattern
    if (barcodeBuffer.length > 20) {
      return extractBarcodeValue(barcodeBuffer);
    }

    return null;
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
 setNotification({ message, type });
 setTimeout(() => setNotification(null), 3000);
  };

  const handleScan = (data: string) => {
    if (data && data.trim()) {
      setScannedCode(data);
      showNotification(`Barcode detected: ${data}`, 'success');
      
      if (onScan) {
        onScan(data.trim());
      }
    }
  };

  useEffect(() => {
    if (!isScanning) return;

    const startScanning = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
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
      if (!ctx) {
        animationIdRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      
      ctx.drawImage(videoRef.current, 0, 0);
      
      // Get image data for barcode detection
      const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      const detected = detectBarcode(imageData);
      
      if (detected && !scannedCodesRef.current.has(detected)) {
        const now = Date.now();
        if (now - lastScanTimeRef.current > 1000) {
          scannedCodesRef.current.add(detected);
          handleScan(detected);
          lastScanTimeRef.current = now;
          
          setTimeout(() => {
            scannedCodesRef.current.delete(detected);
          }, 3000);
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
              playsInline
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
            
            {/* Scanning indicator */}
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white text-xs font-medium">Scanning</span>
            </div>

            {/* Scanned code display */}
            {scannedCode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg text-center text-sm font-mono"
              >
                {scannedCode}
              </motion.div>
            )}
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
            className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-lg z-50 ${
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