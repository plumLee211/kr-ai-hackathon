"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { PartyMember, Boss } from "@/types/generate";

interface ResultCardsProps {
  party: PartyMember[];
  boss: Boss;
  images?: Record<string, string>;
}

/** 8-bit item-acquire style card reveal */
function ItemCard({
  children,
  index,
  borderColor,
  glowClass,
}: {
  children: React.ReactNode;
  index: number;
  borderColor: string;
  glowClass: string;
}) {
  const [visible, setVisible] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setFlash(true);
      setVisible(true);
    }, 600 + index * 500);

    const flashTimer = setTimeout(() => {
      setFlash(false);
    }, 600 + index * 500 + 200);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(flashTimer);
    };
  }, [index]);

  return (
    <div className="relative">
      {/* Flash overlay on acquire */}
      <AnimatePresence>
        {flash && (
          <motion.div
            key="flash"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-white z-10 rounded-lg"
          />
        )}
      </AnimatePresence>

      <div
        className={`border ${borderColor} bg-black/90 rounded-lg overflow-hidden backdrop-blur-sm flex flex-col h-full ${glowClass}`}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.3)",
          transition: "opacity 0.01s step-end, transform 0.15s steps(3)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function ResultCards({ party, boss, images = {} }: ResultCardsProps) {
  return (
    <div className="relative z-10 flex items-center justify-center w-full min-h-screen px-4 pt-12 pb-4">
      <div className="grid grid-cols-5 gap-4 w-full max-w-6xl">
        {/* Party member cards */}
        {party.map((member, i) => (
          <ItemCard
            key={member.id}
            index={i}
            borderColor="border-purple-500/50"
            glowClass="pulse-glow-gemini"
          >
            <div className="w-full aspect-square bg-gray-800/60 flex items-center justify-center border-b border-purple-500/20 overflow-hidden">
              {images[member.id] ? (
                <img
                  src={images[member.id]}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-600 font-mono text-xs animate-pulse">LOADING...</span>
              )}
            </div>
            <div className="p-3 flex flex-col gap-2 flex-1">
              <div>
                <div className="text-sm font-bold text-white font-mono tracking-wide truncate">
                  {member.name}
                </div>
                <div className="text-[10px] text-purple-400/80 font-mono uppercase tracking-widest">
                  {member.role}
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-red-500 text-xs">HP</span>
                  <span className="text-xs font-mono text-red-400">
                    {member.hp}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-orange-400 text-xs">ATK</span>
                  <span className="text-xs font-mono text-orange-300">
                    {member.atk}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-purple-500/20 mt-auto">
                <p className="text-[10px] text-gray-400 leading-relaxed italic line-clamp-2">
                  &ldquo;{member.description}&rdquo;
                </p>
              </div>
            </div>
          </ItemCard>
        ))}

        {/* Boss card — all info hidden as ??? */}
        <ItemCard
          index={party.length}
          borderColor="border-red-600/60"
          glowClass="pulse-glow-red"
        >
          <div className="w-full aspect-square bg-gray-800/60 flex items-center justify-center border-b border-red-600/20 overflow-hidden relative">
            {images["__boss__"] && (
              <img
                src={images["__boss__"]}
                alt="Boss"
                className="w-full h-full object-cover blur-sm brightness-50"
              />
            )}
            <span className="absolute text-gray-400 font-mono text-2xl font-bold">???</span>
          </div>
          <div className="p-3 flex flex-col gap-2 flex-1">
            <div>
              <div className="text-sm font-bold text-red-300 font-mono tracking-wide">
                ???
              </div>
              <div className="text-[10px] text-red-400/70 font-mono uppercase tracking-widest">
                ???
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-1">
                <span className="text-red-500 text-xs">HP</span>
                <span className="text-xs font-mono text-red-400">???</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-orange-400 text-xs">ATK</span>
                <span className="text-xs font-mono text-orange-300">???</span>
              </div>
            </div>
            <div className="pt-2 border-t border-red-600/20 mt-auto">
              <p className="text-[10px] text-gray-400 leading-relaxed italic line-clamp-2">
                &ldquo;???&rdquo;
              </p>
            </div>
          </div>
        </ItemCard>
      </div>
    </div>
  );
}
