"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Canvas } from "@react-three/fiber"
import { Float, Environment, OrbitControls } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Wallet, Eye, EyeOff, Mail, Lock, User, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import WalletConnect from "@/components/WalletConnect"

// 3D Floating Crypto Elements
function FloatingCryptoElements() {
  const elements = [
    { position: [-5, 3, -3] as [number, number, number], color: "#F3BA2F", type: "coin", scale: 1.0 },
    { position: [4, -2, -4] as [number, number, number], color: "#F0B90B", type: "cube", scale: 0.8 },
    { position: [-3, -2, -2] as [number, number, number], color: "#D1884F", type: "coin", scale: 1.2 },
    { position: [5, 2, -5] as [number, number, number], color: "#8B5CF6", type: "octahedron", scale: 0.9 },
    { position: [-4, 0, -6] as [number, number, number], color: "#06D6A0", type: "cube", scale: 1.1 },
    { position: [3, 4, -3] as [number, number, number], color: "#FF6B6B", type: "coin", scale: 0.7 },
    { position: [0, -4, -4] as [number, number, number], color: "#00D4FF", type: "octahedron", scale: 1.0 },
  ]

  return (
    <group>
      {elements.map((element, index) => (
        <Float
          key={index}
          speed={0.8 + index * 0.15}
          rotationIntensity={0.6}
          floatIntensity={1.2}
          position={element.position}
        >
          <mesh scale={element.scale} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
            {element.type === "coin" && <cylinderGeometry args={[0.6, 0.6, 0.2, 12]} />}
            {element.type === "cube" && <boxGeometry args={[1, 1, 1]} />}
            {element.type === "octahedron" && <octahedronGeometry args={[0.8]} />}
            <meshStandardMaterial
              color={element.color}
              emissive={element.color}
              emissiveIntensity={0.4}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

// Enhanced 3D Background Scene
function BackgroundScene() {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 45 }} className="absolute inset-0">
      <Suspense fallback={null}>
        <Environment preset="night" />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00d4ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#8b5cf6" />
        <pointLight position={[0, 10, -5]} intensity={0.6} color="#06d6a0" />

        <FloatingCryptoElements />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          enableDamping
          dampingFactor={0.08}
        />
      </Suspense>
    </Canvas>
  )
}

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    walletAddress: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Listen for wallet connection
  useEffect(() => {
    // Check if browser has ethereum provider
    if (typeof window !== 'undefined' && window.ethereum) {
      // Function to handle address changes
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length > 0) {
          setFormData(prev => ({ ...prev, walletAddress: accounts[0] }));
        } else {
          setFormData(prev => ({ ...prev, walletAddress: "" }));
        }
      };

      // Check for already connected accounts
      const checkConnectedAccounts = async () => {
        try {
          const accounts = await window.ethereum?.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            setFormData(prev => ({ ...prev, walletAddress: accounts[0] }));
          }
        } catch (error) {
          console.error("Error checking connected accounts:", error);
        }
      };

      // Add listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      checkConnectedAccounts();

      // Cleanup
      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Error",
        description: "Passwords don't match!",
        variant: "destructive",
      })
      return
    }
    
    if (!agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      // Register user
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          walletAddress: formData.walletAddress || null,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to register')
      }
      
      toast({
        title: "Account Created",
        description: "Your account has been created successfully!",
        variant: "default",
      })
      
      // Log user in after signup
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })
      
      if (result?.error) {
        console.error('Login after signup failed:', result.error)
        // Still redirect to login if auto-login fails
        router.push('/auth/login')
        return
      }
      
      // Redirect to dashboard on success
      router.push('/dashboard')
    } catch (error) {
      console.error('Signup error:', error)
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-900 to-neutral-800 text-white relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 opacity-25">
        <BackgroundScene />
      </div>

      {/* Background Effects
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/30 via-gray-900/20 to-gray-900/20" />
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
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <Card className="bg-gray-800/30 border-gray-700/50 backdrop-blur-xl shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
                className="w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto border border-cyan-500/30"
              >
                <Sparkles className="w-8 h-8 text-cyan-400" />
              </motion.div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Join NeuroBalance
                </CardTitle>
                <CardDescription className="text-gray-400 mt-2">
                  Create your account and start optimizing your crypto portfolio
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Form */}
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="pl-10 bg-gray-700/50 border-gray-600 focus:border-cyan-500 focus:ring-cyan-500/20 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
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
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-300">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="pl-10 bg-gray-700/50 border-gray-600 focus:border-cyan-500 focus:ring-cyan-500/20 text-white placeholder-gray-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* <div className="relative">
                  <Separator className="bg-gray-700" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-gray-800 px-3 text-sm text-gray-400">connect wallet (optional)</span>
                  </div>
                </div> */}

                {/* Wallet Connection */}
                <div className="flex justify-center py-2">
                  <WalletConnect />
                </div>

                {/* Display connected wallet if any */}
                {formData.walletAddress && (
                  <div className="bg-gray-700/30 p-3 rounded-lg border border-gray-600 text-sm flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <div className="flex-1 overflow-hidden">
                      <span className="text-gray-300">Wallet connected: </span>
                      <span className="text-cyan-400 font-mono truncate">{`${formData.walletAddress.substring(0, 6)}...${formData.walletAddress.substring(formData.walletAddress.length - 4)}`}</span>
                    </div>
                  </div>
                )}

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-3 pt-2">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                    className="data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-300 leading-tight">
                    I agree to the{" "}
                    <Link href="/terms" className="text-cyan-400 hover:text-cyan-300">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !agreeToTerms}
                  className="w-full bg-gradient-to-r from-[#F0B90B] via-[#FFD84D] to-[#FFF2B0] border-0 text-neutral-900"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </form>

              <div className="text-center text-sm text-gray-400">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
                  Sign In
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
