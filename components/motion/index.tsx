'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  fadeIn
} from '@/lib/animations'

// Scroll-triggered fade in from bottom
export function FadeInUp({
  children,
  delay = 0,
  className = ''
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once: true,
    margin: '-50px'
  })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={fadeInUp}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Stagger container — animates children one by one
export function StaggerContainer({
  children,
  className = '',
  style = {}
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once: true,
    margin: '-50px'
  })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={staggerContainer}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
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
    <motion.div
      variants={staggerItem}
      className={className}
    >
      {children}
    </motion.div>
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
      className={className}
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
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once: true
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{
        opacity: isInView ? 1 : 0
      }}
      transition={{
        duration: 0.5,
        delay,
        ease: 'easeOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
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
    <motion.span
      className={className}
      initial={{ backgroundPosition: '0% 50%' }}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
      }}
      transition={{
        duration: 5,
        ease: 'linear',
        repeat: Infinity
      }}
      style={{
        backgroundSize: '200% 200%'
      }}
    >
      {children}
    </motion.span>
  )
}

// Export CountUp and Typewriter
export { CountUp } from './CountUp'
export { Typewriter } from './Typewriter'
