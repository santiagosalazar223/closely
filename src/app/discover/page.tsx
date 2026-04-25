"use client";

import { useBusinesses } from "@/lib/hooks/useBusinesses";
import DiscoverFeedClient from "@/components/DiscoverFeedClient";

export default function DiscoverPage() {
  const { businesses, loading } = useBusinesses({ status: "active" });

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return <DiscoverFeedClient businesses={businesses} />;
}
