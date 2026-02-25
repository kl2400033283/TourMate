
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
  Calendar,
  Wallet,
  ArrowLeft,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.jsx';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet.jsx';
import { useRouter, usePathname } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { cn } from '@/lib/utils.js';
import { collection, query, where, doc, orderBy } from 'firebase/firestore';
import { useEffect, useMemo } from 'react';


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

export default function TourGuideDashboardPage() {
    const router = useRouter();
    const { user, isUserLoading } = useUser();
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
        router.replace('/login');
        return;
        }

        if (userProfile) {
        if (userProfile.role !== 'tour guide') {
            switch (userProfile.role) {
            case 'admin':
                router.replace('/admin-dashboard');
                break;
            case 'home stay host':
                router.replace('/host-dashboard');
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

    const bookingsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'users', user.uid, 'receivedGuideBookings'), orderBy('bookingDate', 'desc'));
    }, [user, firestore]);
    const { data: bookings, isLoading: bookingsLoading } = useCollection(bookingsQuery);

    const handleSignOut = () => {
        const auth = getAuth();
        signOut(auth).then(() => {
            window.location.href = '/';
        });
    };

    const isLoading = isUserLoading || isProfileLoading || bookingsLoading;

    const upcomingTours = useMemo(() => {
        if (!bookings) return [];
        return (bookings || []).filter(b => b.status === 'approved' && new Date(b.tourDate.split('/').reverse().join('-')) >= new Date());
    }, [bookings]);
    
    const pendingRequests = useMemo(() => {
         if (!bookings) return 0;
        return (bookings || []).filter(b => b.status === 'pending').length;
    }, [bookings]);

    const totalEarnings = useMemo(() => {
         if (!bookings) return 0;
        return (bookings || [])
            .filter(b => b.status === 'completed' || b.status === 'approved')
            .reduce((acc, booking) => acc + (booking.totalPrice || 0), 0);
    }, [bookings]);

    const completedToursCount = useMemo(() => {
        if (!bookings) return 0;
        return (bookings || []).filter(b => b.status === 'completed').length;
    }, [bookings]);

    const displayName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}`.trim() : 'Guide';
    
    if (isLoading || !userProfile || userProfile.role !== 'tour guide') {
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
                <div className="flex h-14 items-center px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                      <MapPin className="h-6 w-6 text-primary" />
                      <span className="text-xl font-bold"><span className="text-primary">Tour</span>Mate</span>
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
              className="flex items-center gap-2"
          >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
          </Button>
          <div className="w-full flex-1" />
           <Button onClick={handleSignOut} variant="secondary" size="sm">
                Logout
            </Button>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight">Welcome, {displayName} 👋</h1>
            <p className="text-muted-foreground">
              Manage your guide services and tour bookings.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Tours</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : upcomingTours.length > 0 ? (
                    <div>
                        <div className="text-lg font-bold">{upcomingTours.length} tour(s) scheduled</div>
                        <p className="text-xs text-muted-foreground">Next: {upcomingTours[0].city} on {upcomingTours[0].tourDate}</p>
                    </div>
                ) : (
                    <div className="text-lg font-bold">No upcoming tours</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Hire Requests</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                    <div>
                        <div className="text-2xl font-bold">+{pendingRequests}</div>
                        <p className="text-xs text-muted-foreground">New requests awaiting your approval</p>
                    </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                 {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                    <div>
                        <div className="text-2xl font-bold">₹{totalEarnings.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">From {completedToursCount} completed tours</p>
                    </div>
                 )}
              </CardContent>
            </Card>
          </div>
          
           <Card className="flex-1 rounded-lg bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="flex items-center justify-center h-full min-h-48 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No recent activity.</p>
                </div>
            </Card>

        </main>
        <footer className="border-t bg-card mt-auto">
            <div className="container mx-auto text-center py-6 text-muted-foreground text-sm">
                 <p>TourMate | Quick Links | For Users | Contact @ {new Date().getFullYear()} TourMate | All Rights Reserved.</p>
            </div>
        </footer>
      </div>
    </div>
  );
}
