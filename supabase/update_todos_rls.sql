-- ACTUALIZACIÓN DE SEGURIDAD PARA TAREAS (TODOS)

-- 1. Eliminar política restrictiva anterior (Solo propio usuario)
drop policy if exists "Users can CRUD their own todos" on public.todos;

-- 2. Política para ADMIN (Ve y edita todo)
create policy "Admin manages all todos" on public.todos
  for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

-- 3. Política para CLIENTE (Ve y edita tareas de SU proyecto asignado)
create policy "Client manages project todos" on public.todos
  for all using (
    exists (
      select 1 from public.projects p
      join public.profiles u on u.assigned_project_id = p.id
      where p.id = public.todos.project_id
      and u.id = auth.uid()
    )
  );
