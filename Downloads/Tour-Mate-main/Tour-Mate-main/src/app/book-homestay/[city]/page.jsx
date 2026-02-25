'use client';

import { useEffect, useState, useMemo } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter, usePathname, useParams, useSearchParams } from 'next/navigation';
import { Calendar as CalendarIcon, Loader2, MapPin, Search, Star, Menu } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { citiesByState } from '@/lib/tourist-cities';
import { notFound } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { generateListingsAction } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { saveHomestayBooking } from '@/lib/bookings';
import { cn } from '@/lib/utils';
import { differenceInCalendarDays, parse } from 'date-fns';
import { doc } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';


const getCityData = (slug) => {
  if (!slug) return null;
  for (const state in citiesByState) {
    const city = citiesByState[state].find(c => c.slug === slug);
    if (city) return city;
  }
  return null;
};

function HomestayCard({ homestay, user, city, date, fallbackImage }) {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const firestore = useFirestore();

  const cameFromGuidePage = searchParams.get('from') === 'guide';

  const saveBooking = () => {
    if (!firestore || !user) return;
    
    let totalPrice = homestay.price;
    if (date.from && date.to) {
        try {
            const fromDate = parse(date.from, 'dd/MM/yyyy', new Date());
            const toDate = parse(date.to, 'dd/MM/yyyy', new Date());
            const nights = differenceInCalendarDays(toDate, fromDate);
            if (nights > 0) {
                totalPrice = homestay.price * nights;
            }
        } catch (e) {
            console.error("Error calculating date difference:", e);
        }
    }

    const bookingDetails = {
      homestayId: homestay.id,
      homestayName: homestay.name,
      city: city.name,
      checkInDate: date.from,
      checkOutDate: date.to,
      hostId: homestay.hostId,
      guestName: user.displayName || user.email,
      totalPrice: totalPrice,
      status: 'pending',
    };
    saveHomestayBooking(firestore, user.uid, bookingDetails);
  };

  const handleConfirm = () => {
    if (user) {
      if (!date.from || !date.to) {
        toast({
          variant: 'destructive',
          title: 'Missing Dates',
          description: 'Please enter check-in and check-out dates.',
        });
        return;
      }
      if (cameFromGuidePage) {
        saveBooking();
        toast({
          variant: 'success',
          title: 'Booking Complete!',
          description: 'Your homestay and local guide are booked successfully.',
          duration: 10000,
        });
        router.push('/profile');
      } else {
        setIsDialogOpen(true);
      }
    } else {
      const redirectPath = cameFromGuidePage ? `${pathname}?from=guide` : pathname;
      router.push(`/login?redirect=${redirectPath}`);
    }
  };

  const handleDialogYes = () => {
    router.push(`/hire-local-guide/${params.city}?from=homestay`);
  };

  const handleDialogNo = () => {
    saveBooking();
    toast({
      variant: "success",
      title: "Booking Confirmed!",
      description: "Your homestay is booked successfully.",
      duration: 10000,
    });
    router.push('/profile');
  };

  return (
    <>
      <Card className="overflow-hidden bg-card shadow-md rounded-xl flex flex-col transition-all hover:shadow-lg">
        <div className="relative h-48 w-full">
          <Image
            src={homestay.imageUrl || `https://picsum.photos/seed/${homestay.imageHint?.replace(/\s/g, '-') || homestay.id}/600/400`}
            alt={homestay.name}
            fill
            className="object-cover"
            data-ai-hint={homestay.imageHint || 'homestay cozy'}
          />
        </div>
        <div className="p-4 space-y-3 flex flex-col flex-grow">
          <div className="flex-grow">
            <h3 className="text-xl font-bold line-clamp-1">{homestay.name}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {homestay.location}
            </p>
          </div>
          <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold text-primary">₹{homestay.price.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/Night</span></p>
                <div className="flex items-center gap-1 text-sm bg-accent/50 px-2 py-1 rounded">
                    <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                    <span className="font-bold text-foreground">{homestay.rating.toFixed(1)}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">{homestay.description}</p>
          </div>
          <Button className="w-full mt-2" onClick={handleConfirm}>Book Now</Button>
        </div>
      </Card>
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Would you like to hire a tour guide?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDialogNo}>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleDialogYes}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function CardSkeleton() {
    return (
        <Card className="overflow-hidden bg-card shadow-md rounded-xl">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/5" />
                    <Skeleton className="h-8 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
            </div>
        </Card>
    )
}

