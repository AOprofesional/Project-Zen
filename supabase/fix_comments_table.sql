-- SCRIPT DE REPARACIÓN: Crear Tabla de Comentarios

-- 1. Crear la tabla si no existe
create table if not exists public.task_comments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.todos(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Habilitar RLS
alter table public.task_comments enable row level security;

-- 3. Otorgar permisos básicos
grant all on public.task_comments to postgres, anon, authenticated, service_role;

-- 4. Recrear Políticas (Borrar viejas para evitar conflictos)
drop policy if exists "Admin manages comments" on public.task_comments;
drop policy if exists "Client manages comments" on public.task_comments;

-- Política ADMIN: Ve y edita todo
create policy "Admin manages comments" on public.task_comments
  for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

-- Política CLIENTE: Ve y comenta solo en tareas de su proyecto
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
