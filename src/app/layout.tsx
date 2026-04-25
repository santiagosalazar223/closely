import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "BizSwipe — Compra y Vende Negocios en LATAM",
  description: "La plataforma líder en Latinoamérica para comprar, vender e invertir en pequeños y medianos negocios. Descubre oportunidades, conecta con compradores y cierra deals.",
  keywords: "comprar negocio, vender negocio, inversión, LATAM, M&A, startup, pequeña empresa",
  authors: [{ name: "BizSwipe" }],
  openGraph: {
    title: "BizSwipe — Compra y Vende Negocios",
    description: "La plataforma líder en LATAM para M&A de pequeñas y medianas empresas.",
    type: "website",
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
        </AuthProvider>
      </body>
    </html>
  );
}
