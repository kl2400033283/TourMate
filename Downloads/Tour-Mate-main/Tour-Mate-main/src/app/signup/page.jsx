'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/firebase';
import { initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { RoleSelectionDialog } from '@/components/RoleSelectionDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { countryCodes } from '@/lib/country-codes';

const signupSchema = z.object({
  fullName: z.string().min(3, { message: 'Full name must be at least 3 characters.' }).refine(name => name.trim().includes(' '), { message: 'Please enter your full name (first and last name).' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  countryCode: z.string({required_error: "Please select a country code."}),
  phoneNumber: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});


export default function SignupPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const [isRoleDialogOpen, setRoleDialogOpen] = useState(false);
  const [signupData, setSignupData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        countryCode: '+91',
        phoneNumber: '',
    },
  });

  const onSubmit = (data) => {
    if (auth) {
        setIsSubmitting(true);
        setSignupData(data);
        initiateEmailSignUp(auth, data.email, data.password);
    }
  };

  useEffect(() => {
    if (isSubmitting && user && !isUserLoading) {
        setRoleDialogOpen(true);
        setIsSubmitting(false);
    }
  }, [user, isUserLoading, isSubmitting]);

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
        suppressHydrationWarning
      />
      <div className="absolute inset-0 bg-black/60 -z-10" />
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <Card className="mx-auto max-w-md w-full bg-white/10 backdrop-blur-md text-primary-foreground border-white/20 shadow-2xl">
            <CardHeader className="text-center space-y-4">
                <Link href="/" className="inline-block">
                    <MapPin className="h-12 w-12 mx-auto text-white" />
                </Link>
                <div>
                    <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                    <CardDescription className="text-white/80">
                        Enter your information to get started
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                    <FormItem>
                        <Label htmlFor="full-name" className="text-white/90">Full name</Label>
                        <FormControl>
                            <Input id="full-name" type="text" placeholder="Max Robinson" {...field} className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:ring-offset-primary"/>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
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
                
                <div>
                    <Label className="text-white/90">Phone Number</Label>
                    <div className="flex items-start gap-2 mt-2">
                        <FormField
                            control={form.control}
                            name="countryCode"
                            render={({ field }) => (
                                <FormItem className="w-[130px]">
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:ring-offset-primary">
                                                <SelectValue placeholder="Code" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {countryCodes.map(code => (
                                                <SelectItem key={code.value} value={code.value}>{code.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Input type="tel" placeholder="Your phone number" {...field} className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:ring-offset-primary" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                 <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                    <FormItem>
                        <Label htmlFor="password" className="text-white/90">Password</Label>
                        <FormControl>
                           <div className="relative">
                                <Input 
                                    id="password" 
                                    type={showPassword ? "text" : "password"} 
                                    {...field} 
                                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:ring-offset-primary pr-10" 
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/70 hover:text-white"
                                    onClick={() => setShowPassword(prev => !prev)}
                                >
                                    {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                    <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                                </button>
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                    <FormItem>
                        <Label htmlFor="confirm-password" className="text-white/90">Confirm Password</Label>
                        <FormControl>
                            <div className="relative">
                                <Input 
                                    id="confirm-password" 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    {...field} 
                                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:ring-offset-primary pr-10" 
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/70 hover:text-white"
                                    onClick={() => setShowConfirmPassword(prev => !prev)}
                                >
                                    {showConfirmPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                    <span className="sr-only">{showConfirmPassword ? 'Hide password' : 'Show password'}</span>
                                </button>
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting} suppressHydrationWarning>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Creating Account..." : "Create an account"}
                </Button>
                <Button variant="outline" className="w-full bg-transparent hover:bg-white/20 text-white border-white/50 hover:border-white" suppressHydrationWarning>
                Sign up with Google
                </Button>
            </form>
            </Form>
            </CardContent>
            <CardFooter className="justify-center">
              <div className="text-center text-sm text-white/80">
                Already have an account?{' '}
                <Link href="/login" className="underline text-white hover:font-bold">
                  Login
                </Link>
              </div>
            </CardFooter>
        </Card>
      </div>
      <RoleSelectionDialog 
        open={isRoleDialogOpen} 
        onOpenChange={setRoleDialogOpen}
        signupData={signupData}
      />
    </div>
  );
}
