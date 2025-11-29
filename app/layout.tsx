// app/layout.tsx
'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { AuthProvider } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { createInitialGuestData } from '@/lib/guestManagement';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

// Note: Metadata export doesn't work with 'use client', so define separately
// For production, consider using a separate metadata file or removing 'use client' directive
// and using a RootLayout wrapper component

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [guestDataInitialized, setGuestDataInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Initialize guest data on app start (runs once)
  useEffect(() => {
    const initializeGuestData = async () => {
      try {
        // Always run initialization - it will check and create if needed
        console.log('🔄 Initializing guest data...');
        const result = await createInitialGuestData();
        
        if (result.success) {
          setGuestDataInitialized(true);
          console.log('✅ Guest data initialized successfully - GUEST 1 to 20 created');
        } else {
          // Log but don't error - guests might already exist
          setGuestDataInitialized(true);
          console.log('ℹ️ Guest initialization info:', result.error);
        }
      } catch (error) {
        console.error('❌ Error initializing guest data:', error);
        // Still mark as initialized to not block the app
        setGuestDataInitialized(true);
      }
    };

    initializeGuestData();
  }, []);

  return (
    <html lang="en">
      <head>
        {/* ✅ Google Tag Manager / Google Analytics */}
        <Script
          id="gtag-base"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-QR13SN972H"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-QR13SN972H');
            `,
          }}
        />
        <Script
          id="ms-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r); t.async=1; t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "u3enqvyzjl");`,
          }}
        />
        <title>Cosmic Confluence - Event Registration</title>
        <meta name="description" content="Register for the biggest educational event of the year" />
      </head>
      <body className={inter.className}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=G-QR13SN972H"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            {/* Debug Info - Remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="fixed bottom-4 right-4 z-50 text-xs bg-gray-900 text-white p-2 rounded opacity-50 hover:opacity-100 transition-opacity max-w-xs">
                {guestDataInitialized ? (
                  <p>✅ Guest data ready</p>
                ) : initError ? (
                  <p>⚠️ {initError}</p>
                ) : (
                  <p>⏳ Initializing guests...</p>
                )}
              </div>
            )}
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}