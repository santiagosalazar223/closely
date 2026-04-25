"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Business } from "@/types";
import { formatCurrency } from "@/data/mockData";
import { FiMapPin, FiTrendingUp, FiDollarSign, FiUsers, FiCalendar } from "react-icons/fi";

interface Props {
  business: Business;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTop: boolean;
}

export default function SwipeCard({ business, onSwipeLeft, onSwipeRight, isTop }: Props) {
  const [imgIdx, setImgIdx] = useState(0);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 120) {
      setExitDirection("right");
      onSwipeRight();
    } else if (info.offset.x < -120) {
      setExitDirection("left");
      onSwipeLeft();
    }
  };

  const nextImg = () => setImgIdx((i) => (i + 1) % business.images.length);
  const prevImg = () => setImgIdx((i) => (i - 1 + business.images.length) % business.images.length);

  return (
    <motion.div
      className="absolute inset-0 swipe-card"
      style={{ x, rotate, zIndex: isTop ? 10 : 0 }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      animate={exitDirection === "right" ? { x: 600, rotate: 20, opacity: 0 } :
               exitDirection === "left" ? { x: -600, rotate: -20, opacity: 0 } : {}}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full h-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
        {/* Image section */}
        <div className="relative h-[55%]" onClick={(e) => {
          const rect = (e.target as HTMLElement).getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          if (clickX < rect.width / 2) prevImg(); else nextImg();
        }}>
          <img
            src={business.images[imgIdx]?.url}
            alt={business.title}
            className="w-full h-full object-cover"
          />
          <div className="gradient-overlay absolute inset-0" />

          {/* Image indicators */}
          <div className="absolute top-4 left-4 right-4 flex gap-1">
            {business.images.map((_, i) => (
              <div key={i} className={`flex-1 h-1 rounded-full ${i === imgIdx ? "bg-white" : "bg-white/30"}`} />
            ))}
          </div>

          {/* LIKE / NOPE stamps */}
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-20 left-6 px-6 py-3 border-4 border-emerald-400 rounded-xl rotate-[-20deg]"
          >
            <span className="text-4xl font-black text-emerald-400">INTERESADO</span>
          </motion.div>
          <motion.div
            style={{ opacity: nopeOpacity }}
            className="absolute top-20 right-6 px-6 py-3 border-4 border-red-400 rounded-xl rotate-[20deg]"
          >
            <span className="text-4xl font-black text-red-400">PASO</span>
          </motion.div>

          {/* Percentage badge */}
          {business.percentageForSale < 100 && (
            <div className="absolute top-14 left-4 badge bg-amber-400 text-amber-900 font-semibold">
              {business.percentageForSale}% en venta
            </div>
          )}

          {/* Bottom info on image */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <span className="badge bg-white/20 text-white backdrop-blur-md mb-2">{business.category}</span>
            <h2 className="text-2xl font-bold text-white leading-tight">{business.title}</h2>
            <div className="flex items-center gap-2 text-white/80 text-sm mt-1">
              <FiMapPin size={14} />
              <span>{business.location}</span>
            </div>
          </div>
        </div>

        {/* Info section */}
        <div className="h-[45%] p-6 overflow-y-auto">
          <p className="text-gray-600 text-sm leading-relaxed mb-4">{business.shortDescription}</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-brand-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-brand-600 mb-1">
                <FiDollarSign size={14} />
                <span className="text-xs font-medium">Precio</span>
              </div>
              <p className="text-lg font-bold text-brand-700">{formatCurrency(business.financials.askingPrice)}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
                <FiTrendingUp size={14} />
                <span className="text-xs font-medium">Revenue anual</span>
              </div>
              <p className="text-lg font-bold text-emerald-700">{formatCurrency(business.financials.annualRevenue)}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-purple-600 mb-1">
                <FiTrendingUp size={14} />
                <span className="text-xs font-medium">Margen neto</span>
              </div>
              <p className="text-lg font-bold text-purple-700">{business.financials.profitMargin}%</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-amber-600 mb-1">
                <FiUsers size={14} />
                <span className="text-xs font-medium">Empleados</span>
              </div>
              <p className="text-lg font-bold text-amber-700">{business.financials.employeeCount}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {business.highlights.slice(0, 3).map((h, i) => (
              <span key={i} className="badge bg-gray-100 text-gray-700 text-[11px]">✓ {h}</span>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            <img src={business.sellerAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
            <div>
              <p className="text-sm font-medium text-gray-900">{business.sellerName}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <FiCalendar size={10} /> Desde {business.financials.yearEstablished}
                {business.sellerVerified && <span className="text-brand-500 ml-1">• Verificado ✓</span>}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
