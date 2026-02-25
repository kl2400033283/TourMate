
'use client';

import Link from 'next/link';
import {
  Bell,
  Home,
  LogOut,
  Menu,
  User,
  LayoutGrid,
  DollarSign,
  Briefcase,
  Loader2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  MapPin,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.jsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.jsx';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet.jsx';
import { useRouter, usePathname } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { cn } from '@/lib/utils.js';
import { collection, query, doc, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { useToast } from '@/hooks/use-toast.jsx';
import { useEffect } from 'react';

function SidebarNav({ isMobile = false }) {
    const pathname = usePathname();

    const navLinks = [
        { href: '/tour-guide-dashboard', icon: LayoutGrid, label: 'Dashboard' },
        { href: '/my-tours', icon: Briefcase, label: 'My Tours' },
        { href: '/hire-requests', icon: Bell, label: 'Hire Requests' },
        { href: '/guide-earnings', icon: DollarSign, label: 'Earnings' },
        { href: '/guide-profile', icon: User, label: 'Profile' },
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

function HireRequestsTable({ bookings, isLoading, onUpdateStatus }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
       <div className="flex items-center justify-center h-full min-h-48 border-2 border-dashed rounded-lg text-center p-4">
          <p className="text-muted-foreground">No hire requests found.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client</TableHead>
          <TableHead>City</TableHead>
          <TableHead className="hidden md:table-cell">Date</TableHead>
          <TableHead className="hidden sm:table-cell">Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow key={booking.id}>
            <TableCell>{booking.guestName}</TableCell>
            <TableCell>{booking.city}</TableCell>
            <TableCell className="hidden md:table-cell">{booking.tourDate}</TableCell>
            <TableCell className="hidden sm:table-cell">
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

export default function HireRequestsPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.replace('/login?redirect=/hire-requests');
        }
    }, [isUserLoading, user, router]);

    const bookingsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'users', user.uid, 'receivedGuideBookings'), orderBy('bookingDate', 'desc'));
    }, [user, firestore]);
    const { data: bookings, isLoading: bookingsLoading } = useCollection(bookingsQuery);

    const handleUpdateBookingStatus = (booking, newStatus) => {
      if (!firestore || !user) return;
  
      const guideBookingRef = doc(firestore, 'users', user.uid, 'receivedGuideBookings', booking.id);
      updateDocumentNonBlocking(guideBookingRef, { status: newStatus });
  
      const touristBookingRef = doc(firestore, 'users', booking.userId, 'guideBookings', booking.id);
      updateDocumentNonBlocking(touristBookingRef, { status: newStatus });
  
      toast({
          title: `Request ${newStatus}`,
          description: `The hire request from ${booking.guestName} has been ${newStatus}.`,
          variant: newStatus === 'approved' ? 'success' : 'destructive'
      });
    };

    const handleSignOut = () => {
        const auth = getAuth();
        signOut(auth).then(() => {
            window.location.href = '/';
        });
    };

    if (isUserLoading || !user) {
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
            <div className="flex flex-col bg-background">
                <header className="flex h-14 items-center gap-4 bg-transparent px-4 lg:h-[60px] lg:px-6">
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
                     <Button
                        variant="outline"
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Button>
                    <div className="w-full flex-1" />
                    <Button onClick={handleSignOut} variant="secondary">
                        Logout
                    </Button>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    <div className="flex items-center">
                        <div>
                            <h1 className="text-lg font-semibold md:text-2xl">Hire Requests</h1>
                             <p className="text-sm text-muted-foreground">
                                Manage incoming requests from clients.
                            </p>
                        </div>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>All Hire Requests</CardTitle>
                            <CardDescription>A complete list of all hire requests from clients.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <HireRequestsTable bookings={bookings} isLoading={bookingsLoading} onUpdateStatus={handleUpdateBookingStatus} />
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}
