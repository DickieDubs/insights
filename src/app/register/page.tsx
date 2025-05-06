
'use client';
export const runtime = 'edge';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth'; // Import Firebase auth functions
import { getFirebaseAuth, getGoogleAuthProvider } from '@/lib/firebase/client'; // Use the getter function
import { Separator } from '@/components/ui/separator'; // Import Separator

// Define the form schema using Zod
const registerFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50, { message: "Name cannot exceed 50 characters."}),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Please confirm your password." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // path of error
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

// Google Icon SVG component (can be moved to a shared file if used elsewhere)
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    <path d="M1 1h22v22H1z" fill="none"/>
  </svg>
);


export default function RegisterPage() {
   const router = useRouter();
   const { toast } = useToast();
   const [isLoading, setIsLoading] = React.useState(false);
   const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
   // Get auth instance safely
   const [authInstance, setAuthInstance] = React.useState(() => {
      try {
          return getFirebaseAuth();
      } catch (error) {
          console.error("Failed to get Firebase Auth instance on Register Page:", error);
          return null;
      }
  });


   const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

   // Effect to show toast if auth failed to initialize
    React.useEffect(() => {
        if (!authInstance) {
             toast({
                variant: "destructive",
                title: "Initialization Error",
                description: "Could not connect to authentication service. Please refresh or contact support.",
            });
        }
    }, [authInstance, toast]);


   const handleRegister = async (data: RegisterFormValues) => {
     if (!authInstance) {
         toast({ variant: "destructive", title: "Error", description: "Authentication service not available." });
         return;
    }
    setIsLoading(true);
    console.log("Registration attempt with email:", data.email);

    try {
       // Attempt to create user with Firebase
      const userCredential = await createUserWithEmailAndPassword(authInstance, data.email, data.password);
      const user = userCredential.user;

      // Optionally update the user's profile with their name
      await updateProfile(user, { displayName: data.name });
      console.log("User profile updated with name:", data.name);


        toast({
            title: "Registration Successful",
            description: "Account created. Redirecting to dashboard...",
        });
        // Router push is handled by ProtectedRoute now
        // router.push('/dashboard'); // No longer strictly needed, ProtectedRoute handles it

    } catch (error: any) {
        console.error("Firebase registration error:", error);
         let errorMessage = "An unknown error occurred. Please try again.";
        if (error.code) {
             switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = "An account with this email already exists. Please log in instead.";
                     form.setError("email", { type: "manual", message: errorMessage });
                    break;
                case 'auth/invalid-email':
                    errorMessage = "Please enter a valid email address.";
                     form.setError("email", { type: "manual", message: errorMessage });
                    break;
                case 'auth/weak-password':
                    errorMessage = "Password is too weak. Please choose a stronger password (at least 6 characters).";
                     form.setError("password", { type: "manual", message: errorMessage });
                    break;
                case 'auth/network-request-failed':
                    errorMessage = "Network error. Please check your connection.";
                    break;
                // Add more specific Firebase error codes as needed
                default:
                    errorMessage = `Registration failed: ${error.message}`;
             }
        }

        toast({
            variant: "destructive",
            title: "Registration Failed",
            description: errorMessage,
        });
        setIsLoading(false); // Only set loading to false on error
    }
     // Do not set isLoading to false on success, let the redirect happen
  };

  const handleGoogleSignUp = async () => {
    if (!authInstance) {
      toast({ variant: "destructive", title: "Error", description: "Authentication service not available." });
      return;
    }
    setIsGoogleLoading(true);
    try {
      const provider = getGoogleAuthProvider();
      await signInWithPopup(authInstance, provider); // This works for both sign-in and sign-up
      toast({
        title: "Google Sign-Up Successful",
        description: "Account created. Redirecting to dashboard...",
      });
      // Redirect is handled by ProtectedRoute
    } catch (error: any) {
      console.error("Google Sign-Up error:", error);
      let errorMessage = "An unknown error occurred with Google Sign-Up.";
      if (error.code) {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            errorMessage = "Sign-up popup closed. Please try again.";
            break;
          case 'auth/cancelled-popup-request':
            errorMessage = "Sign-up process cancelled. Please try again.";
            break;
          case 'auth/account-exists-with-different-credential':
            errorMessage = "An account already exists with this email. Please sign in with Google or your original method.";
            break;
          default:
            errorMessage = `Google Sign-Up failed: ${error.message}`;
        }
      }
      toast({
        variant: "destructive",
        title: "Google Sign-Up Failed",
        description: errorMessage,
      });
      setIsGoogleLoading(false);
    }
    // Don't setIsGoogleLoading(false) on success, let redirect handle it
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
           <Image src="/insightpulse-logo.svg" alt="InsightPulse Logo" width={48} height={48} className="mx-auto mb-4" data-ai-hint="pulse logo"/>
          <CardTitle className="text-2xl text-primary">Create an Account</CardTitle>
          <CardDescription>Enter your information to get started.</CardDescription>
        </CardHeader>
        <CardContent>
           <Form {...form}>
            <form onSubmit={form.handleSubmit(handleRegister)} className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel htmlFor="name">Full Name</FormLabel>
                    <FormControl>
                      <Input id="name" placeholder="John Doe" {...field} disabled={isLoading || isGoogleLoading || !authInstance} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <FormControl>
                      <Input id="email" type="email" placeholder="m@example.com" {...field} disabled={isLoading || isGoogleLoading || !authInstance}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <FormControl>
                      <Input id="password" type="password" {...field} disabled={isLoading || isGoogleLoading || !authInstance}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel htmlFor="confirm-password">Confirm Password</FormLabel>
                    <FormControl>
                      <Input id="confirm-password" type="password" {...field} disabled={isLoading || isGoogleLoading || !authInstance}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading || isGoogleLoading || !authInstance}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
              </Button>
            </form>
          </Form>

           <div className="my-4 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-border after:mt-0.5 after:flex-1 after:border-t after:border-border">
              <p className="mx-4 mb-0 text-center text-sm text-muted-foreground">OR</p>
            </div>

            <Button variant="outline" className="w-full" onClick={handleGoogleSignUp} disabled={isLoading || isGoogleLoading || !authInstance}>
                {isGoogleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <GoogleIcon className="mr-2 h-4 w-4" />
                )}
                Sign up with Google
            </Button>


          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className={`underline text-primary hover:text-accent ${isLoading || isGoogleLoading || !authInstance ? 'pointer-events-none opacity-50' : ''}`}>
              Log in
            </Link>
          </div>
           {!authInstance && (
                 <p className="mt-4 text-center text-sm text-destructive">
                    Authentication service is currently unavailable.
                </p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
