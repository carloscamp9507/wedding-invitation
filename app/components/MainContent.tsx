"use client";

import { useState, useEffect, useRef } from "react";
import { IoIosArrowUp } from "react-icons/io";
import { FaInstagram } from "react-icons/fa";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import CountdownTimer from "./Countdown";
import WeddingTimelineVertical from "./WeddingTimelineVertical";
import { config } from "@/lib/config";
import HTMLFlipBook from 'react-pageflip';

type WeddingScreenProps = {
  name?: string;
};

const WeddingScreen = ({ name }: WeddingScreenProps) => {
  const [fadeClass, setFadeClass] = useState("opacity-0");
  const [isOpen, setIsOpen] = useState(false);
  const audioRef = useRef(null);

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

  return (
    <div
      className={`h-screen w-screen flex flex-col md:flex-row ${fadeClass} transition-opacity duration-1000`}
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
          className=" snap-start  w-full h-screen flex items-center justify-center "
        >
          <div className="text-center p-5 flex flex-col h-full justify-between py-20">
            <div className="gap-y-2 md:gap-y-4 flex flex-col">
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
            </div>
            <div>
              <p className="mt-4 uppercase text-sm font-xs tracking-widest text-white">
                {name ? `Dear ${name},` : "Bienvenidos"}
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
                className={`fadeInMove ${isSlide2InView ? "active" : ""}  `}
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
                className={`fadeInMove ${isSlide3InView ? "active" : ""}  `}
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
                  className={`text-xl md:text-5xl  text-white font-ovo fadeInMove ${isSlide4InView ? " active" : ""
                    }`}
                >
                  A journey in love
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
            {/* Slide 5 */}
            <div
              className="snap-start  text-white h-screen flex flex-col items-center px-12 "
              style={{
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%), url(/slide_5.jpeg)`,
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
                className={` ${isSlide6InView ? "active" : ""
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
    <h1 className="text-3xl text-white font-ovo text-center uppercase mb-6">
      Nuestra Historia antes de la boda
    </h1>

    {/* Contenedor del Libro con efecto de pasar páginas */}
    <div className="my-4 flex justify-center">
      {/* @ts-expect-error HTMLFlipBook lacks TS types */}
      <HTMLFlipBook 
        width={320} 
        height={450} 
        size="stretch"
        minWidth={280}
        maxWidth={400}
        minHeight={400}
        maxHeight={600}
        maxShadowOpacity={0.5}
        showCover={true}
        mobileScrollSupport={true}
        className="shadow-2xl mx-auto"
      >
        <div className="bg-white shadow-inner overflow-hidden flex items-center justify-center">
          <img src="/book/Book_page-0001.jpg" alt="Página 1" className="w-full h-full object-contain select-none pointer-events-none" />
        </div>
        <div className="bg-white shadow-inner overflow-hidden flex items-center justify-center">
          <img src="/book/Book_page-0002.jpg" alt="Página 2" className="w-full h-full object-contain select-none pointer-events-none" />
        </div>
        <div className="bg-white shadow-inner overflow-hidden flex items-center justify-center">
          <img src="/book/Book_page-0003.jpg" alt="Página 3" className="w-full h-full object-contain select-none pointer-events-none" />
        </div>
        <div className="bg-white shadow-inner overflow-hidden flex items-center justify-center">
          <img src="/book/Book_page-0004.jpg" alt="Página 4" className="w-full h-full object-contain select-none pointer-events-none" />
        </div>
        <div className="bg-white shadow-inner overflow-hidden flex items-center justify-center">
          <img src="/book/Book_page-0005.jpg" alt="Página 5" className="w-full h-full object-contain select-none pointer-events-none" />
        </div>
      </HTMLFlipBook>
    </div>

    {/* Detalle o firma */}
    <div className="w-72 transform skew-x-6 drop-shadow text-center mt-2">
      <p className="text-3xl font-thesignature text-white/80">
        {config.prewedding.detail}
      </p>
    </div>
  </div>
</div></div>
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
              className="snap-start text-white h-screen flex flex-col justify-end pt-16 pb-16 px-8"
              style={{
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%), url(/slide_9.jpeg)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div
                ref={slide9Ref}
                className={`${isSlide9InView ? "active" : ""} fadeInMove`}
              >
                <h1 className="text-3xl text-white font-ovo text-center uppercase">
                  Confirmación de asistencia
                </h1>
                <p className="text-sm font-legan text-white/80 text-center">
                {config.rsvp.detail}
                </p>
                  <div className="mt-6 flex flex-col items-center gap-3">
                      <a
                        href={
                          config.rsvp.whatsappGroomNumber
                            ? `https://wa.me/${config.rsvp.whatsappGroomNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `Hola, que alegría! Confirmo mi asistencia a la boda. Los bendigo: ${config.coupleNames}`
                              )}`
                            : `https://wa.me/?text=${encodeURIComponent(
                                `Hola, que alegría! Confirmo mi asistencia a la boda. Los bendigo: ${config.coupleNames}`
                              )}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 hover:bg-green-600 text-white rounded-full px-5 py-3 inline-flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-5 h-5" fill="currentColor" aria-hidden>
                          <path d="M19.11 17.02c-.37-.18-2.17-1.07-2.5-1.19-.33-.12-.57-.18-.81.18-.24.37-.97 1.19-1.19 1.43-.22.24-.44.26-.81.09-.37-.18-1.56-.57-2.97-1.83-1.1-.98-1.84-2.19-2.06-2.56-.22-.37-.02-.57.16-.75.16-.16.37-.42.56-.63.19-.22.25-.37.37-.62.12-.24.06-.45-.03-.63-.09-.18-.81-1.95-1.11-2.67-.29-.69-.59-.6-.81-.61-.22-.01-.47-.01-.72-.01-.24 0-.63.09-.96.45-.33.37-1.26 1.24-1.26 3.03 0 1.78 1.29 3.5 1.47 3.75.18.24 2.54 3.86 6.16 5.41 3.62 1.56 3.62.95 4.27.89.65-.06 2.17-.88 2.48-1.73.31-.85.31-1.57.22-1.73-.09-.16-.33-.26-.7-.45z"/>
                          <path d="M16 4C9.37 4 4 9.37 4 16c0 1.99.52 3.85 1.42 5.47L4 28l6.82-1.36A11.94 11.94 0 0016 28c6.63 0 12-5.37 12-12S22.63 4 16 4zM16 26c-1.7 0-3.31-.36-4.76-1.02l-.34-.16L7 26l1.2-3.06-.14-.35A9.99 9.99 0 016 16c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10z"/>
                        </svg>
                        Confirmar a {config.groomNickName}
                      </a>

                      <a
                        href={
                          config.rsvp.whatsappBrideNumber
                            ? `https://wa.me/${config.rsvp.whatsappBrideNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `Hola, que alegría! Confirmo mi asistencia a la boda. Los bendigo: ${config.coupleNames}`
                              )}`
                            : `https://wa.me/?text=${encodeURIComponent(
                                `Hola, que alegría! Confirmo mi asistencia a la boda. Los bendigo: ${config.coupleNames}`
                              )}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-pink-800 hover:bg-pink-900 text-white rounded-full px-5 py-3 inline-flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-5 h-5" fill="currentColor" aria-hidden>
                          <path d="M19.11 17.02c-.37-.18-2.17-1.07-2.5-1.19-.33-.12-.57-.18-.81.18-.24.37-.97 1.19-1.19 1.43-.22.24-.44.26-.81.09-.37-.18-1.56-.57-2.97-1.83-1.1-.98-1.84-2.19-2.06-2.56-.22-.37-.02-.57.16-.75.16-.16.37-.42.56-.63.19-.22.25-.37.37-.62.12-.24.06-.45-.03-.63-.09-.18-.81-1.95-1.11-2.67-.29-.69-.59-.6-.81-.61-.22-.01-.47-.01-.72-.01-.24 0-.63.09-.96.45-.33.37-1.26 1.24-1.26 3.03 0 1.78 1.29 3.5 1.47 3.75.18.24 2.54 3.86 6.16 5.41 3.62 1.56 3.62.95 4.27.89.65-.06 2.17-.88 2.48-1.73.31-.85.31-1.57.22-1.73-.09-.16-.33-.26-.7-.45z"/>
                          <path d="M16 4C9.37 4 4 9.37 4 16c0 1.99.52 3.85 1.42 5.47L4 28l6.82-1.36A11.94 11.94 0 0016 28c6.63 0 12-5.37 12-12S22.63 4 16 4zM16 26c-1.7 0-3.31-.36-4.76-1.02l-.34-.16L7 26l1.2-3.06-.14-.35A9.99 9.99 0 016 16c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10z"/>
                        </svg>
                        Confirmar a {config.brideNickName}
                      </a>
                  </div>
              </div>
            </div>
            )}

            
            {/* Timing Section */}
            <div
                ref={slide11Ref}
                className={` ${isSlide11InView ? "active" : ""} fadeInMove `}
              >
            <WeddingTimelineVertical />
          </div>
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

              <footer className="flex flex-col items-center mt-8">
                <p className="text-[0.5rem] uppercase text-center">
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
