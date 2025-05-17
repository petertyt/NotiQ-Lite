
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { NotiqLogo } from '@/components/icons/notiq-logo';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogIn, LogOut, Loader2, LayoutDashboard, Rocket, UserCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { SidebarTrigger } from '@/components/ui/sidebar'; // Import SidebarTrigger
import { useIsMobile } from '@/hooks/use-mobile'; // To conditionally show trigger

export function AppHeader() {
  const { user, loading: authLoading, loginWithGoogle, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1 && names[0] && names[names.length - 1]) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    if (names.length > 0 && names[0]) {
      return names[0][0].toUpperCase();
    }
    return 'U';
  };

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      toast({
        title: "Login Successful",
        description: "Redirecting to dashboard...",
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "An unexpected error occurred during login.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logout Successful",
        description: "You have been logged out.",
      });
      router.push('/'); 
    } catch (error: any) {
      toast({
        title: "Logout Failed",
        description: error.message || "An unexpected error occurred during logout.",
        variant: "destructive",
      });
    }
  };

  const isDashboardPage = pathname === '/dashboard';

  return (
    <header className="bg-card text-card-foreground p-3 shadow-md sticky top-0 z-50 border-b">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isDashboardPage && isMobile && (
            <SidebarTrigger className="h-8 w-8" />
          )}
          <Link href="/" className="flex items-center gap-2 cursor-pointer" aria-label="Go to NotiQ Lite homepage">
            <NotiqLogo className="h-7 w-auto text-primary" />
            <h1 className="text-xl font-semibold tracking-tight text-primary hidden sm:block">NotiQ Lite</h1>
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          {authLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                  <Avatar className="h-9 w-9 border-2 border-transparent group-hover:border-primary/50 transition-colors">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'} />
                    <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                      {getInitials(user.displayName || user.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.displayName || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard')} className="cursor-pointer">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                {/* Profile and Settings can be accessed via sidebar on dashboard page */}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <Button 
              onClick={() => {
                if (pathname === '/auth/signin') {
                  // Already on signin, button might be for actual sign-in action or redundant
                  // For now, let's assume it tries to login if on this page and clicked
                  handleLogin();
                } else {
                  router.push('/auth/signin'); 
                }
              }}
              variant="ghost" 
              className="text-primary hover:bg-primary/10"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
