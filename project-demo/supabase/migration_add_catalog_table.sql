-- ==========================================================================
-- Migração: tabela de catálogo de itens padrão por sala (editável pela
-- chefia dentro do app — importar planilha / excluir itens).
-- Rode este arquivo se você já tem o banco configurado e só precisa
-- adicionar essa tabela agora.
-- (SQL Editor -> Create a new snippet -> colar -> Run)
-- ==========================================================================

create table if not exists public.caf_catalog (
  room_id text not null,
  code text not null,
  description text not null,
  presentation text,
  primary key (room_id, code)
);

alter table public.caf_catalog enable row level security;

drop policy if exists "allow all - caf_catalog" on public.caf_catalog;
create policy "allow all - caf_catalog" on public.caf_catalog
  for all using (true) with check (true);
