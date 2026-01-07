-- MEJORA DE TAREAS (Soporte para descripción y estados extendidos)
alter table public.todos 
add column if not exists description text,
add column if not exists status text check (status in ('PENDING', 'IN_PROGRESS', 'COMPLETED')) default 'PENDING';

-- Migrar datos antiguos (opcional, para consistencia)
-- Si is_completed = true, poner status = COMPLETED, sino PENDING
update public.todos set status = 'COMPLETED' where is_completed = true and status = 'PENDING';
