"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

export interface Foto {
  src: string;
  alt: string;
}

export default function Galeria({
  fotos,
  modo = "mosaico",
  colunas = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  auto = false,
  velocidade = 0.5,
}: {
  fotos: Foto[];
  modo?: "mosaico" | "faixa";
  colunas?: string;
  auto?: boolean; // faixa que desliza sozinha (marquee)
  velocidade?: number; // pixels por frame
}) {
  const [indice, setIndice] = useState<number | null>(null);
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  const total = fotos.length;
  const aberto = indice !== null;

  // ---- Auto-scroll (marquee) para o modo faixa ----
  const trilhoRef = useRef<HTMLDivElement | null>(null);
  const pausaHover = useRef(false);
  const abertoRef = useRef(false);
  useEffect(() => {
    abertoRef.current = aberto;
  }, [aberto]);

  useEffect(() => {
    if (modo !== "faixa" || !auto) return;
    const el = trilhoRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const passo = () => {
      if (!pausaHover.current && !abertoRef.current) {
        el.scrollLeft += velocidade;
        const metade = el.scrollWidth / 2;
        if (metade > 0 && el.scrollLeft >= metade) el.scrollLeft -= metade;
      }
      raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [modo, auto, velocidade]);

  // No marquee, duplicamos a lista para um loop contínuo e sem emendas.
  const itensFaixa = auto ? [...fotos, ...fotos] : fotos;

  const fechar = useCallback(() => setIndice(null), []);
  const prox = useCallback(
    () => setIndice((i) => (i === null ? i : (i + 1) % total)),
    [total]
  );
  const ant = useCallback(
    () => setIndice((i) => (i === null ? i : (i - 1 + total) % total)),
    [total]
  );

  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar();
      else if (e.key === "ArrowRight") prox();
      else if (e.key === "ArrowLeft") ant();
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [aberto, fechar, prox, ant]);

  if (total === 0) return null;

  return (
    <>
      {modo === "mosaico" ? (
        <div className={`grid gap-3 ${colunas}`}>
          {fotos.map((f, i) => (
            <button
              key={f.src}
              type="button"
              onClick={() => setIndice(i)}
              aria-label={`Ampliar: ${f.alt}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-mata-800/10 ring-1 ring-black/5"
            >
              <Image
                src={f.src}
                alt={f.alt}
                fill
                sizes="(max-width:768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-mata-900/0 transition-colors duration-300 group-hover:bg-mata-900/20" />
            </button>
          ))}
        </div>
      ) : (
        <div
          ref={trilhoRef}
          onMouseEnter={() => (pausaHover.current = true)}
          onMouseLeave={() => (pausaHover.current = false)}
          onTouchStart={() => (pausaHover.current = true)}
          onTouchEnd={() => (pausaHover.current = false)}
          className={`flex gap-3 overflow-x-auto px-1 pb-4 ${
            auto ? "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden" : "snap-x snap-mandatory"
          }`}
        >
          {itensFaixa.map((f, i) => (
            <button
              key={`${f.src}-${i}`}
              type="button"
              onClick={() => setIndice(i % total)}
              aria-label={`Ampliar: ${f.alt}`}
              aria-hidden={auto && i >= total}
              className={`group relative aspect-[4/3] w-64 shrink-0 overflow-hidden rounded-2xl bg-mata-800/10 sm:w-80 ${
                auto ? "" : "snap-start"
              }`}
            >
              <Image
                src={f.src}
                alt={f.alt}
                fill
                sizes="320px"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </button>
          ))}
        </div>
      )}

      {aberto &&
        montado &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={fotos[indice!].alt}
            onClick={fechar}
            className="aparece fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-4 backdrop-blur-sm"
          >
            <span className="absolute left-1/2 top-5 -translate-x-1/2 text-sm font-medium text-white/70">
              {indice! + 1} / {total}
            </span>
            <button
              type="button"
              aria-label="Fechar"
              onClick={fechar}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/25"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
            </button>

            {total > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Foto anterior"
                  onClick={(e) => { e.stopPropagation(); ant(); }}
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/25 sm:left-6"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <button
                  type="button"
                  aria-label="Próxima foto"
                  onClick={(e) => { e.stopPropagation(); prox(); }}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/25 sm:right-6"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </>
            )}

            <div className="relative h-[85vh] w-[92vw]" onClick={(e) => e.stopPropagation()}>
              <Image src={fotos[indice!].src} alt={fotos[indice!].alt} fill sizes="100vw" className="object-contain" />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
