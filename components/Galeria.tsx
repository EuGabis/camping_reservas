"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

export interface Foto {
  src: string;
  alt: string;
}

export default function Galeria({
  fotos,
  modo = "mosaico",
}: {
  fotos: Foto[];
  modo?: "mosaico" | "faixa";
}) {
  const [indice, setIndice] = useState<number | null>(null);
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  const total = fotos.length;
  const aberto = indice !== null;

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

  // padrão "bento": algumas fotos ocupam mais espaço, criando ritmo visual
  const destaque = (i: number) => {
    const m = i % 7;
    if (m === 0) return "col-span-2 row-span-2";
    if (m === 4) return "row-span-2";
    return "";
  };

  return (
    <>
      {modo === "mosaico" ? (
        <div className="grid auto-rows-[140px] grid-cols-2 gap-3 sm:auto-rows-[170px] md:grid-cols-3 lg:grid-cols-4">
          {fotos.map((f, i) => (
            <button
              key={f.src}
              type="button"
              onClick={() => setIndice(i)}
              aria-label={`Ampliar: ${f.alt}`}
              className={`group relative overflow-hidden rounded-2xl bg-mata-800/10 ${destaque(i)}`}
            >
              <Image
                src={f.src}
                alt={f.alt}
                fill
                sizes="(max-width:768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <span className="absolute inset-0 bg-mata-900/0 transition-colors duration-300 group-hover:bg-mata-900/25" />
            </button>
          ))}
        </div>
      ) : (
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-4">
          {fotos.map((f, i) => (
            <button
              key={f.src}
              type="button"
              onClick={() => setIndice(i)}
              aria-label={`Ampliar: ${f.alt}`}
              className="group relative aspect-[4/3] w-64 shrink-0 snap-start overflow-hidden rounded-2xl bg-mata-800/10 sm:w-80"
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