export default function BookHomestayPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
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

  const citySlug = params.city;
  const city = useMemo(() => getCityData(citySlug), [citySlug]);
  
  const [homestays, setHomestays] = useState([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [generationError, setGenerationError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState('all');
  const [rating, setRating] = useState('all');
  const [date, setDate] = useState({ from: '', to: '' });

  useEffect(() => {
    if (!citySlug) return;
    
    const fetchHomestays = async () => {
      setIsGenerating(true);
      setGenerationError(null);
      try {
        const listings = await generateListingsAction({ city: city?.name || citySlug, listingType: 'homestays' });
        setHomestays(listings || []);
      } catch (e) {
        const error = e instanceof Error ? e.message : 'Failed to generate homestays.';
        setGenerationError(error);
        console.error(e);
      } finally {
        setIsGenerating(false);
      }
    };

    fetchHomestays();
  }, [citySlug, city?.name]);

  const filteredHomestays = useMemo(() => {
    return homestays
      .filter(homestay => homestay.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(homestay => {
          if (priceRange === 'all') return true;
          const [min, max] = priceRange.split('-').map(Number);
          if(max) return homestay.price >= min && homestay.price <= max;
          return homestay.price >= min;
      })
      .filter(homestay => rating === 'all' || homestay.rating >= parseFloat(rating));
  }, [homestays, searchQuery, priceRange, rating]);

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!city) {
      notFound();
  }

  const homestayPlaceholder = PlaceHolderImages.find(p => p.id === 'homestay-placeholder');

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="w-full bg-transparent backdrop-blur-sm sticky top-0 z-50 overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <Image 
            src="https://picsum.photos/seed/india-strip-1/1200/100" 
            alt="" 
            fill 
            className="object-cover"
            data-ai-hint="india landscape"
          />
        </div>
        <div className="container mx-auto flex h-20 items-center justify-between relative z-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-xl font-bold tracking-tight">TourMate</span>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Button asChild variant="secondary" className="rounded-lg px-6 hidden sm:flex">
                <Link href={`/explore/${citySlug}`}>Back</Link>
            </Button>
            {user ? (
                 <Button asChild variant="secondary" className="rounded-lg px-6 hidden sm:flex">
                    <Link href={dashboardPath}>Dashboard</Link>
                 </Button>
            ) : (
                <Button asChild variant="secondary" className="rounded-lg px-6 hidden sm:flex">
                  <Link href={`/login?redirect=${pathname}`}>Login</Link>
                </Button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight mb-2">Homestays in {city.name}</h1>
          <p className="text-lg text-muted-foreground">Find comfortable and verified stays near top attractions</p>
        </div>

        <div className="mb-8 p-3 bg-card rounded-xl shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search homestays..." 
                className="pl-10 bg-background focus:bg-card border-none h-11" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
             <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="From (DD/MM/YYYY)"
                className="pl-10 bg-background focus:bg-card border-none h-11"
                value={date.from}
                onChange={e => setDate(prev => ({ ...prev, from: e.target.value }))}
              />
            </div>

            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="To (DD/MM/YYYY)"
                className="pl-10 bg-background focus:bg-card border-none h-11"
                value={date.to}
                onChange={e => setDate(prev => ({ ...prev, to: e.target.value }))}
              />
            </div>
            <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="bg-background focus:bg-card border-none h-11">
                    <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-2000">₹0 - ₹2,000</SelectItem>
                  <SelectItem value="2000-5000">₹2,000 - ₹5,000</SelectItem>
                  <SelectItem value="5000-10000">₹5,000 - ₹10,000</SelectItem>
                  <SelectItem value="10000-Infinity">₹10,000+</SelectItem>
                </SelectContent>
            </Select>
            <Select value={rating} onValueChange={setRating}>
                <SelectTrigger className="bg-background focus:bg-card border-none h-11">
                    <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="4">4 Stars & above</SelectItem>
                    <SelectItem value="4.5">4.5 Stars & above</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </div>
        
        {isGenerating ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
        ) : generationError ? (
            <div className="text-center py-16 bg-card rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-destructive">Failed to Load Homestays</h2>
                <p className="text-muted-foreground mt-2">{generationError}</p>
                <p className="text-muted-foreground mt-1">Please try again later.</p>
            </div>
        ) : filteredHomestays.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHomestays.map(homestay => (
              <HomestayCard 
                key={homestay.id} 
                homestay={homestay} 
                user={user} 
                city={city} 
                date={date} 
                fallbackImage={homestayPlaceholder?.imageUrl}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold">No Homestays Found</h2>
            <p className="text-muted-foreground mt-2">
              Try adjusting your search filters.
            </p>
          </div>
        )}
      </main>

      <footer className="w-full bg-foreground text-background/80 mt-16">
        <div className="container mx-auto text-center py-6 text-sm">
            <p>TourMate | Quick Links | For Users | Contact @ {new Date().getFullYear()} TourMate | All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
