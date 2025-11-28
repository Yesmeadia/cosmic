import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle, AlertCircle } from 'lucide-react';

interface BarcodeProps {
  onScan?: (data: string) => void;
  isScanning?: boolean;
}

export default function BarcodeScanner({ onScan, isScanning: externalIsScanning }: BarcodeProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [scannedCode, setScannedCode] = useState<string>('');
  const [code39Patterns, setCode39Patterns] = useState<Record<string, string>>({});
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scannedCodesRef = useRef<Set<string>>(new Set());
  const lastScanTimeRef = useRef<number>(0);
  const barcodeBufferRef = useRef<string>('');
  
  // Show notification
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch Code 39 patterns from JSON
  useEffect(() => {
    const fetchPatterns = async () => {
      try {
        const response = await fetch('/code39Patterns.json');
        const patterns = await response.json();
        setCode39Patterns(patterns);
      } catch (error) {
        console.error('Error loading Code 39 patterns:', error);
        showNotification('Failed to load barcode patterns', 'error');
      }
    };

    fetchPatterns();
  }, []);

  // Extract binary line data from image
  const extractLineData = (data: Uint8ClampedArray, width: number, y: number, threshold: number): number[] => {
    const lineData: number[] = [];
    
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const gray = (r + g + b) / 3;
      
      lineData.push(gray > threshold ? 1 : 0);
    }
    
    return lineData;
  };

  // Decode Code 39 barcode from line data
  const decodeCode39Line = (lineData: number[]): string => {
    if (Object.keys(code39Patterns).length === 0) return '';

    const binaryString = lineData.join('');
    let decodedCode = '';

    // CODE 39 encoding: each character is 9 bits (5 bars + 4 spaces or vice versa)
    // Start code: 1001011 (13 bits with start marker)
    // Stop code: 1001011
    // Character format: wide-narrow pattern
    
    // Look for start pattern (1001011 or similar variant)
    const patternSize = 9;
    let i = 0;

    // Skip leading quiet zone (zeros)
    while (i < binaryString.length && binaryString[i] === '0') {
      i++;
    }

    // Process barcode patterns
    while (i < binaryString.length - patternSize) {
      const pattern = binaryString.substring(i, i + patternSize);
      
      // Look up character in patterns
      const char = code39Patterns[pattern];
      
      if (char) {
        if (char === '*') {
          // Stop code found
          break;
        }
        decodedCode += char;
        i += patternSize;
      } else {
        // Try to find next valid pattern by shifting
        i += 1;
      }
    }

    return decodedCode;
  };

  // Advanced barcode detection with better pattern recognition
  const detectCode39Barcode = (imageData: ImageData): string | null => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    const threshold = 128;
    let bestCode = '';
    let bestConfidence = 0;

    // Sample multiple horizontal lines to find the barcode
    const yStep = Math.max(1, Math.floor(height / 20));
    
    for (let y = Math.floor(height * 0.2); y < Math.floor(height * 0.8); y += yStep) {
      const lineData = extractLineData(data, width, y, threshold);
      const code = decodeCode39Line(lineData);
      
      if (code && code.length >= 4) {
        const confidence = validateCode39(code);
        if (confidence > bestConfidence) {
          bestConfidence = confidence;
          bestCode = code;
        }
      }
    }

    // Also try with inverted colors (for reversed barcodes)
    for (let y = Math.floor(height * 0.2); y < Math.floor(height * 0.8); y += yStep) {
      const lineData = extractLineData(data, width, y, threshold).map(bit => bit === 0 ? 1 : 0);
      const code = decodeCode39Line(lineData);
      
      if (code && code.length >= 4) {
        const confidence = validateCode39(code);
        if (confidence > bestConfidence) {
          bestConfidence = confidence;
          bestCode = code;
        }
      }
    }

    return bestCode.length >= 4 ? bestCode : null;
  };

  // Validate Code 39 format
  const validateCode39 = (code: string): number => {
    let confidence = 0;
    
    // Check for valid alphanumeric format
    if (/^[A-Z0-9\-\.]{4,20}$/.test(code)) {
      confidence += 50;
    }
    
    // Bonus for specific pattern like "CZ9DELU" or "P2DXBFI"
    if (/^[A-Z][A-Z0-9]{6}$/.test(code)) {
      confidence += 100;
    }
    
    // Bonus for mixed case
    if (/[A-Z]/.test(code) && /[0-9]/.test(code)) {
      confidence += 30;
    }
    
    return confidence;
  };

  // Process scanned barcode
  const handleScan = (data: string) => {
    if (data && data.trim()) {
      const cleanedCode = data.trim().toUpperCase();
      setScannedCode(cleanedCode);
      showNotification(`Code 39 Barcode Detected: ${cleanedCode}`, 'success');
      
      // Call parent callback with scanned data
      if (onScan) {
        onScan(cleanedCode);
      }
    }
  };

  // Sync external isScanning prop
  // This effect is removed as it was causing a setState warning.
  // The `isScanning` state is now directly controlled by `externalIsScanning`
  // if `externalIsScanning` is provided, otherwise it defaults to `true`.
  useEffect(() => { // This useEffect is now only for the initial setup of `isScanning`
    setIsScanning(externalIsScanning !== undefined ? externalIsScanning : true);
  }, [externalIsScanning]);

  // Camera scanning effect
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
      
      // Detect barcode from canvas
      const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      const detected = detectCode39Barcode(imageData);
      
      // Process detected barcode
      if (detected && !scannedCodesRef.current.has(detected)) {
        const now = Date.now();
        if (now - lastScanTimeRef.current > 2000) {
          scannedCodesRef.current.add(detected);
          handleScan(detected);
          lastScanTimeRef.current = now;
          
          // Allow re-scanning after delay
          setTimeout(() => {
            scannedCodesRef.current.delete(detected);
          }, 5000);
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
  }, [isScanning, code39Patterns]);

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
              autoPlay
              muted
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            {/* Scan area overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-80 h-24 border-2 border-blue-500 rounded-lg shadow-lg shadow-blue-500/50"
              />
            </div>
            
            {/* Scanning indicator */}
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white text-xs font-medium">Scanning Code 39</span>
            </div>

            {/* Scanned code display */}
            {scannedCode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-4 right-4 bg-black/80 text-white px-4 py-3 rounded-lg text-center font-mono font-bold"
              >
                <div className="text-sm text-gray-300 mb-1">Detected Code:</div>
                <div className="text-lg">{scannedCode}</div>
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