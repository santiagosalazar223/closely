"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { track } from "@/lib/analytics";
import { FiMessageCircle, FiX, FiCheck, FiAlertCircle } from "react-icons/fi";

const CATEGORIES = [
  { id: "bug",     label: "🐛 Reportar un bug" },
  { id: "feature", label: "💡 Pedir una feature" },
  { id: "ux",      label: "🎨 Comentario sobre UX" },
  { id: "love",    label: "❤️ Algo que me encantó" },
  { id: "other",   label: "💬 Otro" },
];

export default function FeedbackWidget() {
  const { profile, supabaseUser } = useAuth();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<string>("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Hide on landing page (we don't want it before login on the marketing page)
  const hideOnPaths = ["/login", "/register"];
  const shouldHide = hideOnPaths.includes(pathname || "");

  useEffect(() => {
    if (profile?.email) setEmail(profile.email);
  }, [profile?.email]);

  const reset = () => {
    setRating(0);
    setCategory("");
    setMessage("");
    setSubmitted(false);
    setError("");
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(reset, 300);
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError("Escribe un mensaje antes de enviar.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const supabase = getSupabase();
      const { error: dbError } = await supabase.from("feedback").insert({
        user_id: supabaseUser?.id ?? null,
        rating: rating > 0 ? rating : null,
        category: category || null,
        message: message.trim().slice(0, 2000),
        page: pathname || null,
        email: email.trim() || profile?.email || null,
      });

      if (dbError) throw dbError;

      track("feedback_submitted", {
        rating,
        category: category || "none",
        page: pathname || "",
        has_email: !!email.trim(),
      });

      setSubmitted(true);
      setTimeout(handleClose, 2400);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo enviar. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (shouldHide) return null;

  return (
    <>
      {/* Floating trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Enviar feedback"
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-brand-600 to-accent-600 text-white shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
      >
        <FiMessageCircle size={20} />
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-bold text-gray-900">Tu feedback nos ayuda 🙏</h3>
                <p className="text-xs text-gray-500 mt-0.5">Cuéntanos qué piensas en 30 segundos</p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="Cerrar"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Success state */}
            {submitted ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <FiCheck size={28} className="text-emerald-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">¡Recibido!</h4>
                <p className="text-sm text-gray-500">
                  Gracias por tomarte el tiempo. Lo leemos todo.
                </p>
              </div>
            ) : (
              <div className="p-5 space-y-5">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ¿Cómo calificarías tu experiencia?
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        onMouseEnter={() => setHoverRating(n)}
                        onMouseLeave={() => setHoverRating(0)}
                        className={`w-10 h-10 rounded-xl text-lg transition-all ${
                          n <= (hoverRating || rating)
                            ? "bg-amber-400 text-white scale-110"
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        }`}
                      >
                        {n <= (hoverRating || rating) ? "★" : "☆"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ¿De qué se trata?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategory(c.id)}
                        className={`text-left text-sm px-3 py-2 rounded-xl border transition-all ${
                          category === c.id
                            ? "border-brand-500 bg-brand-50 text-brand-700 font-medium"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tu mensaje
                    <span className="text-gray-400 font-normal ml-1">
                      ({message.length}/2000)
                    </span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
                    placeholder="Cuéntanos qué piensas, qué te falta, qué te gusta..."
                    className="w-full h-28 px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-sm resize-none"
                  />
                </div>

                {/* Email if not authenticated */}
                {!supabaseUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-gray-400 font-normal">(opcional, para responderte)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-sm"
                    />
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-sm">
                    <FiAlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-red-700">{error}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !message.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                >
                  {submitting ? "Enviando..." : "Enviar feedback"}
                </button>

                <p className="text-xs text-center text-gray-400">
                  Lee todo el equipo. No spam, prometido.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
