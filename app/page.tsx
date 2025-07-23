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
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Status, StatusIndicator, StatusLabel } from '@/src/components/ui/kibo-ui/status';

import {
  Announcement,
  AnnouncementTag,
  AnnouncementTitle,
} from '@/src/components/ui/kibo-ui/announcement';

import { ArrowUpRightIcon } from 'lucide-react';
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
  TabletSmartphone,
  GithubIcon
} from 'lucide-react';
import { ShineBorder } from '@/src/components/magicui/shine-border';
import  TextReveal  from '@/src/components/magicui/text-reveal';
import LovedBy from '@/components/customized/avatar/avatar-12';

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
      <div className="absolute top-4 right-4">
        <Image 
          src={theme === 'light' ? '/bolt-light.png' : '/bolt-dark.png'} 
          width={60} 
          height={60} 
          alt="Kanba Logo" 
        />
      </div>
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">

        <div className="max-w-7xl mx-auto text-center">
         
          <div className="flex items-center justify-center mb-4">
        <div className="flex justify-center items-center">
  <br />
<br />
<a href="https://vercel.com/oss">
  <img alt="Vercel OSS Program" src="https://vercel.com/oss/program-badge.svg" />
</a>
    <br />
<br />
</div>
        </div>
          <h1 className="text-4xl sm:text-6xl tracking-tight mb-6">
          Project Management
            <span className="bg-gradient-to-r from-pink-600 via-blue-500 to-yellow-400 text-transparent bg-clip-text block p-2">Reimagined for Builders.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          A calm space to move fast and build what matters. Simple, powerful, and proudly open-source.
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
          <div className="flex flex-col items-center justify-center mt-10 gap-2">
            <LovedBy />
            <span className="text-sm text-muted-foreground mt-2">Already loved by <span className="font-semibold text-primary">+150 people</span></span>
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
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
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
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
            <h2 className="text-5xl text-primary">Simple, Transparent Pricing</h2>
            <p className="text-5xl text-gray-500">
            Choose the plan that's right for you
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="relative flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>Perfect for personal use</CardDescription>
                <div className="text-xl font-semibold">$0<span className="text-sm font-normal text-muted-foreground">/month</span></div>
              </CardHeader>
              <CardContent className="flex-grow">
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
                    All Core Features
                  </li>
                  
                </ul>
              </CardContent>
              <div className="p-6 pt-0 mt-auto">
                <Button className="w-full" variant="outline" asChild>
                  <Link href={user ? "/dashboard" : "/signup"}>
                    {user ? "Go to Dashboard" : "Get Started"}
                  </Link>
                </Button>
              </div>
            </Card>
            
            <Card className="relative border-primary border-2 flex flex-col ">
            <div className="absolute inset-0 dark:bg-[url('/topography.svg')] bg-[url('/topography-white.svg')]  opacity-10 dark:opacity-50 mix-blend-overlay pointer-events-none z-0" />

              <CardHeader>
                <CardTitle className="text-2xl">Pro</CardTitle>
                <CardDescription>For teams and power users</CardDescription>
                <div className="text-xl font-semibold">$4.90<span className="text-sm font-normal text-muted-foreground">/month</span></div>
              </CardHeader>
              <CardContent className="flex-grow">
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
              </CardContent>
              <div className="p-6 pt-0 mt-auto">
                <Button className="w-full" asChild>
                  <Link href={user ? "/dashboard/billing" : "/signup"}>
                    {user ? "Upgrade to Pro" : "Upgrade to Pro"}
                  </Link>
                </Button>
              </div>
            </Card>
            <Card className="relative flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl">Self-Host</CardTitle>
                <CardDescription>Run Kanba on your own server</CardDescription>
                <div className="text-xl font-semibold">Free</div>

              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Full control
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    All Features Included
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Full Access to the Source Code
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Complete Customization
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Your Data Stays with You
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    White-label Branding
                  </li>
                  
                </ul>
              </CardContent>
              <div className="p-6 pt-0 mt-auto">
                <Button className="w-full" variant="outline" asChild>
                  <a
                    href="https://github.com/Uaghazade1/kanba"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GithubIcon className="h-5 w-5" />
                    View on GitHub
                  </a>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="">
      <div className="relative flex h-[30rem] w-full flex-col items-center justify-center bg-[#f7f8f9] dark:bg-[#1d1d1f]">
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:20px_20px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
        )}
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#f7f8f9] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-[#1d1d1f]"></div>
      <p className="relative z-20 text-center bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text py-8 text-4xl font-bold text-transparent sm:text-7xl">
      Ready to organize your work better?
      </p>
      <div className="mt-6 z-[50] relative">
  <Button size="lg" className="px-6 py-3 text-base" asChild>
    <Link href="/signup">Get Started</Link>
  </Button>
</div>

    </div>
      </section>


      {/* Footer */}
      <footer className="border-t py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
              <Image 
                  src={theme === 'dark' ? '/logo-dark.png' : '/logo-light.png'} 
                  width={40} 
                  height={40} 
                  alt="Kanba Logo" 
                />
                <span className="">Kanba</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The modern way to manage your projects with beautiful Kanban boards.

              </p>
              <Status status="online" className="inline-flex items-center">
                <StatusIndicator />
                <StatusLabel />
              </Status>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="text-muted-foreground hover:text-primary">Features</Link></li>
                <li><Link href="#pricing" className="text-muted-foreground hover:text-primary">Pricing</Link></li>
                <li><Link href="https://github.com/Uaghazade1/kanba/" target="_blank" className="text-muted-foreground hover:text-primary">Changelog</Link></li>
              </ul>
            </div>
            
            {/* <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-muted-foreground hover:text-primary">About</Link></li>
                <li><Link href="/blog" className="text-muted-foreground hover:text-primary">Blog</Link></li>
                <li><Link href="/careers" className="text-muted-foreground hover:text-primary">Careers</Link></li>
              </ul>
            </div> */}
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
                <li><Link href="mailto:ua@kanba.co" className="text-muted-foreground hover:text-primary">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Kanba. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
