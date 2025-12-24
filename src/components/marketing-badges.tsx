import { useState } from "react"
import { cn } from "@/lib/utils"

interface Badge {
  id: string
  label: string
  color: string
  size: "sm" | "md" | "lg"
  rotation: number
  zIndex: number
  offsetX: number
  offsetY: number
}

const badges: Badge[] = [
  {
    id: "app-builder",
    label: "APP BUILDER",
    color: "from-blue-400 to-blue-600",
    size: "lg",
    rotation: -3,
    zIndex: 1,
    offsetX: -20,
    offsetY: -60,
  },
  {
    id: "games",
    label: "GAMES",
    color: "from-purple-400 to-purple-600",
    size: "sm",
    rotation: 2,
    zIndex: 2,
    offsetX: 60,
    offsetY: -35,
  },
  {
    id: "agent-ia",
    label: "AGENT IA",
    color: "from-green-400 to-green-600",
    size: "lg",
    rotation: -2,
    zIndex: 3,
    offsetX: -30,
    offsetY: -15,
  },
  {
    id: "website",
    label: "WEBSITE",
    color: "from-pink-400 to-pink-600",
    size: "lg",
    rotation: 0,
    zIndex: 4,
    offsetX: 0,
    offsetY: 25,
  },
  {
    id: "texte",
    label: "TEXTE",
    color: "from-orange-400 to-orange-600",
    size: "md",
    rotation: 3,
    zIndex: 5,
    offsetX: -15,
    offsetY: 65,
  },
  {
    id: "anythings",
    label: "ANYTHINGS",
    color: "from-red-400 to-red-600",
    size: "sm",
    rotation: -1,
    zIndex: 6,
    offsetX: 50,
    offsetY: 90,
  },
]

const sizeClasses = {
  sm: "px-6 py-2.5 text-base",
  md: "px-8 py-3 text-lg",
  lg: "px-10 py-3.5 text-xl",
}

export function MarketingBadges() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [clickedId, setClickedId] = useState<string | null>(null)

  const handleClick = (id: string) => {
    setClickedId(clickedId === id ? null : id)

    // Redirections selon les spécifications
    if (id === 'agent-ia') {
      window.location.href = '/ai' // Vers la page AI Agents
    } else if (id !== 'texte') {
      window.location.href = '/docs' // Vers la page Website Builder (iframe interface)
    }
    // 'texte' reste sans redirection spécifique
  }

  return (
    <div className="relative flex h-[400px] w-full items-center justify-center">
      {badges.map((badge) => {
        const isHovered = hoveredId === badge.id
        const isClicked = clickedId === badge.id
        const isOtherHovered = hoveredId !== null && hoveredId !== badge.id

        return (
          <div
            key={badge.id}
            className={cn(
              "absolute cursor-pointer select-none rounded-full font-semibold transition-all duration-500 ease-out",
              "bg-gradient-to-b shadow-lg",
              badge.color,
              sizeClasses[badge.size],
              "hover:shadow-2xl",
            )}
            style={{
              transform: `
                translate(${badge.offsetX}px, ${badge.offsetY}px) 
                rotate(${isHovered ? 0 : badge.rotation}deg)
                scale(${isClicked ? 1.15 : isHovered ? 1.08 : isOtherHovered ? 0.95 : 1})
                translateY(${isHovered ? -8 : 0}px)
              `,
              zIndex: isHovered || isClicked ? 100 : badge.zIndex,
              boxShadow: isHovered
                ? "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 12px 24px -8px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.3)"
                : isClicked
                  ? "0 30px 60px -15px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.4)"
                  : "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 4px 10px -2px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.2)",
            }}
            onMouseEnter={() => setHoveredId(badge.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => handleClick(badge.id)}
          >
            <span
              className={cn(
                "relative block transition-transform duration-300",
                "text-slate-800 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]",
              )}
              style={{
                transform: isHovered ? "translateY(-1px)" : "translateY(0)",
              }}
            >
              {badge.label}
            </span>
            {/* Inner highlight effect */}
            <div
              className="pointer-events-none absolute inset-0 rounded-full opacity-50"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%)",
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
