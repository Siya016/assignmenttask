import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { StorageManager } from '@/components/StorageManager';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Solar Ops Mini-Cockpit',
  description: 'Solar operations monitoring and analysis dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">Solar Ops Mini-Cockpit</h1>
              <div className="flex gap-4">
                <a 
                  href="/" 
                  className="text-sm hover:text-primary transition-colors"
                  aria-label="Dashboard"
                >
                  Dashboard
                </a>
                <a 
                  href="/logs" 
                  className="text-sm hover:text-primary transition-colors"
                  aria-label="Logs"
                >
                  Logs
                </a>
              </div>
            </div>
          </div>
        </nav>
        <StorageManager />
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}