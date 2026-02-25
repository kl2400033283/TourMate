'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MapPin, Menu, Heart, ShieldCheck, Users } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useState, useEffect } from 'react';
import { doc } from 'firebase/firestore';

export default function AboutUsPage() {
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="w-full bg-transparent p-4 absolute top-0 z-50">
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
            <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
              <Link href="/">Home</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
              <Link href="/explore">Explore</Link>
            </Button>
            {user ? (
              <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                <Link href={dashboardPath}>Dashboard</Link>
              </Button>
            ) : (
              <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                <Link href="/login">Login</Link>
              </Button>
            )}
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
                  <Link href="/" className="text-lg">Home</Link>
                  <Link href="/explore" className="text-lg">Explore</Link>
                  {user ? (
                    <Link href={dashboardPath} className="text-lg">Dashboard</Link>
                  ): (
                    <Link href="/login" className="text-lg">Login</Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center text-white overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2071&auto=format&fit=crop"
          alt="Taj Mahal Sunset"
          fill
          className="object-cover"
          data-ai-hint="India landmark"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center space-y-4 px-4">
          <h1 className="text-5xl md:text-7xl font-bold font-headline tracking-tight">Our Mission</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            Connecting travelers with authentic local experiences across the breathtaking landscapes of India.
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="container mx-auto py-16 px-4 space-y-24">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold font-headline text-primary">Indian Cultur</h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              At TourMate, we believe that the best way to experience a culture is from the inside. Founded with a passion for Indian heritage, our platform bridges the gap between curious travelers and the warm, welcoming homes of local hosts.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Whether you're seeking a spiritual retreat in Rishikesh, a bustling food walk in Old Delhi, or a serene backwater escape in Kerala, we provide the tools to find the perfect stay and the most knowledgeable guides.
            </p>
          </div>
          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl bg-muted">
            <Image
              src="https://images.unsplash.com/photo-1504448252408-b32799ff32f3?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Indian Hospitality"
              fill
              className="object-cover"
              data-ai-hint="Indian culture"
            />
          </div>
        </section>

        {/* Values */}
        <section className="text-center space-y-12">
          <h2 className="text-4xl font-bold font-headline">What Drives Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-card rounded-2xl shadow-sm border border-border/50 space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Authenticity</h3>
              <p className="text-muted-foreground">We prioritize genuine experiences that reflect the true spirit and traditions of India.</p>
            </div>
            <div className="p-8 bg-card rounded-2xl shadow-sm border border-border/50 space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Trust & Safety</h3>
              <p className="text-muted-foreground">Our verified hosts and guides ensure a secure and comfortable environment for every traveler.</p>
            </div>
            <div className="p-8 bg-card rounded-2xl shadow-sm border border-border/50 space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Community</h3>
              <p className="text-muted-foreground">We foster connections that turn strangers into friends, creating memories that last a lifetime.</p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-primary rounded-3xl p-12 text-center text-primary-foreground space-y-6">
          <h2 className="text-4xl font-bold font-headline">Ready to Start Your Journey?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">Join thousands of travelers who have discovered the heart of India with TourMate.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Button asChild size="lg" variant="secondary" className="rounded-full px-8">
              <Link href="/explore">Explore Destinations</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 rounded-full px-8">
              <Link href="/signup">Join as a Host</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-card py-12">
        <div className="container mx-auto text-center space-y-4 text-muted-foreground">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight text-foreground">TourMate</span>
          </Link>
          <p>&copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> TourMate. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
