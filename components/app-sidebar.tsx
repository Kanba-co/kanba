"use client"

import * as React from "react"
import {
  LayoutDashboardIcon,
  FolderIcon,
  UsersIcon,
  BarChartIcon,
  SettingsIcon,
  HelpCircleIcon,
  CreditCardIcon,
  PlusCircleIcon,
  LogOutIcon,
  UserCircleIcon,
  BellIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  KanbanIcon,
  Sun,
  Moon,
  ChevronDownIcon,
  ChevronUpIcon,
  FolderOpenIcon,
  NotepadTextIcon,
  Cable,
  PlugZap,
  List,
  Brain,
  Calendar,
  Bookmark,
  CrownIcon,
} from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Notifications } from "@/components/notifications"
import { useTheme } from "next-themes"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuSkeleton,
  SidebarTrigger,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Home } from "lucide-react"
import { useUser } from '@/components/user-provider'
import { useEffect, useState } from "react";

interface Project {
  id: string;
  name: string;
  slug: string;
  user_id: string;
}

interface AppSidebarProps {
  onSignOut: () => void;
  onProjectUpdate?: (action: 'rename' | 'delete', projectId?: string) => void;
}

// Menü öğeleri
const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Projects", url: "/dashboard/projects", icon: FolderIcon },
  { title: "Bookmarks", url: "/dashboard/bookmarks", icon: Bookmark },
  { title: "Notes (soon)", url: "/dashboard/notes", icon: NotepadTextIcon, disabled: true },
  { title: "Analytics (soon)", url: "/dashboard/analytics", icon: BarChartIcon, disabled: true },
  { title: "Integrations (soon)", url: "/dashboard/integrations", icon: PlugZap, disabled: true },
  { title: "Lists (soon)", url: "/dashboard/listd", icon: List, disabled: true },
  { title: "AI Planner (soon)", url: "/dashboard/integrations", icon: Brain, disabled: true },
  { title: "Meetings (soon)", url: "/dashboard/integrations", icon: Calendar, disabled: true },
  { title: "Settings", url: "/dashboard/settings", icon: SettingsIcon },
  { title: "Billing", url: "/dashboard/billing", icon: CreditCardIcon },
]

