# Conectar o Supabase automaticamente

Antes o app pedia pra você colar a URL e a chave do Supabase dentro de um
modal (e isso ficava só salvo no localStorage do navegador). Agora a conexão
é automática: as credenciais vêm de variáveis de ambiente, carregadas
sozinhas quando o app abre.

## 1. Crie as tabelas no Supabase (uma vez só)

No dashboard do seu projeto Supabase: **SQL Editor -> New query**, cole todo
o conteúdo de `supabase/schema.sql` e clique em **Run**. Isso cria as tabelas
`caf_inventory`, `caf_production` e `caf_hygiene` com as permissões
necessárias.

## 2. Pegue a URL e a chave anon do seu projeto

No dashboard: **Project Settings -> API**. Você vai precisar de:
- **Project URL** (ex: `https://abcxyz.supabase.co`)
- **anon public key**

## 3. Preencha o `.env`

Já deixei um arquivo `.env` na raiz do projeto. Abra ele e troque os valores:

```
VITE_SUPABASE_URL="https://SEU-PROJETO.supabase.co"
VITE_SUPABASE_ANON_KEY="SUA_CHAVE_ANON_PUBLICA"
```

Rode `npm run dev` (ou `npm run build`) de novo — pronto, o app já conecta
sozinho, sem pedir nada dentro da tela.

## 4. Se for publicar (Google AI Studio, Vercel, Netlify, etc.)

Variáveis de `.env` não vão no build de produção automaticamente em todo
lugar — em produção você cadastra as mesmas duas variáveis no painel de
**Secrets / Environment Variables** da hospedagem:
- No Google AI Studio: painel de **Secrets** do app.
- Na Vercel/Netlify: **Project Settings -> Environment Variables**.

Assim toda vez que o app for aberto (local ou publicado), ele já nasce
conectado — sem depender de ninguém colar a URL/chave manualmente.

## O que muda no funcionamento

- O botão "Supabase" no menu agora só mostra o status da conexão e um botão
  **Testar Conexão** — não existe mais campo para digitar URL/chave.
- Inventário, produção e avaliação de higiene passam a ser lidos e salvos de
  verdade no Supabase (antes só empurrava dados pro banco, mas sempre lia do
  navegador local — então cada computador via dados diferentes).
- Se as variáveis não estiverem definidas, o app continua funcionando 100%
  local (localStorage) como antes, sem quebrar nada.

## Ponto de atenção (segurança)

O login de "chefe" e das salas ainda é o sistema próprio do app (usuário +
senha fixos no código), não o Supabase Auth. Por isso o `schema.sql` libera
leitura/escrita para a chave anon — ok para um painel interno, mas significa
que qualquer pessoa com a URL + anon key acessa a API diretamente. Se quiser
travar isso de verdade, o próximo passo é migrar o login para o Supabase Auth
e trocar as políticas de RLS por regras baseadas no usuário autenticado — me
avise quando quiser fazer essa parte.
