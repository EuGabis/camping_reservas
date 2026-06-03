import type { Metadata, Viewport } from "next";
import { Fraunces, Figtree } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--fonte-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const corpo = Figtree({
  subsets: ["latin"],
  variable: "--fonte-corpo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vapocamping.com.br"),
  title: {
    default: "Vapo Camping EcoPark — Camping e hospedagem em São Roque (SP)",
    template: "%s · Vapo Camping EcoPark",
  },
  description:
    "Um refúgio na mata nativa de São Roque, a 60 km de São Paulo. Camping, hotel de barracas e pousada com lagos, trilha e cascata. Faça seu pedido de reserva.",
  keywords: [
    "camping São Roque",
    "camping perto de São Paulo",
    "ecopark",
    "hospedagem na natureza",
    "Estrada do Vinho",
  ],
  openGraph: {
    title: "Vapo Camping EcoPark",
    description:
      "Camping, hotel de barracas e pousada em meio à mata nativa de São Roque (SP).",
    type: "website",
    locale: "pt_BR",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/logo.png", apple: "/logo.png" },
};

export const viewport: Viewport = {
  themeColor: "#1d3a26",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${corpo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
