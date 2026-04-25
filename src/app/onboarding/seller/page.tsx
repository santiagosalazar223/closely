"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  FiArrowRight, FiArrowLeft, FiCheck, FiUser, FiBriefcase,
  FiDollarSign, FiMapPin, FiBarChart2, FiStar, FiPlus, FiX
} from "react-icons/fi";

const COUNTRIES = [
  "Colombia", "México", "Argentina", "Chile", "Perú", "Ecuador",
  "Venezuela", "Bolivia", "Paraguay", "Uruguay", "Costa Rica", "España", "Otro",
];

const BUSINESS_STAGES = [
  { value: "idea", label: "Idea / Pre-revenue", icon: "💡", desc: "Aún no tengo ingresos" },
  { value: "early", label: "Early Stage", icon: "🌱", desc: "Menos de 1 año de operación" },
  { value: "growth", label: "En crecimiento", icon: "📈", desc: "1-3 años con tracción" },
  { value: "established", label: "Establecido", icon: "🏢", desc: "3+ años operando establemente" },
  { value: "mature", label: "Maduro", icon: "🏆", desc: "Líder en su nicho" },
];

const SALE_MOTIVATIONS = [
  { value: "retire", label: "Jubilación / Retiro", icon: "🏖️" },
  { value: "new_project", label: "Nuevo proyecto", icon: "🚀" },
  { value: "need_capital", label: "Necesito capital", icon: "💰" },
  { value: "partner", label: "Busco socio estratégico", icon: "🤝" },
  { value: "scale", label: "Escalar con inversión", icon: "📊" },
  { value: "exit", label: "Exit / Liquidez", icon: "💎" },
];

const STEPS = [
  { label: "Perfil", icon: FiUser },
  { label: "Negocio", icon: FiBriefcase },
  { label: "Finanzas", icon: FiDollarSign },
  { label: "Ubicación", icon: FiMapPin },
  { label: "Motivación", icon: FiBarChart2 },
  { label: "Listo", icon: FiStar },
];

