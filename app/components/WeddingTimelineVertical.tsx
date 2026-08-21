"use client";

import React from 'react';

export default function WeddingTimelineVertical() {
  const timelineEvents = [
    {
      time: "15:00",
      title: "Ceremonia",
      description: "El inicio de nuestra historia para toda la vida.",
      icon: "",
    },
    {
      time: "16:30",
      title: "Cóctel",
      description: "Un momento para compartir, conversar y brindar.",
      icon: "",
    },
    {
      time: "18:00",
      title: "Recepción",
      description: "La bienvenida oficial al salón y entrada de los novios.",
      icon: "",
    },
    {
      time: "19:30",
      title: "Cena",
      description: "Disfrutaremos de una deliciosa cena juntos.",
      icon: "",
    },
    {
      time: "21:00",
      title: "Fiesta",
      description: "A abrir la pista de baile y celebrar sin parar.",
      icon: "",
    },
  ];

  return (
    <div className="snap-start text-white h-screen flex flex-col justify-center items-center pt-16 pb-16 px-6 relative bg-slate-950">
      <div className="w-full max-w-md mx-auto">

        <h2 className="text-3xl font-ovo text-center uppercase mb-10 tracking-wider">
          Itinerario del Gran Día
        </h2>

        {/* Contenedor principal del Timeline */}
        <div className="relative border-l-2 border-amber-300/40 ml-4 space-y-8 pl-6">
          {timelineEvents.map((item, index) => (
            <div key={index} className="relative group">

              {/* Punto o Nodo en la línea */}
              <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-amber-300 border-4 border-slate-950 shadow-md group-hover:scale-125 transition-transform" />

              {/* Contenido de cada evento */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-lg hover:border-amber-300/30 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-mono font-bold text-amber-300">{item.time}</span>
                  <span className="text-lg">{item.icon}</span>
                </div>

                <h3 className="text-lg font-ovo font-semibold text-white">{item.title}</h3>

                <p className="text-xs font-legan text-white/70 mt-1">{item.description}</p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
