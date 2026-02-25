"use client"

import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { Shield, Zap, Globe, BarChart3, ChevronRight, Play, Server, Lock, MousePointer2, CheckCircle2, ArrowRight } from "lucide-react"

export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  return (
    <div className="min-h-screen bg-[#020205] text-white font-inter selection:bg-purple-500/30 overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#020205]/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20"
            >
              <Zap className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-2xl font-black font-outfit tracking-tighter uppercase">FastNet</span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[2px] text-gray-500">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#solutions" className="hover:text-white transition-colors">Solutions</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="/admin/login" className="px-6 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all text-white">Login</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/login" className="px-8 py-3 bg-white text-black text-xs font-black rounded-full hover:bg-purple-600 hover:text-white transition-all shadow-xl shadow-white/5 uppercase tracking-widest">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Visual Background Asset */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero.png"
            alt="Network Energy Field"
            fill
            className="object-cover opacity-60 scale-110 blur-[2px]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020205]/0 via-[#020205]/40 to-[#020205]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ opacity, scale }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8 backdrop-blur-md">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[3px] text-purple-400">The Future of Connectivity</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black font-outfit leading-[1.1] mb-8 tracking-tighter">
              Configure Your Router. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">Scale Your Hotspot.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl font-medium">
              Professional MikroTik & RADIUS configuration made simple. Generate high-performance setup scripts, automate billing, and manage your network from the cloud.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link href="/admin/login" className="px-12 py-6 bg-purple-600 text-white font-black rounded-[32px] hover:bg-purple-700 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-purple-600/40 group text-xl uppercase tracking-widest">
                <Play className="w-6 h-6 fill-current" />
                <span>Start Scaling</span>
                <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link href="/admin/login" className="px-12 py-6 bg-white/5 text-white font-black rounded-[32px] border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center text-xl uppercase tracking-widest backdrop-blur-md">
                View Demo
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating Stats Mockup */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="absolute right-[-100px] top-1/2 -translate-y-1/2 hidden lg:block"
        >
          <div className="p-10 bg-white/5 border border-white/10 rounded-[60px] backdrop-blur-3xl rotate-[-5deg] shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-white">$42,890.00</p>
                </div>
              </div>
              <div className="w-64 h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "75%" }}
                  transition={{ duration: 2, delay: 1 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-20 border-y border-white/5 bg-[#030308]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: "Active Nodes", value: "24,000+" },
              { label: "Daily Users", value: "1.2M+" },
              { label: "Uptime", value: "99.99%" },
              { label: "Revenue Processed", value: "$85M+" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <p className="text-4xl md:text-5xl font-black font-outfit mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">{stat.value}</p>
                <p className="text-[10px] font-black text-purple-500 uppercase tracking-[4px]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-40 relative" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-10">
            <div className="max-w-2xl text-left">
              <h2 className="text-[10px] font-black text-purple-500 uppercase tracking-[5px] mb-4">Router & Network Powerhouse</h2>
              <h3 className="text-4xl md:text-5xl font-black font-outfit leading-tight tracking-tighter">Everything you need to <span className="text-gray-500">automate your infrastructure.</span></h3>
            </div>
            <p className="text-gray-400 max-w-xs text-sm leading-relaxed mb-4">
              Direct API & Script integration for MikroTik. We handle the RADIUS handshake and config, you focus on the growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: "One-Click Config",
                text: "Generate optimized MikroTik RouterOS v6/v7 scripts. No manual command-line hurdles for your team.",
                icon: Server
              },
              {
                title: "Monetized RADIUS",
                text: "Seamlessly link PesaPal to your hotspot users. Automated time-limit enforcement and voucher sync.",
                icon: Zap
              },
              {
                title: "Central Console",
                text: "Monitor CPU load, active users, and signal strength across all your remote routers simultaneously.",
                icon: BarChart3
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="p-12 bg-white/5 border border-white/5 rounded-[48px] hover:bg-white/[0.08] hover:border-purple-500/30 transition-all relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 blur-[60px] rounded-full group-hover:bg-purple-600/20 transition-all" />
                <div className="w-16 h-16 bg-purple-600/20 rounded-3xl flex items-center justify-center mb-10 border border-purple-500/20">
                  <item.icon className="w-8 h-8 text-purple-400" />
                </div>
                <h4 className="text-2xl font-bold mb-4 font-outfit tracking-tight">{item.title}</h4>
                <p className="text-gray-400 leading-relaxed text-sm mb-8">{item.text}</p>
                <Link href="/admin/login" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-purple-400 group-hover:text-white transition-colors">
                  Explore Feature <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* High-Impact Showcase */}
      <section className="py-40 bg-white text-black rounded-[80px] mx-6 mb-20 relative overflow-hidden" id="solutions">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="text-left">
              <h2 className="text-[10px] font-black text-purple-600 uppercase tracking-[5px] mb-8">Platform Preview</h2>
              <h3 className="text-4xl md:text-5xl font-black font-outfit leading-[1.1] mb-10 tracking-tighter">
                Professional Control for <span className="text-gray-400">Your Network.</span>
              </h3>
              <div className="space-y-8">
                {[
                  "Automated RouterOS v6/v7 Setup Scripts.",
                  "Real-time usage monitoring and disconnects.",
                  "Custom Branding for every Client Gateway.",
                  "Integrated Payment Webhooks for Vouchers."
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-base font-bold font-inter">{step}</p>
                  </div>
                ))}
              </div>
              <button className="mt-12 px-10 py-5 bg-black text-white font-black rounded-full hover:bg-purple-600 transition-all uppercase tracking-widest text-sm flex items-center gap-3 group">
                <span>See Full Console</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/3] relative rounded-[40px] overflow-hidden shadow-2xl border-[10px] border-black/5">
                <Image
                  src="/images/dashboard.png"
                  alt="Admin Dashboard Preview"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-40 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-5xl md:text-6xl font-black font-outfit mb-12 tracking-tighter leading-[1]">
            Take your <span className="text-purple-500">infrastructure</span> to the cloud.
          </h2>
          <Link href="/admin/login" className="inline-flex items-center gap-4 px-16 py-8 bg-purple-600 text-white font-black rounded-[40px] hover:bg-white hover:text-black transition-all text-2xl uppercase tracking-[4px] shadow-2xl shadow-purple-600/20 group">
            <span>Deploy Now</span>
            <Zap className="w-8 h-8 fill-current group-hover:animate-bounce" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-black text-gray-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black font-outfit text-white tracking-tighter">FASTNET</span>
            </div>
            <div className="flex gap-12 text-[10px] font-black uppercase tracking-[2px]">
              <Link href="#" className="hover:text-white">Privacy</Link>
              <Link href="#" className="hover:text-white">Terms</Link>
              <Link href="#" className="hover:text-white">Cookies</Link>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[2px]">© 2026 FastNet Systems.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
