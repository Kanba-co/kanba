/* eslint-disable react/no-unescaped-entities */
"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { GitStarButton } from "@/src/components/eldoraui/gitstarbutton";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Status,
  StatusIndicator,
  StatusLabel,
} from "@/src/components/ui/kibo-ui/status";
// import Lenis from "lenis";

import {
  Announcement,
  AnnouncementTag,
  AnnouncementTitle,
} from "@/src/components/ui/kibo-ui/announcement";

import { ArrowUpRightIcon } from "lucide-react";
import { useUser } from "@/components/user-provider";
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
  GithubIcon,
} from "lucide-react";
import { ShineBorder } from "@/src/components/magicui/shine-border";
import TextReveal from "@/src/components/magicui/text-reveal";
import LovedBy from "@/components/customized/avatar/avatar-12";

export default function Home() {
  const { user, loading, signOut } = useUser();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Variable declaration for features and pricing plans to prevent manual repetition
  // This allows for easier updates and management of features and pricing plans
  const [features] = React.useState([
    {
      icon: <Kanban className="h-5 w-5 text-gray-400 dark:text-gray-300 " />,
      title: "Kanban Boards",
      description:
        "Visualize your workflow with customizable Kanban boards. Drag and drop tasks between columns.",
    },
    {
      icon: <Zap className="h-5 w-5 text-gray-400 dark:text-gray-300 " />,
      title: "Lightning Fast",
      description:
        "Built with modern technologies for blazing fast performance and real-time updates.",
    },
    {
      icon: <Users className="h-5 w-5 text-gray-400 dark:text-gray-300 " />,
      title: "Team collaboration",
      description:
        "Invite team members, assign tasks, and collaborate seamlessly in real-time.",
    },
    {
      icon: <Shield className="h-5 w-5 text-gray-400 dark:text-gray-300" />,
      title: "Secure & Reliable",
      description:
        "Your data is protected with enterprise-grade security and backed up automatically.",
    },
    {
      icon: <Crown className="h-5 w-5 text-gray-400 dark:text-gray-300" />,
      title: "Unlimited Projects",
      description:
        "Pro plan includes unlimited projects, advanced features, and priority support.",
    },
    {
      icon: (
        <TabletSmartphone className="h-5 w-5 text-gray-400 dark:text-gray-300" />
      ),
      title: "Responsive Design",
      description:
        "Access your projects from anywhere even on mobile devices, with our fully responsive design.",
    },
  ]);

  const [pricingPlans] = React.useState([
    {
      title: "Free",
      isPro: false,
      description: "Perfect for personal use",
      price: "$0",
      priceNote: "/month",
      features: [
        { text: "1 Project", available: true },
        { text: "Unlimited Tasks", available: true },
        { text: "All Core Features", available: true },
      ],
      button: {
        text: user ? "Go to Dashboard" : "Get Started",
        href: user ? "/dashboard" : "/signup",
        variant: "outline" as "outline",
      },
    },
    {
      title: "Pro",
      isPro: true,
      description: "For teams and power users",
      price: "$4.90",
      priceNote: "/month",
      features: [
        { text: "Unlimited Projects", available: true },
        { text: "Unlimited Tasks", available: true },
        { text: "All Core Features", available: true },
        { text: "Advanced Features", available: true },
        { text: "Team Management", available: true },
        { text: "Bookmarks", available: true },
        { text: "Integrations (soon)", available: false },
        { text: "Notes (soon)", available: false },
        { text: "Analytics (soon)", available: false },
        { text: "Lists (soon)", available: false },
        { text: "AI Planner (soon)", available: false },
        { text: "Meetings (soon)", available: false },
      ],
      button: {
        text: "Upgrade to Pro",
        href: user ? "/dashboard/billing" : "/signup",
        variant: "default" as "default",
      },
    },
    {
      title: "Self-Host",
      isPro: false,
      description: "Run Kanba on your own server",
      price: "Free",
      priceNote: "",
      features: [
        { text: "Full control", available: true },
        { text: "All Features Included", available: true },
        { text: "Full Access to the Source Code", available: true },
        { text: "Complete Customization", available: true },
        { text: "Your Data Stays with You", available: true },
        { text: "White-label Branding", available: true },
      ],
      button: {
        text: (
          <>
            <GithubIcon className="h-4 w-4 mr-1" />
            View on GitHub
          </>
        ),
        href: "https://github.com/Uaghazade1/kanba",
        variant: "outline" as "outline",
        external: true,
      },
    },
  ]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Initialize Lenis for smooth scrolling
  // const lenis = new Lenis({
  //   autoRaf: true,
  // });

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

  // Each section has a unique background color controlled by the theme to provide a consistent/contrast look and feel
  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-[#19191C]" : "bg-[#f3f3f6]"
      }`}
    >
      <Navbar user={user} onSignOut={handleSignOut} loading={loading} />
     
      {/* Hero Section */}
      <section
        className={cn(
          "relative py-20 px-4 sm:px-6 lg:px-8",
          theme === "dark" ? "bg-[#19191C]" : "bg-[#f3f3f6]" // lighter shade for light mode
        )}
      >
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
            <span className="bg-gradient-to-r from-pink-600 via-blue-500 to-yellow-400 text-transparent bg-clip-text block p-2">
              Reimagined for Builders
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          An open-source platform to move fast and build what matters. Simple, powerful, and yes, AI-powered.
          </p>
          <div className="flex sm:flex-row gap-4 justify-center">
            {user ? (
              <Button size="lg" asChild>
                <Link href="/dashboard" className="group flex items-center">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
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
            <span className="text-sm text-muted-foreground mt-2">
              Already loved by{" "}
              <span className="font-semibold text-primary">+400 people</span>
            </span>
          </div>
        </div>
      </section>

      <div
        className={cn(
          "py-10 px-4 sm:px-6 lg:px-8 flex items-center  justify-center ",
        )}
      >
        <div className="border-2 border-border p-2 rounded-xl">
          <Image
            src={theme === "dark" ? "/dark-hero.png" : "/light-hero.png"}
            alt="hero"
            width={1000}
            height={500}
            className="rounded-xl "
          />
        </div>
      </div>

      {/* Features Section */}

      <section
        id="features"
        className={cn(
          "py-20 px-4 sm:px-6 lg:px-8",
          theme === "dark" ? "bg-[#19191C]" : "bg-[#f3f3f6]" // lighter shade for light mode
        )}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl text-primary">Everything You Need to</h2>
            <p className="text-5xl text-gray-500">
              Stay Organized and Productive
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {features.map((feature, idx) => (
              <Card
                key={idx}
                className={cn(
                  "border-[3px] rounded-2xl p-8 flex flex-col justify-between min-h-[270px] min-w-[270px] relative group transition-all duration-300 ease-out hover:shadow-xl              ",
                  theme === "dark"
                    ? "bg-[#151516] border-[#50555F33] "
                    : "bg-white border-[#e4e4e7] "
                )}
                style={{
                  boxShadow:
                    theme === "dark"
                      ? "0 4px 24px 0 rgba(0,0,0,0.25)"
                      : "0 4px 24px 0 rgba(0,0,0,0.08)",
                }}
              >
                <div
                  className={`absolute inset-0 pointer-events-none z-0
                ${
                  theme === "dark"
                    ? "dark:bg-[url('/topography.svg')] opacity-10 dark:opacity-20 mix-blend-overlay"
                    : "bg-[url('/topography-white.svg')] opacity-20 mix-blend-overlay"
                }`}
                />
                <CardHeader className="p-0 mb-4">
                  <div className="flex items-center mb-2 rounded-2xl">
                    <div
                      className={cn(
                        "w-11 h-11 flex items-center justify-center mr-2 transition-colors duration-300 rounded-2xl",
                        theme === "dark"
                          ? "bg-gradient-to-br from-[#23272f] to-[#181818]"
                          : "bg-gradient-to-br from-[#f7f8f9] to-[#e4e4e7]"
                      )}
                    >
                      <span>{feature.icon}</span>
                    </div>
                    <span
                      className={cn(
                        "text-lg font-semibold ml-2",
                        theme === "dark" ? "text-gray-200" : "text-gray-900"
                      )}
                    >
                      {feature.title}
                    </span>
                  </div>
                  <CardDescription
                    className={cn(
                      "text-sm",
                      theme === "dark" ? "text-[#a1a1aa]" : "text-gray-500"
                    )}
                    style={{ fontSize: "1rem" }}
                  >
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <div
                  className={cn(
                    "absolute inset-0 pointer-events-none rounded-xl z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    theme === "dark"
                      ? "bg-gradient-to-br from-primary/10 to-[#23272f]/40"
                      : "bg-gradient-to-br from-primary/10 to-[#e4e4e7]/40"
                  )}
                />
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section
        className={cn(
          "py-20 px-4 sm:px-6 lg:px-8",
          theme === "dark" ? "bg-[#161617]" : "bg-[#ebebf1]" // lighter shade for light mode
        )}
      >
        <TextReveal>
          Kanba is an open-source Trello alternative for makers and teams. Cut
          the noise, focus on what matters. Not trying to replace Trello, just
          doing kanban simple and right.
        </TextReveal>
      </section>

      {/* Pricing Section */}

      <section
        id="pricing"
        className={cn(
          "py-20 px-4 sm:px-6 lg:px-8",
          theme === "dark" ? "bg-[#1b1b1d]" : "bg-[#f3f3f6]" // more lighter shade for light mode
        )}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl text-primary">
              Simple, Transparent Pricing
            </h2>
            <p className="text-5xl text-gray-500">
              Choose the plan that's right for you
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto pt-8">
            {pricingPlans.map((plan, idx) => (
              <Card
                key={plan.title}
                className={`border-[4px] ${
                  plan.isPro
                    ? "border-[#6B7280] scale-[1.07]"
                    : "border-[#50555F33]"
                } rounded-[12px] p-6 flex flex-col justify-between min-h-[270px] min-w-[300px] relative
                bg-[#181818] dark:bg-[#f7f8f9]`}
                style={{
                  background: theme === "dark" ? "#181818" : "#f7f8f9",
                  borderColor: plan.isPro
                    ? theme === "dark"
                      ? "#6B7280"
                      : "#d7d7d7"
                    : theme === "dark"
                    ? "#50555F33"
                    : "#e4e4e7",
                }}
              >
                {plan.isPro && (
                  <div
                    className={`absolute inset-0 pointer-events-none z-0
                ${
                  theme === "dark"
                    ? "dark:bg-[url('/topography.svg')] opacity-10 dark:opacity-20 mix-blend-overlay"
                    : "bg-[url('/topography-white.svg')] opacity-20 mix-blend-overlay"
                }`}
                  />
                )}
                <CardHeader>
                  <div className="flex flex-col gap-0">
                    <CardTitle
                      className={`text-2xl ${
                        theme === "dark" ? "text-gray-200" : "text-gray-900"
                      }`}
                    >
                      {plan.title}
                    </CardTitle>
                    <CardDescription
                      className={
                        theme === "dark" ? "text-[#6f727b]" : "text-gray-500"
                      }
                    >
                      {plan.description}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col mt-8">
                    <span
                      className={`text-xl font-semibold ${
                        theme === "dark" ? "text-gray-200" : "text-gray-900"
                      }`}
                    >
                      {plan.price}
                    </span>
                    {plan.priceNote && (
                      <span className="text-sm font-normal text-muted-foreground">
                        {plan.priceNote}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={feature.text} className="flex items-center">
                        <Check
                          className={`h-4 w-4 mr-2 ${
                            feature.available
                              ? "text-green-500"
                              : theme === "dark"
                              ? "text-gray-500"
                              : "text-gray-400"
                          }`}
                        />
                        <span
                          className={
                            theme === "dark" ? "text-gray-200" : "text-gray-900"
                          }
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <div className="pt-6 mt-auto">
                  {"external" in plan.button ? (
                    <Button
                      className="w-full"
                      variant={plan.button.variant}
                      asChild
                    >
                      <a
                        href={plan.button.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {plan.button.text}
                      </a>
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={plan.button.variant}
                      asChild
                    >
                      <Link href={plan.button.href}>{plan.button.text}</Link>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
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
              "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
            )}
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#f7f8f9] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-[#1d1d1f]"></div>
          <p className="relative z-20 text-center bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text py-8 text-4xl font-bold text-transparent sm:text-7xl">
            Ready to organize your work better?
          </p>
          <div className="mt-6 z-[50] relative">
            <Button size="lg" asChild>
              <Link href="/signup" className="group flex items-center">
                Get Started for Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
              </Link>
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
                  src={theme === "dark" ? "/logo-dark.png" : "/logo-light.png"}
                  width={40}
                  height={40}
                  alt="Kanba Logo"
                />
                <span className="">Kanba</span>
              </div>
              <p className="text-sm text-gray-500 hover:text-primary transition-all duration-200 dark:text-gray-400">
                The modern way to manage your projects with beautiful Kanban
                boards.
              </p>
              <Status status="online" className="inline-flex items-center">
                <StatusIndicator />
                <StatusLabel />
              </Status>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#features"
                    className="text-gray-500 hover:text-primary transition-all duration-200 dark:text-gray-400"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="text-gray-500 hover:text-primary transition-all duration-200 dark:text-gray-400"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://github.com/Uaghazade1/kanba/"
                    target="_blank"
                    className="text-gray-500 hover:text-primary transition-all duration-200 dark:text-gray-400"
                  >
                    Changelog
                  </Link>
                </li>
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
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-500 hover:text-primary transition-all duration-200 dark:text-gray-400"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-500 hover:text-primary transition-all duration-200 dark:text-gray-400"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="mailto:ua@kanba.co"
                    className="text-gray-500 hover:text-primary transition-all duration-200 dark:text-gray-400"
                  >
                    Contact
                  </Link>
                </li>
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
