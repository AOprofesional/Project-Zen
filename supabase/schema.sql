-- 1. TABLA PERFILES (Usuarios)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  role text check (role in ('ADMIN', 'CLIENT')) default 'CLIENT',
  assigned_project_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. TABLA PROYECTOS
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.profiles(id),
  name text not null,
  status text check (status in ('ACTIVE', 'ON_HOLD', 'COMPLETED')) default 'ACTIVE',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. TABLA TAREAS (TODOS)
create table if not exists public.todos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  project_id uuid references public.projects(id),
  content text not null,
  is_completed boolean default false,
  type text check (type in ('ROUTINE', 'DAILY', 'WEEKLY', 'MONTHLY', 'EVENTUAL', 'PROJECT_TASK')) not null,
  due_date timestamp with time zone,
  visualization_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. TABLA NOTAS
create table if not exists public.notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  content text not null,
  color_code text default '#ffffff',
  is_pinned boolean default false,
  tags text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SEGURIDAD (Row Level Security)
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.todos enable row level security;
alter table public.notes enable row level security;

-- POLÍTICAS (Usamos DO block para evitar error si ya existen)
do $$
begin
    if not exists (select 1 from pg_policies where policyname = 'Public profiles are viewable by everyone') then
        create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
    end if;
    
    if not exists (select 1 from pg_policies where policyname = 'Users can update own profile') then
        create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
    end if;

    if not exists (select 1 from pg_policies where policyname = 'Admin sees all projects') then
        create policy "Admin sees all projects" on public.projects for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));
    end if;

    if not exists (select 1 from pg_policies where policyname = 'Users can CRUD their own todos') then
        create policy "Users can CRUD their own todos" on public.todos for all using (auth.uid() = user_id);
    end if;

    if not exists (select 1 from pg_policies where policyname = 'Users can CRUD their own notes') then
        create policy "Users can CRUD their own notes" on public.notes for all using (auth.uid() = user_id);
    end if;
end
$$;

-- Permisos explícitos (Fix para caché stubborn)
grant all on public.profiles to postgres, anon, authenticated, service_role;
grant all on public.projects to postgres, anon, authenticated, service_role;
grant all on public.todos to postgres, anon, authenticated, service_role;
grant all on public.notes to postgres, anon, authenticated, service_role;

-- 5. TABLA COMENTARIOS DE TAREAS
create table if not exists public.task_comments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.todos(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.task_comments enable row level security;
grant all on public.task_comments to postgres, anon, authenticated, service_role;

-- Políticas de Comentarios
do $$
begin
    if not exists (select 1 from pg_policies where policyname = 'Admin manages comments') then
        create policy "Admin manages comments" on public.task_comments
          for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));
    end if;

    if not exists (select 1 from pg_policies where policyname = 'Client manages comments') then
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
    end if;
end
$$;
