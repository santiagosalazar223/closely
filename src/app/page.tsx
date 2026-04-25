"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/data/mockData";
import { FiArrowRight, FiCheck, FiShield, FiZap, FiTarget, FiTrendingUp, FiUsers } from "react-icons/fi";

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.push("/feed");
  }, [isAuthenticated, isLoading, router]);

  const [activeTab, setActiveTab] = useState<"buyer" | "seller">("buyer");

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
    </div>
  );
  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-brand-900 to-gray-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.3),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(168,85,247,0.3),transparent_50%)]" />
        </div>

        <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-accent-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-2xl font-bold text-white">BizSwipe</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-white/80 hover:text-white font-medium transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/register" className="btn-accent !py-2.5 !px-5 !text-sm">
              Registrarse
            </Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm text-white/80">+2,400 negocios activos en LATAM</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] mb-6">
              Compra, vende e invierte en{" "}
              <span className="gradient-text bg-gradient-to-r from-brand-400 to-accent-400">negocios reales</span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mb-8 leading-relaxed">
              La plataforma líder en Latinoamérica para descubrir oportunidades de inversión en pequeños y medianos
              negocios. Swipea, conecta y cierra deals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="btn-accent !py-4 !px-8 !text-lg flex items-center justify-center gap-2">
                Comenzar Gratis <FiArrowRight />
              </Link>
              <Link href="/feed" className="btn-secondary !py-4 !px-8 !text-lg !bg-white/10 !text-white !border-white/20 hover:!bg-white/20 flex items-center justify-center">
                Explorar Negocios
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {[
              { value: "2,400+", label: "Negocios listados" },
              { value: "$180M+", label: "En transacciones" },
              { value: "15K+", label: "Inversores activos" },
              { value: "12", label: "Países" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-black text-white">{s.value}</p>
                <p className="text-sm text-white/50 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* How it works for both roles */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-4">¿Cómo funciona?</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Ya sea que quieras comprar un negocio o vender el tuyo, te facilitamos todo el proceso
            </p>
          </div>

          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => setActiveTab("buyer")}
              className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                activeTab === "buyer" ? "bg-brand-600 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Quiero Comprar
            </button>
            <button
              onClick={() => setActiveTab("seller")}
              className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                activeTab === "seller" ? "bg-accent-600 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Quiero Vender
            </button>
          </div>

          {activeTab === "buyer" ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: FiTarget, title: "Descubre", desc: "Explora negocios verificados con filtros avanzados o descúbrelos con nuestro modo Swipe tipo Tinder." },
                { icon: FiZap, title: "Conecta", desc: "Muestra tu interés y conecta directamente con vendedores. Accede al data room con información financiera detallada." },
                { icon: FiShield, title: "Cierra el Deal", desc: "Usa nuestras herramientas de due diligence, negocia y cierra la transacción de forma segura." },
              ].map((step, i) => (
                <div key={i} className="text-center p-8 rounded-3xl bg-gray-50 border border-gray-100">
                  <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <step.icon size={28} className="text-brand-600" />
                  </div>
                  <div className="w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-4">
                    {i + 1}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: FiTrendingUp, title: "Lista tu Negocio", desc: "Crea un listing atractivo con fotos, métricas financieras y highlights clave. Nuestro equipo te ayuda a optimizarlo." },
                { icon: FiUsers, title: "Recibe Interesados", desc: "Compradores verificados muestran su interés. Revisa sus perfiles y decide con quién conectar." },
                { icon: FiShield, title: "Cierra la Venta", desc: "Negocia con herramientas integradas, comparte tu data room y cierra la transacción de forma segura." },
              ].map((step, i) => (
                <div key={i} className="text-center p-8 rounded-3xl bg-gray-50 border border-gray-100">
                  <div className="w-16 h-16 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <step.icon size={28} className="text-accent-600" />
                  </div>
                  <div className="w-8 h-8 bg-accent-600 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-4">
                    {i + 1}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-black text-gray-900 mb-4 text-center">Categorías Populares</h2>
          <p className="text-gray-500 text-center mb-12">Encuentra negocios en la industria que más te interese</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href="/feed"
                className="flex flex-col items-center p-6 bg-white rounded-2xl border border-gray-100 card-hover group"
              >
                <span className="text-3xl mb-3">{cat.icon}</span>
                <span className="text-sm font-medium text-gray-700 text-center group-hover:text-brand-600 transition-colors">
                  {cat.name}
                </span>
                <span className="text-xs text-gray-400 mt-1">{cat.count} negocios</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-black text-gray-900 mb-6">
                Transacciones seguras y verificadas
              </h2>
              <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                Cada negocio en nuestra plataforma pasa por un proceso de verificación.
                Protegemos tanto a compradores como vendedores en cada paso del proceso.
              </p>
              <ul className="space-y-4">
                {[
                  "Verificación de identidad y documentos legales",
                  "Data rooms seguros con información financiera",
                  "Sistema de escrow para transacciones",
                  "NDA automáticos para proteger información sensible",
                  "Soporte legal y asesoría en M&A",
                  "Valoraciones profesionales de negocios",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiCheck size={14} className="text-emerald-600" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-brand-50 to-accent-50 rounded-3xl p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-brand-500 to-accent-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <FiShield size={40} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">BizSwipe Protect™</h3>
              <p className="text-gray-500 mb-6">
                Nuestro sistema de protección garantiza transacciones seguras con escrow, verificación de documentos y soporte legal incluido.
              </p>
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div>
                  <p className="text-2xl font-bold text-brand-600">99.8%</p>
                  <p className="text-xs text-gray-500">Tasa de éxito</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-brand-600">$0</p>
                  <p className="text-xs text-gray-500">Fraudes reportados</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-brand-600">48h</p>
                  <p className="text-xs text-gray-500">Verificación</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-brand-600 via-brand-700 to-accent-700">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            ¿Listo para tu próximo deal?
          </h2>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            Únete a miles de emprendedores e inversores que ya están cerrando transacciones en BizSwipe.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-white text-brand-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
              Crear Cuenta Gratis <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-accent-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <span className="text-xl font-bold text-white">BizSwipe</span>
              </div>
              <p className="text-gray-400 text-sm">
                La plataforma líder en LATAM para compraventa de negocios.
              </p>
            </div>
            {[
              { title: "Plataforma", links: ["Explorar", "Descubrir", "Publicar", "Precios"] },
              { title: "Empresa", links: ["Sobre Nosotros", "Blog", "Carreras", "Prensa"] },
              { title: "Legal", links: ["Términos", "Privacidad", "Cookies", "Licencias"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-white font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l}><a href="#" className="text-gray-400 text-sm hover:text-white transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            © 2024 BizSwipe. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
