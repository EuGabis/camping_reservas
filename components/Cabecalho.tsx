"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { LOGO } from "@/lib/conteudo";

const LINKS = [
  { href: "#sobre", label: "O parque" },
  { href: "#hospedagem", label: "Hospedagem" },
  { href: "#precos", label: "Preços" },
  { href: "#galeria", label: "Galeria" },
  { href: "#como-chegar", label: "Como chegar" },
];

export default function Cabecalho() {
  const [solido, setSolido] = useState(false);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolido(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solido
          ? "bg-areia-50/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-areia-50/80"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <a
          href="#topo"
          className={`flex items-center gap-2.5 font-display text-lg font-semibold ${
            solido ? "text-mata-800" : "text-areia-50"
          }`}
        >
          <Image
            src={LOGO}
            alt="Vapo Camping EcoPark"
            width={44}
            height={44}
            priority
            className="h-10 w-10 rounded-full shadow-sm ring-1 ring-black/5"
          />
          <span className="hidden sm:inline">Vapo Camping</span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-opacity hover:opacity-70 ${
                solido ? "text-tinta" : "text-areia-50"
              }`}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#reservar"
            className="rounded-full bg-terra-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.03] hover:bg-terra-600"
          >
            Reservar
          </a>
        </nav>

        <button
          onClick={() => setAberto((v) => !v)}
          className={`md:hidden ${solido ? "text-mata-800" : "text-areia-50"}`}
          aria-label="Abrir menu"
          aria-expanded={aberto}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {aberto ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {aberto && (
        <nav className="border-t border-areia-200 bg-areia-50 px-5 py-3 md:hidden">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setAberto(false)}
              className="block py-2 text-tinta"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#reservar"
            onClick={() => setAberto(false)}
            className="mt-2 block rounded-full bg-terra-500 px-5 py-2 text-center font-semibold text-white"
          >
            Reservar
          </a>
        </nav>
      )}
    </header>
  );
}
