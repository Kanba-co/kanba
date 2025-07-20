"use client";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';
import { KanbanBoard } from '@/components/kanban-board';

export default function SharePage({ params }: { params: { token: string } }) {
  const [project, setProject] = useState<any>(null);
  const [columns, setColumns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!project) return <div className="p-10 text-center">Project not found or not shared.</div>;

  return (
    <div className="max-w-7xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
      <p className="text-muted-foreground mb-6">{project.description}</p>
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
      />
      <div className="mt-8 text-center text-muted-foreground text-xs">This board is view only. You cannot make changes.</div>
    </div>
  );
} 