"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Wallet, Zap, TrendingUp, DollarSign, Shield, Cpu } from "lucide-react"
import Link from "next/link"


export default function LandingPage() {
  const features = [
    {
      icon: Cpu,
      title: "AI Prediction",
      description:
        "Advanced machine learning algorithms analyze market trends and predict optimal rebalancing opportunities.",
    },
    {
      icon: TrendingUp,
      title: "Smart Rebalancing",
      description: "Automatically rebalance your portfolio based on your risk tolerance and investment goals.",
    },
    {
      icon: DollarSign,
      title: "Low Gas Costs",
      description: "Optimized for BNB Smart Chain to minimize transaction fees while maximizing efficiency.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-900 to-neutral-800 text-white overflow-hidden">
      {/* Background Effects
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-gray-900/20 to-gray-900/20" />
      <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fillRule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%239C92AC&quot; fillOpacity=&quot;0.05&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;1&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" /> */}

      {/* Header */}
{/* Header */}
<header className="relative z-50 p-6 bg-gradient-to-b from-black/80 via-neutral-900/80 to-transparent backdrop-blur-xl border-b border-white/5">
  <nav className="flex items-center justify-between max-w-7xl mx-auto">
    {/* Logo / Brand */}
    <div className="flex items-center space-x-3">
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-neutral-300 to-neutral-50 flex items-center justify-center shadow-lg shadow-white/5">
        <Wallet className="w-5 h-5 text-neutral-900" />
      </div>
      <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[#F0B90B] via-[#FFD84D] to-[#FFF2B0] bg-clip-text text-transparent">
        NeuroBalance
      </span>
    </div>

    {/* Links */}
    <div className="hidden md:flex items-center space-x-8">
      <a
        href="#features"
        className="text-neutral-400 hover:text-white transition-colors duration-200"
      >
        Features
      </a>
      <a
        href="#team"
        className="text-neutral-400 hover:text-white transition-colors duration-200"
      >
        Team
      </a>
      <a
        href="#contact"
        className="text-neutral-400 hover:text-white transition-colors duration-200"
      >
        Contact
      </a>
    </div>

    {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Login Button - Black with Gold Border */}
            <Link href="/auth/login">
              <Button
                variant="outline"
                className="border-[#F0B90B] text-[#F0B90B] hover:bg-[#F0B90B] hover:text-black px-6 font-semibold transition-all"
              >
                Login
              </Button>
            </Link>

            {/* Sign Up Button - BNB Yellow Gradient */}
            <Link href="/auth/signup">
              <Button
                className="bg-gradient-to-r from-[#F0B90B] via-[#FFD84D] to-[#FFF2B0] text-black font-semibold hover:opacity-90 border-0 px-6 transition-all"
              >
                Sign Up
              </Button>
            </Link>
          </div>

  </nav>
</header>



     
        {/* Hero Section - Carbon Fade, Huge Text */}
        <section className="relative flex items-center justify-center min-h-screen bg-gradient-to-b from-black via-neutral-900 to-neutral-800 text-center px-6">
          {/* Subtle radial vignette */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(100%_80%_at_50%_-10%,rgba(255,255,255,0.05)_0%,rgba(0,0,0,0)_70%)]" />

          {/* Soft glow behind */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-[500px] w-[500px] rounded-full bg-white/10 blur-3xl" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 flex flex-col items-center space-y-10 max-w-5xl"
          >
            {/* badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm sm:text-base text-neutral-200"
            >
              🚀 Powered by AI & BNB Smart Chain
            </motion.div>

            {/* HUGE Title */}
            <h1 className="font-sans tracking-tight leading-[0.9] text-balance text-6xl sm:text-8xl lg:text-[9rem] font-bold">
            <span className="bg-gradient-to-r from-[#F0B90B] via-[#FFD84D] to-[#FFF2B0] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(240,185,11,0.25)]">
              NeuroBalance
            </span>
          </h1>


            {/* Subtitle */}
            <p className="text-lg sm:text-xl lg:text-2xl text-neutral-300 max-w-2xl leading-relaxed">
              AI-powered crypto portfolio management. Optimize and rebalance your BNB Smart Chain assets with one click — let AI handle the complexity while you grow your wealth.
            </p>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 mt-4"
            >
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  className="border-[#F0B90B] text-[#F0B90B] hover:bg-[#F0B90B] hover:text-black text-lg px-8 py-4 font-semibold transition-all"
                >
                  Login
                </Button>
              </Link>

              <Link href="/auth/signup">
                <Button
                  className="bg-gradient-to-r from-[#F0B90B] via-[#FFD84D] to-[#FFF2B0] text-black font-semibold hover:opacity-90 border-0 text-lg px-8 py-4 transition-all"
                >
                  Sign Up
                </Button>
              </Link>

            </motion.div>
          </motion.div>
        </section>



      {/* Features Section (Carbon-Fade, Equal Cards) */}
<section id="features" className="relative z-10 py-24 bg-gradient-to-b from-neutral-900/40 to-neutral-900/0">
  <div className="max-w-7xl mx-auto px-6">
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
      className="text-center mb-16"
    >
      <h2 className="text-4xl lg:text-5xl font-semibold mb-5 tracking-tight">
        <span className="bg-gradient-to-r from-[#F0B90B] via-[#FFD84D] to-[#FFF2B0] bg-clip-text text-transparent">
          Revolutionary Features
        </span>
      </h2>
      <p className="text-lg lg:text-xl text-neutral-300 max-w-3xl mx-auto">
        Experience minimalist, AI-driven portfolio management built for clarity and control.
      </p>
    </motion.div>

    {/* Equal-height cards: auto-rows + h-full on Card */}
    <div className="grid md:grid-cols-3 gap-8 auto-rows-fr">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.12, duration: 0.5 }}
          viewport={{ once: true }}
          className="h-full"
        >
          <Card className="h-full rounded-2xl bg-gradient-to-br from-neutral-900/60 to-neutral-800/60 border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-white/20 hover:shadow-black/40 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-8 flex flex-col h-full">
              <div className="w-16 h-16 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                <feature.icon className="w-8 h-8 text-neutral-200 group-hover:text-white transition-colors" />
              </div>

              <h3 className="text-2xl font-semibold mb-3 tracking-tight bg-gradient-to-r from-[#F0B90B] via-[#FFD84D] to-[#FFF2B0] bg-clip-text text-transparent">
                {feature.title}
              </h3>


              <p className="text-neutral-300 leading-relaxed">
                {feature.description}
              </p>

              {/* subtle footer line to balance height */}
              <div className="mt-auto pt-6">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  </div>
</section>


      {/* Team Section */}
<section id="team" className="relative z-10 py-24">
  <div className="max-w-5xl mx-auto px-6">
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="text-center mb-16"
    >
      <h2 className="text-4xl lg:text-5xl font-bold mb-6">
        <span className="bg-gradient-to-r from-[#F0B90B] via-[#FFD84D] to-[#FFF2B0] bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(240,185,11,0.25)]">
          Meet the Team
        </span>
      </h2>
      <p className="text-xl text-gray-300 max-w-3xl mx-auto">
        The minds behind NeuroBalance
      </p>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center justify-center">
      {/* Tushar Gakhil */}
      <div className="flex flex-col items-center bg-gradient-to-br from-neutral-900/60 to-neutral-800/60 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-lg hover:border-yellow-500/40 transition-all duration-300">
        <img
          src="/tushar.jpeg"
          alt="Tushar Gakhil"
          className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-yellow-400/30 shadow-lg"
        />
        <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-[#F0B90B] via-[#FFD84D] to-[#FFF2B0] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(240,185,11,0.25)]">
          Tushar Gakhil
        </h3>
        <p className="text-gray-300 text-center">
          Blockchain developer and DeFi enthusiast. Leads smart contract and backend development for NeuroBalance.
        </p>
      </div>

      {/* Jatin Sinha */}
      <div className="flex flex-col items-center bg-gradient-to-br from-neutral-900/60 to-neutral-800/60 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-lg hover:border-yellow-500/40 transition-all duration-300">
        <img
          src="/jatin.jpg"
          alt="Jatin Sinha"
          className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-yellow-400/30 shadow-lg"
        />
        <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-[#F0B90B] via-[#FFD84D] to-[#FFF2B0] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(240,185,11,0.25)]">
          Jatin Sinha
        </h3>
        <p className="text-gray-300 text-center">
          Team Lead and Full-stack engineer. Crafts seamless interfaces and ensures robust frontend integration of smart contracts and Prediction Model.
        </p>
      </div>

      {/* Arindam Rawat */}
      <div className="flex flex-col items-center bg-gradient-to-br from-neutral-900/60 to-neutral-800/60 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-lg hover:border-yellow-500/40 transition-all duration-300">
        <img
          src="/arindam.jpeg"
          alt="Arindam Rawat"
          className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-yellow-400/30 shadow-lg"
        />
        <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-[#F0B90B] via-[#FFD84D] to-[#FFF2B0] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(240,185,11,0.25)]">
          Arindam Rawat
        </h3>
        <p className="text-gray-300 text-center">
          AI/ML specialist and product architect. Designs the predictive models and user experience for NeuroBalance.
        </p>
      </div>
    </div>
  </div>
</section>


{/* Contact Section - Carbon Fade + Large Yellow Heading */}
<section id="contact" className="relative z-10 py-32 text-center">
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    viewport={{ once: true }}
  >
    {/* Big Heading */}
    <h2 className="font-sans tracking-tight leading-[0.9] text-balance text-5xl sm:text-7xl lg:text-8xl font-bold mb-10">
      <span className="bg-gradient-to-r from-[#F0B90B] via-[#FFD84D] to-[#FFF2B0] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(240,185,11,0.25)]">
        Contact Us
      </span>
    </h2>

    {/* Large Subtext */}
    <p className="text-2xl sm:text-3xl text-neutral-300 max-w-4xl mx-auto mb-12">
      Facing any problem? Feel free to reach out at <br />
      <a
        href="mailto:neurobalance856@gmail.com"
        className="bg-gradient-to-r from-[#F0B90B] via-[#FFD84D] to-[#FFF2B0] bg-clip-text text-transparent underline decoration-[#F0B90B]/40 hover:decoration-[#F0B90B] transition-colors"
      >
        neurobalance856@gmail.com
      </a>
    </p>

    {/* Optional CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-6">
          <a
            href="mailto:neurobalance856@gmail.com"
            className="px-8 py-4 rounded-lg bg-gradient-to-r from-[#F0B90B] via-[#FFD84D] to-[#FFF2B0] text-black font-semibold text-lg hover:opacity-90 transition-all"
          >
            Send Email
          </a>
          <a
            href="#features"
            className="px-8 py-4 rounded-lg border border-[#F0B90B] text-[#F0B90B] font-semibold text-lg hover:bg-[#F0B90B] hover:text-black transition-all"
          >
            Explore Features
          </a>
        </div>

  </motion.div>
</section>


      {/* Stats Section */}
      {/* <section className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-4 gap-8"
          >
            {[
              { value: "$2.5B+", label: "Assets Under Management" },
              { value: "50K+", label: "Active Users" },
              { value: "99.9%", label: "Uptime" },
              { value: "0.1%", label: "Average Fees" },
            ].map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section> */}

      {/* CTA Section
      <section className="relative z-10 py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-12"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Ready to Optimize Your Portfolio?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of investors who trust AI to manage their crypto portfolios. Start your journey to smarter
              investing today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 border-0 text-lg px-8 py-6"
              >
                <Wallet className="w-5 h-5 mr-2" />
                Get Started Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800 text-lg px-8 py-6"
              >
                <Shield className="w-5 h-5 mr-2" />
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section> */}

      {/* Footer */}
<footer className="relative z-10 border-t border-white/10 py-12">
  <div className="max-w-7xl mx-auto px-6">
    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
      
      {/* Logo + Name */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-neutral-300 to-neutral-50 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/20">
          <Wallet className="w-5 h-5 text-neutral-900 " />
        </div>
        <span className="text-2xl font-bold bg-gradient-to-r from-[#F0B90B] via-[#FFD84D] to-[#FFF2B0] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(240,185,11,0.25)]">
          NeuroBalance
        </span>
      </div>

      {/* Links */}
      <div className="flex space-x-6 text-sm">
        <a
          href="#features"
          className="text-neutral-400 hover:text-white transition-colors"
        >
          Features
        </a>
        <a
          href="#team"
          className="text-neutral-400 hover:text-white transition-colors"
        >
          Team
        </a>
        <a
          href="#contact"
          className="text-neutral-400 hover:text-white transition-colors"
        >
          Contact
        </a>
      </div>

      {/* Rights */}
      <div className="text-neutral-500 text-sm text-center md:text-right">
        © 2025 NeuroBalance. All rights reserved.
      </div>
    </div>
  </div>
</footer>

    </div>
  )
}
