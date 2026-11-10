// app/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { ChevronRight, BrainCircuit, Award, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden relative">
      
      {/* Decorative Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-3xl z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-600/5 rounded-full blur-3xl z-0" />

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-5 flex justify-between items-center border-b border-slate-100 bg-white/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-sm font-extrabold text-slate-800 tracking-tight">
            ExpoConnect <span className="text-blue-600">AI</span>
          </span>
          <span className="text-slate-300 font-light">|</span>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">Eskom Expo for Young Scientists</span>
        </div>

        <div className="flex gap-4 items-center">
          <Link 
            href="/login" 
            className="bg-white border border-slate-200 text-slate-700 px-5 py-2 rounded-full font-medium hover:bg-slate-50 hover:shadow-2xs transition-all text-sm inline-block shadow-2xs"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-20 flex flex-col items-center text-center">
        <motion.div className="max-w-4xl mx-auto" variants={containerVariants} initial="hidden" animate="visible">
          
          <motion.div variants={itemVariants} className="mb-6 flex justify-center">
            <span className="bg-blue-50 border border-blue-100 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-2xs">
              <Award size={14} /> Official 2026 Platform
            </span>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight">
              The future of <br />
              <span className="text-blue-600">
                scientific discovery.
              </span>
            </h1>
          </motion.div>

          <motion.div variants={itemVariants}>
            <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              A unified, AI-powered platform for learners to submit projects, judges to evaluate fairly, and administrators to oversee the next generation of innovators.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login" 
              className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              Enter Platform <ChevronRight size={20} />
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto text-left w-full" variants={containerVariants} initial="hidden" animate="visible">
          {[
            { icon: BrainCircuit, title: 'Intelligent Matching', desc: 'AI-driven judge allocation ensures fair, conflict-free project evaluations.' },
            { icon: Award, title: 'Digital Rubrics', desc: 'Streamlined, interactive scoring for consistent and actionable feedback.' },
            { icon: ShieldCheck, title: 'Enterprise Security', desc: 'Secure document handling and protected intellectual property workflows.' }
          ].map((feature, i) => (
            <motion.div key={i} variants={itemVariants} className="bg-white/85 backdrop-blur-md p-8 rounded-2xl border border-slate-100 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6">
                <feature.icon className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* PROFESSIONAL BRANDING FOOTER BANNER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-24 w-full max-w-xl mx-auto bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center gap-3 text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Proudly Powered By</p>
          <div className="relative w-48 h-16">
            <Image 
              src="/EskomExpo.jpg" 
              alt="Eskom Expo for Young Scientists" 
              fill
              className="object-contain"
            />
          </div>
          <p className="text-xs text-slate-500">Empowering youth innovation across South Africa since 1980.</p>
        </motion.div>

      </main>
    </div>
  );
}