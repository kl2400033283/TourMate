
'use client';

import Link from 'next/link';
import { MapPin, LogOut, Menu, Users, Home, Compass, BarChart2, Briefcase, LayoutGrid, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import { useEffect, useMemo } from 'react';
import { doc, collection, collectionGroup, orderBy } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


function SidebarNav({ isMobile = false }) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/admin-dashboard', label: 'Dashboard', icon: LayoutGrid },
    { href: '/manage-users', label: 'Manage Users', icon: Users },
    { href: '/manage-homestays', label: 'Manage Homestays', icon: Home },
    { href: '/manage-guides', label: 'Manage Guides', icon: Compass },
    { href: '/manage-bookings', label: 'Manage Bookings', icon: Briefcase },
    { href: '/reports', label: 'Reports', icon: BarChart2 },
  ];

  return (
    <nav className={cn("grid items-start gap-1 px-2", isMobile ? "text-lg font-medium" : "text-sm font-medium")}>
      {navLinks.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            pathname === link.href && "bg-muted text-primary"
          )}
        >
          <link.icon className="h-4 w-4" />
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function BookingsTable({ bookings, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
      return <p className="p-4 text-center text-muted-foreground">No bookings found.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Guest</TableHead>
          <TableHead>Item</TableHead>
          <TableHead>Dates / Tour Date</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings?.map((booking) => (
          <TableRow key={booking.id}>
            <TableCell>{booking.guestName}</TableCell>
            <TableCell className="font-medium">{booking.homestayName || booking.guideName}</TableCell>
            <TableCell>{booking.checkInDate ? `${booking.checkInDate} - ${booking.checkOutDate}` : booking.tourDate}</TableCell>
            <TableCell>₹{booking.totalPrice?.toLocaleString()}</TableCell>
            <TableCell>
              <Badge variant={
                  booking.status === 'approved' ? 'default' 
                  : booking.status === 'pending' ? 'secondary'
                  : booking.status === 'completed' ? 'outline'
                  : 'destructive'
              } className={cn({
                  'bg-green-500/20 text-green-700 border-green-500/30': booking.status === 'approved',
                  'bg-yellow-500/20 text-yellow-700 border-yellow-500/30': booking.status === 'pending',
                  'bg-blue-500/20 text-blue-700 border-blue-500/30': booking.status === 'completed',
                  'bg-red-500/20 text-red-700 border-red-500/30': booking.status === 'declined',
              })}>
                {booking.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function ManageBookingsPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  useEffect(() => {
    const isLoading = isUserLoading || isProfileLoading;
    if (isLoading) return;

    if (!user) {
      router.replace('/login?redirect=/manage-bookings');
      return;
    }

    if (userProfile && userProfile.role !== 'admin') {
      router.replace('/');
    }
  }, [user, isUserLoading, userProfile, isProfileLoading, router]);

  const homestayBookingsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collectionGroup(firestore, 'homestayBookings');
  }, [firestore]);
  const { data: allHomestayBookings, isLoading: isHomestayBookingsLoading } = useCollection(homestayBookingsQuery);
  
  const guideBookingsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collectionGroup(firestore, 'guideBookings');
  }, [firestore]);
  const { data: allGuideBookings, isLoading: isGuideBookingsLoading } = useCollection(guideBookingsQuery);

  const sortedHomestayBookings = useMemo(() => {
    if (!allHomestayBookings) return [];
    return [...allHomestayBookings].sort((a, b) => {
      const dateA = a.bookingDate?.toDate ? a.bookingDate.toDate() : new Date(0);
      const dateB = b.bookingDate?.toDate ? b.bookingDate.toDate() : new Date(0);
      return dateB - dateA;
    });
  }, [allHomestayBookings]);

  const sortedGuideBookings = useMemo(() => {
    if (!allGuideBookings) return [];
    return [...allGuideBookings].sort((a, b) => {
      const dateA = a.bookingDate?.toDate ? a.bookingDate.toDate() : new Date(0);
      const dateB = b.bookingDate?.toDate ? b.bookingDate.toDate() : new Date(0);
      return dateB - dateA;
    });
  }, [allGuideBookings]);

  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      window.location.href = '/';
    });
  };

  const pageIsLoading = isUserLoading || isProfileLoading;

  if (pageIsLoading || !userProfile || userProfile.role !== 'admin') {
    return <div className="h-screen w-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <MapPin className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold"><span className="text-primary">Tour</span>Mate</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-4">
            <SidebarNav />
          </div>
        </div>
      </aside>
      <div className="flex flex-col bg-muted/40">
        <header className="flex h-14 items-center gap-4 bg-transparent px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                  <Link href="/" className="flex items-center gap-2 font-semibold">
                    <MapPin className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold"><span className="text-primary">Tour</span>Mate</span>
                  </Link>
                </div>
                <div className="flex-1 overflow-auto py-4">
                  <SidebarNav isMobile={true}/>
                </div>
            </SheetContent>
          </Sheet>
           <Button variant="outline" onClick={() => router.push('/')} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
          </Button>
           <div className="w-full flex-1" />
           <Button onClick={handleSignOut} variant="secondary">
              Logout
            </Button>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="mb-4">
            <h1 className="text-3xl font-bold tracking-tight">Manage Bookings</h1>
            <p className="text-muted-foreground mt-1">
              View all homestay and tour guide bookings across the platform.
            </p>
          </div>
          <Card>
            <CardHeader>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>A list of all bookings made in the system.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="homestays">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="homestays">Homestay Bookings</TabsTrigger>
                  <TabsTrigger value="guides">Guide Bookings</TabsTrigger>
                </TabsList>
                <TabsContent value="homestays">
                  <BookingsTable bookings={sortedHomestayBookings} isLoading={isHomestayBookingsLoading} />
                </TabsContent>
                <TabsContent value="guides">
                  <BookingsTable bookings={sortedGuideBookings} isLoading={isGuideBookingsLoading} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
