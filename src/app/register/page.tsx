"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { FiUser, FiMail, FiLock, FiArrowRight, FiShoppingBag, FiDollarSign, FiEye, FiEyeOff, FiCheck } from "react-icons/fi";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"buyer" | "seller" | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordStrength = () => {
    if (password.length === 0) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strengthLabel = ["", "Muy débil", "Débil", "Buena", "Excelente"];
  const strengthColor = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"];
  const ps = passwordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);
    setError("");
    const { error } = await register(email, password, name, role);
    setLoading(false);
    if (error) {
      if (error.includes("already registered")) {
        setError("Este email ya está registrado. ¿Quieres iniciar sesión?");
      } else {
        setError(error);
      }
    } else {
      router.push(role === "buyer" ? "/onboarding/buyer" : "/onboarding/seller");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent-600 via-brand-700 to-brand-900 p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-300 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-bold text-xl">B</span>
          </div>
          <span className="text-2xl font-bold text-white">BizSwipe</span>
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white mb-6 leading-tight">
            Únete a la comunidad de M&A más grande de LATAM
          </h2>
          <p className="text-white/70 text-lg leading-relaxed mb-8">
            Conecta con miles de compradores e inversores verificados. Tu próximo deal comienza aquí.
          </p>
          <div className="space-y-4">
            {[
              { icon: "🔒", text: "Verificación de identidad incluida" },
              { icon: "📊", text: "Data rooms seguros y privados" },
              { icon: "🤝", text: "Matching inteligente comprador-vendedor" },
              { icon: "⚡", text: "Cierre de deals en 30-90 días promedio" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-white/80 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/30 text-sm relative z-10">© 2024 BizSwipe. Todos los derechos reservados.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-600 to-accent-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-gray-900">BizSwipe</span>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${step >= s ? "bg-brand-600" : "bg-gray-200"}`} />
            ))}
          </div>

          {step === 1 ? (
            <>
              <h1 className="text-3xl font-black text-gray-900 mb-2">¿Qué buscas?</h1>
              <p className="text-gray-500 mb-8">Selecciona tu perfil para personalizar tu experiencia</p>

              <div className="space-y-4">
                <button
                  onClick={() => { setRole("buyer"); setStep(2); }}
                  className={`w-full p-6 rounded-2xl border-2 text-left transition-all group hover:border-brand-500 hover:bg-brand-50
                    ${role === "buyer" ? "border-brand-500 bg-brand-50" : "border-gray-200"}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center group-hover:bg-brand-200 transition-colors flex-shrink-0">
                      <FiShoppingBag size={24} className="text-brand-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">Quiero Comprar / Invertir</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Busco negocios para adquirir completamente o comprar participaciones como inversor.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="badge bg-brand-100 text-brand-700">Adquisiciones</span>
                        <span className="badge bg-brand-100 text-brand-700">Participaciones</span>
                        <span className="badge bg-brand-100 text-brand-700">Inversión</span>
                      </div>
                    </div>
                    <FiArrowRight className="text-gray-300 group-hover:text-brand-500 transition-colors mt-2 flex-shrink-0" />
                  </div>
                </button>

                <button
                  onClick={() => { setRole("seller"); setStep(2); }}
                  className={`w-full p-6 rounded-2xl border-2 text-left transition-all group hover:border-accent-500 hover:bg-accent-50
                    ${role === "seller" ? "border-accent-500 bg-accent-50" : "border-gray-200"}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-accent-100 rounded-2xl flex items-center justify-center group-hover:bg-accent-200 transition-colors flex-shrink-0">
                      <FiDollarSign size={24} className="text-accent-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">Quiero Vender / Buscar Inversión</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Busco compradores o inversores para mi negocio. Quiero venderlo total o parcialmente.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="badge bg-accent-100 text-accent-700">Venta total</span>
                        <span className="badge bg-accent-100 text-accent-700">Participación</span>
                        <span className="badge bg-accent-100 text-accent-700">Socio estratégico</span>
                      </div>
                    </div>
                    <FiArrowRight className="text-gray-300 group-hover:text-accent-500 transition-colors mt-2 flex-shrink-0" />
                  </div>
                </button>
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-500 text-sm">
                  ¿Ya tienes cuenta?{" "}
                  <Link href="/login" className="text-brand-600 font-semibold hover:text-brand-700">Inicia sesión</Link>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role === "buyer" ? "bg-brand-100" : "bg-accent-100"}`}>
                  {role === "buyer"
                    ? <FiShoppingBag size={20} className="text-brand-600" />
                    : <FiDollarSign size={20} className="text-accent-600" />
                  }
                </div>
                <div>
                  <h1 className="text-3xl font-black text-gray-900">Crea tu cuenta</h1>
                  <p className="text-sm text-gray-500">
                    Como {role === "buyer" ? "comprador / inversor" : "vendedor"}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Juan Pérez"
                      className="input-field !pl-11"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="input-field !pl-11"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="input-field !pl-11 !pr-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= ps ? strengthColor[ps] : "bg-gray-200"}`} />
                        ))}
                      </div>
                      <p className={`text-xs font-medium ${ps >= 3 ? "text-emerald-600" : ps >= 2 ? "text-yellow-600" : "text-red-500"}`}>
                        {strengthLabel[ps]}
                      </p>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
                    {error}
                    {error.includes("ya está registrado") && (
                      <Link href="/login" className="block mt-1 font-semibold hover:underline">
                        → Ir a iniciar sesión
                      </Link>
                    )}
                  </div>
                )}

                <div className="text-xs text-gray-400">
                  Al registrarte aceptas nuestros{" "}
                  <a href="#" className="text-brand-600 hover:underline">Términos de Uso</a>{" "}
                  y{" "}
                  <a href="#" className="text-brand-600 hover:underline">Política de Privacidad</a>.
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-secondary"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 flex items-center justify-center gap-2 font-semibold py-3 px-6 rounded-xl transition-all text-white disabled:opacity-60 ${
                      role === "buyer"
                        ? "bg-brand-600 hover:bg-brand-700"
                        : "bg-accent-600 hover:bg-accent-700"
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creando cuenta...
                      </span>
                    ) : (
                      <>Crear Cuenta <FiArrowRight size={16} /></>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-500 text-sm">
                  ¿Ya tienes cuenta?{" "}
                  <Link href="/login" className="text-brand-600 font-semibold hover:text-brand-700">Inicia sesión</Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
