-- 0. CORRECCIÓN: Agregar columna faltante a Perfiles
alter table public.profiles 
add column if not exists assigned_project_id uuid;

-- 1. MODIFICACIÓN DE PROYECTOS (Agregar Fechas y Descripción)
alter table public.projects 
add column if not exists description text,
add column if not exists start_date date default CURRENT_DATE,
add column if not exists deadline date;

-- 2. NUEVA TABLA: RECURSOS DEL PROYECTO (Entregables y Documentación)
create table if not exists public.project_resources (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  type text check (type in ('DELIVERABLE', 'DOCUMENT')) not null,
  url text, 
  status text check (status in ('PENDING', 'IN_PROGRESS', 'APPROVED', 'DELIVERED')) default 'PENDING',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. SEGURIDAD Y PERMISOS
alter table public.project_resources enable row level security;
grant all on public.project_resources to postgres, anon, authenticated, service_role;

-- Eliminar políticas viejas si existen para evitar duplicados
drop policy if exists "Admin manages resources" on public.project_resources;
drop policy if exists "Client views resources" on public.project_resources;

-- Admin ve y edita todo
create policy "Admin manages resources" on public.project_resources
  for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

-- Cliente ve solo lo de su proyecto
create policy "Client views resources" on public.project_resources
  for select using (exists (
    select 1 from public.projects p
    join public.profiles u on u.assigned_project_id = p.id
    where p.id = public.project_resources.project_id
    and u.id = auth.uid()
  ));
