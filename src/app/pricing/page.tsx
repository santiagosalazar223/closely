"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { track } from "@/lib/analytics";
import {
  FiCheck, FiX, FiZap, FiArrowLeft, FiStar, FiShield, FiTrendingUp,
} from "react-icons/fi";

type Audience = "buyer" | "seller";
type Plan = "free" | "pro" | "enterprise";

interface PlanDef {
  id: Plan;
  name: string;
  price: number;
  yearly: number;
  highlight?: boolean;
  badge?: string;
  description: string;
  features: { label: string; included: boolean }[];
  cta: string;
}

const SELLER_PLANS: PlanDef[] = [
  {
    id: "free",
    name: "Starter",
    price: 0,
    yearly: 0,
    description: "Para vendedores que están explorando.",
    features: [
      { label: "1 listing activo", included: true },
      { label: "Foto de portada (1 imagen)", included: true },
      { label: "Recibir mensajes de compradores", included: true },
      { label: "Valoración IA con DCF + múltiplos", included: false },
      { label: "Analytics de tu listing", included: false },
      { label: "Vendedor verificado", included: false },
      { label: "Posición destacada", included: false },
      { label: "Deal room con NDA digital", included: false },
    ],
    cta: "Empezar gratis",
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    yearly: 470,
    highlight: true,
    badge: "Más popular",
    description: "El estándar para vendedores serios.",
    features: [
      { label: "Hasta 5 listings activos", included: true },
      { label: "Galería de fotos ilimitada", included: true },
      { label: "Recibir mensajes ilimitados", included: true },
      { label: "Valoración IA — 3 análisis al mes", included: true },
      { label: "Analytics de cada listing (vistas, saves, leads)", included: true },
      { label: "Insignia de vendedor verificado", included: false },
      { label: "Posición destacada en feed", included: false },
      { label: "Deal room con NDA digital", included: false },
    ],
    cta: "Empezar prueba de 14 días",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 199,
    yearly: 1910,
    description: "Para asesores M&A y portafolios grandes.",
    features: [
      { label: "Listings ilimitados", included: true },
      { label: "Galería de fotos ilimitada", included: true },
      { label: "Recibir mensajes ilimitados", included: true },
      { label: "Valoración IA ilimitada", included: true },
      { label: "Analytics avanzados + exportación", included: true },
      { label: "Insignia de vendedor verificado", included: true },
      { label: "Posición destacada en feed", included: true },
      { label: "Deal room con NDA digital y due diligence", included: true },
    ],
    cta: "Contactar ventas",
  },
];

const BUYER_PLANS: PlanDef[] = [
  {
    id: "free",
    name: "Explorer",
    price: 0,
    yearly: 0,
    description: "Para empezar a explorar oportunidades.",
    features: [
      { label: "Acceso al feed completo", included: true },
      { label: "Guardar negocios favoritos", included: true },
      { label: "Ver datos básicos del negocio", included: true },
      { label: "3 mensajes por mes a vendedores", included: true },
      { label: "Ver datos financieros completos", included: false },
      { label: "Alertas personalizadas por email", included: false },
      { label: "Valoración IA de cualquier listing", included: false },
      { label: "Acceso a deal room con NDA", included: false },
    ],
    cta: "Empezar gratis",
  },
  {
    id: "pro",
    name: "Investor",
    price: 29,
    yearly: 278,
    highlight: true,
    badge: "Más popular",
    description: "Para inversionistas activos.",
    features: [
      { label: "Acceso al feed completo", included: true },
      { label: "Guardar negocios favoritos", included: true },
      { label: "Ver datos financieros completos", included: true },
      { label: "Mensajes ilimitados", included: true },
      { label: "Alertas personalizadas por email", included: true },
      { label: "Valoración IA — 5 análisis al mes", included: true },
      { label: "Insignia de comprador verificado", included: false },
      { label: "Acceso a deal room con NDA", included: false },
    ],
    cta: "Empezar prueba de 14 días",
  },
  {
    id: "enterprise",
    name: "Family Office",
    price: 99,
    yearly: 950,
    description: "Para family offices y fondos de inversión.",
    features: [
      { label: "Todo lo de Investor", included: true },
      { label: "Mensajes ilimitados a vendedores", included: true },
      { label: "Datos financieros + due diligence completo", included: true },
      { label: "Alertas en tiempo real", included: true },
      { label: "Valoración IA ilimitada", included: true },
      { label: "Insignia de comprador verificado", included: true },
      { label: "Acceso a deal room con NDA digital", included: true },
      { label: "Asesor M&A dedicado", included: true },
    ],
    cta: "Contactar ventas",
  },
];

