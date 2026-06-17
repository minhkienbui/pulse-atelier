"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Phone } from "lucide-react";

const CHAT_OPTIONS = [
  {
    name: "Zalo",
    icon: "💬",
    color: "#0068FF",
    href: "https://zalo.me/0123456789",
  },
  {
    name: "Messenger",
    icon: "💭",
    color: "#006AFF",
    href: "https://m.me/tempus.vn",
  },
  {
    name: "Hotline",
    icon: null,
    iconComponent: Phone,
    color: "#C9A84C",
    href: "tel:19008888",
  },
];

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-16 right-0 mb-2"
          >
            <div className="glass-dark rounded-xl p-3 shadow-dark-lg min-w-[180px]">
              <p className="text-[11px] text-ivory/40 uppercase tracking-wider font-semibold mb-2 px-2">
                Liên hệ tư vấn
              </p>
              {CHAT_OPTIONS.map((option) => (
                <a
                  key={option.name}
                  href={option.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ivory/70 hover:text-ivory hover:bg-white/[0.05] transition-all duration-200"
                >
                  {option.icon ? (
                    <span className="text-base">{option.icon}</span>
                  ) : option.iconComponent ? (
                    <option.iconComponent size={16} style={{ color: option.color }} />
                  ) : null}
                  <span>{option.name}</span>
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-4 rounded-full shadow-lg transition-all duration-300 ${
          isOpen
            ? "bg-dark-card border border-dark-border text-ivory/60"
            : "bg-gold text-dark-bg hover:bg-gold-light animate-pulse-gold"
        }`}
        aria-label="Chat tư vấn"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={22} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle size={22} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
