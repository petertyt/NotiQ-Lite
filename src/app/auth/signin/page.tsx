
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, UserCheck, Lock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

export default function SignInPage() {
  const { user, loginWithGoogle, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user) {
      const redirectUrl = searchParams.get('redirect') || '/dashboard';
      router.push(redirectUrl);
    }
  }, [user, authLoading, router, searchParams]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      // Successful login will trigger the useEffect above to redirect
      toast({
        title: "Login Successful",
        description: "Redirecting...",
      });
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (authLoading || (!authLoading && user)) { // Show loader if authLoading or if user exists (and will be redirected)
    return (
      <div className="flex flex-col items-center justify-center text-center py-10 min-h-[calc(100vh-var(--header-height,100px)-var(--footer-height,50px))]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">
          {authLoading ? 'Checking authentication status...' : 'Redirecting...'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12 min-h-[calc(100vh-var(--header-height,100px)-var(--footer-height,50px))]">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <Lock className="h-10 w-10 text-primary mx-auto mb-3" />
          <CardTitle>Welcome to NotiQ Lite</CardTitle>
          <CardDescription>
            Sign in with your Google account to access your meeting assistant.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleLogin} className="w-full bg-primary hover:bg-primary/90" disabled={authLoading}>
            {authLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <UserCheck className="mr-2 h-5 w-5" /> // Could use a Google icon here
            )}
            {authLoading ? "Signing in..." : "Sign in with Google"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account? Signing in will create one for you.
          </p>
           <p className="text-center text-sm">
            <Link href="/" className="text-accent hover:underline">
              Back to Home
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
