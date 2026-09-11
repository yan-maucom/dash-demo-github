-- ==========================================================================
-- Painel de Controle CAF — schema do Supabase
-- Execute este arquivo inteiro no SQL Editor do seu projeto Supabase
-- (Dashboard -> SQL Editor -> New query -> colar -> Run)
-- ==========================================================================

-- --- Inventário mensal por sala -------------------------------------------
create table if not exists public.caf_inventory (
  id text primary key,
  room_id text not null,
  month_year text not null,          -- formato "YYYY-MM"
  code text,
  description text,
  presentation text,
  batch text,
  expiry_date date,
  aghu_qty numeric default 0,
  physical_qty numeric default 0,
  unit text,
  location text,
  min_stock numeric default 0,
  notes text,
  updated_at timestamptz default now(),
  updated_by text
);

create index if not exists caf_inventory_room_month_idx
  on public.caf_inventory (room_id, month_year);

-- --- Status de efetivação do inventário (aberto/fechado) por sala/mês ----
-- Toda vez que o inventário é salvo pelo app, ele fica "fechado"
-- automaticamente. Só a chefia pode reabrir para editar de novo.
create table if not exists public.caf_inventory_locks (
  id text primary key,           -- formato: "<room_id>__<month_year>"
  room_id text not null,
  month_year text not null,
  status text not null default 'aberto',   -- 'aberto' | 'fechado'
  closed_by text,
  closed_at timestamptz
);

-- --- Produção / Unitarização -----------------------------------------------
create table if not exists public.caf_production (
  id text primary key,
  month_year text not null,
  date date,
  medication_code text,
  medication_name text,
  batch_number text,
  source_batch text,
  produced_qty numeric default 0,
  loss_qty numeric default 0,
  loss_reason text,
  operator_name text,
  technician_note text,
  expiry_date date
);

create index if not exists caf_production_month_idx
  on public.caf_production (month_year);

-- --- Avaliação de limpeza e organização (por sala/mês) --------------------
create table if not exists public.caf_hygiene (
  id text primary key,
  room_id text not null,
  month_year text not null,
  status text not null,              -- 'conforme' | 'nao_conforme'
  score numeric default 100,
  evaluator_name text,
  evaluated_at timestamptz default now(),
  checklist jsonb,
  observations text,
  corrective_actions text
);

create index if not exists caf_hygiene_room_month_idx
  on public.caf_hygiene (room_id, month_year);

-- --- Usuários / Logins (gerenciados pela chefia dentro do app) ------------
create table if not exists public.caf_users (
  username text primary key,
  user_id text not null,
  name text not null,
  role text not null,                -- 'chefe' | 'responsavel_sala'
  room_id text,
  password text not null
);

-- --- Catálogo de itens padrão por sala (editável pela chefia no app) ------
create table if not exists public.caf_catalog (
  room_id text not null,
  code text not null,
  description text not null,
  presentation text,
  primary key (room_id, code)
);

-- ==========================================================================
-- Row Level Security
-- ==========================================================================
-- O app hoje usa login próprio (nome + senha fixos no código), não o
-- Supabase Auth — ou seja, todo acesso ao banco acontece com a chave "anon".
-- Para o app funcionar como está, as políticas abaixo liberam leitura e
-- escrita para essa chave. Isso é aceitável para um painel interno, mas
-- significa que qualquer pessoa com a URL + anon key consegue ler/alterar
-- os dados diretamente pela API do Supabase (não só pelo app).
--
-- Se quiser travar isso de verdade mais adiante, o passo natural é migrar
-- o login para o Supabase Auth e trocar estas políticas por regras baseadas
-- em auth.uid() / role do usuário. Posso te ajudar com isso quando quiser.

alter table public.caf_inventory enable row level security;
alter table public.caf_production enable row level security;
alter table public.caf_hygiene enable row level security;
alter table public.caf_users enable row level security;
alter table public.caf_catalog enable row level security;
alter table public.caf_inventory_locks enable row level security;

drop policy if exists "allow all - caf_inventory" on public.caf_inventory;
create policy "allow all - caf_inventory" on public.caf_inventory
  for all using (true) with check (true);

drop policy if exists "allow all - caf_production" on public.caf_production;
create policy "allow all - caf_production" on public.caf_production
  for all using (true) with check (true);

drop policy if exists "allow all - caf_hygiene" on public.caf_hygiene;
create policy "allow all - caf_hygiene" on public.caf_hygiene
  for all using (true) with check (true);

drop policy if exists "allow all - caf_users" on public.caf_users;
create policy "allow all - caf_users" on public.caf_users
  for all using (true) with check (true);

drop policy if exists "allow all - caf_catalog" on public.caf_catalog;
create policy "allow all - caf_catalog" on public.caf_catalog
  for all using (true) with check (true);

drop policy if exists "allow all - caf_inventory_locks" on public.caf_inventory_locks;
create policy "allow all - caf_inventory_locks" on public.caf_inventory_locks
  for all using (true) with check (true);
