"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";
import { mockBusinesses } from "@/data/mockData";
import type { Business } from "@/types";

export interface BusinessFilters {
  search?: string;
  category?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sellerId?: string;
  status?: "active" | "pending" | "sold" | "draft";
}

function dbRowToBusiness(row: Record<string, unknown>, images: Record<string, unknown>[]): Business {
  return {
    id: row.id as string,
    sellerId: row.seller_id as string,
    title: row.title as string,
    description: row.description as string,
    shortDescription: row.short_description as string,
    category: row.category as string,
    subcategory: (row.subcategory as string) || "",
    location: row.location as string,
    country: row.country as string,
    images: images.map((img) => ({ url: img.url as string, alt: img.alt as string })),
    financials: {
      annualRevenue: row.annual_revenue as number,
      annualProfit: row.annual_profit as number,
      askingPrice: row.asking_price as number,
      profitMargin: row.profit_margin as number,
      revenueGrowth: row.revenue_growth as number,
      employeeCount: row.employee_count as number,
      yearEstablished: row.year_established as number,
    },
    highlights: (row.highlights as string[]) || [],
    tags: (row.tags as string[]) || [],
    status: row.status as Business["status"],
    featured: row.featured as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    views: row.views as number,
    saves: row.saves as number,
    inquiries: row.inquiries as number,
    percentageForSale: row.percentage_for_sale as number,
    sellerName: (row.seller_name as string) || "",
    sellerAvatar: (row.seller_avatar as string) || "",
    sellerVerified: (row.seller_verified as boolean) || false,
  };
}

