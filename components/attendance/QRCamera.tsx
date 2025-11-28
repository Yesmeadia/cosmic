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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scannedCodesRef = useRef<Set<string>>(new Set());
  const lastScanTimeRef = useRef<number>(0);

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
      const detected = detectCode39Barcode(imageData);
      
      if (detected && !scannedCodesRef.current.has(detected)) {
        const now = Date.now();
        if (now - lastScanTimeRef.current > 2000) {
          scannedCodesRef.current.add(detected);
          handleScan(detected);
          lastScanTimeRef.current = now;
          
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
  }, [isScanning]);

  // Code 39 barcode pattern detection
  const detectCode39Barcode = (imageData: ImageData): string | null => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    const threshold = 128;
    let bestCode = '';
    let bestConfidence = 0;

    // Sample multiple horizontal lines to find the barcode
    for (let y = Math.floor(height * 0.2); y < Math.floor(height * 0.8); y += 5) {
      const lineData = extractLineData(data, width, y, threshold);
      const code = decodeCode39Line(lineData);
      
      if (code && code.length >= 5) {
        // Validate Code 39 format (alphanumeric with hyphens)
        const confidence = validateCode39(code);
        if (confidence > bestConfidence) {
          bestConfidence = confidence;
          bestCode = code;
        }
      }
    }

    return bestCode.length >= 5 ? bestCode : null;
  };

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

  // Code 39 decoder - converts bar patterns to characters
  const decodeCode39Line = (lineData: number[]): string => {
    // Find start and end patterns
    const pattern = lineData.join('');
    const startPattern = '100010010010'; // Start pattern for Code 39
    
    let code = '';
    let i = pattern.indexOf(startPattern);
    
    if (i === -1) return '';
    
    i += startPattern.length;
    
    // Code 39 character patterns (simplified)
    const code39Patterns: Record<string, string> = {
      '100010100': '0',
      '101001000': '1',
      '101000100': '2',
      '101000010': '3', // This was a duplicate in the context, but not in the original file. Keeping it as is.
      '100101000': '4',
      '100100100': '5',
      '100100010': '6',
      '101010000': '7',
      '100010010': '8',
      '100001010': '9',
      '110100100': 'A',
      '110010100': 'B', // This line is a duplicate and will be removed
      '110001010': 'C',
      '101101000': 'D', // This was a duplicate in the context, but not in the original file. Keeping it as is.
      '101100100': 'E',
      '101100010': 'F',
      '100110100': 'G',
      '100011100': 'H',
      '100010110': 'I',
      '101001100': 'J',
      '110010010': 'K',
      '110001001': 'L',
      '101101001': 'M',
      '101011001': 'N',
      '101001101': 'O',
      '100101101': 'P',
      '101010011': 'Q',
      '100110011': 'R',
      '100011011': 'S',
      '100101011': 'T',
      '110010001': 'U',
      '110001100': 'V',
      '110001001': 'W',
      '100111010': 'X',
      '100011110': 'Y',
      '100001110': 'Z',
      '101010100': '-',
      '101011010': '.',
      '101101010': '*',
    };

    // Extract barcode characters (simplified approach)
    const segments = pattern.substring(i).split('0000').slice(0, -1);
    
    for (const segment of segments) {
      if (segment.length > 0) {
        // Normalize and match pattern
        const normalized = segment.substring(0, 9);
        const char = code39Patterns[normalized];
        if (char && char !== '*') {
          code += char;
        }
      }
    }

    return code;
  };

  // Validate Code 39 format (should contain alphanumeric characters)
  const validateCode39 = (code: string): number => {
    let confidence = 0;
    
    // Check for alphanumeric with possible hyphens
    if (/^[A-Z0-9\-]{5,20}$/.test(code)) {
      confidence += 100;
    }
    
    // Bonus for matching known patterns like "CZ9DELU" or "P2DXBFI"
    if (/^[A-Z][A-Z0-9]{6}$/.test(code)) {
      confidence += 50;
    }
    
    return confidence;
  };

  const handleScan = (data: string) => {
    if (data && data.trim()) {
      const cleanedCode = data.trim().toUpperCase();
      setScannedCode(cleanedCode);
      showNotification(`Code 39 Barcode: ${cleanedCode}`, 'success');
      
      if (onScan) {
        onScan(cleanedCode);
      }
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
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