"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { IoIosArrowUp, IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FaInstagram } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import confetti from "canvas-confetti";
import { useInView } from "react-intersection-observer";
import CountdownTimer from "./Countdown";
import WeddingTimelineVertical from "./WeddingTimelineVertical";
import { config } from "@/lib/config";
import { getSupabaseClient, type Database } from "@/lib/supabase";
import HTMLFlipBook from 'react-pageflip';

type Guest = Database["public"]["Tables"]["invitados"]["Row"];

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return fallback;
};

const WeddingScreen = () => {
  const [fadeClass, setFadeClass] = useState("opacity-0");
  const [isOpen, setIsOpen] = useState(false);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [guestToken, setGuestToken] = useState("");
  const [guestLoading, setGuestLoading] = useState(true);
  const [guestError, setGuestError] = useState("");
  const [isEditingRsvp, setIsEditingRsvp] = useState(true);
  const [attendance, setAttendance] = useState<boolean | null>(null);
  const [blessingMessage, setBlessingMessage] = useState("");
  const [weddingQuestion, setWeddingQuestion] = useState("");
  const [isSavingRsvp, setIsSavingRsvp] = useState(false);
  const [rsvpError, setRsvpError] = useState("");
  const [selectedGalleryPhoto, setSelectedGalleryPhoto] = useState<{
    src: string;
    alt: string;
  } | null>(null);
  const audioRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const token = new URLSearchParams(window.location.search).get("token")?.trim();

    if (!token) {
      setGuestError("No encontramos el token de esta invitación. Abre el enlace personalizado que recibiste.");
      setGuestLoading(false);
      return;
    }

    setGuestToken(token);

    const loadGuest = async () => {
      const startedAt = Date.now();
      console.info("[RSVP] Guest lookup started.", {
        table: "invitados",
        tokenProvided: true,
        tokenLength: token.length,
      });

      try {
        console.info("[RSVP] Building guest lookup query.", {
          operation: "select",
          filterColumn: "token",
          resultMode: "maybeSingle",
        });

        const result = await getSupabaseClient()
          .from("invitados")
          .select("*")
          .eq("token", token)
          .maybeSingle();

        console.info("[RSVP] Guest lookup query completed.", {
          hasData: result.data !== null,
          hasError: result.error !== null,
          durationMs: Date.now() - startedAt,
        });

        if (result.error) {
          console.error("[RSVP] Guest lookup returned a Supabase error.", {
            message: result.error.message,
            code: result.error.code,
            details: result.error.details,
            hint: result.error.hint,
          });
          throw result.error;
        }
        if (!result.data) {
          throw new Error("No encontramos una invitación con ese token.");
        }
        if (cancelled) {
          return;
        }

        setGuest(result.data);
        setAttendance(result.data.confirmado);
        setBlessingMessage(result.data.mensaje_bendicion ?? "");
        setWeddingQuestion(result.data.pregunta_opcional ?? "");
        setIsEditingRsvp(result.data.confirmado === null);
        console.info("[RSVP] Guest lookup succeeded; invitation state populated.", {
          guestFound: true,
          rsvpAlreadySubmitted: result.data.confirmado !== null,
          durationMs: Date.now() - startedAt,
        });
      } catch (error) {
        console.error("[RSVP] Guest lookup failed.", {
          message: getErrorMessage(error, "Unknown error"),
          durationMs: Date.now() - startedAt,
        });
        if (!cancelled) {
          setGuestError(
            getErrorMessage(error, "No se pudieron cargar los datos de la invitación.")
          );
        }
      } finally {
        if (!cancelled) {
          setGuestLoading(false);
        }
      }
    };

    void loadGuest();

    return () => {
      cancelled = true;
    };
  }, []);

  const saveRsvp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!guestToken || attendance === null) {
      setRsvpError("Selecciona si podrás acompañarnos antes de guardar.");
      return;
    }

    setIsSavingRsvp(true);
    setRsvpError("");
    const startedAt = Date.now();

    console.info("[RSVP] Save started.", {
      table: "invitados",
      tokenProvided: true,
      tokenLength: guestToken.length,
      attendance,
      blessingMessageLength: blessingMessage.length,
      weddingQuestionLength: weddingQuestion.length,
      fields: ["confirmado", "mensaje_bendicion", "pregunta_opcional", "updated_at"],
    });

    try {
      console.info("[RSVP] Sending update to Supabase.", {
        operation: "update",
        filterColumn: "token",
      });

      const result = await getSupabaseClient()
        .from("invitados")
        .update({
          confirmado: attendance,
          mensaje_bendicion: blessingMessage,
          pregunta_opcional: weddingQuestion,
          updated_at: new Date().toISOString(),
        })
        .eq("token", guestToken)
        .select("*")
        .single();

      console.info("[RSVP] Update query completed.", {
        hasData: result.data !== null,
        hasError: result.error !== null,
        durationMs: Date.now() - startedAt,
      });

      if (result.error) {
        console.error("[RSVP] Update returned a Supabase error.", {
          message: result.error.message,
          code: result.error.code,
          details: result.error.details,
          hint: result.error.hint,
        });
        throw result.error;
      }

      setGuest(result.data);
      setAttendance(result.data.confirmado);
      setBlessingMessage(result.data.mensaje_bendicion ?? "");
      setWeddingQuestion(result.data.pregunta_opcional ?? "");
      setIsEditingRsvp(false);
      if (attendance && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        confetti({
          particleCount: 130,
          spread: 75,
          origin: { x: window.innerWidth >= 768 ? 0.80 : 0.5, y: window.innerWidth >= 768 ? 0.95 : 0.65 },
          colors: ["#0B1F3A", "#D4AF37", "#F4E7B2"],
          disableForReducedMotion: true,
        });
      }
      console.info("[RSVP] Save succeeded; confirmation view displayed.", {
        durationMs: Date.now() - startedAt,
      });
    } catch (error) {
      console.error("[RSVP] Save failed.", {
        message: getErrorMessage(error, "Unknown error"),
        durationMs: Date.now() - startedAt,
      });
      setRsvpError(
        getErrorMessage(error, "No se pudo guardar tu respuesta. Inténtalo nuevamente.")
      );
    } finally {
      setIsSavingRsvp(false);
    }
  };

  useEffect(() => {
    if (!selectedGalleryPhoto) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedGalleryPhoto(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedGalleryPhoto]);

  // Untuk fade-in pertama kali
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeClass("opacity-100");
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && audioRef.current) {
      // Play music when "Open" is clicked
      (audioRef.current as HTMLAudioElement).play();
    }
  };


  const { ref: mainRef, inView: isMainInView } = useInView({
    threshold: 0.5,
  });

  const { ref: main2Ref, inView: isMain2InView } = useInView({
    threshold: 0.5,
  });

  const { ref: slide1Ref, inView: isSlide1InView } = useInView({
    threshold: 0.5,
  });

  const { ref: slide2Ref, inView: isSlide2InView } = useInView({
    threshold: 0.5,
  });

  const { ref: slide3Ref, inView: isSlide3InView } = useInView({
    threshold: 0.5,
  });

  const { ref: slide4Ref, inView: isSlide4InView } = useInView({
    threshold: 0.5,
  });
  const { ref: slide5Ref, inView: isSlide5InView } = useInView({
    threshold: 0.5,
  });
  const { ref: slide6Ref, inView: isSlide6InView } = useInView({
    threshold: 0.5,
  });
  const { ref: slide7Ref, inView: isSlide7InView } = useInView({
    threshold: 0.5,
  });
  const { ref: slide8Ref, inView: isSlide8InView } = useInView({
    threshold: 0.5,
  });
  const { ref: slide9Ref, inView: isSlide9InView } = useInView({
    threshold: 0.5,
  });
  const { ref: slide10Ref, inView: isSlide10InView } = useInView({
    threshold: 0.5,
  });
  const { ref: parentsRef, inView: isParentsInView } = useInView({
    threshold: 0.5,
  });
  const { ref: slide11Ref, inView: isSlide11InView } = useInView({
    threshold: 0.5,
  });
  const { ref: endRef, inView: isEndInView } = useInView({
    threshold: 0.5,
  });



  useEffect(() => {
    const video = document.querySelector("iframe");
    if (video) {
      if (isSlide8InView) {
        video.src += "&autoplay=1"; // Mulai video
      } else {
        video.src = video.src.replace("&autoplay=1", ""); // Hentikan video
      }
    }
  }, [isSlide8InView]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null);
  const [page, setPage] = useState(0);

  const nextButtonClick = () => {
    bookRef.current?.pageFlip().flipNext();
  };

  const prevButtonClick = () => {
    bookRef.current?.pageFlip().flipPrev();
  };

  return (
    <div
      className={`h-[100dvh] w-screen flex flex-col md:flex-row ${fadeClass} transition-opacity duration-1000`}
    >
      {/* Gambar sisi kiri Wide Untuk Komputer */}
      <div
        className="relative overflow-hidden md:flex justify-center hidden items-end pb-12 w-2/3 h-1/2 md:h-full"
        style={{
          backgroundImage: `url(/foto_1_samping.webp)`, //refer to base 1st photo
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute bottom-0 left-0 w-full h-1/5 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent backdrop-blur-sm transition-opacity duration-500 ease-out" />
          <div className="absolute -top-6 left-0 w-full h-12 bg-gradient-to-t from-black/40 to-transparent blur-2xl opacity-80" />
        </div>

        <div
          className={`absolute bottom-10  z-10 font-ovo text-lg text-white tracking-[5px] uppercase`}
        >
          {config.coupleNames}
        </div>
      </div>

      {/* Konten teks sisi kanan bisa scroll untuk pc */}
      <div className=" md:w-1/3 h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth">
        <div
          id="backgroundWedding"
          className="snap-start  w-full h-screen flex items-center justify-center "
        >
          <div className="text-center p-5 flex flex-col h-full justify-between py-20">
            <div className="mt-10 gap-y-2 md:gap-y-4 flex flex-col">
              <h5
                className={`text-sm font-legan text-white uppercase tracking-wide fadeMain2 ${isMain2InView ? "active" : ""
                  } `}
                ref={main2Ref}
              >
                Wedding of
              </h5>
              <h1
                className={`text-2xl md:text-3xl font-ovo t text-white uppercase fadeMain ${isMainInView ? "active" : ""
                  } `}
                ref={mainRef}
              >
                {config.coupleNames}
              </h1>
              <h5
                className={`text-sm  font-legan text-white uppercase tracking-wide  fadeMain2 ${isMain2InView ? "active" : ""
                  } `}
                ref={main2Ref}
              >
                {new Date(config.eventDate).toLocaleDateString("es-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h5>
              <p className="mt-5 text-xs font-legan uppercase tracking-[0.25em] text-white/80">
                una invitación para
              </p>
              <p className="font-ovo text-lg uppercase tracking-wide text-white">
                {guestLoading ? "Cargando invitado..." : guest?.nombre ?? "Invitado"}
              </p>
              {guest && (
                <p className="text-xs font-legan text-white/80">
                  {guest.pases} {guest.pases === 1 ? "pase reservado" : "pases reservados"}
                </p>
              )}
            </div>
            <div className="mb-10">
              <p className="mt-5 uppercase text-sm font-xs tracking-widest text-white">
                Bienvenidos
              </p>
              {!isOpen ? (
                <button
                  className="animate-bounce  mt-5 px-5 py-1  text-xs border border-white hover:text-white hover:bg-transparent rounded-full bg-white text-black transition"
                  onClick={handleOpen}
                >
                 Abrir Invitación
                </button>
              ) : (
                <IoIosArrowUp
                  stroke="4"
                  className="mx-auto mt-20 animate-upDown text-white"
                />
              )}
            </div>
          </div>
        </div>
        {isOpen && (
          <>
            {/* Slide 1 */}
            <div
              className="text-white h-screen flex items-end md:items-center pt-12 p-5 px-12 snap-start relative overflow-hidden"
              style={{
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%), url(/slide_1.jpeg)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div
                ref={slide1Ref}
                className={`relative z-10 ${isSlide1InView ? "active" : ""} fadeInMove pb-10 md:pb-0 w-full md:max-w-3xl`}
              >
                <h1 className="text-xl md:text-2xl font-ovo tracking-wide text-white uppercase">
                  {config.bibleVerse}
                </h1>
                <p className="text-sm mt-5 font-legan">
                  {config.bibleVerseContent}
                </p>
                <p className="text-6xl mt-5 font-wonder">{config.coupleNames}</p>
              </div>
            </div>
            {/* Slide 2 */}
            <div
              className={`text-white h-screen flex items-end pb-16 px-12 snap-start `}
              style={{
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 80%, transparent 100%), url(/slide_2.jpeg)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Display the content when the button is clicked */}
              <div
                ref={slide2Ref}
                className={` mb-10 fadeInMove ${isSlide2InView ? "active" : ""}  `}
              >
                <p className="font-legan text-sm my-2">El Novio</p>
                <h1 className="text-xl md:text-3xl text-white  font-ovo">
                  {config.groom}
                </h1>
                <h3 className="font-thesignature text-2xl">Acerca de {config.groomNickName},</h3>
                <p className="text-sm mt-5 font-legan text-[#CCCCCC]">
                  {config.groomBio}
                </p>
                <Link
                  href={`https://www.instagram.com/${config.groomInstagram}`}
                  target="_blank"
                  className="cursor-pointer hover:bg-black text-sm rounded-full flex items-center gap-x-2 text-center font-legan mt-5 bg-[#4E4E4E] w-fit px-4 py-2 text-[#CCCCCC]"
                >
                  <FaInstagram /> {config.groomInstagram}
                </Link>
              </div>
            </div>
            {/* Slide 3 */}
            <div
              className="snap-start  text-white h-screen flex items-end pb-16 px-12 "
              style={{
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 80%, transparent 100%), url(/slide_3.jpeg)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div
                ref={slide3Ref}
                className={` mb-10 fadeInMove ${isSlide3InView ? "active" : ""}  `}
              >
                <p className="font-legan text-sm my-2">La Novia</p>
                <h1 className="text-xl md:text-3xl text-white  font-ovo">
                  {config.bride}
                </h1>
                <h3 className="font-thesignature text-2xl">Acerca de {config.brideNickName},</h3>
                <p className="text-sm mt-5 font-legan text-[#CCCCCC]">
                  {config.brideBio}
                </p>
                <Link
                  href={`https://www.instagram.com/${config.brideInstagram}`}
                  target="_blank"
                  className="cursor-pointer hover:bg-black text-sm rounded-full flex items-center gap-x-2 text-center font-legan mt-5 bg-[#4E4E4E] w-fit px-4 py-2 text-[#CCCCCC]"
                >
                  <FaInstagram /> {config.brideInstagram}
                </Link>
              </div>
            </div>
            {/* Slide 4 */}
            <div
              className="snap-start  text-white h-screen pt-8 flex px-12 "
              style={{
                backgroundImage: `url(/slide_4.jpg)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div>
                <h1
                  ref={slide4Ref}
                  className={`text-l md:text-4xl  text-white font-ovo fadeInMove ${isSlide4InView ? " active" : ""
                    }`}
                >
                  Nuestra historia de Amor
                </h1>
                <h3
                  ref={slide4Ref}
                  className={`uppercase font-legan text-xl mt-5 mb-2 fadeInMoveSlow ${isSlide4InView ? " active" : ""
                    }`}
                >
                  {config.timeline_1}
                </h3>
                <p
                  ref={slide4Ref}
                  className={`text-xs font-legan text-white fadeInLeftSlow ${isSlide4InView ? "active" : ""
                    }`}
                >
                  {config.timeline_1_content}
                </p>
                <h3
                  ref={slide4Ref}
                  className={`uppercase font-legan text-xl mt-5 mb-2 fadeInMoveSlow ${isSlide4InView ? " active" : ""
                    }`}
                >
                  {config.timeline_2}
                </h3>
                <p
                  ref={slide4Ref}
                  className={`text-xs font-legan text-white fadeInLeftSlow ${isSlide4InView ? " active" : ""
                    }`}
                >
                  {config.timeline_2_content}
                </p>
                <h3
                  ref={slide4Ref}
                  className={`uppercase font-legan text-xl mt-5 mb-2 fadeInMoveSlow ${isSlide4InView ? " active" : ""
                    }`}
                >
                  {config.timeline_3}
                </h3>
                <p
                  ref={slide4Ref}
                  className={`text-xs font-legan text-white fadeInLeftSlow ${isSlide4InView ? " active" : ""
                    }`}
                >
                  {config.timeline_3_content}
                </p>

                <p
                  ref={slide4Ref}
                  className={`text-sm md:text-base font-legan text-white/90 leading-relaxed max-w-md fadeInLeftSlow ${isSlide4InView ? "active" : ""}
                  `}
                >
                  <span className="block text-s font-ovo mb-2">El amor nunca deja de ser.</span>
                  <span className="block text-xs text-white/70 mb-3">1 Corintios 13:8</span>
                  <span className="block text-xs">Y como un cordón de tres dobleces, caminaremos juntos: <span className="font-ovo">Dios, Erick y Lissett</span>.</span>
                </p>

                <div
                  ref={slide4Ref}
                  className={`relative flex items-center mt-5 fadeInLeft ${isSlide4InView ? " active" : ""
                    }`}
                >
                  <hr className="w-[120px] mx-2 border-t border-gray-300" />
                  <span className="px-2 font-thesignature text-3xl">
                    {config.coupleNames}
                  </span>
                </div>
              </div>
            </div>


            {/* Slide homenaje a los padres */}
            <div
              className="snap-start text-white h-screen flex flex-col justify-center px-6 py-16"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div
                ref={parentsRef}
                className={`w-full fadeInMove ${isParentsInView ? "active" : ""}`}
              >
                <div className="border border-white/40 bg-black/25 backdrop-blur-[1px] p-6 md:p-8 max-w-lg mx-auto text-center text-white relative shadow-2xl">
                  <p className="text-[0.6rem] md:text-[0.7rem] uppercase tracking-[0.28em] font-legan text-white/80">
                    CON LA BENDICIÓN DE DIOS Y NUESTROS PADRES:
                  </p>

                  <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
                    <div className="space-y-3 text-sm md:text-base">
                      <p className="font-ovo text-white/90">Fredy Genaro Calle Santos</p>
                      <p className="font-ovo text-white/90">Carmita Esperanza Herrera Cumbicos</p>
                    </div>

                    <div className="space-y-3 text-sm md:text-base">
                      <p className="font-ovo text-white/90">Lilia Margarita Molina Chávez</p>
                      <p className="font-ovo text-white/90">Diego René Acosta Vallejo</p>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-center">
                    <div className="h-px w-10 bg-white/50" />
                    <p className="px-4 text-[0.6rem] md:text-[0.7rem] uppercase tracking-[0.35em] font-legan text-white/80">
                      NOSOTROS
                    </p>
                    <div className="h-px w-10 bg-white/50" />
                  </div>

                  <h2 className="mt-8 font-serif italic text-4xl md:text-5xl tracking-wide font-light text-white leading-none">
                     {config.coupleNames}
                  </h2>

                  <p className="mt-8 text-[0.62rem] md:text-[0.72rem] uppercase tracking-[0.25em] font-legan text-white/90 leading-relaxed">
                    TENEMOS EL HONOR DE INVITARTE A CELEBRAR NUESTRA BODA
                  </p>
                </div>
              </div>
            </div>


            {/* Slide 5 */}
            <div
              className="snap-start  text-white h-screen flex flex-col items-center px-12 "
              style={{
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%), url(/foto_6.webp)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div
                ref={slide5Ref}
                className={` ${isSlide5InView ? "active" : ""
                  }  fadeInMove flex items-center flex-col pt-32 `}
              >
                <h3 className="uppercase font-legan text-xs tracking-wide mt-5 mb-2">
                  save our date
                </h3>
                <h1 className="text-2xl w-[200px] text-center text-white  font-ovo uppercase">
                  {new Date(config.eventDate).toLocaleDateString("es-US", {
                    weekday: "long",
                  })} <br />  {new Date(config.eventDate).toLocaleDateString("es-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h1>
                {config.holyMatrimony.enabled && (
                  <div className="mt-5 mx-auto flex flex-col items-center">
                    <h3 className="uppercase font-ovo text-sm text-center mt-5 mb-2">
                      Matrimonio <br /> {config.holyMatrimony.time}
                    </h3>
                    <p className="text-sm text-center  font-legan text-white">
                      {config.holyMatrimony.place} <br /> {config.holyMatrimony.place_details}
                    </p>
                    <Link
                      href={config.holyMatrimony.googleMapsLink}
                      target="_blank"
                      className="cursor-pointer hover:text-white/20 text-sm rounded-full flex items-center gap-x-2 text-center font-legan mt-5 bg-[#808080] w-fit px-4 py-2 text-white"
                    >
                      Google Maps
                    </Link>
                  </div>
                )}

                {config.weddingReception.enabled && (
                  <div className="mt-5 mx-auto flex  flex-col items-center">
                    <h3 className="uppercase font-ovo text-sm text-center mt-5 mb-2">
                      Wedding Reception <br /> {config.weddingReception.time}
                    </h3>
                    <p className="text-sm text-center  font-legan text-white">
                      {config.weddingReception.place} <br /> {config.weddingReception.place_details}
                    </p>
                    <Link
                      href={config.weddingReception.googleMapsLink}
                      target="_blank"
                      className="cursor-pointer hover:text-white/20 text-sm rounded-full flex items-center gap-x-2 text-center font-legan mt-5 bg-[#808080] w-fit px-4 py-2 text-white"
                    >
                      Google Maps
                    </Link>
                  </div>
                )}
              </div>
            </div>



            {/* Slide 6 */}
            <div
              className="snap-start  text-white h-screen flex flex-col items-center justify-start pt-16 px-12 "
              style={{
                backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%), url(/slide_6.jpeg)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div
                ref={slide6Ref}
                className={`mt-10  ${isSlide6InView ? "active" : ""
                  }  fadeInMove flex items-center flex-col`}
              >
                <h1 className="text-2xl text-center text-white  font-ovo">
                  SE ACERCA EL GRAN DÍA, ¡NO TE LO PIERDAS!
                </h1>
                {/* Countdown Timer */}
                <CountdownTimer />
              </div>
            </div>

            {/* Slide 7 */}
            {config.livestreaming.enabled && (
              <div
                className="snap-start  text-white h-screen flex flex-col justify-between pt-16 pb-32 px-12 "
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%), url(/foto_1_samping.webp)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <h1
                  ref={slide7Ref}
                  className={`text-2xl text-white  font-ovo fadeInMoveSlow ${isSlide7InView ? "active" : ""
                    }`}
                >
                  JOIN OUR EXCLUSIVE LIVE STREAMING EVENT
                </h1>

                <div
                  className={`mt-5 mx-auto flex flex-col fadeInMove ${isSlide7InView ? "active" : ""
                    }`}
                  ref={slide7Ref}
                >
                  <h3 className="uppercase font-ovo text-sm mt-5 mb-2">
                    {new Date(config.eventDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    <br /> {config.livestreaming.time}
                  </h3>
                  <p className="text-sm font-legan text-white">
                    {config.livestreaming.detail}
                  </p>
                  <Link
                    href={config.livestreaming.link}
                    target="_blank"
                    className="cursor-pointer hover:text-white/20 text-sm rounded-full flex items-center gap-x-2 text-center font-legan mt-5 bg-[#3B3B3B] w-fit px-6 py-2 text-white"
                  >
                    Join Live Streaming
                  </Link>
                </div>
              </div>)}
            {/* SLIDE 8 */}
            {config.prewedding.enabled && (
              <div>
                <div className="snap-start text-white h-screen flex flex-col justify-center items-center pt-16 pb-16 px-8 relative"
                  style={{
                    backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%), url(/slide_8.jpg)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div
                    ref={slide8Ref}
                    className={`${isSlide8InView ? "active" : ""} fadeInMove w-full flex flex-col items-center`}
                  >

                    <div className="flex flex-col items-center my-6">

                      {/* Contenedor del Libro y controles */}
                      <div className="relative w-full max-w-[420px] mx-auto flex items-center justify-center">
                        {/* Botón Anterior */}
                        <button
                          onClick={prevButtonClick}
                          className="absolute left-0 z-10 p-2 bg-white rounded-full shadow-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition flex items-center justify-center md:-left-12"
                          aria-label="Página anterior"
                        >
                          <IoIosArrowBack className="w-5 h-5" />
                        </button>

                        {/* Libro */}
                        <div className="my-2 shadow-2xl rounded-lg overflow-hidden cursor-pointer mx-auto w-full flex justify-center">
                          {/* @ts-expect-error HTMLFlipBook lacks TS types */}
                          <HTMLFlipBook
                            ref={bookRef}
                            width={320}
                            height={450}
                            size="stretch"
                            minWidth={280}
                            maxWidth={400}
                            minHeight={400}
                            maxHeight={600}
                            maxShadowOpacity={0.6}
                            showCover={true}
                            mobileScrollSupport={true}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            onFlip={(e: any) => setPage(e.data)}
                            className="mx-auto"
                          >
                            <div className="bg-white shadow-inner overflow-hidden flex items-center justify-center border-r border-gray-200">
                              <img src="/book/Book_page-0001.jpg" alt="Página 1" className="w-full h-full object-contain select-none" />
                            </div>
                            <div className="bg-white shadow-inner overflow-hidden flex items-center justify-center">
                              <img src="/book/Book_page-0002.jpg" alt="Página 2" className="w-full h-full object-contain select-none" />
                            </div>
                            <div className="bg-white shadow-inner overflow-hidden flex items-center justify-center border-r border-gray-200">
                              <img src="/book/Book_page-0003.jpg" alt="Página 3" className="w-full h-full object-contain select-none" />
                            </div>
                            <div className="bg-white shadow-inner overflow-hidden flex items-center justify-center">
                              <img src="/book/Book_page-0004.jpg" alt="Página 4" className="w-full h-full object-contain select-none" />
                            </div>
                            <div className="bg-white shadow-inner overflow-hidden flex items-center justify-center border-r border-gray-200">
                              <img src="/book/Book_page-0005.jpg" alt="Página 5" className="w-full h-full object-contain select-none" />
                            </div>
                          </HTMLFlipBook>
                        </div>

                        {/* Botón Siguiente */}
                        <button
                          onClick={nextButtonClick}
                          className="absolute right-0 z-10 p-2 bg-white rounded-full shadow-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition flex items-center justify-center md:-right-12"
                          aria-label="Página siguiente"
                        >
                          <IoIosArrowForward className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-center gap-4 md:hidden">
                        <span className="text-sm text-white/80">
                          Página {page + 1}
                        </span>
                      </div>


                      {/* Detalle o firma */}
                      <div className="w-72 transform drop-shadow text-center mt-2">
                        <p className="text-l font-legan text-white/80">
                          {config.prewedding.detail}
                        </p>
                      </div>
                    </div>
                  </div></div></div>
            )}

            {/* SLIDE 9 */}
            <div
              className="snap-start text-white h-screen flex flex-col justify-center items-center pt-16 pb-16 px-8 relative"
              style={{
                backgroundImage: `url(/slide_10.jpg)`, // Cambia por la imagen de fondo que prefieras
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div
                ref={slide10Ref}
                className={`${isSlide10InView ? "active" : ""} fadeInMove w-full max-w-xl text-center`}
              >
                <h1 className="text-3xl font-ovo uppercase tracking-wide mb-4">
                  Lluvia de Sobres
                </h1>

                <p className="text-sm font-legan text-white/90 mb-8 px-4 leading-relaxed">
                  Su presencia es nuestro mejor regalo. Sin embargo, si desean tener un detalle con nosotros para nuestra nueva vida juntos, pueden hacerlo mediante transferencia bancaria.
                </p>

                {/* Tarjetas de cuentas bancarias */}
                <div className="space-y-4 bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl">

                  {/* Banco 1 */}
                  <div className="border-b border-white/20 pb-4">
                    <p className="font-ovo text-lg font-semibold text-amber-200">Banco Pichincha</p>
                    <p className="text-sm font-legan text-white/80 mt-1">Cuenta de Ahorros: <span className="font-mono font-bold text-white">2211492583</span></p>
                    <p className="text-sm font-legan text-white/80">Titular: Erick Isaac Calle Herrera</p>
                    <p className="text-xs font-legan text-white/60 mt-1">CI: 1751578731</p>
                  </div>

                  {/* Banco 2 (Opcional) */}
                  <div>
                    <p className="font-ovo text-lg font-semibold text-amber-200">Banco Guayaquil</p>
                    <p className="text-sm font-legan text-white/80 mt-1">Cuenta de Ahorros: <span className="font-mono font-bold text-white">0987654321</span></p>
                    <p className="text-sm font-legan text-white/80">Titular: Erick Isaac Calle Herrera</p>
                    <p className="text-xs font-legan text-white/60 mt-1">CI: 1751578731</p>
                  </div>

                </div>
              </div>
            </div>

            {/* SLIDE 10 */}
            {config.rsvp.enabled && (
              <div
                className="snap-start min-h-[100svh] text-white flex flex-col justify-center py-6 px-5 md:py-12 md:px-8"
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 70%, transparent 100%), url(/slide_11.webp)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div
                  ref={slide9Ref}
                  className={`mx-auto w-full max-w-lg ${isSlide9InView ? "active" : ""} fadeInMove`}
                >
                  <h3 className="text-2xl text-white font-ovo text-center uppercase md:text-3xl">
                    Confirmación de asistencia
                  </h3>
                  <p className="mt-1 text-center text-xs font-legan text-white/80 md:mt-2 md:text-sm">
                    {config.rsvp.detail}
                  </p>
                  <p className="mt-2 text-center text-[0.7rem] font-legan leading-snug text-white/80 md:mt-4 md:text-xs">
                    Confirma antes del 31 de enero del 2027. Podrás modificar tu respuesta después si cambias de opinión.
                  </p>

                  {guestLoading ? (
                    <p className="mt-6 text-center text-sm text-white/80" role="status">
                      Cargando los datos de tu invitación...
                    </p>
                  ) : guestError ? (
                    <p className="mt-6 text-center text-sm text-red-200" role="alert">
                      {guestError}
                    </p>
                  ) : guest && !isEditingRsvp ? (
                    <div className="mt-4 rounded-2xl border border-white/20 bg-black/45 p-4 text-center backdrop-blur-sm md:mt-8 md:p-6">
                      <p className="text-sm font-ovo md:text-lg">
                        {guest.confirmado
                          ? "¡Nos alegra mucho que nos acompañes en este día tan especial!"
                          : "Nos apena que no puedas acompañarnos este día, ¡te llevaremos en el corazón!"}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setRsvpError("");
                          setIsEditingRsvp(true);
                        }}
                        className="mt-3 rounded-full border border-white/70 px-5 py-2 text-sm transition hover:bg-white hover:text-black md:mt-5"
                      >
                        Modificar mi respuesta
                      </button>
                    </div>
                  ) : guest ? (
                    <form
                      onSubmit={saveRsvp}
                      className="mt-4 space-y-3 rounded-2xl border border-white/20 bg-black/45 p-4 backdrop-blur-sm md:mt-7 md:space-y-5 md:p-5"
                    >
                      <fieldset>
                        <legend className="mb-2 w-full text-center text-sm font-ovo md:mb-3 md:text-base">
                          ¿Podrás acompañarnos?
                        </legend>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            aria-pressed={attendance === true}
                            onClick={() => setAttendance(true)}
                            className={`rounded-full border px-3 py-2 text-xs transition md:px-3 md:py-3 md:text-sm ${
                              attendance === true
                                ? "border-white bg-white text-black"
                                : "border-white/50 text-white hover:bg-white/15"
                            }`}
                          >
                            Sí asistiremos
                          </button>
                          <button
                            type="button"
                            aria-pressed={attendance === false}
                            onClick={() => setAttendance(false)}
                            className={`rounded-full border px-3 py-2 text-xs transition md:px-3 md:py-3 md:text-sm ${
                              attendance === false
                                ? "border-white bg-white text-black"
                                : "border-white/50 text-white hover:bg-white/15"
                            }`}
                          >
                            No podremos
                          </button>
                        </div>
                      </fieldset>

                      <label className="block text-xs font-legan md:text-sm">
                        Mensaje de bendición para los novios
                        <textarea
                          value={blessingMessage}
                          onChange={(event) => setBlessingMessage(event.target.value)}
                          rows={2}
                          maxLength={1000}
                          className="mt-1 w-full rounded-lg border border-white/30 bg-black/40 px-3 py-1.5 text-sm text-white outline-none placeholder:text-white/50 focus:border-white md:mt-2 md:py-2"
                          placeholder="Escribe aquí tu mensaje..."
                        />
                      </label>

                      <label className="block text-xs font-legan md:text-sm">
                        Preguntas de la boda (opcional)
                        <textarea
                          value={weddingQuestion}
                          onChange={(event) => setWeddingQuestion(event.target.value)}
                          rows={1}
                          maxLength={1000}
                          className="mt-1 w-full rounded-lg border border-white/30 bg-black/40 px-3 py-1.5 text-sm text-white outline-none placeholder:text-white/50 focus:border-white md:mt-2 md:py-2"
                          placeholder="¿Tienes alguna pregunta?"
                        />
                      </label>

                      {rsvpError && (
                        <p className="text-center text-sm text-red-200" role="alert">
                          {rsvpError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={isSavingRsvp}
                        className="w-full rounded-full bg-white px-5 py-2.5 font-ovo text-sm text-black transition hover:bg-white/85 disabled:cursor-wait disabled:opacity-60 md:py-3"
                      >
                        {isSavingRsvp ? "Guardando..." : "Guardar mi respuesta"}
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            )}

            {config.rsvp.enabled && (
              <section
                className="snap-start min-h-[100svh] flex items-center justify-center px-6 py-12 text-white"
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 70%, transparent 100%), url(/slide_11.webp)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="mx-auto w-full max-w-lg rounded-2xl border border-white/15 bg-black/40 px-6 py-10 text-center shadow-xl backdrop-blur-sm md:px-10 md:py-14">
                  <p className="font-legan text-xs uppercase tracking-[0.3em] text-amber-200/90">
                    Una nota especial
                  </p>
                  <div className="mx-auto my-5 h-px w-14 bg-amber-200/60" />
                  <h2 className="font-ovo text-2xl uppercase tracking-wide md:text-3xl">
                    Con cariño
                  </h2>
                  <p className="mt-5 text-sm font-legan leading-relaxed text-amber-50/95 md:text-base">
                    Adoramos a tus pequeños, sin embargo, este evento está destinado solo para adultos. ¡Esperando tu comprensión!
                  </p>
                  <p className="mt-5 text-xs font-legan leading-relaxed text-white/75 md:text-sm">
                    Gracias por comprender y ayudarnos a celebrar este día tan especial.
                  </p>
                </div>
              </section>
            )}

            {/* Timing Section */}
            <div
              ref={slide11Ref}
              className={`mb-10  ${isSlide11InView ? "active" : ""} fadeInMove `}
            >
              <WeddingTimelineVertical />
            </div>

            {/* Galería */}
            <section className="snap-start min-h-screen bg-[#f1eee8] px-4 py-12 text-[#302d29] md:px-8">
              <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-4xl flex-col justify-center">
                <div className="mb-6 text-center">
                  <p className="font-legan text-xs uppercase tracking-[0.3em] text-[#8a7d6c]">
                    Nuestros momentos
                  </p>
                  <h2 className="mt-2 font-ovo text-2xl uppercase tracking-wide md:text-3xl">
                    Una historia en imágenes
                  </h2>
                </div>

                <div className="space-y-1 bg-white p-1 shadow-[0_18px_100px_rgba(50,40,30,0.12)]">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedGalleryPhoto({
                        src: "/foto_8.webp",
                        alt: "Retrato de los novios",
                      })
                    }
                    aria-label="Ampliar retrato de los novios"
                    className="group relative block aspect-[4/3] w-full cursor-pointer overflow-hidden bg-[#e9e4dc]"
                  >
                    <Image
                      src="/foto_8.webp"
                      alt="Retrato de los novios"
                      fill
                      sizes="(max-width: 768px) 100vw, 800px"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </button>

                  <div className="grid grid-cols-5 gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedGalleryPhoto({
                          src: "/foto_5.webp",
                          alt: "Un recuerdo especial de los novios",
                        })
                      }
                      aria-label="Ampliar foto de los novios"
                      className="group relative col-span-3 block aspect-[3/4] cursor-pointer overflow-hidden bg-[#e9e4dc]"
                    >
                      <Image
                        src="/foto_5.webp"
                        alt="Un recuerdo especial de los novios"
                        fill
                        sizes="(max-width: 808px) 40vw, 320px"
                        className="object-cover  transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedGalleryPhoto({
                          src: "/foto_9.webp",
                          alt: "Una imagen de nuestra historia",
                        })
                      }
                      aria-label="Ampliar foto de nuestra historia"
                      className="group relative col-span-2 block aspect-[3/4] cursor-pointer overflow-hidden bg-[#e9e4dc]"
                    >
                      <Image
                        src="/foto_9.webp"
                        alt="Una imagen de nuestra historia"
                        fill
                        sizes="(max-width: 768px) 60vw, 480px"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-5 py-5 text-center font-ovo text-sm tracking-[0.35em] text-[#746958]">
                    <span aria-hidden="true" className="h-px w-12 bg-[#d8d0c4]" />
                    <div aria-label="6 de julio de 2024" className="flex flex-col gap-1">
                      <span>27</span>
                      <span>03</span>
                      <span>27</span>
                    </div>
                    <span aria-hidden="true" className="h-px w-12 bg-[#d8d0c4]" />
                  </div>

                  <div className="grid grid-cols-5 gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedGalleryPhoto({
                          src: "/foto_6.webp",
                          alt: "Un momento para recordar",
                        })
                      }
                      aria-label="Ampliar foto de un momento para recordar"
                      className="group relative col-span-3 block aspect-[4/3] cursor-pointer overflow-hidden bg-[#e9e4dc]"
                    >
                      <Image
                        src="/foto_6.webp"
                        alt="Un momento para recordar"
                        fill
                        sizes="(max-width: 768px) 60vw, 480px"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedGalleryPhoto({
                          src: "/slide_5.webp",
                          alt: "Un recuerdo de nuestra historia",
                        })
                      }
                      aria-label="Ampliar recuerdo de nuestra historia"
                      className="group relative col-span-2 block aspect-[2/3] cursor-pointer overflow-hidden bg-[#e9e4dc]"
                    >
                      <Image
                        src="/slide_5.webp"
                        alt="Un recuerdo de nuestra historia"
                        fill
                        sizes="(max-width: 768px) 40vw, 320px"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {selectedGalleryPhoto && (
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Foto ampliada"
                onClick={() => setSelectedGalleryPhoto(null)}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
              >
                <button
                  type="button"
                  onClick={() => setSelectedGalleryPhoto(null)}
                  aria-label="Cerrar foto ampliada"
                  className="absolute right-5 top-4 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-black/40 text-4xl leading-none text-white transition hover:bg-black/70"
                >
                  &times;
                </button>
                <div
                  className="relative h-[80vh] w-[90vw] max-w-6xl animate-[lightbox-enter_250ms_ease-out]"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Image
                    src={selectedGalleryPhoto.src}
                    alt={selectedGalleryPhoto.alt}
                    fill
                    sizes="90vw"
                    className="rounded-lg object-contain"
                  />
                </div>
              </div>
            )}

            {/* SLIDE AKHIR */}
            <div
              className="snap-start text-white h-screen flex flex-col justify-end pt-16 pb-16 px-12 "
              style={{
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%), url(/slide_7.jpeg)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div
                ref={endRef}
                className={` ${isEndInView ? "active" : ""} fadeInMove `}
              >
                <h1 className="text-3xl text-white  font-ovo text-center uppercase">
                  {config.thankyou}
                </h1>

                <div className="mt-5 mx-auto flex flex-col ">
                  <p className="text-sm font-legan text-white text-center">
                    {config.thankyouDetail}
                  </p>
                  <p className="text-sm rounded-full text-center font-ovo mt-5 px-6 py-2 text-white uppercase">
                    {config.coupleNames}
                  </p>
                </div>
              </div>
               <footer className="mt-8 text-center">
                  <p className="text-[0.5rem] uppercase tracking-widest text-white/50">
                    Created By Carlos Campoverde
                  </p>
                </footer>

            </div>

            
          </>
        )}
      </div>
      {/* Audio Element */}
      <audio ref={audioRef} src="/music/wedding_song.mp3" preload="auto" />
    </div>
  );
};

export default WeddingScreen;
