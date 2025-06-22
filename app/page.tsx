'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/navbar';
import { useUser } from '@/components/user-provider';
import { 
  Kanban, 
  Zap, 
  Users, 
  Shield, 
  ArrowRight,
  Check,
  Star
} from 'lucide-react';

export default function Home() {
  const { user, loading, signOut } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Navbar user={user} onSignOut={handleSignOut} loading={loading} />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            <Star className="h-3 w-3 mr-1" />
            New: Dark mode by default
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
            Organize Your Projects with
            <span className="text-primary block">Beautiful Kanban Boards</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            KanbanPro is a modern project management tool that helps teams visualize work, 
            limit work-in-progress, and maximize efficiency with elegant Kanban boards.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/signup">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to manage projects</h2>
            <p className="text-xl text-muted-foreground">
              Powerful features to help you stay organized and productive.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden">
              <CardHeader>
                <Kanban className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Kanban Boards</CardTitle>
                <CardDescription>
                  Visualize your workflow with customizable Kanban boards. Drag and drop tasks between columns.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="relative overflow-hidden">
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Built with modern technologies for blazing fast performance and real-time updates.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="relative overflow-hidden">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Team Collaboration</CardTitle>
                <CardDescription>
                  Invite team members, assign tasks, and collaborate seamlessly in real-time.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="relative overflow-hidden">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Secure & Reliable</CardTitle>
                <CardDescription>
                  Your data is protected with enterprise-grade security and backed up automatically.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <span className="text-primary-foreground font-bold">∞</span>
                </div>
                <CardTitle>Unlimited Projects</CardTitle>
                <CardDescription>
                  Pro plan includes unlimited projects, advanced features, and priority support.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <span className="text-primary-foreground font-bold">📱</span>
                </div>
                <CardTitle>Mobile Responsive</CardTitle>
                <CardDescription>
                  Access your projects from anywhere with our fully responsive design.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-muted-foreground">
              Choose the plan that&apos;s right for you.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>Perfect for trying out KanbanPro</CardDescription>
                <div className="text-3xl font-bold">$0<span className="text-sm font-normal text-muted-foreground">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    1 Project
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Unlimited Tasks
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Basic Features
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Community Support
                  </li>
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <Link href={user ? "/dashboard" : "/signup"}>
                    {user ? "Go to Dashboard" : "Get Started"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="relative border-primary">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Pro</CardTitle>
                <CardDescription>For teams and power users</CardDescription>
                <div className="text-3xl font-bold">$9<span className="text-sm font-normal text-muted-foreground">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Unlimited Projects
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Advanced Features
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Priority Support
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Custom Integrations
                  </li>
                </ul>
                <Button className="w-full" asChild>
                  <Link href={user ? "/dashboard/billing" : "/signup"}>
                    {user ? "Upgrade to Pro" : "Upgrade to Pro"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Kanban className="h-6 w-6 text-primary" />
                <span className="font-bold">KanbanPro</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The modern way to manage your projects with beautiful Kanban boards.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features" className="text-muted-foreground hover:text-primary">Features</Link></li>
                <li><Link href="/pricing" className="text-muted-foreground hover:text-primary">Pricing</Link></li>
                <li><Link href="/changelog" className="text-muted-foreground hover:text-primary">Changelog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-muted-foreground hover:text-primary">About</Link></li>
                <li><Link href="/blog" className="text-muted-foreground hover:text-primary">Blog</Link></li>
                <li><Link href="/careers" className="text-muted-foreground hover:text-primary">Careers</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 KanbanPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}