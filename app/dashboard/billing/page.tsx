'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/components/user-provider';
import { stripeProducts } from '@/src/stripe-config';
import { toast } from 'sonner';
import { 
  Crown, 
  CreditCard, 
  Calendar, 
  Check, 
  Loader2,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  subscription_status: 'free' | 'pro' | null;
}

interface Subscription {
  subscription_status: string;
  price_id: string | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export default function BillingPage() {
  const { user, signOut } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    checkUser();
  }, [user, router]);

  const checkUser = async () => {
    if (!user) return;
    
    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(profile);

      // Get subscription data
      const { data: subscriptionData } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      setSubscription(subscriptionData);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleCheckout = async (priceId: string, mode: 'payment' | 'subscription') => {
    setCheckoutLoading(true);
    
    try {
      console.log('🚀 Starting checkout process...');
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        throw new Error('Failed to get authentication session');
      }
      
      if (!session) {
        console.error('❌ No session found');
        toast.error('Please sign in to continue');
        router.push('/login');
        return;
      }

      console.log('✅ Session found, making checkout request...');

      const requestBody = {
        price_id: priceId,
        success_url: `${window.location.origin}/dashboard/billing/success`,
        cancel_url: `${window.location.origin}/dashboard/billing`,
        mode,
      };

      console.log('📦 Request body:', requestBody);

      // Use local API route instead of Supabase Edge Function
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          console.error('❌ Error response data:', errorData);
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
          const errorText = await response.text();
          console.error('❌ Raw error response:', errorText);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Checkout response data:', data);

      if (!data.url) {
        throw new Error('No checkout URL received from server');
      }

      console.log('🔗 Redirecting to checkout URL:', data.url);
      
      // Redirect to Stripe checkout
      window.location.href = data.url;
      
    } catch (error: any) {
      console.error('💥 Checkout error:', error);
      
      // Provide more specific error messages
      let userMessage = 'Failed to start checkout process';
      
      if (error.message.includes('Failed to fetch')) {
        userMessage = 'Network error: Please check your internet connection and try again';
      } else if (error.message.includes('HTTP 404')) {
        userMessage = 'Checkout service not available. Please contact support.';
      } else if (error.message.includes('HTTP 401')) {
        userMessage = 'Authentication failed. Please sign out and sign in again.';
      } else if (error.message.includes('HTTP 500')) {
        if (error.message.includes('Customer not found in Stripe')) {
          userMessage = 'Payment system error. Please try again in a moment.';
        } else {
          userMessage = 'Server error. Please try again in a few moments.';
        }
      } else if (error.message.includes('No such customer')) {
        userMessage = 'Payment system error. Please try again.';
      } else if (error.message) {
        userMessage = error.message;
      }
      
      toast.error(userMessage);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getCurrentProduct = () => {
    if (!subscription?.price_id) return null;
    return stripeProducts.find(product => product.priceId === subscription.price_id);
  };

  // Check if required environment variables are present
  const hasRequiredEnvVars = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                             process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
    );
  }

  const currentProduct = getCurrentProduct();
  const isActive = subscription?.subscription_status === 'active';

  return (
    <>
    <div className="sm:mx-60">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold">Billing & Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing information 
        </p>
      </div>
      {/* Environment Check Warning */}
      {!hasRequiredEnvVars && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/10 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Payment configuration missing. Please ensure environment variables are set up correctly.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Current Subscription */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Crown className="h-5 w-5 mr-2" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isActive && currentProduct ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{currentProduct.name}</h3>
                  <p className="text-muted-foreground">{currentProduct.description}</p>
                </div>
                <Badge variant="default">
                  <Crown className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Next billing date</p>
                  <p className="font-medium">
                    {subscription.current_period_end 
                      ? formatDate(subscription.current_period_end)
                      : 'N/A'
                    }
                  </p>
                </div>
                {subscription.payment_method_brand && subscription.payment_method_last4 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Payment method</p>
                    <p className="font-medium capitalize">
                      {subscription.payment_method_brand} •••• {subscription.payment_method_last4}
                    </p>
                  </div>
                )}
              </div>
              {subscription.cancel_at_period_end && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Your subscription will be canceled at the end of the current billing period.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mb-4">
                <Badge variant="secondary">Free Plan</Badge>
              </div>
              <h3 className="text-lg font-semibold mb-2">You&apos;re on the free plan</h3>
              <p className="text-muted-foreground mb-4">
                Upgrade to Pro to unlock unlimited projects and advanced features
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Available Plans */}
      {!isActive && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Available Plans
            </CardTitle>
            <CardDescription>
              Choose the plan that&apos;s right for you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {stripeProducts.map((product) => (
                <div key={product.id} className="border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{product.name}</h3>
                      <p className="text-muted-foreground">{product.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        ${product.price}
                        {product.interval && (
                          <span className="text-sm font-normal text-muted-foreground">
                            /{product.interval}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Unlimited Projects
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Unlimited Tasks
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    All Core Features           
                    </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Advanced Features
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Team Management
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Bookmarks
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-gray-500 mr-2" />
                    Integrations (soon)
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-gray-500 mr-2" />
                    Notes (soon)
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-gray-500 mr-2" />
                    Analytics (soon)
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-gray-500 mr-2" />
                    Lists (soon)
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-gray-500 mr-2" />
                    AI Planner (soon)
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-gray-500 mr-2" />
                    Meetings (soon)
                  </li>
                </ul>
                  <Button 
                    className="w-full" 
                    onClick={() => handleCheckout(product.priceId, product.mode)}
                    disabled={checkoutLoading || !hasRequiredEnvVars}
                  >
                    {checkoutLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Subscribe to {product.name}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Billing History */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Billing History
          </CardTitle>
          <CardDescription>
            View your past invoices and payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No billing history available</p>
            <p className="text-sm">Your invoices will appear here after your first payment</p>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
}