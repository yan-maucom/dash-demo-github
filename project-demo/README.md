# Painel e Indicadores Hospitalar

Painel web de gestão de inventário farmacêutico hospitalar: controle de estoque por sala, comparação físico vs. sistema interno, avaliação de limpeza e organização por checklist, produção mensal de unitarização e importação/exportação via planilha Excel.

> **🎭 Este repositório é uma versão de demonstração**, com dados fictícios e sem conexão com nenhum banco de dados real. Feito para portfólio — a versão de produção roda com um banco privado (Supabase) e dados reais de uma unidade hospitalar.

## ✨ Funcionalidades

- **Múltiplas salas de farmácia** (Unitarização, Controlados, Quimioterápicos, MAVs, Injetáveis, Soros, Multidoses), cada uma com login próprio
- **Grade de inventário estilo planilha**, com lista padrão de medicamentos por sala, suporte a múltiplos lotes por item, alertas de itens zerados/vencendo
- **Importação de planilhas Excel** (modelo oficial hospitalar), com leitura automática de cabeçalho, lote, validade e quantidades
- **Fluxo de efetivação/fechamento**: ao salvar, o inventário do mês é travado — só a chefia pode reabrir para edição
- **Checklist de Limpeza & Organização** (21 itens), com o resultado (Conforme/Não Conforme) calculado automaticamente a partir do checklist, não escolhido manualmente
- **Produção mensal de unitarização**, com gráfico agrupado por medicamento e controle de perdas
- **Dashboard da chefia** com ranking de salas por acurácia, ranking de higiene e indicadores gerais
- **Gestão de usuários e permissões** direto no app (a chefia cria logins e troca senhas)

## 🛠️ Stack Técnica

- **React 19** + **TypeScript**
- **Vite** (build e dev server)
- **Tailwind CSS** (estilização)
- **Supabase** (Postgres + API REST) como banco de dados — opcional nesta demo
- **SheetJS (xlsx)** para leitura/escrita de planilhas Excel
- **Lucide React** (ícones)

## 🎮 Rodando a demonstração

Esta versão **não precisa de nenhuma configuração de banco de dados**. Sem as variáveis de ambiente do Supabase, o app funciona sozinho com dados fictícios guardados no navegador (localStorage).

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173` e entre com:

| Usuário | Senha | Acesso |
|---|---|---|
| `adm` | `adm` | Todas as salas |
| `rafael.andrade` | `demo123` | Só a sala de Unitarização |

## 🔌 Como funciona a conexão com banco de dados (produção)

Na versão real, basta definir duas variáveis de ambiente para o app conectar automaticamente ao Supabase, sem precisar colar nada dentro da interface:

```env
VITE_SUPABASE_URL="https://SEU-PROJETO.supabase.co"
VITE_SUPABASE_ANON_KEY="SUA_CHAVE_PUBLICA"
```

O schema completo das tabelas está em [`supabase/schema.sql`](supabase/schema.sql). Sem essas variáveis, o app detecta automaticamente e cai no modo local/demonstração — é assim que este repositório público funciona, sem expor nenhum dado real.

## 📂 Estrutura do projeto

```
src/
├── components/     # Componentes de UI (grade de inventário, dashboard, modais...)
├── context/        # Estado global (autenticação, inventário)
├── services/        # Integração com Supabase e leitura/escrita de planilhas Excel
├── data/           # Dados de demonstração e catálogos padrão por sala
└── types.ts        # Tipos TypeScript compartilhados
supabase/
├── schema.sql       # Schema completo do banco (para quem quiser rodar sua própria instância)
└── migration_*.sql  # Migrações incrementais
```

## 📝 Licença

Projeto pessoal de portfólio. Sinta-se à vontade para explorar o código.

---

Desenvolvido como parte de um projeto real de gestão hospitalar, adaptado aqui para fins de demonstração.
