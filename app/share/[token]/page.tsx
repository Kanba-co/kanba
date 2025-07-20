import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { KanbanBoard } from '@/components/kanban-board';

export default async function SharePage({ params }: { params: { token: string } }) {
  // Projeyi token ile bul
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('public_share_token', params.token)
    .single();

  if (projectError || !project) return notFound();

  // Kolonları ve görevleri çek
  const { data: columns, error: columnsError } = await supabase
    .from('columns')
    .select('*')
    .eq('project_id', project.id)
    .order('position');

  if (columnsError) return notFound();

  // Her kolonun görevlerini çek
  const columnsWithTasks = await Promise.all(
    (columns || []).map(async (column) => {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('column_id', column.id)
        .order('position');
      return { ...column, tasks: tasks || [] };
    })
  );

  // No-op fonksiyonlar (readonly için)
  const noop = () => {};

  return (
    <div className="max-w-5xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
      <p className="text-muted-foreground mb-6">{project.description}</p>
      <KanbanBoard
        columns={columnsWithTasks}
        projectMembers={[]}
        handleDragEnd={noop}
        onEditColumn={noop}
        onDeleteColumn={noop}
        onAddTask={noop}
        onEditTask={noop}
        onDeleteTask={noop}
        onViewComments={noop}
      />
      <div className="mt-8 text-center text-muted-foreground text-xs">This board is view only.</div>
    </div>
  );
} 