"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await login(email, password);
    setLoading(false);
    if (error) {
      if (error.includes("Invalid login credentials")) {
        setError("Email o contraseña incorrectos");
      } else if (error.includes("Email not confirmed")) {
        setError("Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.");
      } else {
        setError(error);
      }
    } else {
      router.push("/feed");
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const { getSupabase } = await import("@/lib/supabase");
    const supabase = getSupabase();
    await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setResetSent(true);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-700 to-accent-700 p-16 flex-col justify-between relative overflow-hidden">
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
            Tu próximo negocio te está esperando
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Accede a miles de oportunidades de inversión verificadas en toda Latinoamérica.
          </p>
          <div className="grid grid-cols-3 gap-6 mt-12">
            {[
              { value: "2.4K+", label: "Negocios" },
              { value: "15K+", label: "Usuarios" },
              { value: "12", label: "Países" },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-3xl font-bold text-white">{s.value}</p>
                <p className="text-white/50 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/30 text-sm relative z-10">© 2024 BizSwipe</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-600 to-accent-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-gray-900">BizSwipe</span>
          </div>

          {showReset ? (
            <>
              <h1 className="text-3xl font-black text-gray-900 mb-2">Recuperar contraseña</h1>
              <p className="text-gray-500 mb-8">Te enviaremos un link para restablecer tu contraseña.</p>

              {resetSent ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
                  <div className="text-4xl mb-3">✉️</div>
                  <h3 className="font-bold text-emerald-800 mb-2">¡Email enviado!</h3>
                  <p className="text-sm text-emerald-700">Revisa tu bandeja de entrada y sigue las instrucciones.</p>
                  <button onClick={() => setShowReset(false)} className="mt-4 text-sm text-brand-600 font-semibold hover:underline">
                    Volver al login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReset} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email de tu cuenta</label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={e => setResetEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className="input-field !pl-11"
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                    Enviar link <FiArrowRight size={16} />
                  </button>
                  <button type="button" onClick={() => setShowReset(false)} className="w-full text-sm text-gray-500 hover:text-gray-700">
                    ← Volver al login
                  </button>
                </form>
              )}
            </>
          ) : (
            <>
              <h1 className="text-3xl font-black text-gray-900 mb-2">Bienvenido de vuelta</h1>
              <p className="text-gray-500 mb-8">Ingresa tus credenciales para acceder</p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
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
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field !pl-11 !pr-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPw ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setShowReset(true)}
                    className="text-sm text-brand-600 font-medium hover:text-brand-700"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    <>Iniciar Sesión <FiArrowRight size={16} /></>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-500 text-sm">
                  ¿No tienes cuenta?{" "}
                  <Link href="/register" className="text-brand-600 font-semibold hover:text-brand-700">
                    Regístrate gratis
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
