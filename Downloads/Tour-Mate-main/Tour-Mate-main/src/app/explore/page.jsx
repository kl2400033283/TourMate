
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { citiesByState } from '@/lib/tourist-cities';
import { useUser } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useUser();

  const allCities = Object.entries(citiesByState).flatMap(([stateSlug, cities]) => 
    cities.map(city => ({
        ...city,
        stateSlug,
        stateName: stateSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }))
  );

  const filteredCities = allCities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.stateName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cityPlaceholder = PlaceHolderImages.find(p => p.id === 'city-placeholder');

  return (
    <div className="min-h-screen bg-background text-foreground">
        <header className="absolute top-0 z-50 w-full p-4 bg-transparent">
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
                    <Link href="/profile">Dashboard</Link>
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
                          <Link href="/profile" className="text-lg">Dashboard</Link>
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

        <div className="relative h-[50vh] min-h-[300px] flex items-center justify-center text-white">
            <Image
                src="https://picsum.photos/seed/explore-hero/1920/500"
                alt="Explore tourist destinations"
                fill
                className="object-cover"
                data-ai-hint="India landscape"
            />
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 text-center space-y-4">
                <h1 className="text-5xl font-bold font-headline">Explore Destinations</h1>
                <p className="text-xl text-white/90">Find your next adventure in India.</p>
            </div>
        </div>

      <main className="container mx-auto py-8 -mt-20 relative z-20">
        <div className="relative max-w-2xl mx-auto mb-12">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for cities, states..."
              className="w-full rounded-full pl-12 p-6 text-lg shadow-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>

        {filteredCities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCities.map((city) => (
              <Card key={`${city.stateSlug}-${city.slug}`} className="overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl flex flex-col">
                <CardContent className="p-0">
                    <Image
                    src={city.image || cityPlaceholder?.imageUrl || 'https://picsum.photos/seed/city/400/300'}
                    alt={`A scenic view of ${city.name}`}
                    width={400}
                    height={300}
                    className="h-48 w-full object-cover"
                    data-ai-hint={city.hint || 'cityscape'}
                  />
                </CardContent>
                <CardHeader>
                  <CardTitle className="font-bold text-xl">{city.name}</CardTitle>
                  <CardDescription>{city.stateName}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  <div className="text-sm text-muted-foreground flex items-center">
                      <span>{city.attractions} Attractions</span>
                      <span className="mx-2 font-bold">·</span>
                      <span>{city.homestays} Homestays</span>
                  </div>
                  <CardDescription>{city.knownFor}</CardDescription>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Link href={`/explore/${city.slug}`}>View City</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold">No Cities Found</h2>
            <p className="text-muted-foreground mt-2">
              Your search for "{searchQuery}" did not match any cities. Try a different search.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
