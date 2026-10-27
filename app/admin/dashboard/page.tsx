"use client";

import { useEffect, useState, type FormEvent } from "react";
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
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [siteOrigin, setSiteOrigin] = useState("");
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [guestBeingEdited, setGuestBeingEdited] = useState<Guest | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestPasses, setGuestPasses] = useState("1");
  const [guestAdults, setGuestAdults] = useState("1");
  const [guestChildren, setGuestChildren] = useState("0");
  const [isSavingGuest, setIsSavingGuest] = useState(false);
  const [copiedToken, setCopiedToken] = useState("");

  useEffect(() => {
    let isMounted = true;
    const supabase = getSupabaseClient();
    setSiteOrigin(window.location.origin);

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

  const startCreatingGuest = () => {
    setFormMode("create");
    setGuestBeingEdited(null);
    setGuestName("");
    setGuestPasses("1");
    setGuestAdults("1");
    setGuestChildren("0");
    setActionError("");
    setActionMessage("");
  };

  const startEditingGuest = (guest: Guest) => {
    setFormMode("edit");
    setGuestBeingEdited(guest);
    setGuestName(guest.nombre);
    setGuestPasses(String(guest.pases));
    setActionError("");
    setActionMessage("");
  };

  const saveGuest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nombre = guestName.trim();
    const pases = Number(guestPasses);
    const adultos = Number(guestAdults);
    const ninos = Number(guestChildren);

    if (!nombre || !Number.isInteger(pases) || pases < 1) {
      setActionError("Escribe un nombre y asigna al menos un pase.");
      return;
    }

    if (
      formMode === "create" &&
      (!Number.isInteger(adultos) ||
        adultos < 0 ||
        !Number.isInteger(ninos) ||
        ninos < 0 ||
        adultos + ninos !== pases)
    ) {
      setActionError(
        "El número de adultos más el número de niños debe ser igual al total de pases."
      );
      return;
    }

    if (!siteOrigin) {
      setActionError("No se pudo determinar el dominio actual. Recarga el panel e inténtalo nuevamente.");
      return;
    }

    setIsSavingGuest(true);
    setActionError("");
    setActionMessage("");

    try {
      const supabase = getSupabaseClient();
      let savedGuest: Guest;

      if (formMode === "create") {
        const token = crypto.randomUUID();
        const link = `${siteOrigin}/?token=${encodeURIComponent(token)}`;
        const { data, error } = await supabase
          .from("invitados")
          .insert({ token, nombre, pases, adultos, ninos, link })
          .select("*")
          .single();

        if (error) {
          throw error;
        }

        savedGuest = data;
      } else {
        if (!guestBeingEdited) {
          throw new Error("No se encontró el registro que deseas editar.");
        }

        const link = `${siteOrigin}/?token=${encodeURIComponent(guestBeingEdited.token)}`;
        const { data, error } = await supabase
          .from("invitados")
          .update({
            nombre,
            pases,
            link,
            updated_at: new Date().toISOString(),
          })
          .eq("token", guestBeingEdited.token)
          .select("*")
          .single();

        if (error) {
          throw error;
        }

        savedGuest = data;
      }

      setGuests((currentGuests) =>
        [...currentGuests.filter((guest) => guest.token !== savedGuest.token), savedGuest]
          .sort((first, second) => first.nombre.localeCompare(second.nombre, "es"))
      );
      setFormMode(null);
      setGuestBeingEdited(null);
      setActionMessage(
        formMode === "create"
          ? "La invitación se creó correctamente."
          : "La invitación se actualizó correctamente."
      );
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la invitación."
      );
    } finally {
      setIsSavingGuest(false);
    }
  };

  const copyInvitationUrl = async (token: string) => {
    const url = `${siteOrigin}/?token=${encodeURIComponent(token)}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopiedToken(token);
      setActionError("");
      setActionMessage("Enlace copiado al portapapeles.");
    } catch (error) {
      setActionError(
        error instanceof Error
          ? `No se pudo copiar el enlace: ${error.message}`
          : "No se pudo copiar el enlace."
      );
      setActionMessage("");
    }
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

            <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-ovo text-xl">Invitaciones</h2>
                  <p className="mt-1 text-sm text-white/60">
                    Administra los datos y comparte los enlaces personalizados.
                  </p>
                </div>
                {formMode === null && (
                  <button
                    type="button"
                    onClick={startCreatingGuest}
                    className="w-fit rounded-full bg-amber-100 px-5 py-2 text-sm font-medium text-slate-900 transition hover:bg-white"
                  >
                    Crear invitación
                  </button>
                )}
              </div>

              {formMode !== null && (
                <form
                  onSubmit={saveGuest}
                  className="mt-5 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-2 sm:items-end lg:grid-cols-3 2xl:grid-cols-6"
                >
                  <label className="block text-sm text-white/75">
                    Nombre
                    <input
                      autoFocus
                      required
                      value={guestName}
                      onChange={(event) => setGuestName(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-200"
                    />
                  </label>
                  <label className="block text-sm text-white/75">
                    Pases asignados
                    <input
                      required
                      type="number"
                      min="1"
                      step="1"
                      value={guestPasses}
                      onChange={(event) => setGuestPasses(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-200"
                    />
                  </label>
                  {formMode === "create" && (
                    <>
                      <label className="block text-sm text-white/75">
                        Número de adultos
                        <input
                          required
                          type="number"
                          min="0"
                          step="1"
                          value={guestAdults}
                          onChange={(event) => setGuestAdults(event.target.value)}
                          className="mt-2 w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-200"
                        />
                      </label>
                      <label className="block text-sm text-white/75">
                        Número de niños
                        <input
                          required
                          type="number"
                          min="0"
                          step="1"
                          value={guestChildren}
                          onChange={(event) => setGuestChildren(event.target.value)}
                          className="mt-2 w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-200"
                        />
                      </label>
                    </>
                  )}
                  <button
                    type="submit"
                    disabled={isSavingGuest || !siteOrigin}
                    className="rounded-full bg-amber-100 px-5 py-2 text-sm font-medium text-slate-900 transition hover:bg-white disabled:cursor-wait disabled:opacity-60"
                  >
                    {isSavingGuest ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormMode(null);
                      setGuestBeingEdited(null);
                      setActionError("");
                    }}
                    disabled={isSavingGuest}
                    className="rounded-full border border-white/25 px-5 py-2 text-sm transition hover:border-white disabled:opacity-60"
                  >
                    Cancelar
                  </button>
                  {actionError && (
                    <p role="alert" className="text-sm text-red-200 sm:col-span-full">
                      {actionError}
                    </p>
                  )}
                </form>
              )}
              {actionMessage && (
                <p role="status" className="mt-4 text-sm text-emerald-200">
                  {actionMessage}
                </p>
              )}
              {!formMode && actionError && (
                <p role="alert" className="mt-4 text-sm text-red-200">
                  {actionError}
                </p>
              )}
            </section>

            <section className="mt-8 overflow-hidden rounded-2xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1550px] border-collapse text-left text-sm">
                  <thead className="bg-white/[0.08] text-xs uppercase tracking-wide text-white/70">
                    <tr>
                      <th scope="col" className="px-4 py-4">Nombre</th>
                      <th scope="col" className="px-4 py-4">Pases asignados</th>
                      <th scope="col" className="px-4 py-4">Enlace de invitación</th>
                      <th scope="col" className="px-4 py-4">Adultos</th>
                      <th scope="col" className="px-4 py-4">Niños</th>
                      <th scope="col" className="px-4 py-4">Confirmación</th>
                      <th scope="col" className="px-4 py-4">Asistentes</th>
                      <th scope="col" className="px-4 py-4">Mensaje de bendición</th>
                      <th scope="col" className="px-4 py-4">Pregunta opcional</th>
                      <th scope="col" className="px-4 py-4">Última actualización</th>
                      <th scope="col" className="px-4 py-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {guests.map((guest) => (
                      <tr key={guest.token} className="align-top hover:bg-white/[0.03]">
                        <td className="px-4 py-4 font-medium">{guest.nombre}</td>
                        <td className="px-4 py-4">{guest.pases}</td>
                        <td className="px-4 py-4">
                          <div
                            className="max-w-[360px] truncate text-white/75"
                            title={`${siteOrigin}/?token=${encodeURIComponent(guest.token)}`}
                          >
                            {siteOrigin
                              ? `${siteOrigin}/?token=${encodeURIComponent(guest.token)}`
                              : guest.link}
                          </div>
                          <button
                            type="button"
                            onClick={() => void copyInvitationUrl(guest.token)}
                            disabled={!siteOrigin}
                            className="mt-2 rounded-full border border-white/25 px-3 py-1 text-xs transition hover:border-amber-200 hover:text-amber-100 disabled:opacity-50"
                          >
                            {copiedToken === guest.token ? "Copiado" : "Copiar enlace"}
                          </button>
                        </td>
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
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => startEditingGuest(guest)}
                            className="rounded-full border border-white/25 px-3 py-1 text-xs transition hover:border-amber-200 hover:text-amber-100"
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                    {guests.length === 0 && (
                      <tr>
                        <td colSpan={11} className="px-4 py-12 text-center text-white/60">
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
