'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getAuth, signOut } from 'firebase/auth';
import { Loader2, MapPin, LayoutGrid, Bed, User, UserCheck, Menu, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';


function SidebarNav({ isMobile = false }) {
    const pathname = usePathname();

    const navLinks = [
        { href: '/profile', icon: LayoutGrid, label: 'Dashboard' },
        { href: '/my-stays', icon: Bed, label: 'My Stays' },
        { href: '/my-guide-bookings', icon: UserCheck, label: 'My Guide Bookings' },
        { href: '/my-profile', icon: User, label: 'Profile' },
    ];

    return (
        <nav className={cn("flex flex-col gap-2", isMobile ? "text-lg" : "text-sm font-medium")}>
            {navLinks.map((link) => (
                <Link
                    key={link.label}
                    href={link.href}
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                        pathname === link.href && "text-primary bg-muted"
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
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        );
    }

    if (!bookings || bookings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg text-center p-4">
                <p className="text-muted-foreground mb-4">You haven't booked any stays yet.</p>
                <Button asChild>
                    <Link href="/explore">Explore Destinations</Link>
                </Button>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Homestay</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead className="text-right">Total Price</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.homestayName}</TableCell>
                        <TableCell>{booking.city}</TableCell>
                        <TableCell>{booking.checkInDate} - {booking.checkOutDate}</TableCell>
                        <TableCell className="text-right">₹{booking.totalPrice?.toLocaleString()}</TableCell>
                        <TableCell className="text-center">
                            <Badge 
                                variant="outline"
                                className={cn({
                                    'border-yellow-500 text-yellow-700': booking.status === 'pending',
                                    'border-green-500 text-green-700': booking.status === 'approved',
                                    'border-red-500 text-red-700': booking.status === 'declined',
                                    'border-blue-500 text-blue-700': booking.status === 'completed',
                                })}
                            >
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default function MyStaysPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.replace('/login?redirect=/my-stays');
        }
    }, [isUserLoading, user, router]);

    const homestayBookingsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'users', user.uid, 'homestayBookings'), orderBy('bookingDate', 'desc'));
    }, [user, firestore]);
    const { data: homestayBookings, isLoading: homestayLoading } = useCollection(homestayBookingsQuery);

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
                        <div className="relative px-4">
                            <SidebarNav />
                        </div>
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
                                <div className="relative px-4">
                                     <SidebarNav isMobile={true}/>
                                </div>
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
                        <h1 className="text-lg font-semibold md:text-2xl">My Stays</h1>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Homestay Bookings</CardTitle>
                            <CardDescription>A list of all your past and present homestay bookings.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BookingsTable bookings={homestayBookings} isLoading={homestayLoading} />
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}
