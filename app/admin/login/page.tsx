"use client";

import { useActionState } from "react";
import Image from "next/image";
import { LOGO } from "@/lib/conteudo";
import { entrar, type EstadoLogin } from "../acoes";

const inicial: EstadoLogin = {};

export default function LoginAdmin() {
  const [estado, acao, pendente] = useActionState(entrar, inicial);

  return (
    <main className="flex min-h-screen items-center justify-center bg-mata-900 px-5">
      <div className="w-full max-w-sm rounded-xl2 bg-areia-50 p-8 shadow-xl">
        <div className="mb-6 text-center">
          <Image
            src={LOGO}
            alt="Vapo Camping EcoPark"
            width={72}
            height={72}
            className="mx-auto h-[72px] w-[72px] rounded-full shadow"
          />
          <h1 className="mt-3 font-display text-2xl text-mata-800">Painel · Vapo Camping</h1>
          <p className="mt-1 text-sm text-tinta-suave">Acesso restrito à equipe.</p>
        </div>

        <form action={acao} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-tinta">E-mail</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              className="w-full rounded-lg border border-areia-300 bg-white px-3 py-2.5 outline-none focus:border-mata-500 focus:ring-2 focus:ring-mata-400/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-tinta">Senha</label>
            <input
              name="senha"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-areia-300 bg-white px-3 py-2.5 outline-none focus:border-mata-500 focus:ring-2 focus:ring-mata-400/40"
            />
          </div>

          {estado.erro && (
            <p className="rounded-lg bg-terra-500/10 px-3 py-2 text-sm text-terra-600">
              {estado.erro}
            </p>
          )}

          <button
            type="submit"
            disabled={pendente}
            className="w-full rounded-full bg-mata-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-mata-800 disabled:opacity-60"
          >
            {pendente ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
