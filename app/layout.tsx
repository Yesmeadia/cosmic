import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cosmic Confluence - Event Registration',
  description: 'Register for the biggest educational event of the year',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Microsoft Clarity */}
        <Script
          id="ms-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r); t.async=1; t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "u3enqvyzjl);`, 
          }}
        />
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){
                w[l]=w[l]||[];
                w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
                var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:'';
                j.async=true;
                j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','G-QR13SN972H'); // Replace with your GTM ID
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/gtag/js?id=G-QR13SN972H"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>

        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
          {children}
        </div>
      </body>
    </html>
  );
}
