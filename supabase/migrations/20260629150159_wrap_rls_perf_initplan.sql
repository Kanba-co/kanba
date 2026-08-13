-- Wrap every unwrapped auth.* call (USING + WITH CHECK, including calls nested inside
-- EXISTS/correlated subqueries) in (select ...) so Postgres evaluates each once per
-- statement (an InitPlan) instead of once per row -- the Supabase-documented RLS perf
-- pattern. Predicate-equivalent (row visibility unchanged). Already-wrapped calls left as-is.

ALTER POLICY "activity_logs_team_insert" ON public.activity_logs
    WITH CHECK (((project_id IN ( SELECT projects.id FROM projects WHERE (projects.user_id = (select auth.uid())))) OR (project_id IN ( SELECT user_accessible_projects.project_id FROM user_accessible_projects WHERE (user_accessible_projects.accessor_id = (select auth.uid())))) OR user_has_direct_project_access(project_id, (select auth.uid()))));

ALTER POLICY "activity_logs_team_select" ON public.activity_logs
    USING (((project_id IN ( SELECT projects.id FROM projects WHERE (projects.user_id = (select auth.uid())))) OR (project_id IN ( SELECT user_accessible_projects.project_id FROM user_accessible_projects WHERE (user_accessible_projects.accessor_id = (select auth.uid())))) OR user_has_direct_project_access(project_id, (select auth.uid()))));

ALTER POLICY "columns_team_delete" ON public.columns
    USING (((project_id IN ( SELECT projects.id FROM projects WHERE (projects.user_id = (select auth.uid())))) OR (project_id IN ( SELECT user_accessible_projects.project_id FROM user_accessible_projects WHERE ((user_accessible_projects.accessor_id = (select auth.uid())) AND (user_accessible_projects.access_type = 'admin'::text))))));

ALTER POLICY "columns_team_insert" ON public.columns
    WITH CHECK (((project_id IN ( SELECT projects.id FROM projects WHERE (projects.user_id = (select auth.uid())))) OR (project_id IN ( SELECT user_accessible_projects.project_id FROM user_accessible_projects WHERE (user_accessible_projects.accessor_id = (select auth.uid())))) OR user_has_direct_project_access(project_id, (select auth.uid()))));

ALTER POLICY "columns_team_select" ON public.columns
    USING (((project_id IN ( SELECT projects.id FROM projects WHERE (projects.user_id = (select auth.uid())))) OR (project_id IN ( SELECT user_accessible_projects.project_id FROM user_accessible_projects WHERE (user_accessible_projects.accessor_id = (select auth.uid())))) OR user_has_direct_project_access(project_id, (select auth.uid()))));

ALTER POLICY "columns_team_update" ON public.columns
    USING (((project_id IN ( SELECT projects.id FROM projects WHERE (projects.user_id = (select auth.uid())))) OR (project_id IN ( SELECT user_accessible_projects.project_id FROM user_accessible_projects WHERE (user_accessible_projects.accessor_id = (select auth.uid())))) OR user_has_direct_project_access(project_id, (select auth.uid()))));

ALTER POLICY "notifications_delete_own" ON public.notifications
    USING ((user_id = (select auth.uid())));

ALTER POLICY "notifications_select_own" ON public.notifications
    USING ((user_id = (select auth.uid())));

ALTER POLICY "notifications_update_own" ON public.notifications
    USING ((user_id = (select auth.uid())))
    WITH CHECK ((user_id = (select auth.uid())));

ALTER POLICY "profiles_insert_own" ON public.profiles
    WITH CHECK (((select auth.uid()) = id));

ALTER POLICY "profiles_update_own" ON public.profiles
    USING (((select auth.uid()) = id))
    WITH CHECK (((select auth.uid()) = id));

ALTER POLICY "secure_profiles_insert_own" ON public.profiles
    WITH CHECK (((select auth.uid()) = id));

ALTER POLICY "secure_profiles_select_others_basic" ON public.profiles
    USING ((((select auth.uid()) IS NOT NULL) AND ((select auth.uid()) <> id)));

ALTER POLICY "secure_profiles_select_own" ON public.profiles
    USING (((select auth.uid()) = id));

ALTER POLICY "secure_profiles_update_own" ON public.profiles
    USING (((select auth.uid()) = id))
    WITH CHECK (((select auth.uid()) = id));

ALTER POLICY "project_members_owner_delete" ON public.project_members
    USING ((project_id IN ( SELECT projects.id FROM projects WHERE (projects.user_id = (select auth.uid())))));

ALTER POLICY "project_members_owner_manage" ON public.project_members
    WITH CHECK ((project_id IN ( SELECT projects.id FROM projects WHERE (projects.user_id = (select auth.uid())))));

ALTER POLICY "project_members_owner_update" ON public.project_members
    USING ((project_id IN ( SELECT projects.id FROM projects WHERE (projects.user_id = (select auth.uid())))))
    WITH CHECK ((project_id IN ( SELECT projects.id FROM projects WHERE (projects.user_id = (select auth.uid())))));

