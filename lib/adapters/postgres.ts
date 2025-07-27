import { PrismaClient } from '@prisma/client';
import type { Database } from '../supabase';

// Initialize Prisma client
const prisma = new PrismaClient();

// Type definitions to match Supabase interface
export type PostgresDatabase = {
  profiles: {
    select: (columns?: string) => PostgresQueryBuilder<Database['public']['Tables']['profiles']['Row']>;
    insert: (data: Database['public']['Tables']['profiles']['Insert']) => Promise<{ data: Database['public']['Tables']['profiles']['Row'] | null; error: any }>;
    update: (data: Database['public']['Tables']['profiles']['Update']) => Promise<{ data: Database['public']['Tables']['profiles']['Row'] | null; error: any }>;
    delete: () => Promise<{ data: any; error: any }>;
  };
  projects: {
    select: (columns?: string) => PostgresQueryBuilder<Database['public']['Tables']['projects']['Row']>;
    insert: (data: Database['public']['Tables']['projects']['Insert']) => Promise<{ data: Database['public']['Tables']['projects']['Row'] | null; error: any }>;
    update: (data: Database['public']['Tables']['projects']['Update']) => Promise<{ data: Database['public']['Tables']['projects']['Row'] | null; error: any }>;
    delete: () => Promise<{ data: any; error: any }>;
  };
  columns: {
    select: (columns?: string) => PostgresQueryBuilder<Database['public']['Tables']['columns']['Row']>;
    insert: (data: Database['public']['Tables']['columns']['Insert']) => Promise<{ data: Database['public']['Tables']['columns']['Row'] | null; error: any }>;
    update: (data: Database['public']['Tables']['columns']['Update']) => Promise<{ data: Database['public']['Tables']['columns']['Row'] | null; error: any }>;
    delete: () => Promise<{ data: any; error: any }>;
  };
  tasks: {
    select: (columns?: string) => PostgresQueryBuilder<Database['public']['Tables']['tasks']['Row']>;
    insert: (data: Database['public']['Tables']['tasks']['Insert']) => Promise<{ data: Database['public']['Tables']['tasks']['Row'] | null; error: any }>;
    update: (data: Database['public']['Tables']['tasks']['Update']) => Promise<{ data: Database['public']['Tables']['tasks']['Row'] | null; error: any }>;
    delete: () => Promise<{ data: any; error: any }>;
  };
};

// Query builder class to mimic Supabase's query interface
class PostgresQueryBuilder<T> {
  private table: string;
  private whereConditions: any[] = [];
  private orderByConditions: any[] = [];
  private limitValue?: number;
  private includeRelations: any = {};

  constructor(table: string) {
    this.table = table;
  }

  eq(column: string, value: any): this {
    this.whereConditions.push({ [column]: value });
    return this;
  }

  neq(column: string, value: any): this {
    this.whereConditions.push({ [column]: { not: value } });
    return this;
  }

  gt(column: string, value: any): this {
    this.whereConditions.push({ [column]: { gt: value } });
    return this;
  }

  gte(column: string, value: any): this {
    this.whereConditions.push({ [column]: { gte: value } });
    return this;
  }

  lt(column: string, value: any): this {
    this.whereConditions.push({ [column]: { lt: value } });
    return this;
  }

  lte(column: string, value: any): this {
    this.whereConditions.push({ [column]: { lte: value } });
    return this;
  }

  in(column: string, values: any[]): this {
    this.whereConditions.push({ [column]: { in: values } });
    return this;
  }

  like(column: string, value: string): this {
    this.whereConditions.push({ [column]: { contains: value } });
    return this;
  }

  ilike(column: string, value: string): this {
    this.whereConditions.push({ [column]: { contains: value, mode: 'insensitive' } });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }): this {
    this.orderByConditions.push({ [column]: options?.ascending === false ? 'desc' : 'asc' });
    return this;
  }

  limit(count: number): this {
    this.limitValue = count;
    return this;
  }

  single(): Promise<{ data: T | null; error: any }> {
    return this.execute(true) as Promise<{ data: T | null; error: any }>;
  }

  async execute(single = false): Promise<{ data: T | T[] | null; error: any }> {
    try {
      const where = this.whereConditions.length > 0 
        ? this.whereConditions.reduce((acc, condition) => ({ ...acc, ...condition }), {})
        : {};

      const orderBy = this.orderByConditions.length > 0 
        ? this.orderByConditions.reduce((acc, condition) => ({ ...acc, ...condition }), {})
        : {};

      const include = Object.keys(this.includeRelations).length > 0 ? this.includeRelations : undefined;

      let result;
      if (single) {
        result = await (prisma as any)[this.table].findFirst({
          where,
          orderBy,
          include,
        });
        return { data: result, error: null };
      } else {
        result = await (prisma as any)[this.table].findMany({
          where,
          orderBy,
          include,
          take: this.limitValue,
        });
        return { data: result, error: null };
      }
    } catch (error) {
      return { data: null, error };
    }
  }
}