export function useBusinesses(filters: BusinessFilters = {}) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Fallback to mock if Supabase not configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("TU_PROJECT")) {
      setBusinesses(applyFiltersToMock(mockBusinesses, filters));
      setLoading(false);
      return;
    }

    try {
      const supabase = getSupabase();

      // Timeout after 6 seconds → fall back to mock data
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 6000)
      );

      let query = supabase
        .from("businesses")
        .select(`
          *,
          profiles!businesses_seller_id_fkey (
            name, avatar, verified
          ),
          business_images (
            url, alt, order_index
          )
        `)
        .eq("status", filters.status || "active");

      if (filters.category) query = query.eq("category", filters.category);
      if (filters.country) query = query.eq("country", filters.country);
      if (filters.minPrice) query = query.gte("asking_price", filters.minPrice);
      if (filters.maxPrice) query = query.lte("asking_price", filters.maxPrice);
      if (filters.sellerId) query = query.eq("seller_id", filters.sellerId);
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%`);
      }

      switch (filters.sortBy) {
        case "price-asc": query = query.order("asking_price", { ascending: true }); break;
        case "price-desc": query = query.order("asking_price", { ascending: false }); break;
        case "growth": query = query.order("revenue_growth", { ascending: false }); break;
        case "newest": query = query.order("created_at", { ascending: false }); break;
        case "popular": query = query.order("views", { ascending: false }); break;
        default: query = query.order("featured", { ascending: false }).order("created_at", { ascending: false }); break;
      }

      const { data, error: supabaseError } = await Promise.race([query, timeoutPromise]);

      if (supabaseError) throw supabaseError;

      if (!data || data.length === 0) {
        // Fallback a mock data si no hay datos en Supabase
        setBusinesses(applyFiltersToMock(mockBusinesses, filters));
        return;
      }

      const mapped: Business[] = (data as unknown as Record<string, unknown>[]).map((row) => {
        const profile = row.profiles as Record<string, unknown> | null;
        const imgs = ((row.business_images as Record<string, unknown>[]) || [])
          .sort((a, b) => (a.order_index as number) - (b.order_index as number));
        return dbRowToBusiness(
          { ...row, seller_name: profile?.name, seller_avatar: profile?.avatar, seller_verified: profile?.verified },
          imgs
        );
      });

      setBusinesses(mapped);
    } catch {
      // Siempre hacer fallback a mock en caso de error (sin Supabase configurado)
      setBusinesses(applyFiltersToMock(mockBusinesses, filters));
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.category, filters.country, filters.minPrice, filters.maxPrice, filters.sortBy, filters.sellerId, filters.status]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  return { businesses, loading, error, refetch: fetchBusinesses };
}

export function useBusiness(id: string) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const fetch = async () => {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from("businesses")
          .select(`
            *,
            profiles!businesses_seller_id_fkey (name, avatar, verified),
            business_images (url, alt, order_index)
          `)
          .eq("id", id)
          .single();

        if (error || !data) {
          const mock = mockBusinesses.find(b => b.id === id) || null;
          setBusiness(mock);
          return;
        }

        const row = data as unknown as Record<string, unknown>;
        const profile = row.profiles as Record<string, unknown> | null;
        const imgs = ((row.business_images as Record<string, unknown>[]) || [])
          .sort((a, b) => (a.order_index as number) - (b.order_index as number));

        setBusiness(dbRowToBusiness(
          { ...row, seller_name: profile?.name, seller_avatar: profile?.avatar, seller_verified: profile?.verified },
          imgs
        ));

        // Incrementar views en background
        supabase.rpc("increment_business_views", { business_id: id }).then(() => {});
      } catch {
        const mock = mockBusinesses.find(b => b.id === id) || null;
        setBusiness(mock);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [id]);

  return { business, loading };
}

export async function saveBusiness(businessId: string, userId: string): Promise<{ saved: boolean; error?: string }> {
  const supabase = getSupabase();

  const { data: existing } = await supabase
    .from("saved_businesses")
    .select("id")
    .eq("user_id", userId)
    .eq("business_id", businessId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("saved_businesses")
      .delete()
      .eq("user_id", userId)
      .eq("business_id", businessId);
    return { saved: false, error: error?.message };
  } else {
    const { error } = await supabase
      .from("saved_businesses")
      .insert({ user_id: userId, business_id: businessId });
    return { saved: true, error: error?.message };
  }
}

export async function isBusinessSaved(businessId: string, userId: string): Promise<boolean> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("saved_businesses")
    .select("id")
    .eq("user_id", userId)
    .eq("business_id", businessId)
    .single();
  return !!data;
}

export async function createBusiness(
  data: {
    sellerId: string;
    title: string;
    description: string;
    shortDescription: string;
    category: string;
    subcategory?: string;
    location: string;
    country: string;
    percentageForSale: number;
    annualRevenue: number;
    annualProfit: number;
    askingPrice: number;
    profitMargin: number;
    revenueGrowth: number;
    employeeCount: number;
    yearEstablished: number;
    highlights: string[];
    tags: string[];
    images: { url: string; alt: string }[];
    status?: "active" | "draft";
  }
): Promise<{ business: { id: string } | null; error: string | null }> {
  const supabase = getSupabase();

  const { data: inserted, error } = await supabase
    .from("businesses")
    .insert({
      seller_id: data.sellerId,
      title: data.title,
      description: data.description,
      short_description: data.shortDescription,
      category: data.category,
      subcategory: data.subcategory,
      location: data.location,
      country: data.country,
      percentage_for_sale: data.percentageForSale,
      annual_revenue: data.annualRevenue,
      annual_profit: data.annualProfit,
      asking_price: data.askingPrice,
      profit_margin: data.profitMargin,
      revenue_growth: data.revenueGrowth,
      employee_count: data.employeeCount,
      year_established: data.yearEstablished,
      highlights: data.highlights,
      tags: data.tags,
      featured: false,
      status: data.status || "active",
    })
    .select("id")
    .single();

  if (error || !inserted) return { business: null, error: error?.message || "Error creando negocio" };

  // Insert images
  if (data.images.length > 0) {
    await supabase.from("business_images").insert(
      data.images.map((img, idx) => ({
        business_id: inserted.id,
        url: img.url,
        alt: img.alt,
        order_index: idx,
      }))
    );
  }

  return { business: inserted, error: null };
}

function applyFiltersToMock(businesses: Business[], filters: BusinessFilters): Business[] {
  let result = [...businesses];
  if (filters.search) {
    const s = filters.search.toLowerCase();
    result = result.filter(b =>
      b.title.toLowerCase().includes(s) ||
      b.shortDescription.toLowerCase().includes(s) ||
      b.category.toLowerCase().includes(s)
    );
  }
  if (filters.category) result = result.filter(b => b.category === filters.category);
  if (filters.country) result = result.filter(b => b.country === filters.country);
  if (filters.minPrice) result = result.filter(b => b.financials.askingPrice >= filters.minPrice!);
  if (filters.maxPrice) result = result.filter(b => b.financials.askingPrice <= filters.maxPrice!);
  if (filters.sellerId) result = result.filter(b => b.sellerId === filters.sellerId);
  switch (filters.sortBy) {
    case "price-asc": result.sort((a, b) => a.financials.askingPrice - b.financials.askingPrice); break;
    case "price-desc": result.sort((a, b) => b.financials.askingPrice - a.financials.askingPrice); break;
    case "growth": result.sort((a, b) => b.financials.revenueGrowth - a.financials.revenueGrowth); break;
    case "newest": result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
    case "popular": result.sort((a, b) => b.views - a.views); break;
    default: result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break;
  }
  return result;
}
