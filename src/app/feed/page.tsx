"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import BusinessCard from "@/components/BusinessCard";
import { useBusinesses } from "@/lib/hooks/useBusinesses";
import { CATEGORIES, formatCurrency } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";
import { FiSearch, FiFilter, FiX, FiGrid, FiList, FiRefreshCw } from "react-icons/fi";

export default function FeedPage() {
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [activeSearch, setActiveSearch] = useState("");

  const { businesses, loading, refetch } = useBusinesses({
    search: activeSearch || undefined,
    category: selectedCategory || undefined,
    country: selectedCountry || undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 10000000 ? priceRange[1] : undefined,
    sortBy,
  });

  const countries = useMemo(() => Array.from(new Set(businesses.map(b => b.country))).sort(), [businesses]);
  const featuredBiz = businesses.filter(b => b.featured);
  const regularBiz = businesses.filter(b => !b.featured);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(search);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedCountry(null);
    setPriceRange([0, 10000000]);
    setSearch("");
    setActiveSearch("");
  };

  const activeFiltersCount = [selectedCategory, selectedCountry, priceRange[1] < 10000000 ? "price" : null].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header + Search */}
      <div className="bg-white border-b border-gray-100 sticky top-[64px] z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                {profile?.role === "buyer" ? "Explorar Negocios" : "Marketplace"}
              </h1>
              <p className="text-gray-500 text-xs md:text-sm mt-0.5">
                {loading ? "Cargando..." : `${businesses.length} negocios disponibles`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refetch}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                title="Actualizar"
              >
                <FiRefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-brand-50 text-brand-600" : "text-gray-400 hover:bg-gray-100"}`}
              >
                <FiGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors hidden md:flex ${viewMode === "list" ? "bg-brand-50 text-brand-600" : "text-gray-400 hover:bg-gray-100"}`}
              >
                <FiList size={18} />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (e.target.value === "") setActiveSearch("");
                }}
                placeholder="Buscar negocios por nombre, categoría..."
                className="input-field !pl-12 !py-3"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(""); setActiveSearch(""); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX size={18} />
                </button>
              )}
            </div>
            <button type="submit" className="btn-primary !py-3 !px-5">
              Buscar
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center gap-2 !py-3 ${showFilters ? "!bg-brand-50 !text-brand-600 !border-brand-200" : ""}`}
            >
              <FiFilter size={16} />
              <span className="hidden sm:inline">Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 bg-brand-600 text-white text-[10px] rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </form>

          {/* Filters panel */}
          {showFilters && (
            <div className="mt-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                  <select
                    value={selectedCategory || ""}
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                    className="input-field !py-2.5"
                  >
                    <option value="">Todas las categorías</option>
                    {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
                  <select
                    value={selectedCountry || ""}
                    onChange={(e) => setSelectedCountry(e.target.value || null)}
                    className="input-field !py-2.5"
                  >
                    <option value="">Todos los países</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field !py-2.5">
                    <option value="featured">Destacados</option>
                    <option value="newest">Más recientes</option>
                    <option value="price-asc">Precio: menor a mayor</option>
                    <option value="price-desc">Precio: mayor a menor</option>
                    <option value="growth">Mayor crecimiento</option>
                    <option value="popular">Más populares</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio máximo: {formatCurrency(priceRange[1])}
                </label>
                <input
                  type="range"
                  min={0}
                  max={10000000}
                  step={50000}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full accent-brand-600"
                />
              </div>

              {activeFiltersCount > 0 && (
                <button onClick={clearFilters} className="mt-4 text-sm text-brand-600 font-medium hover:text-brand-700">
                  Limpiar filtros ({activeFiltersCount})
                </button>
              )}
            </div>
          )}

          {/* Category pills */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !selectedCategory ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Todos
            </button>
            {CATEGORIES.slice(0, 10).map(cat => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat.name ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden border border-gray-100 animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSearch size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron resultados</h3>
            <p className="text-gray-500 mb-4">Intenta ajustar tus filtros o términos de búsqueda</p>
            <button onClick={clearFilters} className="btn-primary">Limpiar filtros</button>
          </div>
        ) : (
          <>
            {/* Featured */}
            {featuredBiz.length > 0 && !activeSearch && !selectedCategory && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-amber-500">⭐</span>
                  <h2 className="text-xl font-bold text-gray-900">Destacados</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  {featuredBiz.slice(0, 2).map(biz => (
                    <BusinessCard key={biz.id} business={biz} variant="featured" />
                  ))}
                </div>
              </div>
            )}

            {/* All / Results */}
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {activeSearch || selectedCategory ? `Resultados (${businesses.length})` : "Todos los Negocios"}
              </h2>
            </div>

            {viewMode === "grid" ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {(activeSearch || selectedCategory ? businesses : regularBiz.length > 0 ? regularBiz : businesses).map(biz => (
                  <BusinessCard key={biz.id} business={biz} variant="grid" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {(activeSearch || selectedCategory ? businesses : regularBiz.length > 0 ? regularBiz : businesses).map(biz => (
                  <BusinessCard key={biz.id} business={biz} variant="compact" />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile bottom spacer */}
      <div className="h-24 md:hidden" />
    </div>
  );
}
