"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Canvas } from "@react-three/fiber"
import { Float, Environment, OrbitControls } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Wallet, Eye, EyeOff, Mail, Lock, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import WalletConnect from "@/components/WalletConnect"

// 3D Floating Tokens Component
function FloatingTokens() {
  const tokens = [
    { position: [-4, 2, -2] as [number, number, number], color: "#F3BA2F", scale: 0.8 },
    { position: [3, -1, -3] as [number, number, number], color: "#F0B90B", scale: 1.2 },
    { position: [-2, -3, -1] as [number, number, number], color: "#D1884F", scale: 1.0 },
    { position: [4, 3, -4] as [number, number, number], color: "#8B5CF6", scale: 0.9 },
    { position: [-3, 1, -5] as [number, number, number], color: "#06D6A0", scale: 1.1 },
    { position: [2, -2, -2] as [number, number, number], color: "#FF6B6B", scale: 0.7 },
  ]

  return (
    <group>
      {tokens.map((token, index) => (
        <Float
          key={index}
          speed={1 + index * 0.2}
          rotationIntensity={0.5}
          floatIntensity={0.8}
          position={token.position}
        >
          <mesh scale={token.scale}>
            <cylinderGeometry args={[0.5, 0.5, 0.2, 8]} />
            <meshStandardMaterial
              color={token.color}
              emissive={token.color}
              emissiveIntensity={0.3}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

// 3D Background Scene
function BackgroundScene() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 50 }} className="absolute inset-0">
      <Suspense fallback={null}>
        <Environment preset="night" />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00d4ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />

        <FloatingTokens />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          enableDamping
          dampingFactor={0.05}
        />
      </Suspense>
    </Canvas>
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Login Failed",
          description: result.error,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Login successful
      toast({
        title: "Login Successful",
        description: "Redirecting to dashboard...",
        variant: "default",
      })
      
      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-900 to-neutral-800 text-white relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 opacity-30">
        <BackgroundScene />
      </div>

      {/* Background Effects */}
      {/* <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-gray-900/20 to-gray-900/20" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fillRule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%239C92AC&quot; fillOpacity=&quot;0.05&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;1&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" /> */}

      {/* Header */}
      <header className="relative z-10 p-6">
        <Link href="/" className="flex items-center space-x-2">
        <div className="w-10 h-10 bg-gradient-to-br from-neutral-300 to-neutral-50 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/20">
          <Wallet className="w-5 h-5 text-neutral-900 " />
        </div>
          <span className="text-xl font-bold bg-gradient-to-r from-[#F0B90B] via-[#FFD84D] to-[#FFF2B0] bg-clip-text text-transparent">
            NeuroBalance
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <Card className="bg-gray-800/30 border-gray-700/50 backdrop-blur-xl shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto border border-cyan-500/30"
              >
                <Sparkles className="w-8 h-8 text-cyan-400" />
              </motion.div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-gray-400 mt-2">
                  Sign in to your Smart Portfolio account
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Wallet Connection */}
              <div className="flex justify-center">
                <WalletConnect />
              </div>

              {/* <div className="relative">
                <Separator className="bg-gray-700" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-gray-800 px-3 text-sm text-gray-400">or continue with email</span>
                </div>
              </div> */}

              {/* Email/Password Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-gray-700/50 border-gray-600 focus:border-cyan-500 focus:ring-cyan-500/20 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-gray-700/50 border-gray-600 focus:border-cyan-500 focus:ring-cyan-500/20 text-white placeholder-gray-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remember"
                      className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-offset-gray-800"
                    />
                    <label htmlFor="remember" className="text-gray-300">
                      Remember me
                    </label>
                  </div>
                  <Link href="/auth/forgot-password" className="text-cyan-400 hover:text-cyan-300">
                    Forgot password?
                  </Link>
                </div>

                <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#F0B90B] via-[#FFD84D] to-[#FFF2B0] border-0 text-neutral-900 font-semibold hover:opacity-90 transition-all"
              >
                {isLoading ? "Signing In..." : "Sign In"}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>

              </form>

              <div className="text-center text-sm text-gray-400">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="text-cyan-400 hover:text-cyan-300 font-medium">
                  Sign Up
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Toaster />
    </div>
  )
}
