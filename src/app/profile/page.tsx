"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { CATEGORIES } from "@/data/mockData";
import {
  FiUser, FiMapPin, FiEdit3, FiCheckCircle, FiShield,
  FiDollarSign, FiBriefcase, FiCamera, FiSave, FiLogOut,
  FiPhone, FiLink, FiArrowRight,
} from "react-icons/fi";

export default function ProfilePage() {
  const { profile, logout, updateProfile } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [form, setForm] = useState({
    name: profile?.name || "",
    bio: profile?.bio || "",
    location: profile?.location || "",
    phone: profile?.phone || "",
    linkedin_url: profile?.linkedin_url || "",
    investment_range_min: profile?.investment_range_min || 10000,
    investment_range_max: profile?.investment_range_max || 500000,
    interested_categories: profile?.interested_categories || [],
  });

  if (!profile) return null;
  const isBuyer = profile.role === "buyer";

  const avatarUrl = profile.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "U")}&background=6366f1&color=fff&size=200`;

  const toggleCategory = (cat: string) => {
    setForm(f => ({
      ...f,
      interested_categories: f.interested_categories.includes(cat)
        ? f.interested_categories.filter(c => c !== cat)
        : [...f.interested_categories, cat],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    const { error } = await updateProfile({
      name: form.name,
      bio: form.bio,
      location: form.location,
      phone: form.phone,
      linkedin_url: form.linkedin_url,
      ...(isBuyer ? {
        investment_range_min: form.investment_range_min,
        investment_range_max: form.investment_range_max,
        interested_categories: form.interested_categories,
      } : {}),
    });
    setSaving(false);
    if (error) {
      setSaveError(error);
    } else {
      setEditing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const formatMoney = (n: number) => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
    return `$${n}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Profile header */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-6">
          <div className="h-36 md:h-48 bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 relative">
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          <div className="px-6 md:px-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
              <div className="relative self-start">
                <img
                  src={avatarUrl}
                  alt={profile.name}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                />
                {profile.verified && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center border-2 border-white">
                    <FiCheckCircle size={14} className="text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                  {profile.verified && (
                    <span className="badge bg-brand-100 text-brand-700 flex items-center gap-1 text-xs">
                      <FiCheckCircle size={10} /> Verificado
                    </span>
                  )}
                </div>
                {profile.location && (
                  <p className="text-gray-500 flex items-center gap-1 mt-1 text-sm">
                    <FiMapPin size={13} /> {profile.location}
                  </p>
                )}
                <p className="text-gray-400 text-sm mt-0.5">{profile.email}</p>
              </div>

              <button
                onClick={() => { setEditing(!editing); setSaveError(""); }}
                className="btn-secondary !py-2 flex items-center gap-2 self-start sm:self-auto"
              >
                <FiEdit3 size={15} /> {editing ? "Cancelar" : "Editar Perfil"}
              </button>
            </div>

            {/* Role badge */}
            <div className="mt-5 flex items-center gap-3 flex-wrap">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold ${
                isBuyer ? "bg-brand-50 text-brand-700" : "bg-accent-50 text-accent-700"
              }`}>
                <FiBriefcase size={14} />
                {isBuyer ? "Comprador / Inversor" : "Vendedor"}
              </div>
              {isBuyer && profile.investment_range_min && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <FiDollarSign size={13} />
                  {formatMoney(profile.investment_range_min)} — {formatMoney(profile.investment_range_max || 0)} USD
                </div>
              )}
            </div>

            {profile.bio && (
              <p className="mt-4 text-gray-600 leading-relaxed text-sm md:text-base">{profile.bio}</p>
            )}

            {/* Links */}
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              {profile.phone && (
                <a href={`tel:${profile.phone}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                  <FiPhone size={13} /> {profile.phone}
                </a>
              )}
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700">
                  <FiLink size={13} /> LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Edit form */}
        {editing && (
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Editar Perfil</h2>
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+57 300 000 0000"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Biografía</label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  className="input-field h-24 resize-none"
                  placeholder="Cuéntanos sobre ti y tu experiencia..."
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="Ciudad, País"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
                  <input
                    type="url"
                    value={form.linkedin_url}
                    onChange={e => setForm(f => ({ ...f, linkedin_url: e.target.value }))}
                    placeholder="https://linkedin.com/in/..."
                    className="input-field"
                  />
                </div>
              </div>

              {isBuyer && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Rango de inversión: {formatMoney(form.investment_range_min)} — {formatMoney(form.investment_range_max)} USD
                    </label>
                    <div className="space-y-3">
                      <input type="range" min={5000} max={2000000} step={5000}
                        value={form.investment_range_min}
                        onChange={e => setForm(f => ({ ...f, investment_range_min: +e.target.value }))}
                        className="w-full accent-brand-600"
                      />
                      <input type="range" min={10000} max={10000000} step={10000}
                        value={form.investment_range_max}
                        onChange={e => setForm(f => ({ ...f, investment_range_max: +e.target.value }))}
                        className="w-full accent-brand-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Sectores de interés</label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat.name}
                          type="button"
                          onClick={() => toggleCategory(cat.name)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                            form.interested_categories.includes(cat.name)
                              ? "border-brand-500 bg-brand-50 text-brand-700"
                              : "border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {cat.icon} {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {saveError && (
                <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{saveError}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <FiSave size={16} />
                  )}
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-5">
          {/* Verification */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiShield className="text-brand-600" /> Verificación
            </h3>
            <div className="space-y-1">
              {[
                { label: "Email verificado", done: true },
                { label: "Teléfono verificado", done: !!profile.phone },
                { label: "Documento de identidad", done: profile.verified },
                { label: "LinkedIn verificado", done: !!profile.linkedin_url },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  {item.done ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                      <FiCheckCircle size={13} /> Verificado
                    </span>
                  ) : (
                    <button className="text-xs text-brand-600 font-medium hover:text-brand-700 flex items-center gap-1">
                      Verificar <FiArrowRight size={11} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Account info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiUser className="text-gray-400" /> Información de Cuenta
            </h3>
            <div className="space-y-1">
              {[
                { label: "Email", value: profile.email },
                { label: "Miembro desde", value: new Date(profile.created_at).toLocaleDateString("es") },
                { label: "Tipo de cuenta", value: isBuyer ? "Comprador/Inversor" : "Vendedor" },
                { label: "Plan", value: "Gratis" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <span className="text-sm font-medium text-gray-900 max-w-40 truncate text-right">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
              <Link href={isBuyer ? "/onboarding/buyer" : "/onboarding/seller"}
                className="flex items-center justify-between text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                Completar perfil <FiArrowRight size={14} />
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                <FiLogOut size={15} /> Cerrar sesión
              </button>
            </div>
          </div>
        </div>

        {/* Interests (buyer) */}
        {isBuyer && profile.interested_categories && profile.interested_categories.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-5">
            <h3 className="font-bold text-gray-900 mb-4">Sectores de interés</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interested_categories.map(cat => (
                <span key={cat} className="px-3 py-1.5 bg-brand-50 text-brand-700 rounded-full text-sm font-medium">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="h-24 md:hidden" />
    </div>
  );
}
