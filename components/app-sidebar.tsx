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

interface Project {
  id: string;
  name: string;
  user_id: string;
}

interface AppSidebarProps {
  user: any;
  onSignOut: () => void;
}

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

  const navItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
  ];

  const secondaryItems = [
    {
      title: "Billing",
      url: "/dashboard/billing",
      icon: CreditCardIcon,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: SettingsIcon,
    },
    {
      title: "Help",
      url: "/dashboard/help",
      icon: HelpCircleIcon,
    },
  ];

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
    <div className={`bg-[#fafafa] dark:bg-[#171717]  border-border h-screen flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-60'
    }`}>
      {/* Logo Header */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center space-x-1">
            
            <div className=" p-1 border rounded-lg  mr-1">
              <KanbanIcon className="h-5 w-5 text-[#0A0A0A] dark:text-white" />
            </div>
            {!isCollapsed && <span className="text-lg">Kanba</span>}
          </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-6 w-6 p-0"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-4 w-4" />
            ) : (
              <ChevronLeftIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* New Project Button and Notifications */}
      <div className="p-4">
        {isCollapsed ? (
          <div className="flex flex-col space-y-2 items-center">
            <Button 
              onClick={handleQuickCreate}
              className="flex-1 bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] hover:bg-[#0A0A0A]/90 dark:hover:bg-white/90 justify-start px-2"
             
            >
              <PlusCircleIcon className="h-4 w-4" />
            </Button>
            <Notifications userId={user?.id} />
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Button 
              onClick={handleQuickCreate}
              size="icon"
              className="flex-1 bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] hover:bg-[#0A0A0A]/90 dark:hover:bg-white/90 justify-start px-2"
            >
              <PlusCircleIcon className="h-4 w-4" />
              New Project
            </Button>
            <Notifications userId={user?.id} />
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-4">
        <nav className="space-y-2">
         
          {navItems.map((item) => (
            <Button
              key={item.title}
              variant={pathname === item.url ? "secondary" : "ghost"}
              className={`w-full justify-start px-2 ${isCollapsed ? 'justify-center' : ''}`}
              onClick={() => router.push(item.url)}
              size="icon"
              title={isCollapsed ? item.title : undefined}
            >
              <item.icon className={`h-4 w-4 ${isCollapsed ? '' : ''}`} />
              {!isCollapsed && item.title}
            </Button>
          ))}

          {/* Projects Menu with Submenu */}
          <div className="space-y-1">
            <Button
              variant={pathname.startsWith('/dashboard/projects') ? "secondary" : "ghost"}
              className={`w-full justify-between px-2 ${isCollapsed ? 'justify-center' : ''}`}
              onClick={() => !isCollapsed && setIsProjectsOpen(!isProjectsOpen)}
              size="icon"
              title={isCollapsed ? "Projects" : undefined}
            >
              <div className="flex items-center">
                <FolderIcon className="h-4 w-4" />
                {!isCollapsed && <span className="ml-3">Projects</span>}
              </div>
              {!isCollapsed && (
                <div className="flex items-center">
                  <Badge variant="secondary" className="h-5 w-5 p-1 text-sm items-center justify-center mr-2">
                    {loadingProjects ? '...' : projects.length}
                  </Badge>
                  {isProjectsOpen ? (
                    <ChevronUpIcon className="h-4 w-4" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4" />
                  )}
                </div>
              )}
            </Button>

            {/* Projects Submenu */}
            {!isCollapsed && isProjectsOpen && (
              <div className="ml-4 space-y-1">
                {loadingProjects ? (
                  <div className="px-2 py-1 text-sm text-muted-foreground">Loading...</div>
                ) : projects.length === 0 ? (
                  <div className="px-2 py-1 text-sm text-muted-foreground">
                    No projects yet. Create your first project!
                  </div>
                ) : (
                  projects.map((project) => (
                    <Button
                      key={project.id}
                      variant={pathname === `/dashboard/projects/${project.id}` ? "secondary" : "ghost"}
                      className="w-full justify-start px-2 h-8 text-sm"
                      onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                    >
                      <FolderOpenIcon className="h-4 w-4 mr-2" />
                      {project.name}
                    </Button>
                  ))
                )}
                <Button
                  variant="ghost"
                  className="w-full justify-start px-2 h-8 text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => router.push('/dashboard/projects/new')}
                >
                  <PlusCircleIcon className="h-3 w-3 mr-2" />
                  New Project
                </Button>
              </div>
            )}
          </div>

          {/* Other Menu Items */}
          <Button
            variant={pathname === '/dashboard/team' ? "secondary" : "ghost"}
            className={`w-full justify-start px-2 ${isCollapsed ? 'justify-center' : ''}`}
            onClick={() => router.push('/dashboard/team')}
            size="icon"
            title={isCollapsed ? "Team" : undefined}
          >
            <UsersIcon className="h-4 w-4" />
            {!isCollapsed && "Team"}
          </Button>

          <Button
            variant={pathname === '/dashboard/analytics' ? "secondary" : "ghost"}
            className={`w-full justify-start px-2 ${isCollapsed ? 'justify-center' : ''}`}
            onClick={() => router.push('/dashboard/analytics')}
            size="icon"
            title={isCollapsed ? "Analytics" : undefined}
          >
            <BarChartIcon className="h-4 w-4" />
            {!isCollapsed && "Analytics"}
          </Button>
        </nav>
      </div>

      {/* User Menu - Bottom */}
      <div className="p-4 border-t border-border">
        {isCollapsed ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full p-2 h-auto">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userData.avatar} alt={userData.name} />
                  <AvatarFallback>
                    {userData.name.split(' ').map((n: any[]) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userData.avatar} alt={userData.name} />
                    <AvatarFallback>
                      {userData.name.split(' ').map((n: any[]) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="">{userData.name}</div>
                    <div className="text-sm text-muted-foreground">{userData.email}</div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                  <UserCircleIcon className="h-4 w-4 mr-2" />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/billing')}>
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  Theme
                </DropdownMenuItem>
                
                {/* <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button> */}
              
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOutIcon className="h-4 w-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-3 h-auto">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarImage src={userData.avatar} alt={userData.name} />
                  <AvatarFallback>
                    {userData.name.split(' ').map((n: any[]) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className=" text-sm">{userData.name}</div>
                  <div className="text-sm text-muted-foreground">{userData.email}</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userData.avatar} alt={userData.name} />
                    <AvatarFallback>
                      {userData.name.split(' ').map((n: any[]) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="">{userData.name}</div>
                    <div className="text-sm text-muted-foreground">{userData.email}</div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                  <UserCircleIcon className="h-4 w-4 mr-2" />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/billing')}>
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  Theme
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOutIcon className="h-4 w-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
} 