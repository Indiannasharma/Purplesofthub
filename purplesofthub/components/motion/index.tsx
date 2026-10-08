'use client'

import { motion } from 'framer-motion'
import Reveal from '@/components/Reveal'
import styles from '@/components/Reveal.module.css'

type MotionDivExtraProps = {
  id?: string
  role?: string
  'aria-label'?: string
}

// Visible content with optional, observer-triggered movement.
export function FadeInUp({
  children,
  delay = 0,
  className = '',
  ...props
}: {
  children: React.ReactNode
  delay?: number
  className?: string
} & MotionDivExtraProps) {
  return (
    <Reveal delay={delay}
      className={className}
      {...props}
    >
      {children}
    </Reveal>
  )
}

// Preserve the caller's layout without a shared animated paint layer.
export function StaggerContainer({
  children,
  className = '',
  style = {},
  ...props
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
} & MotionDivExtraProps) {
  return (
    <div
      className={className}
      style={style}
      {...props}
    >
      {children}
    </div>
  )
}

// Individual stagger item
export function StaggerItem({
  children,
  className = ''
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <Reveal
      className={className}
    >
      {children}
    </Reveal>
  )
}

// Animated card with hover effect
export function AnimatedCard({
  children,
  className = '',
  style = {}
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={{
        rest: {
          y: 0,
          transition: {
            duration: 0.2
          }
        },
        hover: {
          y: -4,
          transition: {
            duration: 0.2,
            ease: 'easeOut'
          }
        }
      }}
      className={`${styles.card} ${className}`.trim()}
      style={style}
    >
      {children}
    </motion.div>
  )
}

// Simple fade in
export function FadeIn({
  children,
  delay = 0,
  className = ''
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <Reveal delay={delay}
      className={className}
    >
      {children}
    </Reveal>
  )
}

// Gradient text with shimmer animation
export function GradientText({
  children,
  className = ''
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={`${styles.gradient} ${className}`.trim()}
      style={{
        backgroundSize: '200% 200%'
      }}
    >
      {children}
    </span>
  )
}

// Export CountUp and Typewriter
export { CountUp } from './CountUp'
export { Typewriter } from './Typewriter'
