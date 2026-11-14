import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AppStateProvider } from '@/context/AppStateContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToastBanner } from '@/components/ui/ToastBanner';

export const metadata: Metadata = {
  title: 'UniSport League | Inter-University Matchmaking & Venue Booking',
  description:
    'Challenge rival university teams in Football, Basketball, and Volleyball. Book certified sports arenas with instant slot prepayment & automatic leaderboards.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased flex flex-col font-sans selection:bg-amber-500 selection:text-black">
        <AppStateProvider>
          <Suspense fallback={<div className="h-16 bg-neutral-950 border-b border-neutral-800" />}>
            <Navbar />
          </Suspense>
          <ToastBanner />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </AppStateProvider>
      </body>
    </html>
  );
}
