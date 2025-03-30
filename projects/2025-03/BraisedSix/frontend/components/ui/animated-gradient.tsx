"use client"

import { useEffect, useRef } from "react"

interface AnimatedGradientProps {
  className?: string
}

export function AnimatedGradient({ className = "" }: AnimatedGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.currentent
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = (canvas.width = canvas.offsetWidth)
    let height = (canvas.height = canvas.offsetHeight)

    const colors = [
      [62, 84, 172], // 蓝色
      [124, 45, 192], // 紫色
      [239, 49, 76], // 红色
      [255, 146, 43], // 橙色
    ]

    let step = 0
    const colorIndices = [0, 1, 2, 3]
    const gradientSpeed = 0.002

    function updateGradient() {
      const c0_0 = colors[colorIndices[0]]
      const c0_1 = colors[colorIndices[1]]
      const c1_0 = colors[colorIndices[2]]
      const c1_1 = colors[colorIndices[3]]

      const istep = 1 - step
      const r1 = Math.round(istep * c0_0[0] + step * c0_1[0])
      const g1 = Math.round(istep * c0_0[1] + step * c0_1[1])
      const b1 = Math.round(istep * c0_0[2] + step * c0_1[2])
      const color1 = `rgb(${r1}, ${g1}, ${b1})`

      const r2 = Math.round(istep * c1_0[0] + step * c1_1[0])
      const g2 = Math.round(istep * c1_0[1] + step * c1_1[1])
      const b2 = Math.round(istep * c1_0[2] + step * c1_1[2])
      const color2 = `rgb(${r2}, ${g2}, ${b2})`

      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, color1)
      gradient.addColorStop(1, color2)

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      step += gradientSpeed
      if (step >= 1) {
        step %= 1
        colorIndices[0] = colorIndices[1]
        colorIndices[2] = colorIndices[3]
        colorIndices[1] = (colorIndices[1] + Math.floor(1 + Math.random() * (colors.length - 1))) % colors.length
        colorIndices[3] = (colorIndices[3] + Math.floor(1 + Math.random() * (colors.length - 1))) % colors.length
      }
    }

    function animate() {
      requestAnimationFrame(animate)
      updateGradient()
    }

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth
      height = canvas.height = canvas.offsetHeight
    }

    window.addEventListener("resize", handleResize)
    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className={`absolute inset-0 -z-10 opacity-20 ${className}`} />
}

