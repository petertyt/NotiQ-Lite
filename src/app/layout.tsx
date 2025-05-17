
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
// import { GeistMono } from 'geist/font/mono'; // Assuming this might still be an issue if not fixed, or remove if not used
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/auth-context';
import { AppHeader } from '@/components/app-header';

const geistSans = GeistSans;
// const geistMono = GeistMono; // If GeistMono is definitely not used or fixed, this can be removed.

export const metadata: Metadata = {
  title: 'NotiQ Lite',
  description: 'AI-powered meeting assistant by Firebase Studio',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-background text-foreground">
            {/* AppHeader might be conditionally rendered or styled differently if a page has its own full-page sidebar layout */}
            {/* For now, keep it global, dashboard page will manage its internal layout with sidebar */}
            <AppHeader /> 
            <main className="flex-grow"> {/* Removed container and padding for pages like dashboard to control their own layout */}
              {children}
            </main>
            {/* Footer can be conditional or part of specific page layouts if needed */}
            {/* <footer className="text-center p-4 text-muted-foreground text-sm border-t mt-auto">
              <p>&copy; {new Date().getFullYear()} NotiQ Lite. Powered by Firebase Studio.</p>
            </footer> */}
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
