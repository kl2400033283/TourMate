'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Bell,
  Home,
  List,
  LogOut,
  Menu,
  PlusCircle,
  User,
  LayoutGrid,
  DollarSign,
  Banknote,
  Hourglass,
  Loader2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  MapPin,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useRouter, usePathname } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { cn } from '@/lib/utils';
import { collection, query, where, doc, orderBy } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';


function SidebarNav({ isMobile = false }) {
    const pathname = usePathname();

    const navLinks = [
        { href: '/host-dashboard', icon: LayoutGrid, label: 'Dashboard' },
        { href: '/my-listings', icon: List, label: 'My Listings' },
        { href: '/add-homestay', icon: PlusCircle, label: 'Add Homestay' },
        { href: '/booking-requests', icon: Bell, label: 'Booking Requests' },
        { href: '/earnings', icon: DollarSign, label: 'Earnings' },
        { href: '/host-profile', icon: User, label: 'Profile' },
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
                    {link.badge && (
                        <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                            {link.badge}
                        </Badge>
                    )}
                </Link>
            ))}
        </nav>
    );
}

function RecentBookings({ bookings, isLoading, onUpdateStatus }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-48 border-2 border-dashed rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
       <div className="flex items-center justify-center h-full min-h-48 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No recent bookings found.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Guest</TableHead>
          <TableHead>Homestay</TableHead>
          <TableHead>Dates</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow key={booking.id}>
            <TableCell>{booking.guestName}</TableCell>
            <TableCell>{booking.homestayName}</TableCell>
            <TableCell>
              {booking.checkInDate} - {booking.checkOutDate}
            </TableCell>
            <TableCell>
              <Badge 
                variant={
                  booking.status === 'pending' ? 'secondary' : 
                  booking.status === 'approved' ? 'default' : 
                  'destructive'
                }
                className={cn({
                  'bg-yellow-500/20 text-yellow-700 border-yellow-500/30': booking.status === 'pending',
                  'bg-green-500/20 text-green-700 border-green-500/30': booking.status === 'approved',
                  'bg-red-500/20 text-red-700 border-red-500/30': booking.status === 'declined',
                  'bg-blue-500/20 text-blue-700 border-blue-500/30': booking.status === 'completed',
                })}
              >
                {booking.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {booking.status === 'pending' && (
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => onUpdateStatus(booking, 'approved')}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Approve
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onUpdateStatus(booking, 'declined')}>
                    <XCircle className="h-4 w-4 mr-1" /> Decline
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function HostDashboardPage() {
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const userProfileRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

    useEffect(() => {
        const isLoading = isUserLoading || isProfileLoading;
        if (isLoading) return;

        if (!user) {
        router.replace('/login');
        return;
        }

        if (userProfile) {
        if (userProfile.role !== 'home stay host') {
            switch (userProfile.role) {
            case 'admin':
                router.replace('/admin-dashboard');
                break;
            case 'tour guide':
                router.replace('/tour-guide-dashboard');
                break;
            case 'Tourist':
                router.replace('/profile');
                break;
            default:
                router.replace('/');
                break;
            }
        }
        }
    }, [user, isUserLoading, userProfile, isProfileLoading, router]);

    // Fetch this host's homestay listings
    const listingsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'homestays'), where('hostId', '==', user.uid));
    }, [user, firestore]);
    const { data: listings, isLoading: listingsLoading } = useCollection(listingsQuery);

    // Fetch bookings received by this host
    const bookingsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'users', user.uid, 'receivedHomestayBookings'), orderBy('bookingDate', 'desc'));
    }, [user, firestore]);
    const { data: bookings, isLoading: bookingsLoading } = useCollection(bookingsQuery);

    const handleSignOut = () => {
        const auth = getAuth();
        signOut(auth).then(() => {
            window.location.href = '/';
        });
    };

    const handleUpdateBookingStatus = (booking, newStatus) => {
      if (!firestore || !user) return;
  
      const hostBookingRef = doc(firestore, 'users', user.uid, 'receivedHomestayBookings', booking.id);
      updateDocumentNonBlocking(hostBookingRef, { status: newStatus });
  
      // Also update the booking in the tourist's collection
      const touristBookingRef = doc(firestore, 'users', booking.userId, 'homestayBookings', booking.id);
      updateDocumentNonBlocking(touristBookingRef, { status: newStatus });
  
      toast({
          title: `Booking ${newStatus}`,
          description: `The booking for ${booking.homestayName} has been ${newStatus}.`,
          variant: newStatus === 'approved' ? 'success' : 'destructive'
      });
  };

    const isLoading = isUserLoading || isProfileLoading || listingsLoading || bookingsLoading;
    
    const totalListings = listings ? listings.length : 0;
    
    const pendingBookings = !bookingsLoading && bookings ? 
        (bookings || []).filter(b => b.status === 'pending').length : 0;

    const totalEarnings = !bookingsLoading && bookings ? 
        (bookings || [])
        .filter(b => b.status === 'completed' || b.status === 'approved')
        .reduce((acc, booking) => acc + (booking.totalPrice || 0), 0) : 0;

    const displayName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}`.trim() : 'Host';

    if (isLoading || !userProfile || userProfile.role !== 'home stay host') {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col">
          <div className="flex h-14 items-center px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex items-center gap-1">
                <Home className="h-4 w-4 text-primary" />
                <span className="text-lg font-bold tracking-tight text-foreground">TourMate Host</span>
              </div>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-4">
            <SidebarNav />
          </div>
        </div>
      </aside>
      <div className="flex flex-col bg-muted/20">
        <header className="flex h-14 items-center gap-4 bg-transparent px-4 lg:h-[60px] lg:px-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <Image src="https://picsum.photos/seed/nav-strip-host/1200/100" alt="" fill className="object-cover" data-ai-hint="india landscape" />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
                <div className="flex h-14 items-center px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                      <Home className="h-6 w-6 text-primary" />
                      <span className="text-xl font-bold"><span className="text-primary">Tour</span>Mate Host</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-auto py-4">
                  <SidebarNav isMobile={true} />
                </div>
            </SheetContent>
          </Sheet>
          <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="flex items-center gap-2 relative z-10"
          >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
          </Button>
          <div className="w-full flex-1" />
          <Button onClick={handleSignOut} variant="secondary" size="sm" className="relative z-10">
                Logout
            </Button>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight">Welcome, {displayName}</h1>
            <p className="text-muted-foreground">
              Manage your homestays and booking requests.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
                <List className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{totalListings}</div>}
                <p className="text-xs text-muted-foreground">
                  Active homestays
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Booking Requests</CardTitle>
                <Hourglass className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">+{pendingBookings}</div>}
                <p className="text-xs text-muted-foreground">
                  Awaiting your approval
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <Banknote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                 {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">₹{totalEarnings.toLocaleString()}</div>}
                <p className="text-xs text-muted-foreground">
                  Based on approved bookings
                </p>
              </CardContent>
            </Card>
          </div>
          
           <Card className="flex-1 rounded-lg bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <RecentBookings bookings={bookings} isLoading={isLoading} onUpdateStatus={handleUpdateBookingStatus} />
            </Card>

        </main>
        <footer className="border-t bg-card">
            <div className="container mx-auto text-center py-6 text-muted-foreground text-sm">
                 <p>Quick Links | For Hosts | Contact @ <span suppressHydrationWarning>{new Date().getFullYear()}</span> TourMate | All Rights Reserved.</p>
            </div>
        </footer>
      </div>
    </div>
  );
}
