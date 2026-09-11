-- ==========================================================================
-- Migração: tabela de usuários/logins (gerenciáveis pela chefia no app)
-- Rode este arquivo se você já executou o schema.sql original antes e só
-- precisa adicionar a tabela de usuários agora.
-- (SQL Editor -> Create a new snippet -> colar -> Run)
-- ==========================================================================

create table if not exists public.caf_users (
  username text primary key,
  user_id text not null,
  name text not null,
  role text not null,                -- 'chefe' | 'responsavel_sala'
  room_id text,
  password text not null
);

alter table public.caf_users enable row level security;

drop policy if exists "allow all - caf_users" on public.caf_users;
create policy "allow all - caf_users" on public.caf_users
  for all using (true) with check (true);
