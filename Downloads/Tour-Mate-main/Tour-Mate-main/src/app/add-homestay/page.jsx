
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getAuth, signOut } from 'firebase/auth';
import { Loader2, Home, List, LogOut, Menu, PlusCircle, User, LayoutGrid, DollarSign, Bell, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { useEffect, useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { citiesByState } from '@/lib/tourist-cities';

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
                </Link>
            ))}
        </nav>
    );
}

const addHomestaySchema = z.object({
  name: z.string().min(5, { message: 'Name must be at least 5 characters.' }),
  description: z.string().min(20, { message: 'Description must be at least 20 characters.' }),
  cityId: z.string({ required_error: 'Please select a city.' }).min(1, 'Please select a city.'),
  address: z.string().min(10, { message: 'Please provide a complete address.' }),
  pricePerNight: z.coerce.number().min(100, { message: 'Price must be at least ₹100.' }),
  numberOfBedrooms: z.coerce.number().int().min(1, { message: 'Must have at least one bedroom.' }),
  maxGuests: z.coerce.number().int().min(1, { message: 'Must accommodate at least one guest.' }),
  amenities: z.string().min(3, { message: 'Please list at least one amenity (e.g., Wi-Fi, AC).' }),
  contactEmail: z.string().email({ message: 'Please enter a valid email address.' }),
  contactPhone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  isAvailable: z.boolean().default(true),
});


export default function AddHomestayPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const userProfileRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

    const form = useForm({
        resolver: zodResolver(addHomestaySchema),
        defaultValues: {
            name: '',
            description: '',
            cityId: '',
            address: '',
            pricePerNight: 1500,
            numberOfBedrooms: 1,
            maxGuests: 2,
            amenities: 'Wi-Fi, Air Conditioning, Free Parking',
            contactEmail: '',
            contactPhone: '',
            isAvailable: true,
        },
    });

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.replace('/login?redirect=/add-homestay');
        }
    }, [isUserLoading, user, router]);

    useEffect(() => {
        if (userProfile) {
            form.reset({
                ...form.getValues(),
                contactEmail: userProfile.email || '',
                contactPhone: userProfile.phoneNumber || '',
            });
        }
    }, [userProfile, form]);
    
    const allCities = useMemo(() => Object.values(citiesByState).flat(), []);

    const handleSignOut = () => {
        const auth = getAuth();
        signOut(auth).then(() => {
            window.location.href = '/';
        });
    };

    const onSubmit = (data) => {
        if (!user || !firestore) return;
        setIsSubmitting(true);
        
        const cityName = allCities.find(c => c.slug === data.cityId)?.name || data.cityId;

        const homestayData = {
            ...data,
            city: cityName,
            hostId: user.uid,
            amenities: data.amenities.split(',').map(s => s.trim()).filter(Boolean),
            status: 'pending_approval',
            createdAt: serverTimestamp(),
        };

        const colRef = collection(firestore, 'homestays');
        addDocumentNonBlocking(colRef, homestayData)
            .then((docRef) => {
                 if (docRef?.id) {
                    toast({
                        title: 'Listing Submitted!',
                        description: 'Your new homestay is pending approval from the admin.',
                        variant: 'success'
                    });
                    router.push('/my-listings');
                }
            })
            .catch(() => {
                setIsSubmitting(false);
            });
    };

    if (isUserLoading || isProfileLoading || !user) {
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
                            <Home className="h-6 w-6 text-primary" />
                            <span className="text-xl font-bold"><span className="text-primary">Tour</span>Mate Host</span>
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
                            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col p-0">
                             <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                                <Link href="/" className="flex items-center gap-2 font-semibold">
                                     <Home className="h-6 w-6 text-primary" />
                                     <span className="text-xl font-bold"><span className="text-primary">Tour</span>Mate Host</span>
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
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    <div className="flex items-center">
                        <div>
                            <h1 className="text-lg font-semibold md:text-2xl">Add a New Homestay</h1>
                             <p className="text-sm text-muted-foreground">
                                Fill out the form below to list your property on TourMate.
                            </p>
                        </div>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Property Details</CardTitle>
                            <CardDescription>Provide details about your homestay. All new listings require admin approval.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <FormField control={form.control} name="name" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Homestay Name</FormLabel>
                                                <FormControl><Input placeholder="e.g., Serene Mountain Villa" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="cityId" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>City</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder="Select a city" /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {allCities.map(city => (
                                                            <SelectItem key={city.slug} value={city.slug}>{city.name}, {city.stateName}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                    <FormField control={form.control} name="description" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl><Textarea placeholder="Describe what makes your place special..." {...field} rows={4} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="address" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Street Address</FormLabel>
                                            <FormControl><Input placeholder="123 Main St, Appartment #4, City, State, Pin Code" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <FormField control={form.control} name="pricePerNight" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Price per Night (₹)</FormLabel>
                                                <FormControl><Input type="number" placeholder="2500" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="numberOfBedrooms" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Number of Bedrooms</FormLabel>
                                                <FormControl><Input type="number" placeholder="2" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="maxGuests" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Maximum Guests</FormLabel>
                                                <FormControl><Input type="number" placeholder="4" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                    <FormField control={form.control} name="amenities" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amenities</FormLabel>
                                            <FormControl><Input placeholder="Wi-Fi, Air Conditioning, TV, Kitchen Access" {...field} /></FormControl>
                                            <FormDescription>Enter a comma-separated list of amenities.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                       <FormField control={form.control} name="contactEmail" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Contact Email</FormLabel>
                                                <FormControl><Input type="email" placeholder="contact@yourhomestay.com" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="contactPhone" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Contact Phone</FormLabel>
                                                <FormControl><Input type="tel" placeholder="+91 1234567890" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                    <FormField control={form.control} name="isAvailable" render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel>Available for Bookings</FormLabel>
                                                <FormDescription>
                                                    Turn this off to temporarily delist your property.
                                                </FormDescription>
                                            </div>
                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        </FormItem>
                                    )} />
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}
