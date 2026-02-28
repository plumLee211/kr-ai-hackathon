"use client";

import { motion } from "motion/react";
import type { PartyMember, Boss } from "@/types/generate";

interface ResultCardsProps {
  party: PartyMember[];
  boss: Boss;
}

export function ResultCards({ party, boss }: ResultCardsProps) {
  return (
    <div className="relative z-10 flex flex-col items-center min-h-screen w-full p-4 py-12 overflow-auto">
      <div className="relative z-10 w-full max-w-5xl space-y-10 mt-[55vh]">
        {/* Party header */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.01, delay: 0.3 }}
          className="text-2xl font-bold text-white tracking-widest text-center font-mono"
        >
          ─── YOUR PARTY ───
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {party.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.01,
                delay: 0.5 + i * 0.4,
              }}
              className="border border-green-500/50 bg-black/80 rounded-lg overflow-hidden backdrop-blur-sm flex flex-col pulse-glow-green"
            >
              <div className="relative w-full aspect-[3/4] bg-gradient-to-b from-green-900/30 to-black/60 flex items-center justify-center border-b border-green-500/30">
                <div className="text-green-600/40 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  <span className="text-xs font-mono">IMAGE</span>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-3 flex-1">
                <div>
                  <div className="text-lg font-bold text-white font-mono tracking-wide">{member.name}</div>
                  <div className="text-xs text-green-400/80 font-mono uppercase tracking-widest">{member.role}</div>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-red-500">
                      <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                    </svg>
                    <span className="text-sm font-mono text-red-400">{member.hp}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-orange-400">
                      <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.177A7.547 7.547 0 0 1 6.648 6.61a.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.718Z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-mono text-orange-300">{member.atk}</span>
                  </div>
                </div>
                <div className="mt-auto pt-3 border-t border-green-500/20">
                  <p className="text-xs text-gray-400 leading-relaxed italic">
                    &ldquo;{member.description}&rdquo;
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Boss section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.01, delay: 0.5 + party.length * 0.4 + 0.3 }}
          className="pt-4"
        >
          <h2 className="text-2xl font-bold text-red-400 tracking-widest text-center font-mono mb-6">
            ─── BOSS ───
          </h2>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.01, delay: 0.5 + party.length * 0.4 + 0.7 }}
            className="border border-red-600/60 bg-black/80 rounded-lg overflow-hidden backdrop-blur-sm max-w-sm mx-auto shadow-[0_0_30px_rgba(220,38,38,0.15)] pulse-glow-red"
          >
            <div className="relative w-full aspect-[3/4] bg-gradient-to-b from-red-900/40 to-black/70 flex items-center justify-center border-b border-red-600/30">
              <div className="text-red-600/40 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 mx-auto mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                <span className="text-xs font-mono">IMAGE</span>
              </div>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <div>
                <div className="text-xl font-bold text-red-300 font-mono tracking-wide">{boss.name}</div>
                <div className="text-xs text-red-400/70 font-mono uppercase tracking-widest">{boss.role}</div>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-red-500">
                    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                  </svg>
                  <span className="text-sm font-mono text-red-400">{boss.hp}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-orange-400">
                    <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.177A7.547 7.547 0 0 1 6.648 6.61a.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.718Z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-mono text-orange-300">{boss.atk}</span>
                </div>
              </div>
              <div className="pt-3 border-t border-red-600/20">
                <p className="text-xs text-gray-400 leading-relaxed italic">
                  &ldquo;{boss.description}&rdquo;
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
