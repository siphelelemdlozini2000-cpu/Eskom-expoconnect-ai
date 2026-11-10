import { Inter } from 'next/font/google';
import './globals.css';

// Load the Inter font
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ExpoConnect AI',
  description: 'Digital Submission Platform for the Eskom Expo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Apply the font and smooth font rendering globally */}
      <body className={`${inter.className} antialiased bg-eskom-background text-slate-900`}>
        {children}
      </body>
    </html>
  );
}