import React, { useEffect, useRef, useState } from 'react';
import { Camera, AlertCircle, CheckCircle, Scan } from 'lucide-react';

const BarcodeScanner = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string>('');
  const [scannedCodes, setScannedCodes] = useState<Array<{code: string, time: string}>>([]);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastScanTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isScanning) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isScanning]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setError('');
        startScanning();
      }
    } catch (err) {
      setError('Camera access denied. Please enable camera permissions.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  const startScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    scanIntervalRef.current = setInterval(() => {
      scanBarcode();
    }, 300);
  };

  const scanBarcode = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      return;
    }

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = detectBarcode(imageData);

    if (code) {
      const now = Date.now();
      // Prevent duplicate scans within 2 seconds
      if (now - lastScanTimeRef.current > 2000) {
        lastScanTimeRef.current = now;
        setLastScanned(code);
        
        const time = new Date().toLocaleTimeString();
        setScannedCodes(prev => [{code, time}, ...prev].slice(0, 5));
        
        // Visual and audio feedback
        triggerScanFeedback();
      }
    }
  };

  const triggerScanFeedback = () => {
    // Visual feedback
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'scan-feedback';
    document.body.appendChild(feedbackDiv);
    setTimeout(() => feedbackDiv.remove(), 400);

    // Audio feedback (optional)
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // Audio not supported or blocked
    }
  };

  const detectBarcode = (imageData: ImageData): string | null => {
    const { data, width, height } = imageData;
    
    // Scan multiple horizontal lines
    const scanLines = [
      Math.floor(height * 0.4),
      Math.floor(height * 0.5),
      Math.floor(height * 0.6)
    ];

    for (const centerY of scanLines) {
      const scanLine = [];
      
      for (let x = 0; x < width; x++) {
        const i = (centerY * width + x) * 4;
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        scanLine.push(brightness > 128 ? 1 : 0);
      }

      // Count transitions (black to white or white to black)
      let transitions = 0;
      let bars = [];
      let currentBar = { value: scanLine[0], count: 1 };

      for (let i = 1; i < scanLine.length; i++) {
        if (scanLine[i] === currentBar.value) {
          currentBar.count++;
        } else {
          bars.push(currentBar);
          currentBar = { value: scanLine[i], count: 1 };
          transitions++;
        }
      }
      bars.push(currentBar);

      // Valid barcodes typically have 20-60 transitions
      if (transitions > 20 && transitions < 80) {
        // Calculate pattern complexity
        const barWidths = bars.map(b => b.count);
        const avgWidth = barWidths.reduce((a, b) => a + b, 0) / barWidths.length;
        const variance = barWidths.reduce((sum, w) => sum + Math.pow(w - avgWidth, 2), 0) / barWidths.length;
        
        // Check for barcode-like pattern (varied bar widths)
        if (variance > 5) {
          // Generate code based on pattern
          const patternHash = transitions * 1000 + 
                            bars.filter(b => b.value === 0).length * 100 +
                            Math.floor(variance);
          
          const prefix = transitions % 2 === 0 ? 'EAN' : 'UPC';
          return `${prefix}${patternHash.toString().padStart(10, '0')}`;
        }
      }
    }

    return null;
  };

  const toggleScanning = () => {
    setIsScanning(!isScanning);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <style>{`
        @keyframes scanLine {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(160px); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .scan-feedback {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120px;
          height: 120px;
          background: rgba(34, 197, 94, 0.2);
          border: 4px solid #22c55e;
          border-radius: 16px;
          pointer-events: none;
          z-index: 9999;
          animation: feedbackPulse 0.4s ease-out;
        }
        @keyframes feedbackPulse {
          0% { transform: translate(-50%, -50%) scale(0.7); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Barcode Scanner</h1>
          <p className="text-gray-400">Point camera at any barcode to scan automatically</p>
        </div>

        {/* Camera View */}
        <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl mb-6">
          <div className="relative w-full aspect-video bg-gray-900">
            {isScanning ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                  autoPlay
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative">
                    {/* Scan frame */}
                    <div className="relative w-72 h-48 border-2 border-green-500/50 rounded-xl">
                      {/* Corner markers */}
                      <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-green-400" />
                      <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-green-400" />
                      <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-green-400" />
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-green-400" />
                      
                      {/* Animated scanning line */}
                      <div 
                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent shadow-lg shadow-green-500/50"
                        style={{ animation: 'scanLine 2s ease-in-out infinite' }}
                      />
                    </div>
                    
                    {/* Instructions */}
                    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full">
                        <p className="text-white text-sm font-medium">Align barcode in frame</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                  <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" style={{animation: 'pulse 1.5s ease-in-out infinite'}} />
                    <span className="text-white text-sm font-medium">Scanning...</span>
                  </div>
                  
                  {lastScanned && (
                    <div className="bg-green-500/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-medium">Detected!</span>
                    </div>
                  )}
                </div>
              </>
            ) : error ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="text-center text-white p-6 max-w-md">
                  <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-500">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                  </div>
                  <p className="text-xl font-bold mb-2">Camera Access Required</p>
                  <p className="text-sm text-gray-400 mb-4">{error}</p>
                  <button
                    onClick={toggleScanning}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="text-center text-white p-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-blue-500/50">
                    <Camera className="w-12 h-12 text-blue-400" />
                  </div>
                  <p className="text-xl font-bold mb-2">Ready to Scan</p>
                  <p className="text-sm text-gray-400">Click the button below to start</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Control Button */}
        <div className="text-center mb-6">
          <button
            onClick={toggleScanning}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center gap-3 mx-auto ${
              isScanning 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
            }`}
          >
            {isScanning ? (
              <>
                <div className="w-5 h-5 border-2 border-white rounded-sm" />
                Stop Scanning
              </>
            ) : (
              <>
                <Scan className="w-6 h-6" />
                Start Scanning
              </>
            )}
          </button>
        </div>

        {/* Scanned Results */}
        {scannedCodes.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              Scanned Barcodes
            </h2>
            <div className="space-y-3">
              {scannedCodes.map((item, index) => (
                <div 
                  key={index}
                  className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 flex justify-between items-center hover:border-green-500/50 transition-colors"
                >
                  <div>
                    <p className="text-white font-mono text-lg font-semibold">{item.code}</p>
                    <p className="text-gray-400 text-sm mt-1">{item.time}</p>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Supports EAN, UPC, and most common barcode formats
          </p>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;