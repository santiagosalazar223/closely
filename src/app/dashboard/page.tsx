"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import BusinessCard from "@/components/BusinessCard";
import { useAuth } from "@/context/AuthContext";
import { useBusinesses } from "@/lib/hooks/useBusinesses";
import { useConversations } from "@/lib/hooks/useMessages";
import { mockBusinesses, formatCurrency } from "@/data/mockData";
import Link from "next/link";
import {
  FiTrendingUp, FiEye, FiHeart, FiMessageSquare, FiDollarSign,
  FiPlusCircle, FiBarChart2, FiArrowUpRight, FiBookmark,
  FiStar, FiClock, FiEdit, FiTrash2,
} from "react-icons/fi";

export default function DashboardPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const isBuyer = profile?.role === "buyer";

  const { businesses: myListings } = useBusinesses(
    !isBuyer && profile ? { sellerId: profile.id } : {}
  );
  const { conversations } = useConversations(profile?.id);

  // For buyers, show featured businesses as "recommended"
  const recommended = mockBusinesses.slice(0, 3);

  const totalViews = myListings.reduce((sum, b) => sum + b.views, 0);
  const totalSaves = myListings.reduce((sum, b) => sum + b.saves, 0);
  const totalInquiries = myListings.reduce((sum, b) => sum + b.inquiries, 0);
  const totalValue = myListings.reduce((sum, b) => sum + b.financials.askingPrice, 0);
  const unreadMessages = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900">
              {isBuyer ? "Dashboard" : "Mi Panel de Vendedor"}
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Bienvenido, {profile?.name?.split(" ")[0] || ""}
            </p>
          </div>
          {!isBuyer && (
            <Link href="/create-listing" className="btn-primary flex items-center gap-2 self-start sm:self-auto">
              <FiPlusCircle size={18} /> Publicar Negocio
            </Link>
          )}
        </div>

        {/* Stats */}
        {isBuyer ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Guardados", value: "12", icon: FiBookmark, color: "brand" },
              { label: "Matches activos", value: "5", icon: FiHeart, color: "red" },
              { label: "Mensajes", value: String(unreadMessages || conversations.length), icon: FiMessageSquare, color: "purple" },
              { label: "Negocios vistos", value: "47", icon: FiEye, color: "emerald" },
            ].map((stat, i) => (
              <div key={i} className="stat-card">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                    ${stat.color === "brand" ? "bg-brand-100" : stat.color === "red" ? "bg-red-100" : stat.color === "purple" ? "bg-purple-100" : "bg-emerald-100"}`}>
                    <stat.icon size={20} className={
                      stat.color === "brand" ? "text-brand-600" : stat.color === "red" ? "text-red-500" : stat.color === "purple" ? "text-purple-600" : "text-emerald-600"
                    } />
                  </div>
                  <FiArrowUpRight className="text-emerald-500" size={16} />
                </div>
                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Vistas totales", value: totalViews.toLocaleString(), icon: FiEye, color: "brand" },
              { label: "Interesados", value: String(totalInquiries), icon: FiHeart, color: "red" },
              { label: "Mensajes", value: String(unreadMessages || conversations.length), icon: FiMessageSquare, color: "purple" },
              { label: "Valor del portfolio", value: formatCurrency(totalValue), icon: FiDollarSign, color: "emerald" },
            ].map((stat, i) => (
              <div key={i} className="stat-card">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                    ${stat.color === "brand" ? "bg-brand-100" : stat.color === "red" ? "bg-red-100" : stat.color === "purple" ? "bg-purple-100" : "bg-emerald-100"}`}>
                    <stat.icon size={20} className={
                      stat.color === "brand" ? "text-brand-600" : stat.color === "red" ? "text-red-500" : stat.color === "purple" ? "text-purple-600" : "text-emerald-600"
                    } />
                  </div>
                  <FiArrowUpRight className="text-emerald-500" size={16} />
                </div>
                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
          {(isBuyer
            ? [
                { id: "overview", label: "Resumen" },
                { id: "saved", label: "Guardados" },
                { id: "matches", label: "Matches" },
              ]
            : [
                { id: "overview", label: "Resumen" },
                { id: "listings", label: `Mis Negocios${myListings.length ? ` (${myListings.length})` : ""}` },
                { id: "analytics", label: "Analytics" },
              ]
          ).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 md:px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                ${activeTab === tab.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {activeTab === "overview" && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {isBuyer ? (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiStar className="text-amber-500" /> Recomendados para ti
                  </h3>
                  <div className="space-y-4">
                    {recommended.map(biz => (
                      <BusinessCard key={biz.id} business={biz} variant="compact" />
                    ))}
                  </div>
                  <Link href="/feed" className="block mt-5 text-center text-sm text-brand-600 font-medium hover:text-brand-700">
                    Ver más negocios →
                  </Link>
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <FiBarChart2 className="text-brand-600" /> Mis Negocios
                      </h3>
                      <Link href="/create-listing" className="text-xs text-brand-600 font-medium hover:text-brand-700">
                        + Publicar nuevo
                      </Link>
                    </div>
                    {myListings.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <FiPlusCircle size={24} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm mb-3">No tienes negocios publicados aún</p>
                        <Link href="/create-listing" className="btn-primary !py-2 !text-sm">
                          Publicar tu primer negocio
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {myListings.slice(0, 3).map(biz => (
                          <div key={biz.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl group">
                            <img
                              src={biz.images[0]?.url || "https://picsum.photos/80/80"}
                              alt={biz.title}
                              className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 text-sm truncate">{biz.title}</h4>
                              <p className="text-sm text-brand-600 font-medium">{formatCurrency(biz.financials.askingPrice)}</p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                <span className="flex items-center gap-1"><FiEye size={11} /> {biz.views}</span>
                                <span className="flex items-center gap-1"><FiHeart size={11} /> {biz.saves}</span>
                                <span className="flex items-center gap-1"><FiMessageSquare size={11} /> {biz.inquiries}</span>
                              </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                                <FiEdit size={14} />
                              </button>
                            </div>
                            <span className={`badge-success text-[11px] flex-shrink-0 ${biz.status !== "active" ? "!bg-gray-100 !text-gray-600" : ""}`}>
                              {biz.status === "active" ? "Activo" : biz.status === "draft" ? "Borrador" : biz.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Chart placeholder */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FiTrendingUp className="text-emerald-600" /> Vistas esta semana
                    </h3>
                    <div className="h-40 flex items-end gap-2">
                      {[35, 52, 48, 65, 43, 72, 58].map((v, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full bg-gradient-to-t from-brand-500 to-brand-300 rounded-t-lg"
                            style={{ height: `${(v / 72) * 100}%` }}
                          />
                          <span className="text-[9px] text-gray-400">
                            {["L", "M", "X", "J", "V", "S", "D"][i]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Conversations */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiMessageSquare className="text-purple-500" /> Conversaciones
                </h3>
                {conversations.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No hay mensajes aún</p>
                ) : (
                  <div className="space-y-3">
                    {conversations.slice(0, 3).map(conv => (
                      <Link
                        key={conv.id}
                        href="/messages"
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <img
                          src={conv.otherUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.otherUser.name)}`}
                          alt={conv.otherUser.name}
                          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{conv.otherUser.name}</p>
                          <p className="text-xs text-gray-400 truncate">{conv.lastMessage || conv.businessTitle}</p>
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="w-5 h-5 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
                <Link href="/messages" className="block mt-4 text-center text-xs text-brand-600 font-medium hover:text-brand-700">
                  Ver todos los mensajes →
                </Link>
              </div>

              {/* Activity */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiClock className="text-gray-400" /> Actividad reciente
                </h3>
                <div className="space-y-4">
                  {[
                    { text: "Nuevo interesado en tu negocio", time: "2h", dot: "bg-emerald-500" },
                    { text: "Respondieron tu mensaje", time: "5h", dot: "bg-brand-500" },
                    { text: "15 nuevas vistas hoy", time: "1d", dot: "bg-gray-400" },
                    { text: "Tu perfil está activo", time: "3d", dot: "bg-amber-500" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-2 h-2 ${item.dot} rounded-full mt-1.5 flex-shrink-0`} />
                      <div>
                        <p className="text-sm text-gray-700">{item.text}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick links */}
              {!isBuyer && (
                <div className="bg-gradient-to-br from-brand-600 to-accent-600 rounded-2xl p-5 text-white">
                  <h3 className="font-bold mb-3">Acciones rápidas</h3>
                  <div className="space-y-2">
                    <Link href="/create-listing" className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors">
                      <FiPlusCircle size={15} /> Publicar nuevo negocio
                    </Link>
                    <Link href="/profile" className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors">
                      <FiEdit size={15} /> Editar mi perfil
                    </Link>
                    <Link href="/messages" className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors">
                      <FiMessageSquare size={15} /> Ver mensajes
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: My Listings */}
        {activeTab === "listings" && !isBuyer && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Mis Negocios ({myListings.length})</h3>
              <Link href="/create-listing" className="btn-primary !py-2 !text-sm flex items-center gap-2">
                <FiPlusCircle size={15} /> Nuevo
              </Link>
            </div>
            {myListings.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiPlusCircle size={28} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sin negocios publicados</h3>
                <p className="text-gray-500 text-sm mb-6">Publica tu primer negocio y empieza a recibir consultas de compradores.</p>
                <Link href="/create-listing" className="btn-primary">Publicar mi primer negocio</Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {myListings.map(biz => (
                  <BusinessCard key={biz.id} business={biz} variant="grid" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Saved */}
        {activeTab === "saved" && isBuyer && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-5">Negocios Guardados</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {mockBusinesses.slice(0, 3).map(biz => (
                <BusinessCard key={biz.id} business={biz} variant="grid" />
              ))}
            </div>
          </div>
        )}

        {/* Tab: Matches */}
        {activeTab === "matches" && isBuyer && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-5">Tus Matches</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {mockBusinesses.slice(2, 5).map(biz => (
                <BusinessCard key={biz.id} business={biz} variant="grid" />
              ))}
            </div>
          </div>
        )}

        {/* Tab: Analytics */}
        {activeTab === "analytics" && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiBarChart2 size={28} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Analytics avanzados — Próximamente</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Reportes detallados de tráfico, conversiones, comparativas de mercado y más herramientas de análisis.
            </p>
          </div>
        )}
      </div>

      <div className="h-24 md:hidden" />
    </div>
  );
}
