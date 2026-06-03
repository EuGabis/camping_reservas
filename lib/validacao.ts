import { z } from "zod";
import { ACOMODACOES } from "./precos";

const idsAcomodacao = ACOMODACOES.map((a) => a.id) as [string, ...string[]];
const dataISO = /^\d{4}-\d{2}-\d{2}$/;

export const reservaSchema = z
  .object({
    nome: z.string().trim().min(2, "Informe seu nome.").max(120),
    email: z.string().trim().email("E-mail inválido.").max(180),
    telefone: z
      .string()
      .trim()
      .min(8, "Informe um telefone válido.")
      .max(30)
      .regex(/^[0-9()+\-\s]+$/, "Telefone inválido."),
    acomodacaoId: z.enum(idsAcomodacao),
    checkin: z.string().regex(dataISO, "Data de entrada inválida."),
    checkout: z.string().regex(dataISO, "Data de saída inválida."),
    adultos: z.coerce.number().int().min(1).max(20),
    criancas: z.coerce.number().int().min(0).max(20),
    bebes: z.coerce.number().int().min(0).max(20),
    trailer: z.boolean().default(false),
    observacoes: z.string().trim().max(800).optional().or(z.literal("")),
    // honeypot anti-spam: deve vir vazio
    site: z.string().max(0).optional(),
  })
  .refine(
    (d) => new Date(d.checkout) > new Date(d.checkin),
    { message: "A saída precisa ser depois da entrada.", path: ["checkout"] }
  );

export type ReservaInput = z.infer<typeof reservaSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email().max(180),
  senha: z.string().min(1).max(200),
});
