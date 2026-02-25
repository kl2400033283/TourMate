import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter, Lora } from 'next/font/google';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase/client-provider';

const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const fontHeadline = Lora({
  subsets: ['latin'],
  variable: '--font-headline',
});

export const metadata = {
  title: 'TourMate - Where Travel Meets Comfort',
  description: 'Your ultimate guide to tourism in India.',
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'font-body antialiased',
          fontBody.variable,
          fontHeadline.variable
        )}
      >
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
