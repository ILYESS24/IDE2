/* eslint-disable react-refresh/only-export-components */
"use client";

import React from "react";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Utility Function ---
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


const STAGGER = 0.008;

// --- Helper Component (Renamed from Component to TextRoll) ---
const Component: React.FC<{
  children: string;
  className?: string;
  center?: boolean;
}> = ({ children, className, center = false }) => {
  // Split text into characters, preserving spaces
  const chars = children.split("");

  return (
    <motion.span
      initial="initial"
      whileHover="hovered"
      className={cn("relative block overflow-hidden whitespace-pre", className)}
      style={{
        lineHeight: 1.2,
      }}
    >
      {/* Top Text (Slides up) */}
      <div className="whitespace-pre">
        {chars.map((char, i) => {
          const delay = center
            ? STAGGER * Math.abs(i - (chars.length - 1) / 2)
            : STAGGER * i;

          return (
            <motion.span
              variants={{
                initial: {
                  y: 0,
                },
                hovered: {
                  y: "-100%",
                },
              }}
              transition={{
                ease: [0.25, 0.46, 0.45, 0.94],
                duration: 0.2,
                delay,
              }}
              className="inline-block"
              style={{
                marginRight: char === ' ' ? '0.25em' : '1px',
                fontSize: 'inherit',
                lineHeight: 'inherit',
              }}
              key={i}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          );
        })}
      </div>

      {/* Bottom Text (Slides in from bottom) */}
      <div className="absolute inset-0 whitespace-pre">
        {chars.map((char, i) => {
          const delay = center
            ? STAGGER * Math.abs(i - (chars.length - 1) / 2)
            : STAGGER * i;

          return (
            <motion.span
              variants={{
                initial: {
                  y: "100%",
                },
                hovered: {
                  y: 0,
                },
              }}
              transition={{
                ease: [0.25, 0.46, 0.45, 0.94],
                duration: 0.2,
                delay,
              }}
              className="inline-block"
              style={{
                marginRight: char === ' ' ? '0.25em' : '1px',
                fontSize: 'inherit',
                lineHeight: 'inherit',
              }}
              key={i}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          );
        })}
      </div>
    </motion.span>
  );
};

export  { Component }