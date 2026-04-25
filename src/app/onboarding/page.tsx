"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"buyer" | "seller" | null>(null);
  const [budget, setBudget] = useState("");

  const nextStep = () => {
    if (step === 3) {
      // Setup complete
      localStorage.setItem('onboardingCompleted', 'true');
      router.push("/discover");
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full">
        {/* Progress bar */}
        <div className="w-full flex gap-2 mb-12">
          {[1,2,3].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-brand-600' : 'bg-gray-200'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">¿Qué buscas hoy?</h1>
              <p className="text-gray-500 mb-8">Ayúdanos a personalizar tu feed para mostrarte exactamente lo que necesitas.</p>
              
              <div className="space-y-4">
                <button 
                  onClick={() => { setRole("buyer"); nextStep(); }}
                  className="w-full p-6 text-left border-2 border-gray-100 rounded-2xl hover:border-brand-500 hover:bg-brand-50 transition-all font-semibold"
                >
                  <span className="text-2xl mb-2 block">💼</span>
                  Quiero Invertir / Comprar Negocio
                </button>
                <button 
                  onClick={() => { setRole("seller"); nextStep(); }}
                  className="w-full p-6 text-left border-2 border-gray-100 rounded-2xl hover:border-brand-500 hover:bg-brand-50 transition-all font-semibold"
                >
                  <span className="text-2xl mb-2 block">🏷️</span>
                  Quiero Vender mi Negocio
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && role === "buyer" && (
            <motion.div key="step2-buyer" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">¿Cuál es tu presupuesto?</h1>
              <p className="text-gray-500 mb-8">Filtraremos las oportunidades para que encajen en tu billetera.</p>
              
              <div className="space-y-4">
                {["Hasta $50,000 USD", "$50k - $200k USD", "$200k - $1M USD", "Más de $1M USD"].map(b => (
                  <button 
                    key={b}
                    onClick={() => { setBudget(b); nextStep(); }}
                    className="w-full p-4 border-2 border-gray-100 rounded-xl hover:border-brand-500 hover:bg-brand-50 font-medium text-gray-800 transition-colors"
                  >
                    {b}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center">
              <div className="w-24 h-24 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                ✨
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Todo listo!</h1>
              <p className="text-gray-500 mb-8">Tu feed algorítmico ha sido generado y curado para ti.</p>
              <button onClick={nextStep} className="btn-primary w-full py-4 text-lg">Empezar a Escrollear</button>
            </motion.div>
          )}

          {step === 2 && role === "seller" && (
              <motion.div key="step2-seller" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">¿Cómo describes tu negocio maduro?</h1>
                  <p className="text-gray-500 mb-8">Definamos el atractivo base para que compradores ideales hagan Swipe.</p>

                  <div className="space-y-4">
                      {["Empresa tecnológica sin deudas", "Restaurante llave en mano", "ECommerce en crecimiento", "Servicios escalables"].map(b => (
                          <button
                              key={b}
                              onClick={() => { nextStep(); }}
                              className="w-full p-4 border-2 border-gray-100 rounded-xl hover:border-brand-500 hover:bg-brand-50 font-medium text-gray-800 transition-colors"
                          >
                              {b}
                          </button>
                      ))}
                  </div>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