// Enhanced query builder with include support
class PostgresQueryBuilderWithInclude<T> extends PostgresQueryBuilder<T> {
  include(relations: any): this {
    (this as any).includeRelations = relations;
    return this;
  }
}

// PostgreSQL adapter implementation
export const postgresAdapter: PostgresDatabase = {
  profiles: {
    select: (columns?: string) => new PostgresQueryBuilderWithInclude<Database['public']['Tables']['profiles']['Row']>('profiles'),
    insert: async (data) => {
      try {
        const result = await prisma.profile.create({ data });
        return { data: result as any, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    update: async (data) => {
      try {
        const { id, ...updateData } = data;
        const result = await prisma.profile.update({
          where: { id: id! },
          data: updateData,
        });
        return { data: result as any, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    delete: async () => {
      try {
        const result = await prisma.profile.deleteMany();
        return { data: result, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
  },
  projects: {
    select: (columns?: string) => new PostgresQueryBuilderWithInclude<Database['public']['Tables']['projects']['Row']>('projects'),
    insert: async (data) => {
      try {
        const result = await prisma.project.create({ data });
        return { data: result as any, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    update: async (data) => {
      try {
        const { id, ...updateData } = data;
        const result = await prisma.project.update({
          where: { id: id! },
          data: updateData,
        });
        return { data: result as any, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    delete: async () => {
      try {
        const result = await prisma.project.deleteMany();
        return { data: result, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
  },
  columns: {
    select: (columns?: string) => new PostgresQueryBuilderWithInclude<Database['public']['Tables']['columns']['Row']>('columns'),
    insert: async (data) => {
      try {
        const result = await prisma.column.create({ data });
        return { data: result as any, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    update: async (data) => {
      try {
        const { id, ...updateData } = data;
        const result = await prisma.column.update({
          where: { id: id! },
          data: updateData,
        });
        return { data: result as any, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    delete: async () => {
      try {
        const result = await prisma.column.deleteMany();
        return { data: result, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
  },
  tasks: {
    select: (columns?: string) => new PostgresQueryBuilderWithInclude<Database['public']['Tables']['tasks']['Row']>('tasks'),
    insert: async (data) => {
      try {
        const result = await prisma.task.create({ data });
        return { data: result as any, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    update: async (data) => {
      try {
        const { id, ...updateData } = data;
        const result = await prisma.task.update({
          where: { id: id! },
          data: updateData,
        });
        return { data: result as any, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    delete: async () => {
      try {
        const result = await prisma.task.deleteMany();
        return { data: result, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
  },
};

// Additional helper functions for complex queries
export const postgresHelpers = {
  // Get project with columns and tasks
  async getProjectWithDetails(projectId: string) {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          columns: {
            include: {
              tasks: {
                include: {
                  assignee: {
                    select: {
                      id: true,
                      email: true,
                      full_name: true,
                      avatar_url: true,
                    },
                  },
                },
                orderBy: { position: 'asc' },
              },
            },
            orderBy: { position: 'asc' },
          },
        },
      });
      return { data: project, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get user projects with member info
  async getUserProjects(userId: string) {
    try {
      const projects = await prisma.project.findMany({
        where: {
          OR: [
            { user_id: userId },
            {
              project_members: {
                some: { user_id: userId },
              },
            },
          ],
        },
        include: {
          project_members: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  full_name: true,
                  avatar_url: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });
      return { data: projects, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get tasks assigned to user
  async getAssignedTasks(userId: string, limit = 10) {
    try {
      const tasks = await prisma.task.findMany({
        where: { assigned_to: userId },
        include: {
          column: {
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
        take: limit,
      });
      return { data: tasks, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Search users for team collaboration
  async searchUsers(query: string, currentUserId: string, limit = 10) {
    try {
      const users = await prisma.profile.findMany({
        where: {
          AND: [
            {
              OR: [
                { email: { contains: query, mode: 'insensitive' } },
                { full_name: { contains: query, mode: 'insensitive' } },
              ],
            },
            { id: { not: currentUserId } },
          ],
        },
        select: {
          id: true,
          email: true,
          full_name: true,
          avatar_url: true,
        },
        take: limit,
      });
      return { data: users, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};

// Export Prisma client for direct use if needed
export { prisma }; 