export default function SellerOnboardingPage() {
  const router = useRouter();
  const { updateProfile, profile } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    phone: "",
    bio: "",
    linkedin_url: "",
    website_url: "",
    location: "",
    country: "",
    // Business info (non-DB, for context)
    business_name: "",
    business_category: "",
    business_stage: "",
    sale_motivation: [] as string[],
    has_financials: "",
    seeking_amount_min: 50000,
    seeking_amount_max: 1000000,
  });

  const toggleMotivation = (val: string) => {
    setForm(f => ({
      ...f,
      sale_motivation: f.sale_motivation.includes(val)
        ? f.sale_motivation.filter(v => v !== val)
        : [...f.sale_motivation, val],
    }));
  };

  const canProceed = () => {
    if (step === 1) return !!form.business_category && !!form.business_stage;
    if (step === 3) return !!form.country;
    if (step === 4) return form.sale_motivation.length > 0;
    return true;
  };

  const formatMoney = (n: number) => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
    return `$${n}`;
  };

  const handleFinish = async () => {
    setSaving(true);
    setError("");
    const { error } = await updateProfile({
      bio: form.bio,
      phone: form.phone,
      linkedin_url: form.linkedin_url,
      website_url: form.website_url,
      location: form.location,
      country: form.country,
      onboarding_completed: true,
      onboarding_step: 6,
    });
    setSaving(false);
    if (error) {
      setError(error);
    } else {
      router.push("/create-listing");
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-50 via-white to-brand-50">
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

        <div className="flex gap-1.5 mb-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                i <= step ? "bg-accent-600" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <div className="flex gap-1.5 mb-10">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <span className={`text-[10px] mt-1 font-medium ${i <= step ? "text-accent-600" : "text-gray-300"}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-12">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10">

          {/* STEP 0: Perfil */}
          {step === 0 && (
            <div>
              <div className="w-16 h-16 bg-accent-100 rounded-2xl flex items-center justify-center mb-6">
                <FiUser size={28} className="text-accent-600" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">
                ¡Bienvenido{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}!
              </h1>
              <p className="text-gray-500 mb-8">
                Vamos a preparar tu perfil de vendedor para atraer compradores calificados.
              </p>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción profesional <span className="text-gray-400 font-normal">— Genera confianza en compradores</span>
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Ej: Emprendedor con 8 años de experiencia en el sector food & beverage. He fundado y escalado 2 negocios exitosos..."
                    rows={4}
                    className="input-field resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">Los perfiles con bio reciben 3x más contactos</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
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
                      placeholder="linkedin.com/in/..."
                      className="input-field"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sitio web del negocio (opcional)</label>
                  <input
                    type="url"
                    value={form.website_url}
                    onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))}
                    placeholder="https://mi-negocio.com"
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Info del negocio */}
          {step === 1 && (
            <div>
              <div className="w-16 h-16 bg-accent-100 rounded-2xl flex items-center justify-center mb-6">
                <FiBriefcase size={28} className="text-accent-600" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">Tu negocio</h1>
              <p className="text-gray-500 mb-8">
                Cuéntanos sobre el negocio que quieres vender o buscar inversión.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del negocio (opcional)</label>
                  <input
                    type="text"
                    value={form.business_name}
                    onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))}
                    placeholder="Ej: Café Origen, GestorPro..."
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">Sector / Categoría *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.name}
                        onClick={() => setForm(f => ({ ...f, business_category: cat.name }))}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          form.business_category === cat.name
                            ? "border-accent-500 bg-accent-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-xl mb-1">{cat.icon}</div>
                        <p className={`text-xs font-medium leading-tight ${
                          form.business_category === cat.name ? "text-accent-700" : "text-gray-600"
                        }`}>{cat.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">Etapa del negocio *</label>
                  <div className="space-y-3">
                    {BUSINESS_STAGES.map(stage => (
                      <button
                        key={stage.value}
                        onClick={() => setForm(f => ({ ...f, business_stage: stage.value }))}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                          form.business_stage === stage.value
                            ? "border-accent-500 bg-accent-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span className="text-2xl">{stage.icon}</span>
                        <div className="flex-1">
                          <p className={`font-semibold ${form.business_stage === stage.value ? "text-accent-700" : "text-gray-800"}`}>
                            {stage.label}
                          </p>
                          <p className="text-xs text-gray-500">{stage.desc}</p>
                        </div>
                        {form.business_stage === stage.value && (
                          <div className="w-5 h-5 bg-accent-600 rounded-full flex items-center justify-center">
                            <FiCheck size={11} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Finanzas */}
          {step === 2 && (
            <div>
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <FiDollarSign size={28} className="text-emerald-600" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">Expectativa financiera</h1>
              <p className="text-gray-500 mb-8">
                ¿Cuánto estás buscando recibir? Esto te conecta con compradores con el presupuesto correcto.
              </p>

              <div className="bg-gradient-to-r from-accent-50 to-emerald-50 rounded-2xl p-6 mb-6 text-center">
                <p className="text-sm text-gray-500 mb-1">Rango de valuación buscada</p>
                <p className="text-4xl font-black text-gray-900">
                  {formatMoney(form.seeking_amount_min)} — {formatMoney(form.seeking_amount_max)}
                </p>
                <p className="text-sm text-gray-400 mt-1">USD</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Mínimo: {formatMoney(form.seeking_amount_min)}
                  </label>
                  <input
                    type="range"
                    min={5000}
                    max={2000000}
                    step={5000}
                    value={form.seeking_amount_min}
                    onChange={e => {
                      const val = parseInt(e.target.value);
                      if (val < form.seeking_amount_max) setForm(f => ({ ...f, seeking_amount_min: val }));
                    }}
                    className="w-full accent-accent-600"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Máximo: {formatMoney(form.seeking_amount_max)}
                  </label>
                  <input
                    type="range"
                    min={10000}
                    max={10000000}
                    step={10000}
                    value={form.seeking_amount_max}
                    onChange={e => {
                      const val = parseInt(e.target.value);
                      if (val > form.seeking_amount_min) setForm(f => ({ ...f, seeking_amount_max: val }));
                    }}
                    className="w-full accent-accent-600"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-4">¿Tienes estados financieros disponibles?</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "yes_audited", label: "Sí, auditados", icon: "✅" },
                    { value: "yes_internal", label: "Sí, internos", icon: "📊" },
                    { value: "no", label: "No aún", icon: "⏳" },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setForm(f => ({ ...f, has_financials: opt.value }))}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        form.has_financials === opt.value
                          ? "border-accent-500 bg-accent-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-2xl mb-1">{opt.icon}</div>
                      <p className={`text-xs font-medium ${form.has_financials === opt.value ? "text-accent-700" : "text-gray-600"}`}>
                        {opt.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Ubicación */}
          {step === 3 && (
            <div>
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <FiMapPin size={28} className="text-purple-600" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">¿Dónde está tu negocio?</h1>
              <p className="text-gray-500 mb-8">
                Los compradores buscan por ubicación. Tener la ciudad exacta aumenta tu visibilidad.
              </p>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">País *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {COUNTRIES.map(country => (
                      <button
                        key={country}
                        onClick={() => setForm(f => ({ ...f, country }))}
                        className={`py-3 px-2 rounded-xl text-sm font-medium border-2 transition-all text-center ${
                          form.country === country
                            ? "border-accent-500 bg-accent-50 text-accent-700"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {country}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad o región</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="Ej: Bogotá, LATAM, Remoto..."
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Motivación */}
          {step === 4 && (
            <div>
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                <FiBarChart2 size={28} className="text-amber-600" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">¿Por qué vendes?</h1>
              <p className="text-gray-500 mb-8">
                Los compradores prefieren saber la motivación. Selecciona las razones que aplican.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {SALE_MOTIVATIONS.map(m => (
                  <button
                    key={m.value}
                    onClick={() => toggleMotivation(m.value)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                      form.sale_motivation.includes(m.value)
                        ? "border-accent-500 bg-accent-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-2xl">{m.icon}</span>
                    <span className={`font-medium text-sm flex-1 ${form.sale_motivation.includes(m.value) ? "text-accent-700" : "text-gray-700"}`}>
                      {m.label}
                    </span>
                    {form.sale_motivation.includes(m.value) && (
                      <div className="w-5 h-5 bg-accent-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <FiCheck size={11} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Final */}
          {step === 5 && (
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-accent-500 to-brand-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <FiStar size={40} className="text-white" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-4">¡Perfil listo!</h1>
              <p className="text-gray-500 mb-8 text-lg leading-relaxed">
                Ahora crea el listing de tu negocio. Te guiaremos paso a paso para que tu negocio
                destaque ante compradores calificados.
              </p>

              <div className="bg-gradient-to-br from-accent-50 to-brand-50 rounded-2xl p-6 text-left space-y-4 mb-8">
                <h3 className="font-bold text-gray-900 mb-3">Tu próximo paso:</h3>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                  <p className="text-sm text-gray-700">Completa la información de tu negocio</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-sm font-bold">2</div>
                  <p className="text-sm text-gray-500">Sube fotos atractivas</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-sm font-bold">3</div>
                  <p className="text-sm text-gray-500">Agrega métricas financieras</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-sm font-bold">4</div>
                  <p className="text-sm text-gray-500">Publica y recibe ofertas</p>
                </div>
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
                className="btn-accent flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar <FiArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={saving}
                className="btn-accent flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Crear mi listing"} <FiPlus size={16} />
              </button>
            )}
          </div>

          {step === 0 && (
            <button
              onClick={() => setStep(s => s + 1)}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-4 transition-colors"
            >
              Completar después
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
