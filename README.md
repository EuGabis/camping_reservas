# Vapo Camping EcoPark — Site de Reservas

Site institucional + sistema de **pedidos de reserva** para o Vapo Camping EcoPark
(São Roque/SP). Feito em Next.js (App Router), com painel administrativo protegido.

O cliente escolhe modalidade, datas e número de pessoas; o site calcula uma
**estimativa de valor**, salva o pedido no banco e gera um envio pronto pelo
WhatsApp. A confirmação final (disponibilidade + 50% de sinal) é feita pela equipe.

## Stack

- **Next.js 15** (App Router, Route Handlers, Server Actions)
- **TypeScript** + **Tailwind CSS v4**
- **Prisma** + **PostgreSQL** (Supabase ou Neon)
- Autenticação do admin com **JWT em cookie httpOnly** (jose) + senha **bcrypt**
- Validação com **zod**

## Como rodar localmente

1. **Instale as dependências**
   ```bash
   npm install
   ```

2. **Crie o `.env.local`** a partir do exemplo e preencha os valores:
   ```bash
   cp .env.example .env.local
   ```
   - `DATABASE_URL` — string de conexão Postgres (Supabase/Neon).
   - `AUTH_SECRET` — gere com:
     ```bash
     node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
     ```
   - `ADMIN_EMAIL` / `ADMIN_SENHA` — conta inicial do painel (senha forte).
   - `NEXT_PUBLIC_WHATSAPP` — número no formato `5511986659885`.

3. **Crie as tabelas no banco**
   ```bash
   npm run db:push
   ```

4. **Crie o usuário admin**
   ```bash
   npm run seed:admin
   ```

5. **Suba o servidor**
   ```bash
   npm run dev
   ```
   - Site: http://localhost:3000
   - Painel: http://localhost:3000/admin

## Deploy na Vercel

1. Suba o repositório no GitHub e importe na Vercel.
2. Em **Settings → Environment Variables**, adicione as mesmas variáveis do
   `.env.local` (nunca commite o arquivo de segredos).
3. O build roda `prisma generate` automaticamente (script `build`).
4. Rode `npm run db:push` apontando para o banco de produção e `npm run seed:admin`
   uma vez (localmente, com a `DATABASE_URL` de produção) para criar o admin.

## Trocar as fotos

As fotos de demonstração vêm do Unsplash e estão centralizadas em
[`lib/conteudo.ts`](lib/conteudo.ts) (objeto `FOTOS`). Coloque as fotos reais do
camping em `public/fotos/` e troque os caminhos. Depois, remova o domínio do
Unsplash em [`next.config.mjs`](next.config.mjs).

## Onde editar o conteúdo

- **Textos, contato, comodidades, regras, horários** → [`lib/conteudo.ts`](lib/conteudo.ts)
- **Preços e regras de cálculo** → [`lib/precos.ts`](lib/precos.ts)

## Segurança

- Valor da reserva é **recalculado no servidor** (o cliente não define preço).
- Validação de entrada com zod em todas as rotas.
- Cookie de sessão `httpOnly`, `sameSite=lax`, `secure` em produção.
- Honeypot + rate limiting básico no formulário público.
- Cabeçalhos de segurança (X-Frame-Options, nosniff, Referrer-Policy).
- `/admin` bloqueado para indexação (robots).
