'use client';

import React from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggableProvided,
  DraggableStateSnapshot,
  DroppableProvided,
  DroppableStateSnapshot,
} from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Flag,
  Calendar,
  User,
  MessageSquare,
} from 'lucide-react';

import type { Task, Column, ProjectMember } from '@/lib/types';

interface SortableTaskProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onViewComments: (task: Task) => void;
  projectMembers: ProjectMember[];
}

function TaskCard({ task, index, onEdit, onDelete, onViewComments, projectMembers, readOnly }: SortableTaskProps & { readOnly?: boolean }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  const assignedUser = projectMembers.find(member => member.user_id === task.assigned_to);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="bg-muted/60 {`cursor-grab hover:shadow-md transition-shadow ${snapshot.isDragging ? 'ring-2 ring-primary' : ''}`}"
        >
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-sm leading-tight flex-1 line-clamp-2">{task.title}</h4>
                {!readOnly && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(task)}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onViewComments(task)}><MessageSquare className="h-4 w-4 mr-2" />Comments</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {readOnly && (
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onViewComments(task)}>
                    <MessageSquare className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {task.description && <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>}
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <div className="flex items-center space-x-4">
                    <Badge variant="secondary" className={`text-xs ${getPriorityColor(task.priority)}`}><Flag className="h-3 w-3 mr-1" />{task.priority}</Badge>
                </div>
                <div className="flex items-center"><User className="h-3 w-3 mr-1" />{assignedUser ? (assignedUser.profiles.full_name || assignedUser.profiles.email) : 'Unassigned'}</div>
              </div>
              <div className="flex justify-end">
              {task.due_date && <div className="flex text-xs items-center"><Calendar className="h-3 w-3 mr-1" />{formatDate(task.due_date)}</div>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
}

interface KanbanBoardProps {
  columns: Column[];
  projectMembers: ProjectMember[];
  handleDragEnd: (result: DropResult) => void;
  onEditColumn: (column: Column) => void;
  onDeleteColumn: (columnId: string) => void;
  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onViewComments: (task: Task) => void;
  readOnly?: boolean;
}

export function KanbanBoard({
  columns,
  projectMembers,
  handleDragEnd,
  onEditColumn,
  onDeleteColumn,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onViewComments,
  readOnly = false,
}: KanbanBoardProps) {
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map((column) => (
          <Droppable key={column.id} droppableId={column.id}>
            {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex-shrink-0 w-80"
              >
                <Card className="bg-muted/20 {`transition-colors ${snapshot.isDraggingOver ? 'bg-muted/50' : ''}`}">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm font-medium">{column.name}</CardTitle>
                      {!readOnly && (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{column.tasks.length}</Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><MoreHorizontal className="h-3 w-3" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onEditColumn(column)}><Edit className="h-4 w-4 mr-2" />Rename</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onDeleteColumn(column.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                      {readOnly && (
                        <Badge variant="secondary" className="text-xs">{column.tasks.length}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {column.tasks.map((task, index) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        index={index}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                        onViewComments={onViewComments}
                        projectMembers={projectMembers}
                        readOnly={readOnly}
                      />
                    ))}
                    {provided.placeholder}
                    {!readOnly && (
                      <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" size="sm" onClick={() => onAddTask(column.id)}>
                        <Plus className="h-4 w-4 mr-2" />Add a task
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}