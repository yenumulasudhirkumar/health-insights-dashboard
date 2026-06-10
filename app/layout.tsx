import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Health Insights Dashboard',
  description: 'Internal dashboard for fresh health discussion signals',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
