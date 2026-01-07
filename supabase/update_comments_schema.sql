-- TABLA DE COMENTARIOS DE TAREAS
create table if not exists public.task_comments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.todos(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SEGURIDAD
alter table public.task_comments enable row level security;
grant all on public.task_comments to postgres, anon, authenticated, service_role;

-- POLÍTICAS
-- Admin ve y comenta en todo
create policy "Admin manages comments" on public.task_comments
  for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

-- Cliente ve y comenta SOLO en tareas de SU proyecto asignado
create policy "Client manages comments" on public.task_comments
  for all using (
    exists (
      select 1 from public.todos t
      join public.projects p on p.id = t.project_id
      join public.profiles u on u.assigned_project_id = p.id
      where t.id = public.task_comments.task_id
      and u.id = auth.uid()
    )
  );
