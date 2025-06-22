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

interface AppSidebarProps {
  user: any;
  onSignOut: () => void;
}

export function AppSidebar({ user, onSignOut }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const navItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Projects",
      url: "/dashboard/projects",
      icon: FolderIcon,
    },
    {
      title: "Team",
      url: "/dashboard/team",
      icon: UsersIcon,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChartIcon,
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
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Logo Header */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <div className="">
              <KanbanIcon className="h-6 w-6 text-black dark:text-white" />
            </div>
            {!isCollapsed && <span className="text-sm font-semibold">KanbanPro</span>}
          </div>
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
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
             
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
              className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 justify-start px-2"
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
        </nav>

        <nav className="space-y-2 mt-8">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Settings</span>
          {secondaryItems.map((item) => (
            <Button
              key={item.title}
              variant={pathname === item.url ? "secondary" : "ghost"}
              className={`w-full justify-start px-2 ${isCollapsed ? 'justify-center' : ''}`}
              onClick={() => router.push(item.url)}
              title={isCollapsed ? item.title : undefined}
            >
              <item.icon className={`h-4 w-4 ${isCollapsed ? '' : ''}`} />
              {!isCollapsed && item.title}
            </Button>
          ))}
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
                    <div className="font-medium">{userData.name}</div>
                    <div className="text-xs text-muted-foreground">{userData.email}</div>
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
                <DropdownMenuItem onClick={() => router.push('/dashboard/notifications')}>
                  <BellIcon className="h-4 w-4 mr-2" />
                  Notifications
                </DropdownMenuItem>
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
                  <div className="font-medium text-sm">{userData.name}</div>
                  <div className="text-xs text-muted-foreground">{userData.email}</div>
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
                    <div className="font-medium">{userData.name}</div>
                    <div className="text-xs text-muted-foreground">{userData.email}</div>
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
                <DropdownMenuItem onClick={() => router.push('/dashboard/notifications')}>
                  <BellIcon className="h-4 w-4 mr-2" />
                  Notifications
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