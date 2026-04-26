"use client";

import { useState, useRef, useCallback } from "react";
import {
  FiX, FiUploadCloud, FiFileText, FiCheckCircle, FiAlertTriangle,
  FiTrendingUp, FiDollarSign, FiBarChart2, FiInfo, FiDownload,
  FiChevronDown, FiChevronUp, FiLoader,
} from "react-icons/fi";

interface ValuationResult {
  resumen_ejecutivo: string;
  sector_identificado: string;
  codigo_ciiu: string;
  wacc_usado: number;
  datos_financieros_extraidos: {
    ingresos_anuales: number;
    ebitda: number;
    margen_ebitda_pct: number;
    utilidad_neta: number;
    total_activos: number;
    total_pasivos: number;
    patrimonio: number;
    flujo_caja_libre: number;
    deuda_financiera_neta: number;
    año_datos: string;
    supuestos_aplicados: string[];
  };
  metodologias: {
    dcf: {
      valor_empresa_usd: number;
      valor_patrimonio_usd: number;
      tasa_crecimiento_terminal_pct: number;
      tasa_crecimiento_proyectado_pct: number;
      proyecciones_fcl: Array<{ año: number; fcl_usd: number }>;
      ponderacion_pct: number;
      justificacion: string;
    };
    multiplos: {
      ev_ebitda_multiplo_sector: number;
      ev_revenue_multiplo_sector: number;
      valor_por_ev_ebitda_usd: number;
      valor_por_ev_revenue_usd: number;
      valor_promedio_multiplos_usd: number;
      ponderacion_pct: number;
      justificacion: string;
    };
    activos_netos: {
      valor_libros_patrimonio_usd: number;
      valor_ajustado_usd: number;
      ponderacion_pct: number;
      justificacion: string;
    };
  };
  ajustes: {
    prima_iliquidez_pct: number;
    prima_riesgo_pais_pct: number;
    descuento_empresa_pequena_pct: number;
    ajuste_total_pct: number;
  };
  valoracion_final: {
    valor_bajo_usd: number;
    valor_medio_usd: number;
    valor_alto_usd: number;
    valor_recomendado_usd: number;
    nota_conversion?: string;
  };
  factores_clave_valor: string[];
  factores_riesgo: string[];
  recomendaciones_vendedor: string[];
  nivel_confianza: "alto" | "medio" | "bajo";
  razon_confianza: string;
  disclaimer: string;
}

interface Props {
  businessName: string;
  sector: string;
  onClose: () => void;
  onApplyValuation: (recommendedUSD: number) => void;
}

const STEPS = ["Subir EEFF", "Analizando", "Resultado"];

function formatUSD(n: number): string {
  if (!n || isNaN(n)) return "N/A";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M USD`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K USD`;
  return `$${n.toFixed(0)} USD`;
}

function formatNum(n: number): string {
  if (!n || isNaN(n)) return "N/A";
  return new Intl.NumberFormat("es-CO").format(Math.round(n));
}

