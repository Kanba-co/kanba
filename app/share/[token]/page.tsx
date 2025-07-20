"use client";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';
import { KanbanBoard } from '@/components/kanban-board';
import { useTheme } from 'next-themes';
import Image from "next/image";
import Link from 'next/link';
import { 
   
    Moon, 
    Sun, 
    
  } from 'lucide-react';
  import { Button } from "@/components/ui/button";


export default function SharePage({ params }: { params: { token: string } }) {
  const [project, setProject] = useState<any>(null);
  const [columns, setColumns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    async function fetchData() {
      const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('public_share_token', params.token)
        .single();
      if (!project) {
        setLoading(false);
        return;
      }
      setProject(project);

      const { data: columns } = await supabase
        .from('columns')
        .select('*')
        .eq('project_id', project.id)
        .order('position');
      if (!columns) {
        setLoading(false);
        return;
      }

      const columnsWithTasks = await Promise.all(
        columns.map(async (column: any) => {
          const { data: tasks } = await supabase
            .from('tasks')
            .select('*')
            .eq('column_id', column.id)
            .order('position');
          return { ...column, tasks: tasks || [] };
        })
      );
      setColumns(columnsWithTasks);
      setLoading(false);
    }
    fetchData();
  }, [params.token]);

  const noop = () => {};

  if (loading) return  <div className="flex items-center justify-center min-h-screen w-full">
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
</div>;
  if (!project) return <div className="p-10 text-center">Project not found or not shared.</div>;

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-background transition-colors duration-300">
      <div
        className="
          relative
          h-[calc(100vh-2rem)]
          w-[calc(100vw-2rem)]
          m-4
          border border-border
          shadow-sm dark:shadow:sm
          rounded-xl
          bg-white dark:bg-[#0A0A0A]
          flex flex-col
          overflow-hidden
        "
      >
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <h1 className="text-3xl font-bold mb-2 px-4 pt-4">{project.name}</h1>
          <p className="mb-6 text-muted-foreground px-4">{project.description}</p>
          <div className="flex-1 overflow-auto px-2 pb-4  border-b">
            <KanbanBoard
              columns={columns}
              projectMembers={[]}
              handleDragEnd={noop}
              onEditColumn={noop}
              onDeleteColumn={noop}
              onAddTask={noop}
              onEditTask={noop}
              onDeleteTask={noop}
              onViewComments={noop}
              readOnly={true}
            />
          </div>
          <div className="mt-4 text-center flex justify-center text-muted-foreground items-center text-xs px-4 pb-4">
            This board is view only. Built with <Link href="/" className="flex items-center">
              <div className=" flex items-center">
                <Image 
                  src={theme === 'light' ? '/logo-light.png' : '/logo-dark.png'} 
                  width={30} 
                  height={30} 
                  alt="Kanba Logo" 
                />
              </div>
             <span className="font-semibold">Kanba.</span></Link>
          </div>
        </div>
      </div>
    </div>
  );
} 