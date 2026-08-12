"use client";

import React from "react";
import { motion } from "framer-motion";
import { GoogleLoginButton } from "@/components/auth/google-login-button";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#08090A] overflow-hidden selection:bg-[#6366F1]/30">
      {/* Animated Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6366F1]/20 rounded-full blur-[120px] mix-blend-screen animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-[pulse_10s_ease-in-out_infinite_reverse]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-[#0F1115]/80 backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-2xl p-8 shadow-2xl shadow-black/50">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366F1] to-purple-600 shadow-lg shadow-indigo-500/25 mb-6">
              <span className="text-2xl font-bold text-white tracking-tighter">JM</span>
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#9CA3AF] mb-3 tracking-tight">
              JIIT Matchmaker
            </h1>
            <p className="text-[#9CA3AF] text-sm">
              Find your dream team for PBL & hackathons
            </p>
          </div>

          <div className="space-y-4">
            <GoogleLoginButton />
            
            <p className="text-center text-xs text-[#9CA3AF] font-medium mt-6 flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Only @mail.jiit.ac.in accounts allowed
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
