'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Zap, Activity, ShieldCheck, BarChart3, ArrowRight } from 'lucide-react'
import { IconBrandGithub } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { ModeToggle } from '@/components/mode-toggle'

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-[#020617] text-slate-900 dark:text-slate-200 transition-colors duration-300 overflow-hidden selection:bg-blue-500/30">
      {/* MagicUI Style Backgrounds */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 dark:bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/5 dark:bg-amber-500/10 blur-[120px] rounded-full animate-pulse delay-1000" />
        
        {/* Retro Grid Effect */}
        <div 
          className="absolute inset-0 opacity-[0.05] dark:opacity-[0.15]" 
          style={{ 
            backgroundImage: `linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)`,
            backgroundSize: '4rem 4rem',
            maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 100%)'
          }} 
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto border-b border-slate-200 dark:border-white/5 backdrop-blur-md bg-white/5 dark:bg-black/5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/20">
            <Zap className="w-5 h-5 text-white fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Cooling<span className="text-blue-600 dark:text-blue-500">Water</span></span>
        </div>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
          <Link href="#features" className="hover:text-blue-600 dark:hover:text-white transition-colors">Fitur</Link>
          <Link href="#technology" className="hover:text-blue-600 dark:hover:text-white transition-colors">Teknologi</Link>
          <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10" />
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-lg shadow-blue-600/20">
                Mulai Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-600/20 dark:border-blue-500/30 bg-blue-600/5 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-500 animate-ping" />
          Powered by AI (Random Forest)
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1]"
        >
          Klasifikasi Kualitas Air <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-400 to-amber-500 dark:from-blue-400 dark:via-blue-200 dark:to-amber-200">
            Lebih Cerdas & Akurat
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Sistem monitoring dan klasifikasi kelayakan air pendingin berbasis kecerdasan buatan untuk optimalisasi operasional di 
          <span className="text-slate-900 dark:text-white font-semibold"> PT PLN Nusantara Power UP Arun.</span>
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/login">
            <Button className="h-14 px-8 text-lg font-bold bg-blue-600 dark:bg-white text-white dark:text-black hover:bg-blue-700 dark:hover:bg-slate-200 rounded-2xl shadow-xl dark:shadow-white/10 group">
              Mulai Klasifikasi
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Button variant="outline" className="h-14 px-8 text-lg font-bold border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-2xl backdrop-blur-sm shadow-sm">
            Lihat Dokumentasi
          </Button>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Fitur Utama Sistem</h2>
          <div className="h-1.5 w-20 bg-blue-600 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Analisis Real-time",
              desc: "Proses klasifikasi data parameter air dalam hitungan detik dengan akurasi tinggi.",
              icon: <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
              borderColor: "hover:border-blue-500/50"
            },
            {
              title: "Manajemen Terpusat",
              desc: "Kelola data unit, parameter teknik, dan laporan dalam satu dashboard terintegrasi.",
              icon: <BarChart3 className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
              borderColor: "hover:border-amber-500/50"
            },
            {
              title: "Keamanan Role-Based",
              desc: "Akses data terkontrol berdasarkan peran Admin dan Operator untuk integritas data.",
              icon: <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
              borderColor: "hover:border-emerald-500/50"
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className={cn(
                "p-8 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl transition-all duration-300 shadow-sm hover:shadow-xl",
                feature.borderColor
              )}
            >
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-transparent">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-slate-200 dark:border-white/5 px-6 bg-slate-50/50 dark:bg-transparent">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-70">
            <Zap className="w-4 h-4 text-blue-600 dark:text-white fill-current" />
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase">Cooling Water AI</span>
          </div>
          <p className="text-slate-500 dark:text-slate-500 text-sm font-medium">
            &copy; 2026 PT PLN Nusantara Power UP Arun. Developed for Advanced Monitoring.
          </p>
          <div className="flex gap-6 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-slate-300 transition-colors">
            <IconBrandGithub className="w-5 h-5 cursor-pointer" />
          </div>
        </div>
      </footer>
    </div>
  )
}