const CONFIDENCE_CONFIG = {
  alto: { label: "Alta confianza", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  medio: { label: "Confianza media", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  bajo: { label: "Baja confianza", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
};

export default function ValuationModal({ businessName, sector, onClose, onApplyValuation }: Props) {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [extraContext, setExtraContext] = useState("");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>("dcf");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_EXT = ".pdf,.jpg,.jpeg,.png,.webp,.csv,.txt,.xlsx,.xls";
  const MAX_MB = 10;

  const validateAndSetFile = (f: File) => {
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`El archivo supera ${MAX_MB} MB.`);
      return;
    }
    setError("");
    setFile(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) validateAndSetFile(f);
  }, []);

  const handleAnalyze = async () => {
    if (!file) return;
    setStep(1);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("businessName", businessName);
    formData.append("sector", sector);
    formData.append("extraContext", extraContext);

    try {
      const res = await fetch("/api/valuation", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error ?? "Error al procesar la valoración.");
        setStep(0);
        return;
      }

      setResult(json.valuation);
      setStep(2);
    } catch {
      setError("Error de conexión. Verifica tu internet e intenta de nuevo.");
      setStep(0);
    }
  };

  const toggleSection = (s: string) => setExpandedSection(prev => prev === s ? null : s);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-brand-600 rounded-xl flex items-center justify-center">
                <FiBarChart2 size={16} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Valoración IA</h2>
              <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full">BETA</span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">Análisis financiero profesional con IA</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <FiX size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Steps */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  i === step ? "bg-brand-600 text-white" :
                  i < step ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"
                }`}>
                  {i < step ? <FiCheckCircle size={11} /> : <span>{i + 1}</span>}
                  {s}
                </div>
                {i < STEPS.length - 1 && <div className={`h-px w-6 ${i < step ? "bg-emerald-300" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── STEP 0: Upload ── */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 flex gap-3">
                <FiInfo size={18} className="text-violet-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-violet-800">
                  <p className="font-semibold mb-1">¿Qué documentos puedo subir?</p>
                  <ul className="space-y-0.5 text-violet-700">
                    <li>• Estado de Resultados (P&L) — últimos 1-3 años</li>
                    <li>• Balance General</li>
                    <li>• Flujo de Caja / Cash Flow Statement</li>
                    <li>• Formatos: PDF, imagen (foto del doc), Excel, CSV</li>
                  </ul>
                </div>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragging ? "border-brand-400 bg-brand-50" :
                  file ? "border-emerald-400 bg-emerald-50" : "border-gray-300 hover:border-brand-400 hover:bg-gray-50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_EXT}
                  className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]); }}
                />
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FiCheckCircle size={36} className="text-emerald-500" />
                    <p className="font-semibold text-emerald-700">{file.name}</p>
                    <p className="text-sm text-emerald-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="text-xs text-gray-400 hover:text-gray-600 underline mt-1"
                    >
                      Cambiar archivo
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <FiUploadCloud size={40} className="text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-700">Arrastra tu archivo aquí</p>
                      <p className="text-sm text-gray-400 mt-1">o haz clic para seleccionar</p>
                    </div>
                    <p className="text-xs text-gray-400">PDF • Excel • CSV • Imagen — máx. {MAX_MB} MB</p>
                  </div>
                )}
              </div>

              {/* Extra context */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contexto adicional <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  value={extraContext}
                  onChange={(e) => setExtraContext(e.target.value.slice(0, 1000))}
                  className="input-field h-20 resize-none text-sm"
                  placeholder="Ej: La empresa tiene 5 años operando, tiene 2 contratos recurrentes por $50M anuales, activos propios valorados en $200M..."
                />
                <p className="text-xs text-gray-400 mt-1">{extraContext.length}/1000 caracteres</p>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                  <FiAlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={!file}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiBarChart2 size={18} />
                Generar Valoración con IA
              </button>
            </div>
          )}

          {/* ── STEP 1: Loading ── */}
          {step === 1 && (
            <div className="flex flex-col items-center justify-center py-16 gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FiBarChart2 size={24} className="text-brand-600" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">Analizando estados financieros</p>
                <p className="text-gray-500 mt-2 max-w-sm">
                  Nuestro modelo de IA está extrayendo datos, calculando el WACC sectorial y generando proyecciones DCF...
                </p>
              </div>
              <div className="flex gap-1">
                {["Extrayendo datos", "Calculando WACC", "Modelo DCF", "Múltiplos", "Ponderando"].map((t, i) => (
                  <span key={t} className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.3}s` }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 2: Results ── */}
          {step === 2 && result && (
            <div className="space-y-5">
              {/* Confidence badge */}
              {(() => {
                const conf = CONFIDENCE_CONFIG[result.nivel_confianza] ?? CONFIDENCE_CONFIG.medio;
                return (
                  <div className={`flex items-start gap-2 ${conf.bg} border ${conf.border} rounded-xl p-3`}>
                    <FiInfo size={15} className={`${conf.color} flex-shrink-0 mt-0.5`} />
                    <div>
                      <span className={`text-xs font-bold ${conf.color}`}>{conf.label}</span>
                      <p className={`text-xs ${conf.color} mt-0.5`}>{result.razon_confianza}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Valuation hero */}
              <div className="bg-gradient-to-br from-brand-600 to-violet-700 rounded-2xl p-6 text-white">
                <p className="text-white/70 text-sm mb-1">Valoración recomendada</p>
                <p className="text-4xl font-black">{formatUSD(result.valoracion_final.valor_recomendado_usd)}</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="text-center">
                    <p className="text-white/60 text-xs">Rango bajo</p>
                    <p className="font-bold text-sm">{formatUSD(result.valoracion_final.valor_bajo_usd)}</p>
                  </div>
                  <div className="flex-1 h-1.5 bg-white/20 rounded-full">
                    <div className="h-full bg-white/60 rounded-full w-2/3" />
                  </div>
                  <div className="text-center">
                    <p className="text-white/60 text-xs">Rango alto</p>
                    <p className="font-bold text-sm">{formatUSD(result.valoracion_final.valor_alto_usd)}</p>
                  </div>
                </div>
                {result.valoracion_final.nota_conversion && (
                  <p className="text-white/60 text-xs mt-3">{result.valoracion_final.nota_conversion}</p>
                )}
              </div>

              {/* Executive summary */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Resumen ejecutivo</p>
                <p className="text-sm text-gray-600 leading-relaxed">{result.resumen_ejecutivo}</p>
                <div className="flex gap-3 mt-3 flex-wrap">
                  <span className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1 text-gray-600">
                    Sector: {result.sector_identificado}
                  </span>
                  <span className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1 text-gray-600">
                    WACC: {result.wacc_usado}%
                  </span>
                  <span className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1 text-gray-600">
                    CIIU: {result.codigo_ciiu}
                  </span>
                </div>
              </div>

              {/* Financial data */}
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleSection("financials")}
                  className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-800 flex items-center gap-2">
                    <FiFileText size={16} className="text-brand-600" /> Datos financieros extraídos
                  </span>
                  {expandedSection === "financials" ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                </button>
                {expandedSection === "financials" && (
                  <div className="px-5 pb-5 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {[
                        { label: "Ingresos anuales", value: formatUSD(result.datos_financieros_extraidos.ingresos_anuales) },
                        { label: "EBITDA", value: formatUSD(result.datos_financieros_extraidos.ebitda) },
                        { label: "Margen EBITDA", value: `${result.datos_financieros_extraidos.margen_ebitda_pct?.toFixed(1)}%` },
                        { label: "Utilidad neta", value: formatUSD(result.datos_financieros_extraidos.utilidad_neta) },
                        { label: "Total activos", value: formatUSD(result.datos_financieros_extraidos.total_activos) },
                        { label: "Deuda neta", value: formatUSD(result.datos_financieros_extraidos.deuda_financiera_neta) },
                        { label: "Flujo caja libre", value: formatUSD(result.datos_financieros_extraidos.flujo_caja_libre) },
                        { label: "Período analizado", value: result.datos_financieros_extraidos.año_datos },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-500">{label}</p>
                          <p className="text-sm font-bold text-gray-900 mt-0.5">{value}</p>
                        </div>
                      ))}
                    </div>
                    {result.datos_financieros_extraidos.supuestos_aplicados?.length > 0 && (
                      <div className="mt-4 bg-amber-50 rounded-xl p-3">
                        <p className="text-xs font-semibold text-amber-700 mb-1.5">Supuestos aplicados</p>
                        <ul className="space-y-1">
                          {result.datos_financieros_extraidos.supuestos_aplicados.map((s, i) => (
                            <li key={i} className="text-xs text-amber-700 flex gap-1"><span>•</span>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Methodologies */}
              {["dcf", "multiplos", "activos_netos"].map((method) => {
                const m = result.metodologias[method as keyof typeof result.metodologias];
                const titles: Record<string, string> = {
                  dcf: "DCF — Flujos de Caja Descontados",
                  multiplos: "Múltiplos de mercado",
                  activos_netos: "Activos netos ajustados",
                };
                return (
                  <div key={method} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => toggleSection(method)}
                      className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FiTrendingUp size={16} className="text-violet-600" />
                        <span className="font-semibold text-gray-800 text-sm">{titles[method]}</span>
                        <span className="text-xs text-gray-400">({m.ponderacion_pct}% peso)</span>
                      </div>
                      {expandedSection === method ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                    </button>
                    {expandedSection === method && (
                      <div className="px-5 pb-5 border-t border-gray-100 mt-0">
                        <p className="text-sm text-gray-600 mt-4 leading-relaxed">{m.justificacion}</p>
                        {method === "dcf" && (
                          <div className="mt-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-violet-50 rounded-xl p-3">
                                <p className="text-xs text-violet-600">Valor empresa (EV)</p>
                                <p className="font-bold text-violet-900">{formatUSD((m as typeof result.metodologias.dcf).valor_empresa_usd)}</p>
                              </div>
                              <div className="bg-violet-50 rounded-xl p-3">
                                <p className="text-xs text-violet-600">Valor patrimonio</p>
                                <p className="font-bold text-violet-900">{formatUSD((m as typeof result.metodologias.dcf).valor_patrimonio_usd)}</p>
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                              <p className="text-xs font-semibold text-gray-700 mb-2">Proyección FCL (5 años)</p>
                              <div className="flex gap-1.5">
                                {(m as typeof result.metodologias.dcf).proyecciones_fcl?.map(({ año, fcl_usd }) => (
                                  <div key={año} className="flex-1 text-center">
                                    <div
                                      className="bg-violet-200 rounded-t mx-auto"
                                      style={{ height: `${Math.max(20, Math.min(80, (fcl_usd / (result.datos_financieros_extraidos.flujo_caja_libre || 1)) * 40))}px`, width: "100%" }}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Año {año}</p>
                                    <p className="text-xs font-bold text-gray-700">{formatUSD(fcl_usd)}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        {method === "multiplos" && (
                          <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className="bg-violet-50 rounded-xl p-3">
                              <p className="text-xs text-violet-600">EV/EBITDA sector: {(m as typeof result.metodologias.multiplos).ev_ebitda_multiplo_sector}x</p>
                              <p className="font-bold text-violet-900">{formatUSD((m as typeof result.metodologias.multiplos).valor_por_ev_ebitda_usd)}</p>
                            </div>
                            <div className="bg-violet-50 rounded-xl p-3">
                              <p className="text-xs text-violet-600">EV/Revenue sector: {(m as typeof result.metodologias.multiplos).ev_revenue_multiplo_sector}x</p>
                              <p className="font-bold text-violet-900">{formatUSD((m as typeof result.metodologias.multiplos).valor_por_ev_revenue_usd)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Key factors */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-emerald-50 rounded-2xl p-4">
                  <p className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-1.5">
                    <FiTrendingUp size={14} /> Factores de valor
                  </p>
                  <ul className="space-y-1.5">
                    {result.factores_clave_valor?.map((f, i) => (
                      <li key={i} className="text-xs text-emerald-700 flex gap-1.5"><span>✓</span>{f}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50 rounded-2xl p-4">
                  <p className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-1.5">
                    <FiAlertTriangle size={14} /> Factores de riesgo
                  </p>
                  <ul className="space-y-1.5">
                    {result.factores_riesgo?.map((f, i) => (
                      <li key={i} className="text-xs text-red-700 flex gap-1.5"><span>⚠</span>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommendations */}
              {result.recomendaciones_vendedor?.length > 0 && (
                <div className="bg-brand-50 rounded-2xl p-4">
                  <p className="text-sm font-semibold text-brand-800 mb-2">💡 Recomendaciones para el vendedor</p>
                  <ul className="space-y-1.5">
                    {result.recomendaciones_vendedor.map((r, i) => (
                      <li key={i} className="text-xs text-brand-700 flex gap-1.5"><span>→</span>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-xs text-gray-400 leading-relaxed">{result.disclaimer}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 2 && result && (
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
            <button
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Solo consultar
            </button>
            <button
              onClick={() => {
                onApplyValuation(result.valoracion_final.valor_recomendado_usd);
                onClose();
              }}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <FiDollarSign size={16} />
              Usar precio sugerido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
