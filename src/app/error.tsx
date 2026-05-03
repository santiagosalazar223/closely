"use client";

import { useEffect } from "react";
import Link from "next/link";
import { FiAlertTriangle, FiRefreshCw, FiHome } from "react-icons/fi";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console; in production we could pipe to Sentry / Supabase events
    console.error("[error-boundary]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-5">
          <FiAlertTriangle size={28} className="text-red-600" />
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-2">
          Algo salió mal
        </h1>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Encontramos un error inesperado. Ya lo registramos y nuestro equipo lo está revisando.
          Mientras tanto, puedes intentar de nuevo o volver al inicio.
        </p>

        {error.digest && (
          <div className="mb-6 px-3 py-2 bg-gray-50 rounded-xl text-xs text-gray-400 font-mono">
            ID: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white font-semibold text-sm hover:shadow-lg transition-all"
          >
            <FiRefreshCw size={16} /> Intentar de nuevo
          </button>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            <FiHome size={16} /> Ir al inicio
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Si el problema persiste, escríbenos a{" "}
          <a href="mailto:soporte@bizswipe.co" className="text-brand-600 hover:underline">
            soporte@bizswipe.co
          </a>
        </p>
      </div>
    </div>
  );
}
