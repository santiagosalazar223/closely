"use client";

import { useRef, useEffect, useState } from "react";
import { formatCurrency, getPaybackPeriod, getMonthlyFreeCash } from "@/utils/financialTranslator";
import { FiHeart, FiMessageCircle, FiShare2, FiBookmark } from "react-icons/fi";
import Link from 'next/link';

interface ReelCardProps {
  business: any; // We use any for brevity in MVP schema
  isActive: boolean;
}

export default function ReelCard({ business, isActive }: ReelCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="relative w-full h-[100dvh] snap-start snap-always shrink-0 group">
      {/* Fallback image in case video is hidden/fails */}
      <div 
         className="absolute inset-0 bg-cover bg-center z-0"
         style={{ backgroundImage: `url(${business.images && business.images.length > 0 ? business.images[0].url : "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80"})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Video layer */}
      <video
        ref={videoRef}
        src={business.videoUrl}
        poster={business.images && business.images.length > 0 ? business.images[0].url : "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80"}
        className="relative z-10 w-full h-full object-cover"
        loop
        playsInline
        muted // Muted to allow auto-play
        onClick={togglePlay}
        onError={(e) => {
           // En caso de que el video de Pexels sea bloqueado
           const target = e.target as HTMLVideoElement;
           target.style.display = 'none'; 
        }}
      />

      {/* Dim overlay */}
      <div className="absolute inset-0 z-20 bg-gradient-to-b from-black/10 via-transparent to-black/80 pointer-events-none" />

      {/* Information Overlay */}
      <div className="absolute bottom-0 left-0 right-16 p-6 pb-20 pointer-events-none flex flex-col justify-end">
        <div className="flex items-center gap-2 mb-3">
          {business.seller && business.seller.avatar && (
            <img src={business.seller.avatar} className="w-10 h-10 rounded-full border-2 border-brand-500 shadow-md" />
          )}
          <span className="font-bold text-white shadow-sm">@{business.seller?.name?.split(' ')[0] || 'Gestor'}</span>
          <button className="ml-2 text-xs font-semibold bg-transparent border border-white text-white px-3 py-1 rounded-full pointer-events-auto hover:bg-white hover:text-black transition-colors">
            Contactar
          </button>
        </div>

        <h2 className="text-xl font-bold text-white mb-2 leading-tight drop-shadow-md">
          {business.title}
        </h2>
        
        <p className="text-white/90 text-sm mb-4 line-clamp-2 drop-shadow-sm">
          {business.shortDescription}
        </p>

        {/* Financials translated */}
        <div className="flex flex-col gap-2 relative z-10 pointer-events-auto">
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <p className="text-white font-semibold text-lg">{formatCurrency(business.askingPrice)}</p>
            <p className="text-emerald-400 text-sm font-medium">{getMonthlyFreeCash(business.annualProfit)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 inline-block w-fit">
            <p className="text-white/90 text-xs text-center">{getPaybackPeriod(business.askingPrice, business.annualProfit)}</p>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay (TikTok style actions) */}
      <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center z-10">
        <button 
          onClick={() => setLiked(!liked)} 
          className="flex flex-col items-center gap-1 group"
        >
          <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center transform transition-all active:scale-95">
            <FiHeart size={24} className={`${liked ? 'text-red-500 fill-red-500' : 'text-white'} transition-colors`} />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-md">
             {liked ? business.views + 1 : business.views}
          </span>
        </button>

        <button className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center transform transition-all active:scale-95">
             <FiMessageCircle size={24} className="text-white" />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-md">Chat</span>
        </button>

        <button 
          onClick={() => setSaved(!saved)}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center transform transition-all active:scale-95">
            <FiBookmark size={24} className={`${saved ? 'text-amber-400 fill-amber-400' : 'text-white'} transition-colors`} />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-md">Guardar</span>
        </button>

        <button className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center transform transition-all active:scale-95">
            <FiShare2 size={24} className="text-white" />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-md">Compartir</span>
        </button>
      </div>
      
    </div>
  );
}
