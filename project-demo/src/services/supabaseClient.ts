import { createClient, SupabaseClient } from '@supabase/supabase-js';

// As credenciais vêm de variáveis de ambiente definidas no build (.env local,
// ou nos "Secrets" do Google AI Studio / painel da hospedagem em produção).
// Assim a conexão acontece automaticamente sempre que o app abre — o usuário
// nunca precisa colar a URL/chave dentro do app.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        persistSession: false,
      },
    })
  : null;

if (!isSupabaseConfigured && typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.warn(
    '[Supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não configuradas. ' +
      'O app vai operar apenas com armazenamento local até que essas variáveis sejam definidas.'
  );
}
