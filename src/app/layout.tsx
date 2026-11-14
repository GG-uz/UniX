import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AppStateProvider } from '@/context/AppStateContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToastBanner } from '@/components/ui/ToastBanner';

export const metadata: Metadata = {
  title: 'UniSport & Academic League Tashkent | Матчмейкинг и Бронирование Площадок',
  description:
    'Межуниверситетские битвы в Футболе, Математике, Физике, Химии и IT-Хакатонах среди вузов Ташкента (TEAM University, WIUT, Inha, MDIST, Amity, ТУИТ). Бронирование слотов до 300 000 сум/час с защитой 48 часов.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
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
