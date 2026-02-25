
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
  Mail,
  Phone,
  KeyRound,
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
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { cn } from '@/lib/utils.js';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton.jsx';
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

function ProfileDetails({ userProfile, isLoading }) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-6 w-1/2" />
            </div>
        );
    }
    
    if (!userProfile) {
        return <p>Could not load profile details.</p>;
    }

    const { firstName, lastName, email, phoneNumber, role } = userProfile;

    return (
        <div className="space-y-4">
            <div className="flex items-center">
                <User className="h-5 w-5 text-muted-foreground mr-3" />
                <span className="font-medium">{firstName} {lastName}</span>
            </div>
            <div className="flex items-center">
                <Mail className="h-5 w-5 text-muted-foreground mr-3" />
                <span className="text-muted-foreground">{email}</span>
            </div>
             <div className="flex items-center">
                <Phone className="h-5 w-5 text-muted-foreground mr-3" />
                <span className="text-muted-foreground">{phoneNumber}</span>
            </div>
            <div className="flex items-center">
                <KeyRound className="h-5 w-5 text-muted-foreground mr-3" />
                <span className="text-muted-foreground capitalize">{role}</span>
            </div>
        </div>
    );
}

export default function GuideProfilePage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.replace('/login?redirect=/guide-profile');
        }
    }, [isUserLoading, user, router]);

    const userProfileRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

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
                        <h1 className="text-lg font-semibold md:text-2xl">My Profile</h1>
                    </div>
                     <Card>
                        <CardHeader>
                            <CardTitle>Your Guide Account Details</CardTitle>
                            <CardDescription>This is the information associated with your account.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ProfileDetails userProfile={userProfile} isLoading={isProfileLoading} />
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}
