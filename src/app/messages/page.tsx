"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { useConversations, useMessages } from "@/lib/hooks/useMessages";
import { useAuth } from "@/context/AuthContext";
import { timeAgo } from "@/data/mockData";
import { FiSearch, FiSend, FiInfo, FiArrowLeft, FiCheckCircle, FiMessageCircle } from "react-icons/fi";

export default function MessagesPage() {
  const { profile } = useAuth();
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { conversations, loading: convsLoading } = useConversations(profile?.id);
  const { messages, sendMessage } = useMessages(selectedConvId, profile?.id);

  const selectedConv = conversations.find(c => c.id === selectedConvId);
  const filtered = conversations.filter(c =>
    !searchTerm ||
    c.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.businessTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConvId || !profile) return;
    const text = newMessage.trim();
    setNewMessage("");
    await sendMessage(text, profile.id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-0 md:px-6 py-0 md:py-6">
        <div className="bg-white md:rounded-2xl shadow-sm border-y md:border border-gray-100 overflow-hidden h-[calc(100vh-64px)] md:h-[calc(100vh-120px)] flex">

          {/* Conversations list */}
          <div className={`w-full md:w-96 border-r border-gray-100 flex flex-col flex-shrink-0 ${selectedConvId ? "hidden md:flex" : "flex"}`}>
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Mensajes</h2>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar conversaciones..."
                  className="input-field !py-2.5 !pl-10 !text-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {convsLoading ? (
                <div className="space-y-0">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 animate-pulse border-b border-gray-50">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-2/3" />
                        <div className="h-2 bg-gray-200 rounded w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center">
                  <FiMessageCircle size={32} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No hay conversaciones aún</p>
                  <p className="text-xs text-gray-300 mt-1">Contacta a un vendedor desde un listing</p>
                </div>
              ) : (
                filtered.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedConvId(c.id)}
                    className={`w-full flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${
                      selectedConvId === c.id ? "bg-brand-50 border-l-2 border-l-brand-500" : ""
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={c.otherUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.otherUser.name)}&background=random`}
                        alt={c.otherUser.name}
                        className="w-12 h-12 rounded-full object-cover border border-gray-100"
                      />
                      {c.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="font-semibold text-gray-900 text-sm flex items-center gap-1 truncate">
                          {c.otherUser.name}
                          {c.otherUser.verified && <span className="text-brand-500 text-xs">✓</span>}
                        </p>
                        <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">{timeAgo(c.lastMessageTime)}</span>
                      </div>
                      <p className="text-xs text-brand-600 font-medium truncate">{c.businessTitle}</p>
                      <p className={`text-sm mt-0.5 truncate ${c.unreadCount > 0 ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                        {c.lastMessage || "Sin mensajes aún"}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className={`flex-1 flex flex-col min-w-0 ${!selectedConvId ? "hidden md:flex" : "flex"}`}>
            {!selectedConvId ? (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">💬</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Tus conversaciones</h3>
                  <p className="text-gray-500 text-sm max-w-xs">
                    Selecciona una conversación para ver los mensajes o contacta a un vendedor desde un listing.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-white">
                  <button
                    onClick={() => setSelectedConvId(null)}
                    className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <FiArrowLeft size={20} />
                  </button>
                  <img
                    src={selectedConv?.otherUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConv?.otherUser.name || "")}`}
                    alt={selectedConv?.otherUser.name}
                    className="w-10 h-10 rounded-full object-cover border border-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm flex items-center gap-1">
                      {selectedConv?.otherUser.name}
                      {selectedConv?.otherUser.verified && (
                        <span className="text-brand-500 text-xs font-medium">✓</span>
                      )}
                    </p>
                    <p className="text-xs text-brand-600 truncate">{selectedConv?.businessTitle}</p>
                  </div>
                  <button className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                    <FiInfo size={20} />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                  <div className="text-center py-2">
                    <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
                      Conversación sobre {selectedConv?.businessTitle}
                    </span>
                  </div>

                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-400">Sé el primero en enviar un mensaje</p>
                    </div>
                  )}

                  {messages.map((msg, i) => {
                    const isMe = msg.senderId === profile?.id;
                    const showTime = i === 0 ||
                      new Date(msg.timestamp).getTime() - new Date(messages[i-1].timestamp).getTime() > 5 * 60 * 1000;

                    return (
                      <div key={msg.id}>
                        {showTime && i > 0 && (
                          <div className="text-center py-1">
                            <span className="text-[10px] text-gray-400">
                              {new Date(msg.timestamp).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl ${
                            isMe
                              ? "bg-brand-600 text-white rounded-br-sm"
                              : "bg-white text-gray-900 rounded-bl-sm shadow-sm border border-gray-100"
                          }`}>
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                            <div className={`flex items-center gap-1 mt-0.5 ${isMe ? "justify-end" : ""}`}>
                              <span className={`text-[10px] ${isMe ? "text-white/60" : "text-gray-400"}`}>
                                {new Date(msg.timestamp).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              {isMe && msg.read && <FiCheckCircle size={10} className="text-white/60" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-100 bg-white">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      placeholder="Escribe un mensaje..."
                      className="input-field !py-3 !rounded-2xl flex-1"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!newMessage.trim()}
                      className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      <FiSend size={18} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
