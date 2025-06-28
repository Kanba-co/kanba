'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Notifications } from '@/components/notifications';
import { 
  Kanban, 
  Moon, 
  Sun, 
  User, 
  Settings, 
  LogOut,
  CreditCard,
  KanbanIcon
} from 'lucide-react';
import { Badge } from './ui/badge';

interface NavbarProps {
  user?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  } | null;
  onSignOut?: () => void;
  loading?: boolean;
}

export function Navbar({ user, onSignOut, loading = false }: NavbarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="sticky top-4 z-50 px-4">
      <nav className="max-w-3xl mx-auto rounded-2xl border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex justify-between items-center h-14 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-x-6">
            <Link href="/" className="flex items-center space-x-2">
              <div className=" flex items-center gap-x-2">
                <Image 
                  src={theme === 'light' ? '/logo-light.png' : '/logo-dark.png'} 
                  width={40} 
                  height={40} 
                  alt="Kanba Logo" 
                />
                <Badge variant="outline" className="text-xs text-gray-500 border border-gray-200 dark:border-gray-700 dark:text-gray-400 rounded-full">Beta</Badge>
              </div>
            </Link>
            <div className="hidden md:flex items-center  space-x-6">
              <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="#pricing" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {loading ? (
              <div className="animate-pulse bg-muted rounded-full h-8 w-8"></div>
            ) : user ? (
              <>
                {/* Notifications */}
                <Notifications userId={user.id} />
                
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || ''} alt={user.full_name || ''} />
                        <AvatarFallback>
                          {user.full_name ? user.full_name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {user.full_name && <p className="font-medium">{user.full_name}</p>}
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <Settings className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/billing">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Billing
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                
                <Button asChild size="xs">
                  <Link href="/signup">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}