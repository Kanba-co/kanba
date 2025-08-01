/*
  # Add isDone field to tasks table

  This migration adds an isDone boolean field to the tasks table
  to allow users to mark tasks as completed without moving them
  between columns.
*/

-- Add isDone column to tasks table
ALTER TABLE public.tasks 
ADD COLUMN is_done BOOLEAN DEFAULT FALSE;

-- Create index for better query performance
CREATE INDEX idx_tasks_is_done ON public.tasks(is_done);

-- Add comment for documentation
COMMENT ON COLUMN public.tasks.is_done IS 'Whether the task is marked as done/completed'; 