import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE = "vapo_admin";
const DURACAO = 60 * 60 * 8; // 8 horas

function segredo(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    throw new Error("AUTH_SECRET ausente ou muito curto. Defina em .env.local");
  }
  return new TextEncoder().encode(s);
}

export interface Sessao {
  sub: string; // id do admin
  email: string;
}

export async function criarSessao(dados: Sessao): Promise<void> {
  const token = await new SignJWT({ email: dados.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(dados.sub)
    .setIssuedAt()
    .setExpirationTime(`${DURACAO}s`)
    .sign(segredo());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACAO,
  });
}

export async function lerSessao(): Promise<Sessao | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, segredo());
    return { sub: String(payload.sub), email: String(payload.email) };
  } catch {
    return null;
  }
}

export async function encerrarSessao(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}
