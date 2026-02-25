'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { MapPin } from 'lucide-react';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { initiateEmailSignIn } from '@/firebase/non-blocking-login.jsx';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card.jsx';
import { PlaceHolderImages } from '@/lib/placeholder-images.js';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export function LoginContent() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!isUserLoading && user && !isProfileLoading) {
      if (userProfile) {
        const { role } = userProfile;
        let targetDashboard = '/profile';
        if (redirect) {
          targetDashboard = redirect;
        } else {
            switch (role) {
              case 'home stay host':
                targetDashboard = '/host-dashboard';
                break;
              case 'tour guide':
                targetDashboard = '/tour-guide-dashboard';
                break;
              case 'admin':
                targetDashboard = '/admin-dashboard';
                break;
              case 'Tourist':
              default:
                targetDashboard = '/profile';
                break;
            }
        }
        router.push(targetDashboard);
      } else if (redirect) {
        // If there's no profile yet, but a redirect is present, go there.
        // This can happen during the signup flow.
        router.push(redirect);
      }
    }
  }, [user, isUserLoading, userProfile, isProfileLoading, router, redirect]);


  const onSubmit = (data) => {
    if (auth) {
      initiateEmailSignIn(auth, data.email, data.password);
    }
  };

  const backgroundImage = PlaceHolderImages.find(p => p.id === 'background-image');
  const imageUrl = backgroundImage?.imageUrl || 'https://picsum.photos/seed/bg/1920/1080';
  const imageHint = backgroundImage?.imageHint || 'India travel';
  const imageAlt = backgroundImage?.description || "A collage of famous landmarks in India.";

  return (
    <div className="relative min-h-screen w-full">
       <Image
        src={imageUrl}
        alt={imageAlt}
        fill
        className="absolute top-0 left-0 w-full h-full object-cover -z-10"
        data-ai-hint={imageHint}
        priority
      />
      <div className="absolute inset-0 bg-black/60 -z-10" />

      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <Card className="mx-auto max-w-sm w-full bg-white/10 backdrop-blur-md text-primary-foreground border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <Link href="/" className="inline-block">
                <MapPin className="h-12 w-12 mx-auto text-white" />
            </Link>
            <div>
              <CardTitle className="text-2xl font-bold">Login to TourMate</CardTitle>
              <CardDescription className="text-white/80">
                Enter your credentials to access your account
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="email" className="text-white/90">Email</Label>
                      <FormControl>
                        <Input id="email" type="email" placeholder="m@example.com" {...field} className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:ring-offset-primary" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                       <div className="flex items-center">
                          <Label htmlFor="password" className="text-white/90">Password</Label>
                          <Link href="#" className="ml-auto inline-block text-sm underline text-white/80 hover:text-white">
                              Forgot your password?
                          </Link>
                      </div>
                      <FormControl>
                        <Input id="password" type="password" {...field} className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:ring-offset-primary" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Login
                </Button>
                <Button variant="outline" className="w-full bg-transparent hover:bg-white/20 text-white border-white/50 hover:border-white">
                  Login with Google
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="justify-center">
            <div className="text-center text-sm text-white/80">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="underline text-white hover:font-bold">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
