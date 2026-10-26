"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient, type Database } from "@/lib/supabase";

type Guest = Database["public"]["Tables"]["invitados"]["Row"];

const ALLOWED_ADMIN_EMAILS = ["carlos.ingsold17@gmail.com","isaacalle10@gmail.com", "alissett7@gmail.com"];

const formatDate = (value: string | null) => {
  if (!value || Number.isNaN(Date.parse(value))) {
    return "—";
  }

  return new Date(value).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getConfirmationStatus = (confirmed: boolean | null) => {
  if (confirmed === true) {
    return "Confirmado";
  }

  if (confirmed === false) {
    return "No asistirá";
  }

  return "Pendiente";
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    const supabase = getSupabaseClient();

    const loadDashboard = async () => {
      try {
        const { data: userData, error: authError } = await supabase.auth.getUser();

        if (!isMounted) {
          return;
        }

        if (authError) {
          throw authError;
        }

        if (!userData.user) {
          router.replace("/admin/login");
          return;
        }

        const email = userData.user.email?.trim().toLowerCase();
        if (!email || !ALLOWED_ADMIN_EMAILS.includes(email)) {
          window.alert("Esta cuenta no tiene permiso para acceder al panel.");
          router.replace("/");
          return;
        }

        const { data, error: queryError } = await supabase
          .from("invitados")
          .select("*")
          .order("nombre", { ascending: true });

        if (queryError) {
          throw queryError;
        }

        if (isMounted) {
          setGuests(data);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar las respuestas de los invitados."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const signOut = async () => {
    const { error } = await getSupabaseClient().auth.signOut();
    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.replace("/admin/login");
  };

  const confirmedGuests = guests.filter((guest) => guest.confirmado === true);
  const confirmedAdults = confirmedGuests.reduce(
    (total, guest) => total + (guest.adultos ?? 0),
    0
  );
  const confirmedChildren = confirmedGuests.reduce(
    (total, guest) => total + (guest.ninos ?? 0),
    0
  );

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-legan text-xs uppercase tracking-[0.35em] text-amber-200">
              Administración
            </p>
            <h1 className="mt-2 font-ovo text-3xl sm:text-4xl">
              Respuestas de invitados
            </h1>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="w-fit rounded-full border border-white/25 px-5 py-2 text-sm transition hover:border-white hover:bg-white hover:text-slate-900"
          >
            Cerrar sesión
          </button>
        </header>

        {isLoading ? (
          <p className="py-16 text-center text-white/70" role="status">
            Verificando acceso y cargando invitados...
          </p>
        ) : errorMessage ? (
          <p
            role="alert"
            className="mt-8 rounded-xl border border-red-300/30 bg-red-300/10 p-4 text-sm text-red-200"
          >
            No se pudo cargar el panel: {errorMessage}
          </p>
        ) : (
          <>
            <section
              aria-label="Resumen de confirmaciones"
              className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              {[
                { label: "Invitaciones", value: guests.length },
                { label: "Confirmadas", value: confirmedGuests.length },
                { label: "Adultos confirmados", value: confirmedAdults },
                { label: "Niños confirmados", value: confirmedChildren },
              ].map((metric) => (
                <article
                  key={metric.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                >
                  <p className="text-sm text-white/60">{metric.label}</p>
                  <p className="mt-2 font-ovo text-3xl text-amber-100">
                    {metric.value}
                  </p>
                </article>
              ))}
            </section>

            <section className="mt-8 overflow-hidden rounded-2xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1250px] border-collapse text-left text-sm">
                  <thead className="bg-white/[0.08] text-xs uppercase tracking-wide text-white/70">
                    <tr>
                      <th scope="col" className="px-4 py-4">Nombre</th>
                      <th scope="col" className="px-4 py-4">Pases asignados</th>
                      <th scope="col" className="px-4 py-4">Adultos</th>
                      <th scope="col" className="px-4 py-4">Niños</th>
                      <th scope="col" className="px-4 py-4">Confirmación</th>
                      <th scope="col" className="px-4 py-4">Asistentes</th>
                      <th scope="col" className="px-4 py-4">Mensaje de bendición</th>
                      <th scope="col" className="px-4 py-4">Pregunta opcional</th>
                      <th scope="col" className="px-4 py-4">Última actualización</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {guests.map((guest) => (
                      <tr key={guest.token} className="align-top hover:bg-white/[0.03]">
                        <td className="px-4 py-4 font-medium">{guest.nombre}</td>
                        <td className="px-4 py-4">{guest.pases}</td>
                        <td className="px-4 py-4">{guest.adultos ?? "—"}</td>
                        <td className="px-4 py-4">{guest.ninos ?? "—"}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs ${
                              guest.confirmado === true
                                ? "bg-emerald-300/15 text-emerald-200"
                                : guest.confirmado === false
                                  ? "bg-red-300/15 text-red-200"
                                  : "bg-amber-200/15 text-amber-100"
                            }`}
                          >
                            {getConfirmationStatus(guest.confirmado)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {guest.asistentes_confirmados ?? "—"}
                        </td>
                        <td className="max-w-xs whitespace-pre-wrap px-4 py-4 text-white/75">
                          {guest.mensaje_bendicion || "—"}
                        </td>
                        <td className="max-w-xs whitespace-pre-wrap px-4 py-4 text-white/75">
                          {guest.pregunta_opcional || "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-white/70">
                          {formatDate(guest.updated_at)}
                        </td>
                      </tr>
                    ))}
                    {guests.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center text-white/60">
                          Aún no hay invitados registrados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