ALTER POLICY "project_members_team_select" ON public.project_members
    USING (((project_id IN ( SELECT projects.id FROM projects WHERE (projects.user_id = (select auth.uid())))) OR (project_id IN ( SELECT user_accessible_projects.project_id FROM user_accessible_projects WHERE (user_accessible_projects.accessor_id = (select auth.uid())))) OR (user_id = (select auth.uid())) OR user_has_direct_project_access(project_id, (select auth.uid()))));

ALTER POLICY "projects_accessible" ON public.projects
    USING (((user_id = (select auth.uid())) OR (id IN ( SELECT user_accessible_projects.project_id FROM user_accessible_projects WHERE (user_accessible_projects.accessor_id = (select auth.uid())))) OR user_has_direct_project_access(id, (select auth.uid()))));

ALTER POLICY "projects_owner_delete" ON public.projects
    USING ((user_id = (select auth.uid())));

ALTER POLICY "projects_owner_modify" ON public.projects
    WITH CHECK ((user_id = (select auth.uid())));

ALTER POLICY "projects_owner_update" ON public.projects
    USING ((user_id = (select auth.uid())))
    WITH CHECK ((user_id = (select auth.uid())));

ALTER POLICY "task_comments_own_delete" ON public.task_comments
    USING ((user_id = (select auth.uid())));

ALTER POLICY "task_comments_own_update" ON public.task_comments
    USING ((user_id = (select auth.uid())))
    WITH CHECK ((user_id = (select auth.uid())));

ALTER POLICY "task_comments_team_insert" ON public.task_comments
    WITH CHECK (((task_id IN ( SELECT t.id FROM (tasks t JOIN columns c ON ((c.id = t.column_id))) WHERE ((c.project_id IN ( SELECT projects.id FROM projects WHERE (projects.user_id = (select auth.uid())))) OR (c.project_id IN ( SELECT user_accessible_projects.project_id FROM user_accessible_projects WHERE (user_accessible_projects.accessor_id = (select auth.uid())))) OR user_has_direct_project_access(c.project_id, (select auth.uid()))))) AND (user_id = (select auth.uid()))));

ALTER POLICY "task_comments_team_select" ON public.task_comments
    USING ((task_id IN ( SELECT t.id FROM (tasks t JOIN columns c ON ((c.id = t.column_id))) WHERE ((c.project_id IN ( SELECT projects.id FROM projects WHERE (projects.user_id = (select auth.uid())))) OR (c.project_id IN ( SELECT user_accessible_projects.project_id FROM user_accessible_projects WHERE (user_accessible_projects.accessor_id = (select auth.uid())))) OR user_has_direct_project_access(c.project_id, (select auth.uid()))))));

ALTER POLICY "tasks_team_delete" ON public.tasks
    USING ((column_id IN ( SELECT c.id FROM columns c WHERE ((c.project_id IN ( SELECT projects.id FROM projects WHERE (projects.user_id = (select auth.uid())))) OR (c.project_id IN ( SELECT user_accessible_projects.project_id FROM user_accessible_projects WHERE ((user_accessible_projects.accessor_id = (select auth.uid())) AND (user_accessible_projects.access_type = 'admin'::text)))) OR ((tasks.created_by = (select auth.uid())) AND user_has_direct_project_access(c.project_id, (select auth.uid())))))));

ALTER POLICY "tasks_team_insert" ON public.tasks
    WITH CHECK ((column_id IN ( SELECT c.id FROM columns c WHERE ((c.project_id IN ( SELECT projects.id FROM projects WHERE (projects.user_id = (select auth.uid())))) OR (c.project_id IN ( SELECT user_accessible_projects.project_id FROM user_accessible_projects WHERE (user_accessible_projects.accessor_id = (select auth.uid())))) OR user_has_direct_project_access(c.project_id, (select auth.uid()))))));

ALTER POLICY "tasks_team_select" ON public.tasks
    USING ((column_id IN ( SELECT c.id FROM columns c WHERE ((c.project_id IN ( SELECT projects.id FROM projects WHERE (projects.user_id = (select auth.uid())))) OR (c.project_id IN ( SELECT user_accessible_projects.project_id FROM user_accessible_projects WHERE (user_accessible_projects.accessor_id = (select auth.uid())))) OR user_has_direct_project_access(c.project_id, (select auth.uid()))))));

ALTER POLICY "tasks_team_update" ON public.tasks
    USING ((column_id IN ( SELECT c.id FROM columns c WHERE ((c.project_id IN ( SELECT projects.id FROM projects WHERE (projects.user_id = (select auth.uid())))) OR (c.project_id IN ( SELECT user_accessible_projects.project_id FROM user_accessible_projects WHERE (user_accessible_projects.accessor_id = (select auth.uid())))) OR user_has_direct_project_access(c.project_id, (select auth.uid()))))));
