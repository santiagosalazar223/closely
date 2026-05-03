import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Analytics } from "@vercel/analytics/next";
import FeedbackWidget from "@/components/FeedbackWidget";

export const metadata: Metadata = {
  title: "BizSwipe — Compra y Vende Negocios en LATAM",
  description:
    "La plataforma AI-first para comprar, vender e invertir en pequeños y medianos negocios en LATAM. Valoración profesional con IA en menos de 2 minutos.",
  keywords:
    "comprar negocio, vender negocio, inversión, LATAM, M&A, startup, pequeña empresa, valoración empresarial, DCF",
  authors: [{ name: "BizSwipe" }],
  openGraph: {
    title: "BizSwipe — Compra y Vende Negocios con IA",
    description:
      "Marketplace AI-first para M&A en LATAM. Encuentra, valora y cierra deals con herramientas de banca de inversión.",
    type: "website",
    locale: "es_CO",
  },
  twitter: {
    card: "summary_large_image",
    title: "BizSwipe — AI-first M&A Marketplace",
    description: "Compra, vende y valora negocios en LATAM con IA.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#4f46e5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
          <FeedbackWidget />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
