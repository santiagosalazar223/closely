"use client";

import { useState } from "react";
import Link from "next/link";
import { Business } from "@/types";
import { formatCurrency } from "@/data/mockData";
import { FiHeart, FiMapPin, FiTrendingUp, FiUsers, FiBookmark, FiShare2, FiMessageSquare } from "react-icons/fi";

interface Props {
  business: Business;
  variant?: "grid" | "featured" | "compact";
}

export default function BusinessCard({ business, variant = "grid" }: Props) {
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  if (variant === "featured") {
    return (
      <Link href={`/business/${business.id}`} className="block group">
        <div className="relative rounded-3xl overflow-hidden shadow-lg card-hover bg-white">
          <div className="relative h-80">
            <img
              src={business.images[0]?.url}
              alt={business.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="gradient-overlay absolute inset-0" />
            {business.percentageForSale < 100 && (
              <div className="absolute top-4 left-4 badge bg-amber-400 text-amber-900 font-semibold">
                {business.percentageForSale}% en venta
              </div>
            )}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={(e) => { e.preventDefault(); setSaved(!saved); }}
                className={`p-2.5 rounded-full backdrop-blur-md transition-all ${saved ? "bg-brand-500 text-white" : "bg-white/20 text-white hover:bg-white/30"}`}
              >
                <FiBookmark size={18} fill={saved ? "currentColor" : "none"} />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="badge bg-white/20 text-white backdrop-blur-md">{business.category}</span>
                {business.featured && <span className="badge bg-amber-400 text-amber-900">Destacado</span>}
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{business.title}</h3>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <FiMapPin size={14} />
                <span>{business.location}</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{business.shortDescription}</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Precio</p>
                <p className="text-lg font-bold text-brand-700">{formatCurrency(business.financials.askingPrice)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Revenue</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(business.financials.annualRevenue)}/año</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Crecimiento</p>
                <p className="text-lg font-bold text-emerald-600">+{business.financials.revenueGrowth}%</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <img src={business.sellerAvatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                <span className="text-sm text-gray-600">{business.sellerName}</span>
                {business.sellerVerified && (
                  <span className="text-brand-500 text-xs">✓</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <span className="flex items-center gap-1"><FiUsers size={14} />{business.views}</span>
                <span className="flex items-center gap-1"><FiHeart size={14} />{business.saves}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={`/business/${business.id}`} className="block group">
        <div className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 card-hover">
          <div className="relative w-28 h-28 rounded-xl overflow-hidden flex-shrink-0">
            <img src={business.images[0]?.url} alt="" className="w-full h-full object-cover" />
            {business.percentageForSale < 100 && (
              <div className="absolute top-1 left-1 badge bg-amber-400 text-amber-900 text-[10px]">
                {business.percentageForSale}%
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate group-hover:text-brand-600 transition-colors">
              {business.title}
            </h4>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
              <FiMapPin size={12} /> {business.location}
            </div>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{business.shortDescription}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm font-bold text-brand-700">{formatCurrency(business.financials.askingPrice)}</span>
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
                <FiTrendingUp size={12} />+{business.financials.revenueGrowth}%
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid variant (Instagram-style)
  return (
    <Link href={`/business/${business.id}`} className="block group">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 card-hover">
        {/* Image carousel */}
        <div className="relative aspect-[4/3]">
          <img
            src={business.images[imgIdx]?.url}
            alt={business.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="gradient-overlay-light absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Image dots */}
          {business.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {business.images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); setImgIdx(i); }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIdx ? "bg-white w-4" : "bg-white/50"}`}
                />
              ))}
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {business.featured && (
              <span className="badge bg-amber-400 text-amber-900 font-semibold text-[10px]">⭐ Destacado</span>
            )}
            {business.percentageForSale < 100 && (
              <span className="badge bg-white/90 text-gray-700 font-semibold text-[10px] backdrop-blur-sm">
                {business.percentageForSale}% en venta
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
              className={`p-2 rounded-full backdrop-blur-md transition-all ${liked ? "bg-red-500 text-white" : "bg-white/20 text-white hover:bg-white/30"}`}
            >
              <FiHeart size={16} fill={liked ? "currentColor" : "none"} />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); setSaved(!saved); }}
              className={`p-2 rounded-full backdrop-blur-md transition-all ${saved ? "bg-brand-500 text-white" : "bg-white/20 text-white hover:bg-white/30"}`}
            >
              <FiBookmark size={16} fill={saved ? "currentColor" : "none"} />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); }}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md transition-all"
            >
              <FiShare2 size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase tracking-wider text-brand-600 font-semibold">{business.category}</span>
              <h3 className="font-semibold text-gray-900 mt-0.5 line-clamp-1 group-hover:text-brand-600 transition-colors">
                {business.title}
              </h3>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                <FiMapPin size={11} /> {business.location}
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{business.shortDescription}</p>

          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 uppercase">Precio</p>
              <p className="text-sm font-bold text-brand-700">{formatCurrency(business.financials.askingPrice)}</p>
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 uppercase">Revenue</p>
              <p className="text-sm font-bold text-gray-700">{formatCurrency(business.financials.annualRevenue)}/a</p>
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 uppercase">Margen</p>
              <p className="text-sm font-bold text-emerald-600">{business.financials.profitMargin}%</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1.5">
              <img src={business.sellerAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
              <span className="text-xs text-gray-500">{business.sellerName}</span>
              {business.sellerVerified && <span className="text-brand-500 text-[10px]">✓</span>}
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="flex items-center gap-0.5 text-[10px]"><FiUsers size={10} />{business.views}</span>
              <span className="flex items-center gap-0.5 text-[10px]"><FiMessageSquare size={10} />{business.inquiries}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
