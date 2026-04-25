"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReelCard from "./ReelCard";
import Navbar from "./Navbar";

interface Props {
  businesses: any[];
}

export default function DiscoverFeedClient({ businesses }: Props) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const { scrollTop, clientHeight } = containerRef.current;
      // Calculate which video is mostly in view
      const index = Math.round(scrollTop / clientHeight);
      setActiveIndex(index);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
    }
    return () => {
      if (container) container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    // Si llega al 3er video (índice 2) y no tiene perfil, mostramos el paywall
    if (activeIndex >= 2) {
      if (!localStorage.getItem('onboardingCompleted')) {
        setShowPaywall(true);
      }
    }
  }, [activeIndex]);

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900 flex justify-center sm:items-center">
      <div className="h-[100dvh] w-full sm:max-w-[414px] sm:h-[90dvh] bg-black flex flex-col overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.5)] sm:rounded-[40px] sm:border-[8px] sm:border-neutral-800">
      {/* Absolute Navbar matching Tiktok styles with Transparent BG */}
      <div className="absolute top-0 left-0 right-0 z-50 px-4 pt-6 pb-2 bg-gradient-to-b from-black/60 to-transparent flex justify-between items-center text-white">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-accent-400">BizSwipe</h1>
        <div className="flex gap-4 font-semibold text-sm drop-shadow-md">
           <span className="opacity-60 cursor-pointer">Siguiendo</span>
           <span className="border-b-2 border-white pb-1 cursor-pointer">Para ti</span>
        </div>
        <button className="text-white">🔍</button>
      </div>

      {/* Snap Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto snap-y snap-mandatory scrollbar-none pb-[80px]"
      >
        {businesses.map((business, index) => (
          <ReelCard 
            key={business.id} 
            business={business} 
            isActive={index === activeIndex} 
          />
        ))}

        {businesses.length === 0 && (
          <div className="h-full flex items-center justify-center text-white/50">
            No hay más negocios por ahora
          </div>
        )}
      </div>

      {/* Bottom Nav Mockup */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-black flex justify-around items-center text-white/60 text-xs pb-safe border-t border-white/10 z-30">
         <div className="flex flex-col items-center text-white cursor-pointer"><span className="text-xl mb-1">🏠</span> Inicio</div>
         <div className="flex flex-col items-center cursor-pointer"><span className="text-xl mb-1">🔍</span> Buscar</div>
         <div className="flex flex-col items-center cursor-pointer"><div className="w-10 h-7 bg-white text-black rounded flex items-center justify-center font-bold text-lg">+</div></div>
         <div className="flex flex-col items-center cursor-pointer"><span className="text-xl mb-1">💬</span> Mensajes</div>
         <div className="flex flex-col items-center cursor-pointer"><span className="text-xl mb-1">👤</span> Perfil</div>
      </div>

      {/* Onboarding Paywall Overlay */}
      {showPaywall && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="text-6xl mb-4">🔮</div>
          <h2 className="text-3xl font-bold text-white mb-3">Descubre más oportunidades</h2>
          <p className="text-white/70 mb-8 max-w-sm">Para seguir bajando y ver el feed completo necesitas decirnos un par de cosas sobre tus preferencias de inversión.</p>
          <button 
            onClick={() => router.push('/onboarding')}
            className="w-full max-w-xs bg-brand-600 text-white font-bold py-4 rounded-full text-lg shadow-[0_0_20px_rgba(var(--brand-600),0.4)] transition-transform hover:scale-105 active:scale-95"
          >
            Completar mi perfil
          </button>
        </div>
      )}
    </div>
    </div>
  );
}
