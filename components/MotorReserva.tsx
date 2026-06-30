"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const hojeISO = () => {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
};

export default function MotorReserva({
  inicial,
}: {
  inicial?: {
    checkin?: string;
    checkout?: string;
    adultos?: number;
    criancas?: number;
    bebes?: number;
  };
}) {
  const router = useRouter();
  const [checkin, setCheckin] = useState(inicial?.checkin ?? "");
  const [checkout, setCheckout] = useState(inicial?.checkout ?? "");
  const [adultos, setAdultos] = useState(inicial?.adultos ?? 2);
  const [criancas, setCriancas] = useState(inicial?.criancas ?? 0);
  const [bebes, setBebes] = useState(inicial?.bebes ?? 0);
  const [erro, setErro] = useState<string | null>(null);

  function consultar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!checkin || !checkout) {
      setErro("Escolha as datas de entrada e saída.");
      return;
    }
    if (checkout <= checkin) {
      setErro("A data de saída precisa ser depois da entrada.");
      return;
    }
    const q = new URLSearchParams({
      checkin,
      checkout,
      adultos: String(adultos),
      criancas: String(criancas),
      bebes: String(bebes),
    });
    router.push(`/disponibilidade?${q.toString()}`);
  }

  const campo =
    "w-full rounded-xl border border-areia-300 bg-areia-50 px-3 py-2.5 text-sm text-tinta outline-none focus:border-mata-500 focus:ring-2 focus:ring-mata-400/30";
  const rotulo = "mb-1 block text-[11px] font-semibold uppercase tracking-wide text-tinta-suave";

  return (
    <form
      onSubmit={consultar}
      className="rounded-[var(--radius-xl2)] border border-areia-200 bg-white p-4 shadow-xl sm:p-5"
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-[1fr_1fr_auto_auto_auto_auto]">
        <div>
          <label className={rotulo}>Entrada</label>
          <input
            type="date"
            min={hojeISO()}
            value={checkin}
            onChange={(e) => setCheckin(e.target.value)}
            className={campo}
          />
        </div>
        <div>
          <label className={rotulo}>Saída</label>
          <input
            type="date"
            min={checkin || hojeISO()}
            value={checkout}
            onChange={(e) => setCheckout(e.target.value)}
            className={campo}
          />
        </div>
        <div>
          <label className={rotulo}>Adultos</label>
          <select value={adultos} onChange={(e) => setAdultos(+e.target.value)} className={campo}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={rotulo}>Crianças <span className="font-normal normal-case">6–12</span></label>
          <select value={criancas} onChange={(e) => setCriancas(+e.target.value)} className={campo}>
            {Array.from({ length: 11 }, (_, i) => i).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={rotulo}>Bebês <span className="font-normal normal-case">até 5</span></label>
          <select value={bebes} onChange={(e) => setBebes(+e.target.value)} className={campo}>
            {Array.from({ length: 11 }, (_, i) => i).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2 flex items-end lg:col-span-1">
          <button
            type="submit"
            className="w-full rounded-xl bg-terra-500 px-6 py-2.5 text-sm font-semibold text-white shadow transition-transform hover:scale-[1.02] hover:bg-terra-600 lg:h-[42px]"
          >
            Consultar valores
          </button>
        </div>
      </div>
      {erro && <p className="mt-2 text-sm text-terra-600">{erro}</p>}
    </form>
  );
}
