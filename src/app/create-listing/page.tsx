"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { createBusiness } from "@/lib/hooks/useBusinesses";
import { CATEGORIES } from "@/data/mockData";
import {
  FiImage, FiDollarSign, FiMapPin, FiFileText, FiTag,
  FiUsers, FiTrendingUp, FiCalendar, FiCheck, FiArrowLeft, FiArrowRight,
  FiUpload, FiPercent, FiX, FiAlertCircle, FiZap,
} from "react-icons/fi";
import ValuationModal from "@/components/ValuationModal";
import { getSupabase } from "@/lib/supabase";

const COUNTRIES = [
  "Colombia", "México", "Argentina", "Chile", "Perú", "Ecuador",
  "Venezuela", "Bolivia", "Paraguay", "Uruguay", "Costa Rica", "España", "Otro",
];

export default function CreateListingPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showValuation, setShowValuation] = useState(false);

  // Step 1: Basic info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("");
  const [percentageForSale, setPercentageForSale] = useState(100);

  // Step 2: Financials
  const [askingPrice, setAskingPrice] = useState("");
  const [annualRevenue, setAnnualRevenue] = useState("");
  const [annualProfit, setAnnualProfit] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [yearEstablished, setYearEstablished] = useState(String(new Date().getFullYear() - 3));
  const [revenueGrowth, setRevenueGrowth] = useState("");

  // Step 3: Highlights & Images
  const [highlights, setHighlights] = useState(["", "", ""]);
  const [tags, setTags] = useState("");
  const [imageUrls, setImageUrls] = useState<{ url: string; alt: string }[]>([]);
  const [imageInputUrl, setImageInputUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 4;

  const profitMargin = annualRevenue && annualProfit
    ? ((Number(annualProfit) / Number(annualRevenue)) * 100)
    : 0;

  const roi = askingPrice && annualProfit
    ? ((Number(annualProfit) / Number(askingPrice)) * 100)
    : 0;

  const payback = askingPrice && annualProfit && Number(annualProfit) > 0
    ? (Number(askingPrice) / Number(annualProfit))
    : 0;

  const canProceedStep1 = title.trim() && shortDescription.trim() && category && country;
  const canProceedStep2 = askingPrice && annualRevenue && annualProfit;
  const canProceedStep3 = highlights.filter(h => h.trim()).length >= 1;

  const addImageUrl = () => {
    if (imageInputUrl.trim() && imageUrls.length < 4) {
      setImageUrls(prev => [...prev, { url: imageInputUrl.trim(), alt: title || "Imagen del negocio" }]);
      setImageInputUrl("");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || imageUrls.length >= 4) return;

    const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!ALLOWED.includes(file.type)) {
      setUploadError("Solo se permiten imágenes JPG, PNG o WEBP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("La imagen no puede superar 5 MB.");
      return;
    }

    setUploadError("");
    setUploadingImage(true);
    try {
      const supabase = getSupabase();
      const ext = file.name.split(".").pop();
      const path = `businesses/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("business-images").upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("business-images").getPublicUrl(path);
      setImageUrls(prev => [...prev, { url: data.publicUrl, alt: title || "Imagen del negocio" }]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setUploadError(`Error al subir: ${msg}`);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePublish = async () => {
    if (!profile) {
      setError("Debes iniciar sesión para publicar");
      return;
    }
    setLoading(true);
    setError("");

    const { business, error: createError } = await createBusiness({
      sellerId: profile.id,
      title,
      description,
      shortDescription,
      category,
      subcategory: subcategory || undefined,
      location: location || country,
      country,
      percentageForSale,
      annualRevenue: Number(annualRevenue),
      annualProfit: Number(annualProfit),
      askingPrice: Number(askingPrice),
      profitMargin: Math.round(profitMargin * 10) / 10,
      revenueGrowth: Number(revenueGrowth) || 0,
      employeeCount: Number(employeeCount) || 0,
      yearEstablished: Number(yearEstablished) || new Date().getFullYear(),
      highlights: highlights.filter(h => h.trim()),
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      images: imageUrls.length > 0 ? imageUrls : [
        { url: "https://picsum.photos/800/600?random=1", alt: title }
      ],
      status: "active",
    });

    setLoading(false);
    if (createError) {
      setError(createError);
    } else {
      router.push(business ? `/business/${business.id}` : "/dashboard");
    }
  };

  const stepLabels = ["Información básica", "Datos financieros", "Fotos y highlights", "Revisión y publicación"];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
            <FiArrowLeft size={18} /> Volver
          </button>
          <h1 className="text-3xl font-black text-gray-900">Publicar tu Negocio</h1>
          <p className="text-gray-500 mt-1">Completa la información para atraer compradores calificados.</p>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i < step ? "bg-brand-600" : "bg-gray-200"}`} />
          ))}
        </div>
        <div className="flex justify-between mb-6">
          <span className="text-sm text-gray-500">Paso {step} de {totalSteps}</span>
          <span className="text-sm font-medium text-brand-600">{stepLabels[step - 1]}</span>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">

          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del negocio *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ej: Cadena de Cafeterías 'Café Origen' — Bogotá"
                  className="input-field"
                />
                <p className="text-xs text-gray-400 mt-1">Un título claro y atractivo con el nombre de la marca</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resumen de una línea *
                  <span className="text-gray-400 font-normal ml-1">({shortDescription.length}/120)</span>
                </label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="ej: 5 cafeterías premium en Bogotá con marca consolidada y app de fidelización"
                  className="input-field"
                  maxLength={120}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción completa
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe tu negocio en detalle: historia, qué incluye la venta, ventajas competitivas, por qué es una buena oportunidad de inversión..."
                  className="input-field h-40 resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
                    <option value="">Seleccionar categoría...</option>
                    {CATEGORIES.map(c => (
                      <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subcategoría (opcional)</label>
                  <input
                    type="text"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="ej: Cafeterías, Software B2B..."
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">País *</label>
                  <select value={country} onChange={(e) => setCountry(e.target.value)} className="input-field">
                    <option value="">Seleccionar país...</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad / Región</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="ej: Bogotá, Remoto, LATAM..."
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Porcentaje en venta: <span className="text-brand-600 font-bold">{percentageForSale}%</span>
                  {percentageForSale === 100 && <span className="text-gray-400 ml-2 font-normal">(Venta total)</span>}
                  {percentageForSale < 50 && <span className="text-gray-400 ml-2 font-normal">(Participación minoritaria)</span>}
                  {percentageForSale >= 50 && percentageForSale < 100 && <span className="text-gray-400 ml-2 font-normal">(Control mayoritario)</span>}
                </label>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={percentageForSale}
                  onChange={(e) => setPercentageForSale(parseInt(e.target.value))}
                  className="w-full accent-brand-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1% — Solo participación</span>
                  <span>100% — Venta total</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Financials */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-700 flex items-start gap-3">
                <FiDollarSign className="mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <p className="font-semibold">Información financiera</p>
                  <p className="text-amber-600 mt-0.5">Todos los montos en USD. Solo visible para compradores verificados.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowValuation(true)}
                className="w-full flex items-center justify-between gap-3 bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-2xl p-4 hover:from-violet-100 hover:to-indigo-100 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-violet-700 transition-colors">
                    <FiZap size={18} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-violet-900">Valoración IA con estados financieros</p>
                    <p className="text-xs text-violet-600 mt-0.5">Sube tu EEFF y Claude calculará el precio justo con DCF + múltiplos</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-violet-600 bg-violet-100 px-2.5 py-1 rounded-full whitespace-nowrap">Usar IA</span>
              </button>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Precio de venta (USD) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                    <input
                      type="number"
                      value={askingPrice}
                      onChange={(e) => setAskingPrice(e.target.value)}
                      placeholder="850,000"
                      className="input-field !pl-8"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Revenue anual (USD) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                    <input
                      type="number"
                      value={annualRevenue}
                      onChange={(e) => setAnnualRevenue(e.target.value)}
                      placeholder="720,000"
                      className="input-field !pl-8"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ganancia neta anual (USD) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                    <input
                      type="number"
                      value={annualProfit}
                      onChange={(e) => setAnnualProfit(e.target.value)}
                      placeholder="180,000"
                      className="input-field !pl-8"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Crecimiento anual (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={revenueGrowth}
                      onChange={(e) => setRevenueGrowth(e.target.value)}
                      placeholder="18"
                      className="input-field !pr-8"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número de empleados</label>
                  <input
                    type="number"
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(e.target.value)}
                    placeholder="28"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Año de fundación</label>
                  <input
                    type="number"
                    value={yearEstablished}
                    onChange={(e) => setYearEstablished(e.target.value)}
                    placeholder="2017"
                    min={1950}
                    max={new Date().getFullYear()}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Auto-calculated */}
              {askingPrice && annualProfit && Number(annualProfit) > 0 && (
                <div className="bg-gradient-to-r from-brand-50 to-emerald-50 rounded-2xl p-5">
                  <p className="text-sm font-semibold text-gray-700 mb-4">Métricas calculadas automáticamente:</p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Margen Neto</p>
                      <p className="text-2xl font-black text-brand-700">{profitMargin.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">ROI Anual</p>
                      <p className="text-2xl font-black text-emerald-700">{roi.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Payback</p>
                      <p className="text-2xl font-black text-gray-700">{payback.toFixed(1)}y</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Highlights + Images */}
          {step === 3 && (
            <div className="space-y-8">
              {/* Images */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Imágenes del negocio
                  <span className="text-gray-400 font-normal ml-2">(hasta 4 fotos)</span>
                </label>
                <p className="text-xs text-gray-400 mb-4">
                  Sube fotos desde tu dispositivo o pega una URL. La primera será la portada.
                </p>

                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {imageUrls.map((img, i) => (
                      <div key={i} className="relative aspect-square">
                        <img
                          src={img.url}
                          alt={img.alt}
                          className="w-full h-full object-cover rounded-xl border border-gray-200"
                          onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/200/200?random=${i}`; }}
                        />
                        {i === 0 && (
                          <span className="absolute top-1 left-1 bg-brand-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            PORTADA
                          </span>
                        )}
                        <button
                          onClick={() => setImageUrls(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                        >
                          <FiX size={10} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {imageUrls.length < 4 && (
                  <div className="space-y-3">
                    {/* Upload from device */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="w-full flex items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-2xl py-6 text-gray-500 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-all disabled:opacity-50"
                    >
                      {uploadingImage ? (
                        <>
                          <span className="w-5 h-5 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <FiUpload size={20} />
                          Subir foto desde tu dispositivo
                        </>
                      )}
                    </button>

                    {/* URL input */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-xs text-gray-400">o pega una URL</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={imageInputUrl}
                        onChange={e => setImageInputUrl(e.target.value)}
                        placeholder="https://imagen-de-tu-negocio.com/foto.jpg"
                        className="input-field flex-1"
                        onKeyDown={e => e.key === "Enter" && addImageUrl()}
                      />
                      <button
                        type="button"
                        onClick={addImageUrl}
                        disabled={!imageInputUrl.trim()}
                        className="btn-primary disabled:opacity-40"
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                )}

                {uploadError && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <FiAlertCircle size={12} /> {uploadError}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Tip: Si no tienes fotos ahora, puedes agregarlas después. Usaremos una imagen de muestra.
                </p>
              </div>

              {/* Highlights */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Highlights — puntos clave *
                </label>
                <p className="text-xs text-gray-400 mb-4">
                  Los 3-5 aspectos más atractivos de tu negocio para inversores. Sé específico y usa números.
                </p>
                <div className="space-y-3">
                  {highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FiCheck size={14} className="text-emerald-600" />
                      </div>
                      <input
                        type="text"
                        value={h}
                        onChange={(e) => {
                          const newH = [...highlights];
                          newH[i] = e.target.value;
                          setHighlights(newH);
                        }}
                        placeholder={[
                          "ej: 7 años de operación continua y rentable",
                          "ej: 25% margen de ganancia neta",
                          "ej: Crecimiento del 18% YoY (últimos 3 años)",
                          "ej: Base de 4,500 clientes activos",
                          "ej: Contratos de arrendamiento hasta 2029",
                        ][i] || "ej: Otro punto clave del negocio"}
                        className="input-field flex-1 !py-2.5"
                      />
                      {highlights.length > 2 && (
                        <button
                          onClick={() => setHighlights(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <FiX size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  {highlights.length < 7 && (
                    <button
                      type="button"
                      onClick={() => setHighlights([...highlights, ""])}
                      className="text-sm text-brand-600 font-medium hover:text-brand-700 flex items-center gap-1"
                    >
                      + Agregar highlight
                    </button>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags / Palabras clave
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="ej: café, franquicia, premium, latam, tecnología (separar con comas)"
                  className="input-field"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Review */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-sm text-emerald-700 flex items-start gap-3">
                <FiCheck className="mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <p className="font-semibold">¡Todo listo para publicar!</p>
                  <p className="text-emerald-600 mt-0.5">Revisa que la información sea correcta antes de publicar.</p>
                </div>
              </div>

              <div className="space-y-1">
                {[
                  { label: "Nombre", value: title },
                  { label: "Categoría", value: category },
                  { label: "País", value: country },
                  { label: "Ubicación", value: location || country },
                  { label: "% en venta", value: `${percentageForSale}%` },
                  { label: "Precio de venta", value: `$${Number(askingPrice || 0).toLocaleString()} USD` },
                  { label: "Revenue anual", value: `$${Number(annualRevenue || 0).toLocaleString()} USD` },
                  { label: "Ganancia neta", value: `$${Number(annualProfit || 0).toLocaleString()} USD` },
                  { label: "Crecimiento", value: revenueGrowth ? `${revenueGrowth}%` : "No definido" },
                  { label: "Empleados", value: employeeCount || "No definido" },
                  { label: "Año fundación", value: yearEstablished },
                  { label: "Highlights", value: `${highlights.filter(h => h.trim()).length} definidos` },
                  { label: "Imágenes", value: imageUrls.length > 0 ? `${imageUrls.length} foto(s)` : "Imagen de muestra" },
                ].map((row, i) => (
                  <div key={i} className={`flex justify-between py-3 ${i < 12 ? "border-b border-gray-100" : ""}`}>
                    <span className="text-gray-500 text-sm">{row.label}</span>
                    <span className="font-medium text-gray-900 text-sm text-right max-w-xs">{row.value || <span className="text-red-400">Sin definir</span>}</span>
                  </div>
                ))}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <FiAlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                Al publicar, confirmas que la información es verídica y aceptas nuestros{" "}
                <a href="#" className="text-brand-600 hover:underline">Términos de Servicio</a>.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="btn-secondary flex items-center gap-2">
                <FiArrowLeft size={16} /> Anterior
              </button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !canProceedStep1) ||
                  (step === 2 && !canProceedStep2) ||
                  (step === 3 && !canProceedStep3)
                }
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente <FiArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={loading}
                className="btn-accent flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <><FiCheck size={18} /> Publicar Negocio</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="h-24 md:hidden" />

      {showValuation && (
        <ValuationModal
          businessName={title || "Mi negocio"}
          sector={category || "No especificado"}
          onClose={() => setShowValuation(false)}
          onApplyValuation={(recommendedUSD) => {
            setAskingPrice(String(Math.round(recommendedUSD)));
            setShowValuation(false);
          }}
        />
      )}
    </div>
  );
}
