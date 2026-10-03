import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

export const metadata: Metadata = {
  title: 'HospitalOS — Real-Time Hospital Operations & Patient Journey Management Platform',
  description: 'Enterprise healthcare operations platform with live Digital Twin, real-time queues, and 10-stage patient journey management.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className="min-h-full flex flex-col antialiased text-slate-900">
        <Navbar />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/60">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
