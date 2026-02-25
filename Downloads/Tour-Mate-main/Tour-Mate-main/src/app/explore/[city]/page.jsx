
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { citiesByState } from '@/lib/tourist-cities';
import { notFound, useRouter, useParams } from 'next/navigation';
import { MapPin, ArrowLeft, Menu } from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { doc } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';


const getCityData = (slug) => {
  for (const state in citiesByState) {
    const city = citiesByState[state].find(c => c.slug === slug);
    if (city) {
      return {
        ...city,
        stateName: state.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      };
    }
  }
  return null;
};

function AttractionCard({ attraction, cityImage, attractionPlaceholder }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
      <div className="relative h-48 w-full">
        <Image
          src={attraction.image || cityImage || attractionPlaceholder || 'https://picsum.photos/seed/attraction/400/250'}
          alt={attraction.name}
          fill
          className="object-cover"
          data-ai-hint={attraction.hint}
        />
      </div>
      <div className="p-6 text-center">
        <h3 className="text-xl font-bold mb-2">{attraction.name}</h3>
        <p className="text-muted-foreground text-sm">{attraction.description}</p>
      </div>
    </div>
  );
}

export default function CityPage() {
  const router = useRouter();
  const params = useParams();
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

  const city = getCityData(params.city);

  if (!city) {
    notFound();
  }

  const { name, stateName, description, image, hint, attractionDetails = [] } = city;
  const cityPlaceholder = PlaceHolderImages.find(p => p.id === 'city-placeholder');
  const attractionPlaceholder = PlaceHolderImages.find(p => p.id === 'attraction-placeholder');

  return (
    <div className="bg-white text-gray-800">
      <div className="relative h-[70vh] min-h-[500px] text-white">
        <Image
          src={image || cityPlaceholder?.imageUrl || 'https://picsum.photos/seed/city-hero/1920/1080'}
          alt={`Hero image for ${name}`}
          fill
          className="object-cover"
          data-ai-hint={hint || 'cityscape'}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        
        <header className="absolute top-0 left-0 right-0 z-20 p-4 bg-transparent">
          <div className="container mx-auto flex items-center justify-between">
            <div className='flex items-center gap-4'>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white" onClick={() => router.push('/explore')}>
                  <ArrowLeft className="h-6 w-6" />
                  <span className="sr-only">Back</span>
              </Button>
              <Link href="/" className="flex items-center gap-2 group">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-white" />
                  <span className="text-xl font-bold tracking-tight text-white">TourMate</span>
                </div>
              </Link>
            </div>
            
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
                    ) : (
                      <Link href="/login" className="text-lg">Login</Link>
                    )}
                    <Link href="/about-us" className="text-lg">About Us</Link>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
          <div className="space-y-3">
            <h1 className="font-headline text-6xl font-extrabold tracking-tighter sm:text-7xl md:text-8xl">
              {name}
            </h1>
            <p className="text-lg text-white/90">{stateName}</p>
            <p className="mx-auto max-w-2xl text-base text-white/80 sm:text-lg">
              {description || `Explore spiritual landmarks, book comfortable homestays, and experience local traditions in ${name}`}
            </p>
          </div>
        </div>
      </div>

      <main className="container mx-auto py-12 md:py-20 px-4">
        <div className="text-center mb-12">
            <h2 className="font-headline text-3xl font-bold mb-1">
                Attractions in {name}
            </h2>
            <p className="text-muted-foreground">
                Explore sacred and historic landmarks
            </p>
        </div>
        
        {attractionDetails.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {attractionDetails.map((attraction, index) => (
              <AttractionCard 
                key={index} 
                attraction={attraction} 
                cityImage={image}
                attractionPlaceholder={attractionPlaceholder?.imageUrl}
              />
            ))}
          </div>
        ) : (
          <div className="text-center bg-gray-50 border rounded-lg p-12 mt-8">
            <h2 className="text-2xl font-semibold mb-2">Attractions Coming Soon!</h2>
            <p className="text-muted-foreground">
              We are currently curating the best attractions for {name}. Please check back later.
            </p>
          </div>
        )}
      </main>

      <div className="container mx-auto text-center py-12 md:py-16">
        <div className="flex justify-center gap-6">
          <Button asChild size="lg">
            <Link href={`/book-homestay/${city.slug}`}>Book a Home Stay</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href={`/hire-local-guide/${city.slug}`}>Hire a Local Guide</Link>
          </Button>
        </div>
      </div>
      
      <footer className="border-t">
        <div className="container mx-auto text-center py-6 text-muted-foreground text-sm">
            <p>&copy; {new Date().getFullYear()} TourMate. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
