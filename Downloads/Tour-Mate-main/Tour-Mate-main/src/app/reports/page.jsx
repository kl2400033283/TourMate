'use client';

import Link from 'next/link';
import {
    MapPin, Menu, Users, Home, Compass, BarChart2, LayoutGrid, ArrowLeft, DollarSign, LineChart, Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import { useEffect } from 'react';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";


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

const chartData = [
  { month: "Jan", bookings: 12, revenue: 24000 },
  { month: "Feb", bookings: 19, revenue: 38000 },
  { month: "Mar", bookings: 15, revenue: 30000 },
  { month: "Apr", bookings: 22, revenue: 44000 },
  { month: "May", bookings: 25, revenue: 50000 },
  { month: "Jun", bookings: 18, revenue: 36000 },
];

function BookingsChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <XAxis
          dataKey="month"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₹${value / 1000}k`}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--muted))' }}
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
          }}
        />
        <Legend />
        <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        <Bar dataKey="bookings" name="Bookings" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}


export default function ReportsPage() {
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
      router.replace('/login?redirect=/reports');
      return;
    }

    if (userProfile && userProfile.role !== 'admin') {
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
  }, [user, isUserLoading, userProfile, isProfileLoading, router]);


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
      <div className="flex flex-col bg-muted/40">
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
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="mb-4">
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Visualize platform performance and growth.
            </p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹4,52,318</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+235</div>
                <p className="text-xs text-muted-foreground">+18.1% from last month</p>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Bookings</CardTitle>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+12,234</div>
                <p className="text-xs text-muted-foreground">+19% from last month</p>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Listings</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-muted-foreground">+5% from last month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
                <CardTitle>Bookings Overview</CardTitle>
                <CardDescription>Monthly bookings and revenue analysis.</CardDescription>
            </CardHeader>
            <CardContent>
                <BookingsChart />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
