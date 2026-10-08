'use client'

import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
}

export function CountUp({
  end,
  duration = 2,
  suffix = '',
  prefix = ''
}: CountUpProps) {
  const [count, setCount] = useState(end)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node || duration <= 0 || typeof IntersectionObserver !== 'function' || typeof window.matchMedia !== 'function') return
    let started = false
    let active = true
    let observer: IntersectionObserver | undefined
    let timer: ReturnType<typeof setInterval> | undefined
    try {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)')
      if (media.matches) return
      observer = new IntersectionObserver(([entry]) => {
        if (!active || started || !entry?.isIntersecting) return
        started = true
        observer?.disconnect()
        const startTime = Date.now()
        timer = setInterval(() => {
          const progress = Math.min((Date.now() - startTime) / (duration * 1000), 1)
          if (media.matches || progress >= 1) {
            setCount(end)
            clearInterval(timer)
            return
          }
          setCount(Math.floor((1 - Math.pow(1 - progress, 3)) * end))
        }, 16)
      }, { threshold: 0.1 })
      observer.observe(node)
    } catch {
      observer?.disconnect()
    }
    return () => { active = false; observer?.disconnect(); if (timer !== undefined) clearInterval(timer) }
  }, [end, duration])

  return (
    <span ref={ref}>
      {prefix}
      {count}
      {suffix}
    </span>
  )
}
