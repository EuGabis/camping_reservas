import { redirect } from "next/navigation";
import { lerSessao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { centavosParaReais } from "@/lib/precos";
import { formatarData } from "@/lib/util";
import { sair, mudarStatus } from "./acoes";
import { StatusReserva } from "@prisma/client";

export const dynamic = "force-dynamic";

const CORES: Record<StatusReserva, string> = {
  PENDENTE: "bg-amber-100 text-amber-800",
  CONFIRMADA: "bg-emerald-100 text-emerald-800",
  CANCELADA: "bg-rose-100 text-rose-700",
  CONCLUIDA: "bg-slate-200 text-slate-700",
};

export default async function PainelAdmin() {
  const sessao = await lerSessao();
  if (!sessao) redirect("/admin/login");

  const reservas = await prisma.reserva.findMany({
    orderBy: { criadoEm: "desc" },
    take: 200,
  });

  const total = reservas.length;
  const pendentes = reservas.filter((r) => r.status === "PENDENTE").length;
  const confirmadas = reservas.filter((r) => r.status === "CONFIRMADA").length;
  const receita = reservas
    .filter((r) => r.status === "CONFIRMADA" || r.status === "CONCLUIDA")
    .reduce((s, r) => s + r.valorEstimado, 0);

  return (
    <main className="min-h-screen bg-areia-100">
      <header className="border-b border-areia-200 bg-areia-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div>
            <p className="font-display text-xl text-mata-800">🌿 Painel · Reservas</p>
            <p className="text-xs text-tinta-suave">{sessao.email}</p>
          </div>
          <form action={sair}>
            <button className="rounded-full border border-areia-300 px-4 py-2 text-sm font-medium text-tinta hover:bg-areia-200">
              Sair
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            ["Pedidos", String(total)],
            ["Pendentes", String(pendentes)],
            ["Confirmadas", String(confirmadas)],
            ["Receita confirmada", centavosParaReais(receita)],
          ].map(([t, v]) => (
            <div key={t} className="rounded-2xl bg-white p-5 ring-1 ring-areia-200">
              <p className="text-sm text-tinta-suave">{t}</p>
              <p className="mt-1 font-display text-2xl font-semibold text-mata-800">{v}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 overflow-x-auto rounded-2xl bg-white ring-1 ring-areia-200">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-areia-200 text-xs uppercase tracking-wide text-tinta-suave">
              <tr>
                <th className="px-4 py-3">Código / Cliente</th>
                <th className="px-4 py-3">Acomodação</th>
                <th className="px-4 py-3">Período</th>
                <th className="px-4 py-3">Pessoas</th>
                <th className="px-4 py-3">Estimativa</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-areia-100">
              {reservas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-tinta-suave">
                    Nenhum pedido ainda. Eles aparecerão aqui assim que chegarem.
                  </td>
                </tr>
              )}
              {reservas.map((r) => (
                <tr key={r.id} className="align-top hover:bg-areia-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-mata-700">{r.codigo}</p>
                    <p className="text-tinta">{r.nome}</p>
                    <p className="text-xs text-tinta-suave">{r.telefone}</p>
                    <p className="text-xs text-tinta-suave">{r.email}</p>
                  </td>
                  <td className="px-4 py-3 text-tinta">{r.acomodacao}</td>
                  <td className="px-4 py-3 text-tinta">
                    {formatarData(r.checkin)} → {formatarData(r.checkout)}
                    <span className="block text-xs text-tinta-suave">{r.noites} noite(s)</span>
                  </td>
                  <td className="px-4 py-3 text-tinta">
                    {r.adultos}A · {r.criancas}C · {r.bebes}B
                    {r.trailer && <span className="block text-xs text-tinta-suave">trailer</span>}
                  </td>
                  <td className="px-4 py-3 font-medium text-tinta">
                    {centavosParaReais(r.valorEstimado)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${CORES[r.status]}`}>
                      {r.status}
                    </span>
                    <form action={mudarStatus} className="mt-2">
                      <input type="hidden" name="id" value={r.id} />
                      <select
                        name="status"
                        defaultValue={r.status}
                        className="rounded-md border border-areia-300 bg-white px-2 py-1 text-xs"
                      >
                        {Object.values(StatusReserva).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button className="ml-1 rounded-md bg-mata-700 px-2 py-1 text-xs font-semibold text-white hover:bg-mata-800">
                        Salvar
                      </button>
                    </form>
                    {r.observacoes && (
                      <p className="mt-2 max-w-[16rem] text-xs italic text-tinta-suave">
                        “{r.observacoes}”
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
