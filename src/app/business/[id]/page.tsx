"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useBusiness, saveBusiness } from "@/lib/hooks/useBusinesses";
import { getOrCreateConversation, sendDirectMessage } from "@/lib/hooks/useMessages";
import { formatCurrency, formatFullCurrency } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  FiArrowLeft, FiHeart, FiBookmark, FiShare2, FiMapPin, FiCalendar,
  FiUsers, FiTrendingUp, FiDollarSign, FiCheckCircle, FiMessageSquare,
  FiExternalLink, FiBarChart2, FiPieChart, FiChevronLeft, FiChevronRight,
  FiSend,
} from "react-icons/fi";

export default function BusinessDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { profile } = useAuth();
  const { business, loading } = useBusiness(String(id));

  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const [contactMsg, setContactMsg] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgSent, setMsgSent] = useState(false);

  const handleSave = async () => {
    if (!profile || !business) return;
    setSaved(!saved);
    await saveBusiness(business.id, profile.id);
  };

  const handleSendMessage = async () => {
    if (!profile || !business || !contactMsg.trim()) return;
    setSendingMsg(true);

    try {
      const convId = await getOrCreateConversation(
        business.id,
        profile.role === "buyer" ? profile.id : business.sellerId,
        profile.role === "seller" ? profile.id : business.sellerId
      );
      if (convId) {
        await sendDirectMessage(convId, profile.id, contactMsg.trim());
        setMsgSent(true);
        setTimeout(() => router.push("/messages"), 1500);
      }
    } catch {
      // Fallback: just redirect to messages
      router.push("/messages");
    } finally {
      setSendingMsg(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-gray-200 rounded-2xl" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiBarChart2 size={28} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Negocio no encontrado</h2>
          <Link href="/feed" className="btn-primary">Volver al feed</Link>
        </div>
      </div>
    );
  }

  const f = business.financials;
  const roi = f.annualProfit > 0 ? ((f.annualProfit / f.askingPrice) * 100).toFixed(1) : "—";
  const payback = f.annualProfit > 0 ? (f.askingPrice / f.annualProfit).toFixed(1) : "—";
  const defaultMsg = `Hola ${business.sellerName}, me interesa mucho "${business.title}". ¿Podríamos agendar una llamada para conocer más detalles?`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Image gallery */}
      <div className="relative bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="relative h-[45vh] md:h-[60vh]">
            <img
              src={business.images[imgIdx]?.url || `https://picsum.photos/1200/600?random=${imgIdx}`}
              alt={business.title}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/1200/600?random=1`; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {business.images.length > 1 && (
              <>
                <button
                  onClick={() => setImgIdx(i => (i - 1 + business.images.length) % business.images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors backdrop-blur-sm"
                >
                  <FiChevronLeft size={22} />
                </button>
                <button
                  onClick={() => setImgIdx(i => (i + 1) % business.images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors backdrop-blur-sm"
                >
                  <FiChevronRight size={22} />
                </button>
              </>
            )}

            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="p-2.5 rounded-full bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm transition-colors"
              >
                <FiArrowLeft size={20} />
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setLiked(!liked)}
                  className={`p-2.5 rounded-full backdrop-blur-sm transition-all ${liked ? "bg-red-500 text-white" : "bg-black/30 text-white hover:bg-black/50"}`}
                >
                  <FiHeart size={20} fill={liked ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={handleSave}
                  className={`p-2.5 rounded-full backdrop-blur-sm transition-all ${saved ? "bg-brand-500 text-white" : "bg-black/30 text-white hover:bg-black/50"}`}
                >
                  <FiBookmark size={20} fill={saved ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={() => navigator.share ? navigator.share({ title: business.title, url: window.location.href }) : navigator.clipboard.writeText(window.location.href)}
                  className="p-2.5 rounded-full bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm transition-colors"
                >
                  <FiShare2 size={20} />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            {business.images.length > 1 && (
              <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                {business.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`w-14 h-10 md:w-16 md:h-12 rounded-lg overflow-hidden border-2 transition-all ${i === imgIdx ? "border-white" : "border-transparent opacity-60 hover:opacity-100"}`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="badge-info">{business.category}</span>
                {business.subcategory && <span className="badge bg-gray-100 text-gray-600">{business.subcategory}</span>}
                {business.percentageForSale < 100 && (
                  <span className="badge-warning">{business.percentageForSale}% en venta</span>
                )}
                {business.featured && <span className="badge bg-amber-100 text-amber-800">⭐ Destacado</span>}
                <span className="badge-success">Activo</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-gray-900 mb-3 leading-tight">{business.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm md:text-base">
                <span className="flex items-center gap-1"><FiMapPin size={15} /> {business.location}</span>
                <span className="flex items-center gap-1"><FiCalendar size={15} /> Fundado en {f.yearEstablished}</span>
                <span className="flex items-center gap-1"><FiUsers size={15} /> {f.employeeCount} empleados</span>
              </div>
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { label: "Precio", value: formatCurrency(f.askingPrice), icon: FiDollarSign, colorClass: "text-brand-600 bg-brand-50", sub: business.percentageForSale < 100 ? `por ${business.percentageForSale}%` : "venta total" },
                { label: "Revenue Anual", value: formatCurrency(f.annualRevenue), icon: FiBarChart2, colorClass: "text-emerald-600 bg-emerald-50", sub: `+${f.revenueGrowth}% YoY` },
                { label: "Ganancia Neta", value: formatCurrency(f.annualProfit), icon: FiPieChart, colorClass: "text-purple-600 bg-purple-50", sub: `${f.profitMargin}% margen` },
                { label: "ROI Estimado", value: `${roi}%`, icon: FiTrendingUp, colorClass: "text-amber-600 bg-amber-50", sub: `${payback} años payback` },
              ].map((m, i) => (
                <div key={i} className="stat-card">
                  <div className={`flex items-center gap-1.5 mb-2`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${m.colorClass}`}>
                      <m.icon size={14} />
                    </div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{m.label}</span>
                  </div>
                  <p className="text-xl md:text-2xl font-black text-gray-900">{m.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{m.sub}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Descripción del Negocio</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm md:text-base">{business.description || business.shortDescription}</p>
            </div>

            {/* Highlights */}
            {business.highlights.length > 0 && (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Highlights</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {business.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl">
                      <FiCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" size={17} />
                      <span className="text-gray-700 text-sm leading-snug">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financial details */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Detalles Financieros</h2>
              <div className="space-y-1">
                {[
                  { label: "Revenue Anual", value: formatFullCurrency(f.annualRevenue) },
                  { label: "Ganancia Neta Anual", value: formatFullCurrency(f.annualProfit) },
                  { label: "Margen de Ganancia", value: `${f.profitMargin}%` },
                  { label: "Crecimiento Anual", value: `+${f.revenueGrowth}%` },
                  { label: "Precio de Venta", value: formatFullCurrency(f.askingPrice) },
                  { label: "Múltiplo (Precio/Ganancia)", value: f.annualProfit > 0 ? `${(f.askingPrice / f.annualProfit).toFixed(1)}x` : "—" },
                  { label: "Múltiplo (Precio/Revenue)", value: f.annualRevenue > 0 ? `${(f.askingPrice / f.annualRevenue).toFixed(1)}x` : "—" },
                  { label: "Año de Fundación", value: f.yearEstablished.toString() },
                  { label: "Empleados", value: f.employeeCount.toString() },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <span className="text-gray-500 text-sm">{item.label}</span>
                    <span className="font-semibold text-gray-900 text-sm">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            {business.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {business.tags.map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* CTA Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-20">
              <div className="text-center mb-5">
                <p className="text-sm text-gray-500 mb-1">Precio de venta</p>
                <p className="text-4xl font-black bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
                  {formatCurrency(f.askingPrice)}
                </p>
                {business.percentageForSale < 100 && (
                  <p className="text-sm text-amber-600 font-medium mt-1">por {business.percentageForSale}% del negocio</p>
                )}
              </div>

              <div className="space-y-3 mb-5">
                {profile && profile.id !== business.sellerId ? (
                  <>
                    <button
                      onClick={() => { setContactMsg(defaultMsg); setShowContact(true); }}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <FiMessageSquare size={18} /> Contactar Vendedor
                    </button>
                    <button className="btn-secondary w-full flex items-center justify-center gap-2">
                      <FiExternalLink size={18} /> Solicitar Data Room
                    </button>
                  </>
                ) : !profile ? (
                  <Link href="/register" className="btn-primary w-full flex items-center justify-center gap-2">
                    <FiMessageSquare size={18} /> Regístrate para contactar
                  </Link>
                ) : (
                  <Link href="/dashboard" className="btn-secondary w-full flex items-center justify-center gap-2">
                    Ver en mi dashboard
                  </Link>
                )}
              </div>

              <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                {[
                  { label: "Revenue/año", value: formatCurrency(f.annualRevenue) },
                  { label: "Ganancia/año", value: formatCurrency(f.annualProfit) },
                  { label: "Margen", value: `${f.profitMargin}%`, color: "text-emerald-600" },
                  { label: "Crecimiento", value: `+${f.revenueGrowth}%`, color: "text-emerald-600" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-gray-500">
                    <span>{item.label}</span>
                    <span className={`font-semibold ${item.color || "text-gray-900"}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Seller card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Vendedor</h3>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={business.sellerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(business.sellerName || "V")}&background=random`}
                  alt={business.sellerName}
                  className="w-12 h-12 rounded-full object-cover border border-gray-100"
                />
                <div>
                  <p className="font-semibold text-gray-900 flex items-center gap-1">
                    {business.sellerName}
                    {business.sellerVerified && <span className="text-brand-500 text-sm">✓</span>}
                  </p>
                  <p className="text-sm text-gray-500">{business.location}</p>
                </div>
              </div>
              {business.sellerVerified && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl text-sm text-emerald-700">
                  <FiCheckCircle size={15} />
                  <span>Identidad y documentos verificados</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Estadísticas del Listing</h3>
              <div className="space-y-2">
                {[
                  { label: "Vistas", value: business.views.toLocaleString() },
                  { label: "Guardados", value: String(business.saves) },
                  { label: "Consultas", value: String(business.inquiries) },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <span className="font-semibold text-sm">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact modal */}
      {showContact && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 md:p-8 animate-slide-up">
            {msgSent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheckCircle size={32} className="text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">¡Mensaje enviado!</h3>
                <p className="text-gray-500 text-sm">Redirigiendo a tus mensajes...</p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Contactar a {business.sellerName}</h2>
                <p className="text-gray-500 text-sm mb-5">Sobre: <span className="font-medium text-gray-700">{business.title}</span></p>
                <textarea
                  className="input-field h-32 resize-none mb-4"
                  value={contactMsg}
                  onChange={e => setContactMsg(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                />
                <div className="flex gap-3">
                  <button onClick={() => setShowContact(false)} className="btn-secondary flex-1">Cancelar</button>
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMsg || !contactMsg.trim()}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {sendingMsg ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <FiSend size={16} />
                    )}
                    Enviar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="h-24 md:hidden" />
    </div>
  );
}
