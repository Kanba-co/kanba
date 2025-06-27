/* eslint-disable react/no-unescaped-entities */
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/navbar';
import { GitStarButton } from '@/src/components/eldoraui/gitstarbutton';
import { useTheme } from 'next-themes';

import Image from 'next/image';
import { useUser } from '@/components/user-provider';
import { 
  Kanban, 
  Zap, 
  Users, 
  Shield, 
  ArrowRight,
  Check,
  Star,
  Crown,
  TabletSmartphone
} from 'lucide-react';
import { ShineBorder } from '@/src/components/magicui/shine-border';
import { TextReveal } from '@/src/components/magicui/text-reveal';

export default function Home() {
  const { user, loading, signOut } = useUser();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

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
          <div className="flex items-center justify-center mb-4">
        <GitStarButton />
        </div>
          <h1 className="text-4xl sm:text-6xl tracking-tight mb-6">
          Project Management
            <span className="bg-gradient-to-r from-pink-600 via-blue-500 to-yellow-400 text-transparent bg-clip-text block p-2">Reimagined for Builders.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          The project management tool indie hackers deserve. Simple, powerful, and proudly open-source.
          </p>
          <div className="flex sm:flex-row gap-4 justify-center">
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
                
              </>
            )}
          </div>
        </div>
      </section>

      <div className="py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="">

           <Image src={theme === 'dark' ? '/dark-hero.png' : '/light-hero.png'} alt="hero" width={1000} height={500} 
           className='rounded-xl border-2 border-secondary p-2'
           />
           </div>
      </div>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl text-primary">Everything You Need to</h2>
            <p className="text-5xl text-gray-500">
            Stay Organized and Productive
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="relative overflow-hidden">
            <ShineBorder shineColor={theme === "dark" ? "white" : "black"}  />

              <CardHeader>
                <div className="flex items-center justify-start mb-2">
                <Kanban className="h-6 w-6 text-primary mr-2" />
                <span className="text-primary text-sm font-semibold">Kanban Boards</span>
                </div>
                <span className="text-xs text-primary">
                  Visualize your workflow with customizable Kanban boards. Drag and drop tasks between columns.
                </span>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden">
            <ShineBorder shineColor={theme === "dark" ? "white" : "black"}  />

              <CardHeader>
                <div className="flex items-center justify-start mb-2">
                <Zap className="h-6 w-6 text-primary mr-2" />
                <span className="text-primary text-sm font-semibold">Lightning Fast</span>
                </div>
                <span className="text-xs text-primary">
                Built with modern technologies for blazing fast performance and real-time updates.
                </span>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden">
            <ShineBorder shineColor={theme === "dark" ? "white" : "black"}  />

              <CardHeader>
                <div className="flex items-center justify-start mb-2">
                <Users className="h-6 w-6 text-primary mr-2" />
                <span className="text-primary text-sm font-semibold">Team Collaboration</span>
                </div>
                <span className="text-xs text-primary">
                Invite team members, assign tasks, and collaborate seamlessly in real-time.
                </span>
              </CardHeader>
            </Card>
            
            
            <Card className="relative overflow-hidden">
            <ShineBorder shineColor={theme === "dark" ? "white" : "black"}  />

              <CardHeader>
                <div className="flex items-center justify-start mb-2">
                <Shield className="h-6 w-6 text-primary mr-2" />
                <span className="text-primary text-sm font-semibold">Secure & Reliable</span>
                </div>
                <span className="text-xs text-primary">
                Your data is protected with enterprise-grade security and backed up automatically.
                </span>
              </CardHeader>
            </Card>
            
            
            <Card className="relative overflow-hidden">
            <ShineBorder shineColor={theme === "dark" ? "white" : "black"}  />

              <CardHeader>
                <div className="flex items-center justify-start mb-2">
                <Crown className="h-6 w-6 text-primary mr-2" />
                <span className="text-primary text-sm font-semibold">Unlimited Projects</span>
                </div>
                <span className="text-xs text-primary">
                Pro plan includes unlimited projects, advanced features, and priority support.
                </span>
              </CardHeader>
            </Card>
            
            <Card className="relative overflow-hidden">
            <ShineBorder shineColor={theme === "dark" ? "white" : "black"}  />

              <CardHeader>
                <div className="flex items-center justify-start mb-2">
                <TabletSmartphone className="h-6 w-6 text-primary mr-2" />
                <span className="text-primary text-sm font-semibold">Mobile Responsive</span>
                </div>
                <span className="text-xs text-primary">
                Access your projects from anywhere with our fully responsive design.
                </span>
              </CardHeader>
            </Card>
         
           
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
       <TextReveal>
       Kanba is an open-source Trello alternative for makers and teams. Cut the noise, focus on what matters. Not trying to replace Trello, just doing kanban simple and right.
         </TextReveal>
      </section>


      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
            <h2 className="text-5xl text-primary">Simple, transparent pricing</h2>
            <p className="text-5xl text-gray-500">
            Choose the plan that's right for you
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>Perfect for trying out Kanba</CardDescription>
                <div className="text-xl font-semibold">$0<span className="text-sm font-normal text-muted-foreground">/month</span></div>
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
                <div className="text-xl font-semibold">$9<span className="text-sm font-normal text-muted-foreground">/month</span></div>
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
                <span className="font-bold">Kanba</span>
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
            <p>&copy; 2024 Kanba. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}