const FAQ = [
  {
    q: "¿Cómo cobra BizSwipe a los vendedores?",
    a: "Cobramos una suscripción mensual o anual según el plan, más una comisión de éxito de 3% sobre el precio final del deal cerrado a través de la plataforma. La comisión solo aplica si el deal se cierra; nunca antes.",
  },
  {
    q: "¿Por qué pagar como comprador?",
    a: "El feed es gratis para todos. Cobramos solo cuando quieres acceso a datos financieros completos, mensajes ilimitados o el deal room con NDA digital. Pago mensual sin compromiso.",
  },
  {
    q: "¿Cómo funciona la valoración IA?",
    a: "Subes los estados financieros de la empresa (PDF, Excel o CSV) y nuestra IA aplica DCF, múltiplos comparables (EV/EBITDA, EV/Revenue) y valoración por activos netos, ajustada por riesgo país LATAM y prima de iliquidez. Recibes un informe en menos de 2 minutos.",
  },
  {
    q: "¿Puedo cancelar en cualquier momento?",
    a: "Sí. Cancelas desde tu dashboard sin preguntas. Mantienes acceso hasta el final del período pagado.",
  },
  {
    q: "¿BizSwipe garantiza la veracidad de los listings?",
    a: "El plan Enterprise incluye verificación de vendedor: validamos identidad, registros mercantiles y cuentas bancarias. Para los demás planes, recomendamos due diligence independiente antes de cerrar cualquier transacción.",
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { isAuthenticated, profile } = useAuth();
  const [audience, setAudience] = useState<Audience>("seller");
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    track("pricing_viewed");
    if (profile?.role) setAudience(profile.role);
  }, [profile?.role]);

  const plans = audience === "seller" ? SELLER_PLANS : BUYER_PLANS;

  const handleUpgrade = (plan: Plan) => {
    track("upgrade_clicked", { plan, audience, billing });
    if (!isAuthenticated) {
      router.push(`/register?plan=${plan}&audience=${audience}`);
      return;
    }
    if (plan === "enterprise") {
      window.location.href = "mailto:ventas@bizswipe.co?subject=Interés%20en%20plan%20Enterprise";
      return;
    }
    router.push(`/dashboard?upgrade=${plan}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-brand-600 to-accent-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
            BizSwipe
          </span>
        </Link>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium"
        >
          <FiArrowLeft size={16} /> Volver
        </button>
      </div>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pt-8 pb-12 text-center">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-brand-100 text-brand-700 mb-4">
          <FiZap size={12} /> Precios transparentes — sin sorpresas
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
          Compra y vende negocios con<br />
          <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
            herramientas de banca de inversión
          </span>
        </h1>
        <p className="text-lg text-gray-600 mt-5 max-w-2xl mx-auto">
          Suscripción mensual o anual. Comisión de éxito del 3% solo cuando cierras un deal.
          Sin tarifas ocultas, sin contratos forzosos.
        </p>

        {/* Audience toggle */}
        <div className="inline-flex items-center bg-gray-100 rounded-full p-1 mt-8">
          <button
            onClick={() => setAudience("seller")}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
              audience === "seller"
                ? "bg-white text-gray-900 shadow"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Soy vendedor
          </button>
          <button
            onClick={() => setAudience("buyer")}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
              audience === "buyer"
                ? "bg-white text-gray-900 shadow"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Soy comprador
          </button>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mt-5 text-sm">
          <span className={billing === "monthly" ? "font-semibold text-gray-900" : "text-gray-400"}>
            Mensual
          </span>
          <button
            onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              billing === "yearly" ? "bg-brand-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                billing === "yearly" ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className={billing === "yearly" ? "font-semibold text-gray-900" : "text-gray-400"}>
            Anual
          </span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
            -20%
          </span>
        </div>
      </section>

      {/* Plans */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const monthlyDisplay = billing === "monthly" ? p.price : Math.round(p.yearly / 12);
            return (
              <div
                key={p.id}
                className={`relative rounded-3xl p-7 flex flex-col transition-all ${
                  p.highlight
                    ? "bg-gradient-to-br from-brand-600 to-accent-600 text-white shadow-2xl scale-105"
                    : "bg-white border border-gray-200 hover:border-gray-300"
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full bg-amber-400 text-amber-900">
                    {p.badge}
                  </span>
                )}

                <h3 className={`text-xl font-bold ${p.highlight ? "text-white" : "text-gray-900"}`}>
                  {p.name}
                </h3>
                <p className={`text-sm mt-1 mb-6 ${p.highlight ? "text-white/80" : "text-gray-500"}`}>
                  {p.description}
                </p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-5xl font-black ${p.highlight ? "text-white" : "text-gray-900"}`}>
                      ${monthlyDisplay}
                    </span>
                    <span className={`text-sm ${p.highlight ? "text-white/80" : "text-gray-500"}`}>
                      USD/mes
                    </span>
                  </div>
                  {billing === "yearly" && p.yearly > 0 && (
                    <p className={`text-xs mt-1 ${p.highlight ? "text-white/70" : "text-gray-400"}`}>
                      Facturado ${p.yearly} USD/año
                    </p>
                  )}
                  {p.price === 0 && (
                    <p className={`text-xs mt-1 ${p.highlight ? "text-white/70" : "text-gray-400"}`}>
                      Para siempre
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleUpgrade(p.id)}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all mb-6 ${
                    p.highlight
                      ? "bg-white text-brand-700 hover:bg-gray-50"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  {p.cta}
                </button>

                <ul className="space-y-3 flex-1">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      {f.included ? (
                        <FiCheck
                          size={16}
                          className={`flex-shrink-0 mt-0.5 ${p.highlight ? "text-emerald-200" : "text-emerald-500"}`}
                        />
                      ) : (
                        <FiX
                          size={16}
                          className={`flex-shrink-0 mt-0.5 ${p.highlight ? "text-white/40" : "text-gray-300"}`}
                        />
                      )}
                      <span
                        className={`${
                          f.included
                            ? p.highlight
                              ? "text-white"
                              : "text-gray-700"
                            : p.highlight
                              ? "text-white/50"
                              : "text-gray-400 line-through"
                        }`}
                      >
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Success fee */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 pb-20">
        <div className="bg-gray-900 rounded-3xl p-8 md:p-12 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 mb-3">
                <FiStar size={12} /> Comisión de éxito
              </span>
              <h2 className="text-3xl font-bold mb-2">3% sobre el deal cerrado</h2>
              <p className="text-gray-300 text-sm max-w-lg">
                Solo cobramos cuando cierras la transacción a través de BizSwipe. Sin éxito,
                sin comisión. Es nuestra forma de alinear incentivos contigo.
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-black text-amber-300">3%</div>
              <p className="text-xs text-gray-400 mt-1">vs. 8-12% de un broker tradicional</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-20">
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiShield className="text-emerald-600" size={18} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Sin contrato forzoso</p>
              <p className="text-xs text-gray-500 mt-0.5">Cancelas cuando quieras desde tu dashboard.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiTrendingUp className="text-brand-600" size={18} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">14 días de prueba gratis</p>
              <p className="text-xs text-gray-500 mt-0.5">En todos los planes Pro. Sin tarjeta de crédito.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiZap className="text-amber-600" size={18} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Activación instantánea</p>
              <p className="text-xs text-gray-500 mt-0.5">Empieza a usar todas las features en menos de 1 minuto.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 md:px-6 pb-24">
        <h2 className="text-3xl font-black text-center text-gray-900 mb-10">
          Preguntas frecuentes
        </h2>
        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <details
              key={i}
              className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 transition-colors"
            >
              <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                <span className="font-semibold text-gray-900">{item.q}</span>
                <span className="text-gray-400 text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 pb-24 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
          ¿Listo para empezar?
        </h2>
        <p className="text-gray-600 mb-8">
          Únete a cientos de emprendedores e inversionistas en LATAM.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/register" className="btn-primary">
            Crear cuenta gratis
          </Link>
          <a href="mailto:hola@bizswipe.co" className="btn-secondary">
            Hablar con ventas
          </a>
        </div>
      </section>
    </div>
  );
}
