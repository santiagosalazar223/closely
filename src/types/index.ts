export type UserRole = "buyer" | "seller";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  bio: string;
  location: string;
  verified: boolean;
  createdAt: string;
  // Buyer-specific
  investmentRange?: { min: number; max: number };
  interestedCategories?: string[];
  investmentExperience?: string;
  // Seller-specific
  businessCount?: number;
}

export interface BusinessImage {
  url: string;
  alt: string;
}

export interface FinancialInfo {
  annualRevenue: number;
  annualProfit: number;
  askingPrice: number;
  profitMargin: number;
  revenueGrowth: number;
  employeeCount: number;
  yearEstablished: number;
}

export interface Business {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  subcategory: string;
  location: string;
  country: string;
  images: BusinessImage[];
  financials: FinancialInfo;
  highlights: string[];
  tags: string[];
  status: "active" | "pending" | "sold" | "draft";
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  views: number;
  saves: number;
  inquiries: number;
  percentageForSale: number; // 1-100
  sellerName: string;
  sellerAvatar: string;
  sellerVerified: boolean;
}

export interface Match {
  id: string;
  businessId: string;
  buyerId: string;
  sellerId: string;
  status: "pending" | "accepted" | "rejected" | "expired";
  createdAt: string;
  business: Business;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  businessId: string;
  businessTitle: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  otherUser: {
    name: string;
    avatar: string;
    verified: boolean;
  };
}

export interface Notification {
  id: string;
  type: "match" | "message" | "view" | "save" | "inquiry";
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
}

export type BusinessCategory =
  | "Restaurantes y Comida"
  | "Tecnología y SaaS"
  | "E-commerce"
  | "Salud y Bienestar"
  | "Educación"
  | "Servicios Profesionales"
  | "Retail y Tiendas"
  | "Manufactura"
  | "Inmobiliaria"
  | "Entretenimiento"
  | "Transporte y Logística"
  | "Agricultura";
