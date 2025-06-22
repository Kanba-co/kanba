'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/navbar';
import { supabase } from '@/lib/supabase';
import { CheckCircle, ArrowRight, Crown } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} onSignOut={handleSignOut} />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>
              Thank you for subscribing to Klik
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 dark:bg-green-950/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <Crown className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-semibold text-green-800 dark:text-green-200">
                  Welcome to Klik!
                </span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your subscription is now active and you have access to all Pro features.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">What's next?</h3>
              <ul className="text-left space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Create unlimited projects
                </li>
                <li className="flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Access advanced Kanban features
                </li>
                <li className="flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Get priority customer support
                </li>
                <li className="flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Enjoy custom integrations
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button asChild className="flex-1">
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link href="/dashboard/billing">
                  View Billing
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t text-xs text-muted-foreground">
              <p>
                You will receive a confirmation email shortly. If you have any questions, 
                please contact our support team.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}