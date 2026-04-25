"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  FiArrowRight, FiArrowLeft, FiCheck, FiTarget, FiDollarSign,
  FiMapPin, FiStar, FiUser, FiBriefcase, FiTrendingUp
} from "react-icons/fi";

const CATEGORIES = [
  { name: "Restaurantes y Comida", icon: "🍽️" },
  { name: "Tecnología y SaaS", icon: "💻" },
  { name: "E-commerce", icon: "🛒" },
  { name: "Salud y Bienestar", icon: "🏥" },
  { name: "Educación", icon: "📚" },
  { name: "Servicios Profesionales", icon: "💼" },
  { name: "Retail y Tiendas", icon: "🏪" },
  { name: "Manufactura", icon: "🏭" },
  { name: "Inmobiliaria", icon: "🏠" },
  { name: "Entretenimiento", icon: "🎬" },
  { name: "Transporte y Logística", icon: "🚚" },
  { name: "Agricultura", icon: "🌾" },
];

const COUNTRIES = [
  "Colombia", "México", "Argentina", "Chile", "Perú", "Ecuador",
  "Venezuela", "Bolivia", "Paraguay", "Uruguay", "Costa Rica", "España", "Otro",
];

const INVESTMENT_EXPERIENCE = [
  { value: "first_time", label: "Primera vez invirtiendo", icon: "🌱" },
  { value: "1_3_years", label: "1-3 años de experiencia", icon: "📈" },
  { value: "3_5_years", label: "3-5 años de experiencia", icon: "💼" },
  { value: "5_plus_years", label: "5+ años — inversor activo", icon: "🏆" },
];

const INVESTMENT_TYPES = [
  { value: "full_acquisition", label: "Adquisición total", desc: "Comprar el 100% del negocio", icon: "🎯" },
  { value: "majority_stake", label: "Mayoría (>50%)", desc: "Control mayoritario del negocio", icon: "📊" },
  { value: "minority_stake", label: "Participación minoritaria", desc: "Inversión como socio minoritario", icon: "🤝" },
  { value: "investor", label: "Inversor financiero", desc: "Retorno sin gestión operativa", icon: "💰" },
];

const STEPS = [
  { label: "Perfil", icon: FiUser },
  { label: "Intereses", icon: FiTarget },
  { label: "Presupuesto", icon: FiDollarSign },
  { label: "Ubicación", icon: FiMapPin },
  { label: "Experiencia", icon: FiBriefcase },
  { label: "Listo", icon: FiStar },
];