export function AppSidebar({ onSignOut, onProjectUpdate }: AppSidebarProps) {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const [subscription, setSubscription] = useState<'free' | 'pro'>('free');

  useEffect(() => {
    if (user?.id) {
      supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.subscription_status) setSubscription(data.subscription_status);
        });
    }
  }, [user?.id]);

  // Kullanıcı bilgisi
  const userData = {
    name: user?.full_name || user?.email || 'User',
    email: user?.email || '',
    avatar: user?.avatar_url || '',
    subscription,
  };

  // Load projects
  React.useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  // Listen for project updates
  React.useEffect(() => {
    if (onProjectUpdate) {
      // This will be called from parent component when project is updated
      const handleProjectUpdate = (action: 'create' | 'rename' | 'delete', projectId?: string) => {
        if (action === 'delete') {
          // Remove project from list immediately
          setProjects(prev => prev.filter(p => p.id !== projectId));
        } else if (action === 'rename' || action === 'create') {
          // Reload projects to get updated names or new projects
          loadProjects();
        }
      };
      
      // Store the handler for external use
      (window as any).handleProjectUpdate = handleProjectUpdate;
    }
  }, [onProjectUpdate]);

  // Cleanup global handler on unmount
  React.useEffect(() => {
    return () => {
      if ((window as any).handleProjectUpdate) {
        delete (window as any).handleProjectUpdate;
      }
    };
  }, []);

  const loadProjects = async () => {
    if (!user) return;
    
    console.log('Loading projects for user:', user.id);
    setLoadingProjects(true);
    try {
      // Get projects owned by user
      const { data: projects, error } = await supabase
        .from('projects')
        .select('id, name, slug, user_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      console.log('Projects query result:', { projects, error });

      if (error) throw error;
      setProjects(projects || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleQuickCreate = () => {
    router.push('/dashboard/projects/new');
  };

  const handleSignOut = async () => {
    try {
      await onSignOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <Sidebar>
      {/* Üst kısım (Logo veya başlık) */}
      <SidebarHeader>
        <div className="flex items-center gap-x-2">
          <Link href="/" className="flex items-center">
      <Image 
                  src={theme === 'dark' ? '/logo-dark.png' : '/logo-light.png'} 
                  width={40} 
                  height={40} 
                  alt="Kanba Logo" 
                />
                <span className="text-lg">Kanba</span>
                </Link>
                <Badge variant="outline" className="text-xs text-gray-500 border border-gray-200 dark:border-gray-700 dark:text-gray-400 rounded-full">Beta</Badge>

                </div>
      </SidebarHeader>
      {/* Menü */}
      <SidebarContent>
        <SidebarGroup>
          <div className="flex flex-row items-center justify-between py-2 gap-x-2">
            <Button size="xs" variant="secondary" className="flex w-full gap-2 justify-start bg-muted-foreground text-secondary hover:bg-primary/80" onClick={handleQuickCreate}>
              <PlusCircleIcon className="h-4 w-4" />
              <span className="text-xs">New Project</span>
            </Button>
            {user?.id && <Notifications userId={user.id} />}
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                if (item.title === "Bookmarks") {
                  const isPro = userData.subscription === 'pro';
                  return (
                    <SidebarMenuItem key={item.title}>
                      {isPro ? (
                        <SidebarMenuButton
                          asChild
                          isActive={pathname?.startsWith("/dashboard/bookmarks") || false}
                        >
                          <Link href={item.url}>
                            <item.icon className="w-4 h-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      ) : (
                        <SidebarMenuButton
                          onClick={() => router.push('/dashboard/billing')}
                          className="relative opacity-60 cursor-pointer"
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                          <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-400 text-black rounded-full absolute right-2 top-1/2 -translate-y-1/2"><CrownIcon size="12px"/></span>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  );
                }

                if (item.title === "Projects") {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        isActive={pathname?.startsWith("/dashboard/projects") || false}
                        
                      >
                        <FolderIcon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>

                      <SidebarMenuSub>
                        {loadingProjects ? (
                          <>
                            <SidebarMenuSkeleton className="h-6" />
                            <SidebarMenuSkeleton className="h-6" />
                          </>
                        ) : (
                          projects.map((project) => (
                            <SidebarMenuSubItem key={project.id}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === `/dashboard/projects/${project.slug}`}
                              >
                                <Link href={`/dashboard/projects/${project.slug}`} title={project.name}>
                                <FolderOpenIcon className="w-4 h-4" />
                                  <span className="truncate">{project.name}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))
                        )}
                      </SidebarMenuSub>
                    </SidebarMenuItem>
                  );
                }

                if (item.disabled) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        disabled
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }
                 
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.url === '/dashboard' ? pathname === item.url : pathname?.startsWith(item.url) || false}
                    >
                      <Link href={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* Alt kısım (Kullanıcı veya çıkış) */}
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full flex items-center gap-3 px-2 py-6">
              <Avatar className="h-9 w-9">
                {userData.avatar ? (
                  <AvatarImage src={userData.avatar} alt={userData.name} />
                ) : (
                  <AvatarFallback>{userData.name?.[0]?.toUpperCase() || userData.email?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col min-w-0 text-left">
                <span className="font-medium truncate text-sm">{userData.name}</span>
                <span className="text-xs text-muted-foreground truncate">{userData.email}</span>
              </div>
              <ChevronDownIcon className="ml-auto h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar className="h-9 w-9">
                {userData.avatar ? (
                  <AvatarImage src={userData.avatar} alt={userData.name} />
                ) : (
                  <AvatarFallback>{userData.name?.[0]?.toUpperCase() || userData.email?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                )}
                </Avatar>
              <div className="flex flex-col min-w-0 text-left">
                <span className="font-medium truncate text-sm">{userData.name}</span>
                <span className="text-xs text-muted-foreground truncate">{userData.email}</span>
                  </div>
                </div>
              <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
              Toggle Theme
                </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/billing">
                <CreditCardIcon className="h-4 w-4 mr-2" /> Billing
              </Link>
                </DropdownMenuItem>
              <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
              <LogOutIcon className="h-4 w-4 mr-2" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
} 