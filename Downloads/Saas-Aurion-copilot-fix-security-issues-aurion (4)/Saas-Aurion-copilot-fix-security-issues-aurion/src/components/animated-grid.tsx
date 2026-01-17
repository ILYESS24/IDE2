import type React from "react"

import { useMemo } from "react"

interface AnimatedGridProps {
  rows?: number
  cols?: number
  cellSize?: string
  animationDuration?: string
  startColor?: [number, number, number]
  endColor?: [number, number, number]
  animationStartColor?: [number, number, number]
  animationEndColor?: [number, number, number] 
}

export function AnimatedGrid({
  rows = 6,
  cols = 8,
  cellSize = "4rem",
  animationDuration = "2s",
  startColor = [94, 47, 70],
  endColor = [199, 82, 51],
  animationStartColor = [105, 210, 231],
  animationEndColor = [250, 105, 0], 
}: AnimatedGridProps) {
  const totalItems = rows * cols

  // Generate grid items with calculated positions
  const gridItems = useMemo(() => {
    return Array.from({ length: totalItems }, (_, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols

      // Calculate animation delay based on position
      const delay = ((col - row) / cols - 1) * Number.parseFloat(animationDuration)

      // Calculate color interpolation factor
      const k = row / rows

      return {
        index,
        row,
        col,
        delay,
        k,
      }
    })
  }, [rows, cols, totalItems, animationDuration])

  // Color interpolation function
  const interpolateColor = (color1: [number, number, number], color2: [number, number, number], k: number) => {
    const r = Math.round(k * color2[0] + (1 - k) * color1[0])
    const g = Math.round(k * color2[1] + (1 - k) * color1[1])
    const b = Math.round(k * color2[2] + (1 - k) * color1[2])
    return `rgb(${r}, ${g}, ${b})`
  }

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1
      }}
    >
      <div
        className="grid gap-0"
        style={{
          width: '100vw',
          height: '100vh',
          gridTemplate: `repeat(${rows}, 1fr) / repeat(${cols}, 1fr)`,
        }}
      >
        {gridItems.map(({ index, row, col, delay, k }) => {
          const cellBackgroundColor = interpolateColor(startColor, endColor, k)
          const animationColor1 = interpolateColor(animationStartColor, animationEndColor, k)

          return (
            <div
              key={index}
              className="relative"
              style={
                {
                  backgroundColor: cellBackgroundColor,
                  animation: `gridAnimation ${animationDuration} ease-in ${delay}s infinite alternate`,
                  "--animation-color": animationColor1,
                } as React.CSSProperties
              }
            />
          )
        })}
      </div>

    </div>
  )
}
