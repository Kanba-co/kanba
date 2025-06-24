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
  SidebarTrigger,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Home } from "lucide-react"

interface Project {
  id: string;
  name: string;
  user_id: string;
}

interface AppSidebarProps {
  user: any;
  onSignOut: () => void;
}

// Menü öğeleri
const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Projeler", url: "/dashboard/projects", icon: FolderIcon },
  { title: "Takım", url: "/dashboard/team", icon: UsersIcon },
  { title: "Analitik", url: "/dashboard/analytics", icon: BarChartIcon },
  { title: "Ayarlar", url: "/dashboard/settings", icon: SettingsIcon },
]

export function AppSidebar({ user, onSignOut }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = React.useState(true);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = React.useState(false);
  const { theme, setTheme } = useTheme();

  // Load projects
  React.useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;
    
    console.log('Loading projects for user:', user.id);
    setLoadingProjects(true);
    try {
      // Get projects owned by user
      const { data: projects, error } = await supabase
        .from('projects')
        .select('id, name, user_id')
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

  const userData = {
    name: user?.full_name || user?.email || 'User',
    email: user?.email || '',
    avatar: user?.avatar_url || '',
  };

  return (
    <Sidebar>
      {/* Üst kısım (Logo veya başlık) */}
      <SidebarHeader>
        <div className="font-bold text-lg">Kanba</div>
      </SidebarHeader>
      {/* Menü */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menü</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4 mr-2" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* Alt kısım (Kullanıcı veya çıkış) */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button className="flex items-center w-full text-left">
                <LogOutIcon className="w-4 h-4 mr-2" />
                <span>Çıkış Yap</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
} 