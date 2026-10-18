import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type Guest = {
  token: string;
  nombre: string;
  pases: number;
  adultos: number | null;
  ninos: number | null;
  confirmado: boolean | null;
  asistentes_confirmados: number | null;
  mensaje_bendicion: string | null;
  pregunta_opcional: string | null;
  link: string;
  updated_at: string | null;
};

export type Database = {
  public: {
    Tables: {
      invitados: {
        Row: Guest;
        Insert: Omit<Guest, "adultos" | "ninos" | "confirmado" | "asistentes_confirmados" | "mensaje_bendicion" | "pregunta_opcional" | "updated_at"> &
          Partial<Pick<Guest, "adultos" | "ninos" | "confirmado" | "asistentes_confirmados" | "mensaje_bendicion" | "pregunta_opcional" | "updated_at">>;
        Update: Partial<Guest>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

let supabaseClient: SupabaseClient<Database> | undefined;

export function getSupabaseClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  if (!supabaseClient) {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(supabaseUrl);
    } catch {
      console.error("[Supabase] NEXT_PUBLIC_SUPABASE_URL no es una URL válida.");
      throw new Error("NEXT_PUBLIC_SUPABASE_URL debe ser una URL absoluta válida.");
    }

    console.info("[Supabase] Inicializando cliente.", {
      protocol: parsedUrl.protocol,
      host: parsedUrl.host,
      basePath: parsedUrl.pathname,
      hasAnonKey: true,
    });

    if (!["https:", "http:"].includes(parsedUrl.protocol)) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL debe usar HTTP o HTTPS.");
    }

    if (parsedUrl.pathname.replace(/\/+$/, "").endsWith("/rest/v1")) {
      console.warn(
        "[Supabase] La URL base ya contiene /rest/v1; se quitará porque el cliente lo agrega automáticamente. Configura NEXT_PUBLIC_SUPABASE_URL con la URL raíz del proyecto."
      );
    }

    const normalizedSupabaseUrl = supabaseUrl
      .replace(/\/rest\/v1\/?$/, "")
      .replace(/\/+$/, "");

    supabaseClient = createClient<Database>(normalizedSupabaseUrl, supabaseAnonKey, {
      global: {
        fetch: async (input, init) => {
          const requestUrl =
            input instanceof Request
              ? new URL(input.url)
              : new URL(input.toString());
          const method = init?.method ?? (input instanceof Request ? input.method : "GET");
          const queryKeys = Array.from(requestUrl.searchParams.keys());
          const startedAt = Date.now();

          console.info("[Supabase] HTTP request started.", {
            method,
            path: requestUrl.pathname,
            queryKeys,
          });

          try {
            const response = await fetch(input, init);
            console.info("[Supabase] HTTP response received.", {
              method,
              path: requestUrl.pathname,
              status: response.status,
              statusText: response.statusText,
              durationMs: Date.now() - startedAt,
            });
            return response;
          } catch (error) {
            console.error("[Supabase] HTTP request failed before a response.", {
              method,
              path: requestUrl.pathname,
              durationMs: Date.now() - startedAt,
              error:
                error instanceof Error
                  ? { name: error.name, message: error.message }
                  : String(error),
            });
            throw error;
          }
        },
      },
    });
  }

  return supabaseClient;
}
