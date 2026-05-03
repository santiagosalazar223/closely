import Link from "next/link";
import { FiCompass, FiHome } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 mx-auto bg-brand-100 rounded-full flex items-center justify-center mb-5">
          <FiCompass size={28} className="text-brand-600" />
        </div>

        <h1 className="text-6xl font-black text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Página no encontrada</h2>
        <p className="text-gray-500 text-sm mb-6">
          Esta página no existe o fue movida. Vuelve al inicio para seguir explorando negocios.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white font-semibold text-sm hover:shadow-lg transition-all"
          >
            <FiHome size={16} /> Ir al inicio
          </Link>
          <Link
            href="/feed"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            <FiCompass size={16} /> Explorar feed
          </Link>
        </div>
      </div>
    </div>
  );
}
