
'use client';

import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { getAuth, signOut } from 'firebase/auth';
import { Loader2, MapPin, LogOut, LayoutGrid, Bed, User, UserCheck, Menu, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
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


export default function ProfilePage() {
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
        router.replace('/login?redirect=/profile');
        return;
        }

        if (userProfile) {
        if (userProfile.role !== 'Tourist') {
            switch (userProfile.role) {
            case 'admin':
                router.replace('/admin-dashboard');
                break;
            case 'home stay host':
                router.replace('/host-dashboard');
                break;
            case 'tour guide':
                router.replace('/tour-guide-dashboard');
                break;
            default:
                router.replace('/');
                break;
            }
        }
        }
    }, [user, isUserLoading, userProfile, isProfileLoading, router]);

    const homestayBookingsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'users', user.uid, 'homestayBookings'), orderBy('bookingDate', 'desc'));
    }, [user, firestore]);
    const { data: homestayBookings, isLoading: homestayLoading } = useCollection(homestayBookingsQuery);
    const latestHomestayBooking = homestayBookings?.[0];

    const guideBookingsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'users', user.uid, 'guideBookings'), orderBy('bookingDate', 'desc'));
    }, [user, firestore]);
    const { data: guideBookings, isLoading: guideLoading } = useCollection(guideBookingsQuery);
    const latestGuideBooking = guideBookings?.[0];

    const totalTrips = (homestayBookings?.length || 0) + (guideBookings?.length || 0);
    const isCardsLoading = homestayLoading || guideLoading;

    const handleSignOut = () => {
        const auth = getAuth();
        signOut(auth).then(() => {
            window.location.href = '/';
        });
    };

    const isLoading = isUserLoading || isProfileLoading;

    if (isLoading || !userProfile || userProfile.role !== 'Tourist') {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const displayName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}`.trim() : (user?.email?.split('@')[0] || 'User');

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <aside className="hidden border-r bg-card md:block">
                <div className="flex h-full max-h-screen flex-col">
                    <div className="flex h-14 items-center px-4 lg:h-[60px] lg:px-6">
                        <Link href="/" className="flex items-center gap-2 group">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="text-lg font-bold tracking-tight text-foreground">TourMate</span>
                          </div>
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
                <header className="flex h-14 items-center gap-4 bg-transparent px-4 lg:h-[60px] lg:px-6 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5 pointer-events-none">
                      <Image src="https://picsum.photos/seed/nav-strip-tourist/1200/100" alt="" fill className="object-cover" data-ai-hint="india landscape" />
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
                        className="flex items-center gap-2 relative z-10"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Button>
                    <div className="w-full flex-1" />
                    <Button onClick={handleSignOut} variant="secondary" className="relative z-10">
                        Logout
                    </Button>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold tracking-tight">Welcome, {displayName}</h1>
                        <p className="text-muted-foreground">
                            Here&apos;s a summary of your bookings and activities.
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Upcoming Stay
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isCardsLoading ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                ) : latestHomestayBooking ? (
                                    <>
                                        <div className="text-lg font-bold">{latestHomestayBooking.homestayName}</div>
                                        <p className="text-xs text-muted-foreground">
                                            {latestHomestayBooking.checkInDate} – {latestHomestayBooking.checkOutDate}
                                        </p>
                                    </>
                                ) : (
                                    <div className="text-lg font-bold">No bookings yet.</div>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Guide Tour
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                               {isCardsLoading ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                ) : latestGuideBooking ? (
                                    <>
                                        <div className="text-lg font-bold">{latestGuideBooking.guideName}</div>
                                        <p className="text-xs text-muted-foreground">
                                            {latestGuideBooking.tourDate}
                                        </p>
                                    </>
                                ) : (
                                    <div className="text-lg font-bold">No bookings yet.</div>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isCardsLoading ? (
                                    <Skeleton className="h-6 w-1/2" />
                                ) : (
                                    <div className="text-lg font-bold">{totalTrips} Booking{totalTrips !== 1 ? 's' : ''}</div>
                                )}
                                <p className='text-xs text-muted-foreground invisible'>-</p>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