export default function BuyerOnboardingPage() {
  const router = useRouter();
  const { updateProfile, profile } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    phone: "",
    location: "",
    country: "",
    bio: "",
    interested_categories: [] as string[],
    investment_range_min: 10000,
    investment_range_max: 500000,
    investment_experience: "",
    investment_type: [] as string[],
    linkedin_url: "",
  });

  const toggleCategory = (cat: string) => {
    setForm(f => ({
      ...f,
      interested_categories: f.interested_categories.includes(cat)
        ? f.interested_categories.filter(c => c !== cat)
        : [...f.interested_categories, cat],
    }));
  };

  const toggleInvestmentType = (val: string) => {
    setForm(f => ({
      ...f,
      investment_type: f.investment_type.includes(val)
        ? f.investment_type.filter(v => v !== val)
        : [...f.investment_type, val],
    }));
  };

  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) return form.interested_categories.length > 0;
    if (step === 2) return form.investment_range_min < form.investment_range_max;
    if (step === 3) return !!form.country;
    if (step === 4) return !!form.investment_experience && form.investment_type.length > 0;
    return true;
  };

  const handleFinish = async () => {
    setSaving(true);
    setError("");
    const { error } = await updateProfile({
      ...form,
      onboarding_completed: true,
      onboarding_step: 6,
    });
    setSaving(false);
    if (error) {
      setError(error);
    } else {
      router.push("/feed");
    }
  };

  const formatMoney = (n: number) => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
    return `$${n}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50">
      {/* Header */}
      <div className="max-w-2xl mx-auto px-6 pt-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-600 to-accent-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-gray-900">BizSwipe</span>
          </div>
          <span className="text-sm text-gray-400">Paso {step + 1} de {STEPS.length}</span>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5 mb-2">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                i <= step ? "bg-brand-600" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Step labels */}
        <div className="flex gap-1.5 mb-10">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <span className={`text-[10px] mt-1 font-medium ${i <= step ? "text-brand-600" : "text-gray-300"}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="max-w-2xl mx-auto px-6 pb-12">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10">

          {/* STEP 0: Perfil básico */}
          {step === 0 && (
            <div>
              <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mb-6">
                <FiUser size={28} className="text-brand-600" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">
                Hola{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}! 👋
              </h1>
              <p className="text-gray-500 mb-8">
                Cuéntanos un poco sobre ti para personalizar tu experiencia de búsqueda.
              </p>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio (opcional) <span className="text-gray-400 font-normal">— ¿Quién eres?</span>
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Ej: Inversor con 5 años de experiencia en M&A. Busco negocios rentables en el sector tech y food."
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono (opcional)</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+57 300 000 0000"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn (opcional)</label>
                  <input
                    type="url"
                    value={form.linkedin_url}
                    onChange={e => setForm(f => ({ ...f, linkedin_url: e.target.value }))}
                    placeholder="https://linkedin.com/in/tu-perfil"
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Categorías de interés */}
          {step === 1 && (
            <div>
              <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mb-6">
                <FiTarget size={28} className="text-brand-600" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">¿Qué sectores te interesan?</h1>
              <p className="text-gray-500 mb-8">Selecciona todos los sectores en los que buscarías invertir. Puedes cambiarlos después.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => toggleCategory(cat.name)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      form.interested_categories.includes(cat.name)
                        ? "border-brand-500 bg-brand-50 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-2xl">{cat.icon}</span>
                      {form.interested_categories.includes(cat.name) && (
                        <div className="w-5 h-5 bg-brand-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <FiCheck size={11} className="text-white" />
                        </div>
                      )}
                    </div>
                    <p className={`text-sm font-medium mt-2 leading-tight ${
                      form.interested_categories.includes(cat.name) ? "text-brand-700" : "text-gray-700"
                    }`}>{cat.name}</p>
                  </button>
                ))}
              </div>
              {form.interested_categories.length > 0 && (
                <p className="text-sm text-brand-600 font-medium mt-4">
                  {form.interested_categories.length} sector{form.interested_categories.length > 1 ? "es" : ""} seleccionado{form.interested_categories.length > 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}

          {/* STEP 2: Presupuesto */}
          {step === 2 && (
            <div>
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <FiDollarSign size={28} className="text-emerald-600" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">¿Cuál es tu presupuesto?</h1>
              <p className="text-gray-500 mb-8">
                Defina el rango de inversión que considera. Esto nos ayuda a mostrarle negocios relevantes.
              </p>

              <div className="bg-gradient-to-r from-brand-50 to-accent-50 rounded-2xl p-6 mb-6 text-center">
                <p className="text-sm text-gray-500 mb-1">Rango de inversión</p>
                <p className="text-4xl font-black text-gray-900">
                  {formatMoney(form.investment_range_min)} — {formatMoney(form.investment_range_max)}
                </p>
                <p className="text-sm text-gray-400 mt-1">USD</p>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Mínimo: {formatMoney(form.investment_range_min)}</label>
                  </div>
                  <input
                    type="range"
                    min={5000}
                    max={2000000}
                    step={5000}
                    value={form.investment_range_min}
                    onChange={e => {
                      const val = parseInt(e.target.value);
                      if (val < form.investment_range_max) setForm(f => ({ ...f, investment_range_min: val }));
                    }}
                    className="w-full accent-brand-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Máximo: {formatMoney(form.investment_range_max)}</label>
                  </div>
                  <input
                    type="range"
                    min={10000}
                    max={10000000}
                    step={10000}
                    value={form.investment_range_max}
                    onChange={e => {
                      const val = parseInt(e.target.value);
                      if (val > form.investment_range_min) setForm(f => ({ ...f, investment_range_max: val }));
                    }}
                    className="w-full accent-brand-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-6">
                {[
                  { label: "Pequeño", min: 5000, max: 100000 },
                  { label: "Mediano", min: 100000, max: 1000000 },
                  { label: "Grande", min: 1000000, max: 10000000 },
                ].map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => setForm(f => ({ ...f, investment_range_min: preset.min, investment_range_max: preset.max }))}
                    className={`py-2.5 px-4 rounded-xl text-sm font-medium border-2 transition-all ${
                      form.investment_range_min === preset.min && form.investment_range_max === preset.max
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Ubicación */}
          {step === 3 && (
            <div>
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <FiMapPin size={28} className="text-purple-600" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">¿Desde dónde operas?</h1>
              <p className="text-gray-500 mb-8">
                Esto nos ayuda a mostrarte negocios en tu región y de los países que te interesan.
              </p>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">País de residencia *</label>
                  <div className="grid grid-cols-3 gap-3">
                    {COUNTRIES.map(country => (
                      <button
                        key={country}
                        onClick={() => setForm(f => ({ ...f, country }))}
                        className={`py-3 px-3 rounded-xl text-sm font-medium border-2 transition-all text-center ${
                          form.country === country
                            ? "border-brand-500 bg-brand-50 text-brand-700"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {country}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad (opcional)</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="Ej: Bogotá, Ciudad de México..."
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Experiencia y tipo de inversión */}
          {step === 4 && (
            <div>
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                <FiBriefcase size={28} className="text-amber-600" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">Cuéntanos tu experiencia</h1>
              <p className="text-gray-500 mb-8">Esto nos ayuda a conectarte con los vendedores correctos.</p>

              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-4">¿Cuánta experiencia tienes invirtiendo?</label>
                <div className="space-y-3">
                  {INVESTMENT_EXPERIENCE.map(exp => (
                    <button
                      key={exp.value}
                      onClick={() => setForm(f => ({ ...f, investment_experience: exp.value }))}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                        form.investment_experience === exp.value
                          ? "border-brand-500 bg-brand-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-2xl">{exp.icon}</span>
                      <span className={`font-medium ${form.investment_experience === exp.value ? "text-brand-700" : "text-gray-700"}`}>
                        {exp.label}
                      </span>
                      {form.investment_experience === exp.value && (
                        <div className="ml-auto w-5 h-5 bg-brand-600 rounded-full flex items-center justify-center">
                          <FiCheck size={11} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">¿Qué tipo de inversión buscas? (selecciona todos)</label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {INVESTMENT_TYPES.map(type => (
                    <button
                      key={type.value}
                      onClick={() => toggleInvestmentType(type.value)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        form.investment_type.includes(type.value)
                          ? "border-brand-500 bg-brand-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xl">{type.icon}</span>
                        {form.investment_type.includes(type.value) && (
                          <div className="w-5 h-5 bg-brand-600 rounded-full flex items-center justify-center">
                            <FiCheck size={11} className="text-white" />
                          </div>
                        )}
                      </div>
                      <p className={`text-sm font-semibold ${form.investment_type.includes(type.value) ? "text-brand-700" : "text-gray-800"}`}>
                        {type.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{type.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Final */}
          {step === 5 && (
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-brand-500 to-accent-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <FiTrendingUp size={40} className="text-white" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-4">¡Todo listo!</h1>
              <p className="text-gray-500 mb-8 text-lg leading-relaxed">
                Tu perfil está configurado. Ahora te mostraremos negocios personalizados
                según tus intereses y presupuesto.
              </p>

              <div className="bg-gray-50 rounded-2xl p-6 text-left space-y-4 mb-8">
                <h3 className="font-bold text-gray-900 mb-3">Resumen de tu perfil:</h3>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Sectores de interés</p>
                    <p className="text-sm text-gray-500">
                      {form.interested_categories.length > 0
                        ? form.interested_categories.slice(0, 3).join(", ") + (form.interested_categories.length > 3 ? ` +${form.interested_categories.length - 3}` : "")
                        : "No definido"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💰</span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Presupuesto</p>
                    <p className="text-sm text-gray-500">{formatMoney(form.investment_range_min)} — {formatMoney(form.investment_range_max)} USD</p>
                  </div>
                </div>
                {form.country && (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📍</span>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Ubicación</p>
                      <p className="text-sm text-gray-500">{form.location ? `${form.location}, ` : ""}{form.country}</p>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 rounded-xl p-4 mb-4 text-sm">{error}</div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="btn-secondary flex items-center gap-2"
              >
                <FiArrowLeft size={16} /> Atrás
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar <FiArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={saving}
                className="btn-accent flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Explorar Negocios"} <FiArrowRight size={16} />
              </button>
            )}
          </div>

          {step === 0 && (
            <button
              onClick={() => setStep(s => s + 1)}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-4 transition-colors"
            >
              Saltar por ahora
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
