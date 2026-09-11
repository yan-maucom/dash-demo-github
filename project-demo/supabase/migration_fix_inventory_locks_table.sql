-- ==========================================================================
-- Correção: a tabela de status aberto/fechado do inventário usava uma
-- chave primária composta (room_id + month_year) que podia causar
-- ambiguidade ao salvar. Esta migração recria a tabela com uma chave
-- única simples (sala + mês combinados em uma só coluna "id"), a mesma
-- estratégia já usada nas outras tabelas do app.
--
-- Rodar isto é seguro: a única informação perdida é o status "fechado"
-- que já estava salvo (tudo volta a aparecer como "aberto"), nada do
-- inventário em si é apagado.
-- (SQL Editor -> Create a new snippet -> colar -> Run)
-- ==========================================================================

drop table if exists public.caf_inventory_locks;

create table public.caf_inventory_locks (
  id text primary key,           -- formato: "<room_id>__<month_year>"
  room_id text not null,
  month_year text not null,
  status text not null default 'aberto',
  closed_by text,
  closed_at timestamptz
);

alter table public.caf_inventory_locks enable row level security;

drop policy if exists "allow all - caf_inventory_locks" on public.caf_inventory_locks;
create policy "allow all - caf_inventory_locks" on public.caf_inventory_locks
  for all using (true) with check (true);
