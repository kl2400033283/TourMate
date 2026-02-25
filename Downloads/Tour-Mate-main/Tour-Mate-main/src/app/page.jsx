'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MapPin, Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useState, useEffect } from 'react';
import { doc } from 'firebase/firestore';


export default function Page() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [dashboardPath, setDashboardPath] = useState('/profile');

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  const { data: userProfile } = useDoc(userProfileRef);

  useEffect(() => {
    if (user && userProfile) {
        switch (userProfile.role) {
          case 'home stay host':
            setDashboardPath('/host-dashboard');
            break;
          case 'tour guide':
            setDashboardPath('/tour-guide-dashboard');
            break;
          case 'admin':
            setDashboardPath('/admin-dashboard');
            break;
          case 'Tourist':
          default:
            setDashboardPath('/profile');
            break;
        }
    }
  }, [user, userProfile]);

  const backgroundImage = PlaceHolderImages.find(p => p.id === 'background-image');
  const imageUrl = backgroundImage?.imageUrl || 'https://picsum.photos/seed/bg/1920/1080';
  const imageHint = backgroundImage?.imageHint || 'India travel';
  const imageAlt = backgroundImage?.description || "A collage of famous landmarks in India.";

  return (
    <div className="relative h-screen w-screen text-white">
      <Image
        src={imageUrl}
        alt={imageAlt}
        fill
        className="object-cover"
        data-ai-hint={imageHint}
        priority
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 flex h-full flex-col">
        <header className="p-4 bg-transparent">
          <div className="container mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-white" />
                <span className="text-xl font-bold tracking-tight text-white">
                  TourMate
                </span>
              </div>
            </Link>
            <nav className="hidden items-center gap-2 sm:flex">
              {user ? (
                 <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                    <Link href={dashboardPath}>Dashboard</Link>
                 </Button>
              ) : (
                <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                  <Link href="/login">Login</Link>
                </Button>
              )}
              <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                <Link href="/about-us">About Us</Link>
              </Button>
            </nav>
            <div className="sm:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <nav className="flex flex-col gap-4 pt-8">
                     <Link href="/" className="flex items-center gap-2 mb-4">
                      <MapPin className="h-6 w-6 text-primary" />
                      <span className="text-xl font-bold tracking-tight">
                        TourMate
                      </span>
                    </Link>
                    {user ? (
                      <Link href={dashboardPath} className="text-lg">Dashboard</Link>
                    ): (
                      <Link href="/login" className="text-lg">Login</Link>
                    )}
                    <Link href="/about-us" className="text-lg">About Us</Link>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center text-center px-4">
          <div className="space-y-6">
            <h1 className="font-headline text-5xl font-extrabold tracking-tighter sm:text-7xl md:text-8xl">
              TourMate
            </h1>
            <p className="mx-auto max-w-md text-lg text-white/80 sm:text-xl">
              Where Travel Meets Comfort
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg rounded-full px-8"
              >
                <Link href="/explore">Explore with TourMate</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
