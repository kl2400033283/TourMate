'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
    MapPin, Menu, Users, Home, Compass, BarChart2, MoreHorizontal, ArrowLeft, LayoutGrid, Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import { useEffect, useMemo } from 'react';
import { doc, collection } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';


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

function HomestaysTable({ homestays, users, isLoading, onUpdateStatus }) {
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const usersById = useMemo(() => {
    if (!users) return {};
    return users.reduce((acc, user) => {
      acc[user.uid] = user;
      return acc;
    }, {});
  }, [users]);
  
  if (!homestays || homestays.length === 0) {
    return <p className="p-4 text-center text-muted-foreground">No homestays found.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Host</TableHead>
          <TableHead className="hidden md:table-cell">Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {homestays?.map((homestay) => {
          const host = usersById[homestay.hostId];
          const hostName = host ? `${host.firstName} ${host.lastName}` : 'N/A';
          return (
            <TableRow key={homestay.id}>
              <TableCell className="hidden sm:table-cell">
                 <div className="relative h-12 w-12 overflow-hidden rounded-md">
                    <Image
                        alt={homestay.name}
                        className="object-cover"
                        fill
                        src={homestay.imageUrl || `https://picsum.photos/seed/${homestay.id}/64/64`}
                        data-ai-hint={homestay.imageHint || 'homestay interior'}
                    />
                 </div>
              </TableCell>
              <TableCell className="font-medium">{homestay.name}</TableCell>
              <TableCell>{hostName}</TableCell>
              <TableCell className="hidden md:table-cell">₹{homestay.pricePerNight?.toLocaleString()}</TableCell>
              <TableCell>
                <Badge variant={
                  homestay.status === 'approved' ? 'default' 
                  : homestay.status === 'pending_approval' ? 'secondary'
                  : 'destructive'
                } className={cn('capitalize', {
                  'bg-green-500/20 text-green-700 border-green-500/30': homestay.status === 'approved',
                  'bg-yellow-500/20 text-yellow-700 border-yellow-500/30': homestay.status === 'pending_approval',
                  'bg-red-500/20 text-red-700 border-red-500/30': homestay.status === 'rejected',
                })}>
                  {homestay.status?.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    {homestay.status === 'pending_approval' && (
                      <>
                        <DropdownMenuItem onClick={() => onUpdateStatus(homestay.id, 'approved')}>Approve</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => onUpdateStatus(homestay.id, 'rejected')}>Reject</DropdownMenuItem>
                      </>
                    )}
                    {homestay.status === 'approved' && <DropdownMenuItem className="text-destructive" onClick={() => onUpdateStatus(homestay.id, 'rejected')}>Suspend Listing</DropdownMenuItem>}
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}


export default function ManageHomestaysPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
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
      router.replace('/login?redirect=/manage-homestays');
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

  const allHomestaysQuery = useMemoFirebase(() => firestore ? collection(firestore, 'homestays') : null, [firestore]);
  const { data: allHomestays, isLoading: isAllHomestaysLoading } = useCollection(allHomestaysQuery);
  
  const allUsersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const { data: allUsers, isLoading: isAllUsersLoading } = useCollection(allUsersQuery);

  const handleUpdateHomestayStatus = (homestayId, status) => {
    if (!firestore) return;
    const homestayRef = doc(firestore, 'homestays', homestayId);
    updateDocumentNonBlocking(homestayRef, { status });
    toast({
      title: "Homestay Status Updated",
      description: `Homestay has been ${status}.`
    });
  };

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
            <h1 className="text-3xl font-bold tracking-tight">Manage Homestays</h1>
            <p className="text-muted-foreground mt-1">
              View, approve, and manage all homestay listings on the platform.
            </p>
          </div>
          <Card>
            <CardHeader>
                <CardTitle>All Homestays</CardTitle>
                <CardDescription>A list of all homestays in the system.</CardDescription>
            </CardHeader>
            <CardContent>
                <HomestaysTable homestays={allHomestays} users={allUsers} isLoading={isAllHomestaysLoading || isAllUsersLoading} onUpdateStatus={handleUpdateHomestayStatus} />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
