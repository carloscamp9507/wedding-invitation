"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      const { data, error } = await getSupabaseClient().auth.getUser();

      if (!isMounted || error || !data.user) {
        return;
      }

      router.replace("/admin/dashboard");
    };

    void checkSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const signInWithGoogle = async () => {
    setIsSigningIn(true);
    setErrorMessage("");

    try {
      const { error } = await getSupabaseClient().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/admin/dashboard`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar sesión. Inténtalo nuevamente."
      );
      setIsSigningIn(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-5 py-12 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl sm:p-10">
        <p className="font-legan text-xs uppercase tracking-[0.35em] text-amber-200">
          Administración
        </p>
        <h1 className="mt-4 font-ovo text-3xl">Panel de los novios</h1>
        <p className="mt-3 text-sm leading-6 text-white/65">
          Inicia sesión con la cuenta autorizada para consultar las respuestas
          de tus invitados.
        </p>

        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={isSigningIn}
          className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-amber-100 disabled:cursor-wait disabled:opacity-60"
        >
          <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.25 5.48-4.72 7.18l7.62 5.91c4.45-4.11 7.14-10.16 7.14-17.56Z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19Z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.9-5.89l-7.62-5.91c-2.12 1.42-4.84 2.27-8.28 2.27-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
            />
          </svg>
          {isSigningIn ? "Redirigiendo a Google..." : "Iniciar sesión con Google"}
        </button>

        {errorMessage && (
          <p role="alert" className="mt-5 text-sm text-red-300">
            {errorMessage}
          </p>
        )}
      </section>
    </main>
  );
}
