"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { criarSessao, encerrarSessao, lerSessao } from "@/lib/auth";
import { loginSchema } from "@/lib/validacao";
import { StatusReserva } from "@prisma/client";

export interface EstadoLogin {
  erro?: string;
}

export async function entrar(
  _prev: EstadoLogin,
  formData: FormData
): Promise<EstadoLogin> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
  });
  if (!parsed.success) {
    return { erro: "Preencha e-mail e senha corretamente." };
  }

  const admin = await prisma.admin.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });

  // Compara sempre (mesmo sem admin) para não vazar se o e-mail existe.
  const hash = admin?.senhaHash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinv";
  const confere = await bcrypt.compare(parsed.data.senha, hash);

  if (!admin || !confere) {
    return { erro: "E-mail ou senha incorretos." };
  }

  await criarSessao({ sub: admin.id, email: admin.email });
  redirect("/admin");
}

export async function sair(): Promise<void> {
  await encerrarSessao();
  redirect("/admin/login");
}

export async function mudarStatus(formData: FormData): Promise<void> {
  const sessao = await lerSessao();
  if (!sessao) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  const valido = (Object.values(StatusReserva) as string[]).includes(status);
  if (!id || !valido) return;

  await prisma.reserva.update({
    where: { id },
    data: { status: status as StatusReserva },
  });
  revalidatePath("/admin");
}
