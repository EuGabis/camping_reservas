// Cria (ou atualiza a senha do) usuário admin a partir do .env.local
// Uso:  npm run seed:admin
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const email = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
const senha = process.env.ADMIN_SENHA ?? "";

if (!email || senha.length < 8) {
  console.error(
    "Defina ADMIN_EMAIL e ADMIN_SENHA (mín. 8 caracteres) no .env.local antes de rodar."
  );
  process.exit(1);
}

const senhaHash = await bcrypt.hash(senha, 12);

const admin = await prisma.admin.upsert({
  where: { email },
  update: { senhaHash },
  create: { email, senhaHash, nome: "Equipe Vapo" },
});

console.log(`✓ Admin pronto: ${admin.email}`);
await prisma.$disconnect();
