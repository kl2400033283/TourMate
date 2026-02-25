
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, LogOut, Menu, Users, Home, Compass, BarChart2, LayoutGrid, ArrowLeft, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import { useEffect, useMemo } from 'react';
import { doc, collection, collectionGroup } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

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

function StatCard({ title, value, description, icon: Icon, isLoading }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}


export default function AdminDashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);
  
  const allUsersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const { data: allUsers, isLoading: isAllUsersLoading } = useCollection(allUsersQuery);

  const allHomestaysQuery = useMemoFirebase(() => firestore ? collection(firestore, 'homestays') : null, [firestore]);
  const { data: allHomestays, isLoading: isAllHomestaysLoading } = useCollection(allHomestaysQuery);

  const homestayBookingsQuery = useMemoFirebase(() => firestore ? collectionGroup(firestore, 'homestayBookings') : null, [firestore]);
  const { data: allHomestayBookings, isLoading: homestayBookingsLoading } = useCollection(homestayBookingsQuery);

  const guideBookingsQuery = useMemoFirebase(() => firestore ? collectionGroup(firestore, 'guideBookings') : null, [firestore]);
  const { data: allGuideBookings, isLoading: guideBookingsLoading } = useCollection(guideBookingsQuery);
  
  const stats = useMemo(() => {
    if (!allUsers || !allHomestays) {
      return {
        tourists: 0,
        hosts: 0,
        guides: 0,
        pendingHomestays: 0,
        pendingGuides: 0,
      };
    }

    const tourists = allUsers.filter(u => u.role === 'Tourist').length;
    const hosts = allUsers.filter(u => u.role === 'home stay host').length;
    const guides = allUsers.filter(u => u.role === 'tour guide').length;
    const pendingGuides = allUsers.filter(u => u.role === 'tour guide' && u.status === 'pending_verification').length;
    const pendingHomestays = allHomestays.filter(h => h.status === 'pending_approval').length;

    return { tourists, hosts, guides, pendingHomestays, pendingGuides };
  }, [allUsers, allHomestays]);
  
  const { totalBookings, activeBookings, completedBookings } = useMemo(() => {
    if(!allHomestayBookings || !allGuideBookings) return {totalBookings: 0, activeBookings: 0, completedBookings: 0};
    
    const allBookings = [...allHomestayBookings, ...allGuideBookings];
    const total = allBookings.length;
    const active = allBookings.filter(b => b.status === 'approved').length;
    const completed = allBookings.filter(b => b.status === 'completed').length;
    
    return {totalBookings: total, activeBookings: active, completedBookings: completed};

  }, [allHomestayBookings, allGuideBookings]);
  

  useEffect(() => {
    const isLoading = isUserLoading || isProfileLoading;
    if (isLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (userProfile) {
      if (userProfile.role !== 'admin') {
        switch (userProfile.role) {
          case 'home stay host':
            router.replace('/host-dashboard');
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

  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      window.location.href = '/';
    });
  };

  const dashboardIsLoading = isUserLoading || isProfileLoading || isAllUsersLoading || isAllHomestaysLoading || homestayBookingsLoading || guideBookingsLoading;

  if (dashboardIsLoading || !userProfile || userProfile.role !== 'admin') {
    return <div className="h-screen w-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  const totalUsers = allUsers?.length || 0;
  const totalHomestays = allHomestays?.length || 0;
  const totalGuides = stats.guides;


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
            <SidebarNav />
          </div>
        </div>
      </aside>
      <div className="flex flex-col bg-muted/40">
        <header className="flex h-14 items-center gap-4 bg-transparent px-4 lg:h-[60px] lg:px-6 overflow-hidden relative">
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <Image src="https://picsum.photos/seed/nav-strip-admin/1200/100" alt="" fill className="object-cover" data-ai-hint="india landscape" />
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
                    <MapPin className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold tracking-tight">TourMate</span>
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
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="mb-4">
            <h1 className="text-3xl font-bold tracking-tight">Welcome, Admin 👋</h1>
            <p className="text-muted-foreground mt-1">
              Monitor platform activity and manage users.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <StatCard 
              title="Total Users" 
              value={totalUsers} 
              description={`${stats.tourists} Tourists, ${stats.hosts} Hosts, ${stats.guides} Guides`} 
              icon={Users}
              isLoading={dashboardIsLoading} 
            />
            <StatCard 
              title="Homestay Listings" 
              value={totalHomestays} 
              description={`${stats.pendingHomestays} Pending Approval`}
              icon={Home}
              isLoading={dashboardIsLoading} 
            />
            <StatCard 
              title="Local Guides" 
              value={totalGuides} 
              description={`${stats.pendingGuides} Pending Verification`}
              icon={Compass}
              isLoading={dashboardIsLoading} 
            />
            <StatCard 
              title="Total Bookings" 
              value={totalBookings}
              description={`${activeBookings} Active, ${completedBookings} Completed`}
              icon={Briefcase}
              isLoading={dashboardIsLoading}
            />
          </div>
        </main>
        <footer className="bg-card border-t mt-auto">
            <div className="container mx-auto text-center py-6 text-muted-foreground text-sm">
                <div>
                  &copy; {new Date().getFullYear()} TourMate | All Rights Reserved.
                </div>
            </div>
        </footer>
      </div>
    </div>
  );
}
