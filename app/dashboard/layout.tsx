'use client';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { useUser } from '@/components/user-provider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        <AppSidebar onSignOut={signOut} />
        <main className="flex-1 p-2 flex justify-center items-start  overflow-auto">
          <div className="w-full min-h-screen border border-border shadow-sm dark:shadow:sm rounded-xl h-full px-4 py-4 bg-white dark:bg-[#0A0A0A]">
            <SidebarTrigger />
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
} 