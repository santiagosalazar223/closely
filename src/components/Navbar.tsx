"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  FiHome, FiCompass, FiMessageSquare, FiUser, FiPlusCircle,
  FiGrid, FiBell, FiLogOut, FiX, FiZap,
} from "react-icons/fi";

export default function Navbar() {
  const { profile, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  if (isLoading || !profile) return null;

  const isBuyer = profile.role === "buyer";

  const navItems = [
    { href: "/feed", label: "Explorar", icon: FiHome },
    ...(isBuyer
      ? [{ href: "/feed", label: "Descubrir", icon: FiCompass }]
      : [{ href: "/create-listing", label: "Publicar", icon: FiPlusCircle }]
    ),
    { href: "/messages", label: "Mensajes", icon: FiMessageSquare },
    { href: "/dashboard", label: "Dashboard", icon: FiGrid },
    { href: "/profile", label: "Perfil", icon: FiUser },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const avatarUrl = profile.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "U")}&background=6366f1&color=fff&size=80`;

  return (
    <>
      {/* Desktop navbar */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between h-16">
          <Link href="/feed" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-600 to-accent-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
              BizSwipe
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                    ${active ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {/* Role badge */}
            <span className={`hidden lg:flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full ${
              isBuyer ? "bg-brand-100 text-brand-700" : "bg-accent-100 text-accent-700"
            }`}>
              {isBuyer ? "🔍 Comprador" : "🏪 Vendedor"}
            </span>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setShowNotif(!showNotif); setShowUserMenu(false); }}
                className="relative p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <FiBell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {showNotif && (
                <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                    <button onClick={() => setShowNotif(false)} className="text-gray-400 hover:text-gray-600">
                      <FiX size={16} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {[
                      { emoji: "🤝", title: "Nuevo interesado", desc: "Un comprador mostró interés en tu negocio", time: "2h" },
                      { emoji: "💬", title: "Nuevo mensaje", desc: "Tienes un mensaje sin leer", time: "5h" },
                      { emoji: "👁️", title: "Vistas hoy", desc: "15 personas vieron tu negocio", time: "1d" },
                    ].map((n, i) => (
                      <div key={i} className="flex gap-3 p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                        <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-base flex-shrink-0">
                          {n.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{n.title}</p>
                          <p className="text-xs text-gray-500 truncate">{n.desc}</p>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotif(false); }}
                className="flex items-center gap-2 rounded-xl hover:bg-gray-100 p-1 pr-3 transition-colors"
              >
                <img src={avatarUrl} alt={profile.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-200" />
                <span className="text-sm font-medium text-gray-700 hidden lg:block max-w-24 truncate">
                  {profile.name?.split(" ")[0]}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute top-12 right-0 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50">
                  <div className="px-3 py-2 mb-1 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">{profile.name}</p>
                    <p className="text-xs text-gray-400 truncate">{profile.email}</p>
                  </div>
                  <Link href="/profile" onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    <FiUser size={15} /> Mi Perfil
                  </Link>
                  <Link href="/dashboard" onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    <FiGrid size={15} /> Dashboard
                  </Link>
                  <Link href="/pricing" onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-brand-600 hover:bg-brand-50 transition-colors font-medium">
                    <FiZap size={15} /> Mejorar plan
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors mt-1"
                  >
                    <FiLogOut size={15} /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex items-center justify-around h-16 px-2">
          {[
            { href: "/feed", label: "Explorar", icon: FiHome },
            ...(isBuyer ? [] : [{ href: "/create-listing", label: "Publicar", icon: FiPlusCircle }]),
            { href: "/messages", label: "Mensajes", icon: FiMessageSquare },
            { href: "/dashboard", label: "Dashboard", icon: FiGrid },
            { href: "/profile", label: "Perfil", icon: FiUser },
          ].slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                  active ? "text-brand-600" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Icon size={22} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Backdrop for dropdowns */}
      {(showNotif || showUserMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setShowNotif(false); setShowUserMenu(false); }}
        />
      )}

      {/* Spacers */}
      <div className="hidden md:block h-16" />
    </>
  );
}
