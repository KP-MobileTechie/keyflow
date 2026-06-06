import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';

const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });

export const metadata: Metadata = {
  title: 'keyflow — typing speed trainer',
  description:
    'Terminal-style typing test with live WPM, accuracy, per-key error heatmap, and local history.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jetbrains.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
