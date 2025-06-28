'use client';
import { useEffect, useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { useUser } from '@/components/user-provider';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = () => {
    router.push('/');
    signOut();
  };

  const handleProjectUpdate = (action: 'rename' | 'delete', projectId?: string) => {
    // Call the global handler if it exists
    if ((window as any).handleProjectUpdate) {
      (window as any).handleProjectUpdate(action, projectId);
    }
  };

  if (!mounted) return null; // SSR ile uyuşmazlık olmasın diye

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
        <AppSidebar onSignOut={handleSignOut} onProjectUpdate={handleProjectUpdate} />
        <main className="flex-1 p-2 flex justify-center items-start overflow-auto">
          <div className="w-full border border-border shadow-sm dark:shadow:sm rounded-xl h-full px-4 py-4 bg-white dark:bg-[#0A0A0A]">
            <SidebarTrigger />
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
