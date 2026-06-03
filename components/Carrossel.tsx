"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

interface Slide {
  src: string;
  alt: string;
}

export default function Carrossel({
  slides,
  intervalo = 5000,
}: {
  slides: Slide[];
  intervalo?: number;
}) {
  const [atual, setAtual] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = slides.length;

  const proximo = useCallback(() => setAtual((a) => (a + 1) % total), [total]);
  const anterior = useCallback(() => setAtual((a) => (a - 1 + total) % total), [total]);

  const iniciar = useCallback(() => {
    if (total <= 1) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer.current = setInterval(proximo, intervalo);
  }, [proximo, intervalo, total]);

  useEffect(() => {
    iniciar();
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [iniciar]);

  function reiniciar() {
    if (timer.current) clearInterval(timer.current);
    iniciar();
  }

  if (total === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {slides.map((s, i) => (
        <div
          key={s.src}
          className={`absolute inset-0 transition-opacity duration-[1400ms] ease-in-out ${
            i === atual ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== atual}
        >
          <Image
            src={s.src}
            alt={s.alt}
            fill
            priority={i === 0}
            sizes="100vw"
            className="scale-105 object-cover"
          />
        </div>
      ))}

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => { anterior(); reiniciar(); }}
            aria-label="Foto anterior"
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/25 p-2 text-areia-50 backdrop-blur-sm transition hover:bg-black/45 sm:left-6"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button
            type="button"
            onClick={() => { proximo(); reiniciar(); }}
            aria-label="Próxima foto"
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/25 p-2 text-areia-50 backdrop-blur-sm transition hover:bg-black/45 sm:right-6"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>

          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2.5">
            {slides.map((s, i) => (
              <button
                key={"dot" + s.src}
                type="button"
                onClick={() => { setAtual(i); reiniciar(); }}
                aria-label={`Ir para a foto ${i + 1}`}
                aria-current={i === atual}
                className={`h-2.5 rounded-full transition-all ${
                  i === atual ? "w-7 bg-areia-50" : "w-2.5 bg-areia-50/50 hover:bg-areia-50/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
