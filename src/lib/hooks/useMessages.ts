"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getSupabase } from "@/lib/supabase";
import { mockConversations, mockMessages } from "@/data/mockData";
import type { Conversation, Message } from "@/types";

export function useConversations(userId: string | undefined) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!userId) {
      setConversations(mockConversations);
      setLoading(false);
      return;
    }

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          businesses (title),
          buyer:profiles!conversations_buyer_id_fkey (id, name, avatar, verified),
          seller:profiles!conversations_seller_id_fkey (id, name, avatar, verified),
          messages (text, created_at, read, sender_id)
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (error || !data || data.length === 0) {
        setConversations(mockConversations);
        return;
      }

      const mapped: Conversation[] = data.map((conv: Record<string, unknown>) => {
        const isBuyer = (conv.buyer_id as string) === userId;
        const other = isBuyer
          ? (conv.seller as Record<string, unknown>)
          : (conv.buyer as Record<string, unknown>);
        const msgs = ((conv.messages as Record<string, unknown>[]) || []).sort(
          (a, b) => new Date(a.created_at as string).getTime() - new Date(b.created_at as string).getTime()
        );
        const lastMsg = msgs[msgs.length - 1];
        const unread = msgs.filter(m => !(m.read as boolean) && (m.sender_id as string) !== userId).length;

        return {
          id: conv.id as string,
          participants: [conv.buyer_id as string, conv.seller_id as string],
          businessId: conv.business_id as string,
          businessTitle: ((conv.businesses as Record<string, unknown>)?.title as string) || "",
          lastMessage: lastMsg ? (lastMsg.text as string) : "",
          lastMessageTime: lastMsg ? (lastMsg.created_at as string) : (conv.created_at as string),
          unreadCount: unread,
          otherUser: {
            name: (other?.name as string) || "",
            avatar: (other?.avatar as string) || "",
            verified: (other?.verified as boolean) || false,
          },
        };
      });

      setConversations(mapped);
    } catch {
      setConversations(mockConversations);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return { conversations, loading, refetch: fetchConversations };
}

export function useMessages(conversationId: string | null, userId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<ReturnType<typeof getSupabase>["channel"]> | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setLoading(false);
      return;
    }

    const loadMessages = async () => {
      setLoading(true);
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true });

        if (error || !data || data.length === 0) {
          const mockMsgs = mockMessages[conversationId] || [];
          setMessages(mockMsgs);
          return;
        }

        setMessages(data.map((m: Record<string, unknown>) => ({
          id: m.id as string,
          conversationId: m.conversation_id as string,
          senderId: m.sender_id as string,
          text: m.text as string,
          timestamp: m.created_at as string,
          read: m.read as boolean,
        })));

        // Marcar como leídos
        if (userId) {
          supabase
            .from("messages")
            .update({ read: true })
            .eq("conversation_id", conversationId)
            .neq("sender_id", userId)
            .eq("read", false)
            .then(() => {});
        }
      } catch {
        const mockMsgs = mockMessages[conversationId] || [];
        setMessages(mockMsgs);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Realtime subscription
    const supabase = getSupabase();
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const m = payload.new as Record<string, unknown>;
          setMessages(prev => [...prev, {
            id: m.id as string,
            conversationId: m.conversation_id as string,
            senderId: m.sender_id as string,
            text: m.text as string,
            timestamp: m.created_at as string,
            read: m.read as boolean,
          }]);
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, userId]);

  const sendMessage = useCallback(async (text: string, senderId: string) => {
    if (!conversationId) return;
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: senderId,
        text,
        read: false,
      });
      if (error) throw error;
    } catch {
      // Optimistic update only (mock mode)
      const tempMsg: Message = {
        id: `temp-${Date.now()}`,
        conversationId,
        senderId,
        text,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setMessages(prev => [...prev, tempMsg]);
    }
  }, [conversationId]);

  return { messages, loading, sendMessage };
}

export async function sendDirectMessage(
  conversationId: string,
  senderId: string,
  text: string
): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: senderId,
    text,
    read: false,
  });
  return !error;
}

export async function getOrCreateConversation(
  businessId: string,
  buyerId: string,
  sellerId: string
): Promise<string | null> {
  const supabase = getSupabase();

  // Check existing
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("business_id", businessId)
    .eq("buyer_id", buyerId)
    .eq("seller_id", sellerId)
    .single();

  if (existing) return existing.id as string;

  const { data, error } = await supabase
    .from("conversations")
    .insert({ business_id: businessId, buyer_id: buyerId, seller_id: sellerId })
    .select("id")
    .single();

  if (error || !data) return null;
  return data.id as string;
}
