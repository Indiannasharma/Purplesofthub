'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

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
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once: true
  })
  const hasStarted = useRef(false)

  useEffect(() => {
    if (!isInView || hasStarted.current) return

    hasStarted.current = true

    const startTime = Date.now()
    const endTime = startTime + duration * 1000

    const timer = setInterval(() => {
      const now = Date.now()
      const progress = Math.min(
        (now - startTime) / (duration * 1000),
        1
      )

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)

      setCount(Math.floor(eased * end))

      if (now >= endTime) {
        setCount(end)
        clearInterval(timer)
      }
    }, 16)

    return () => clearInterval(timer)
  }, [isInView, end, duration])

  return (
    <span ref={ref}>
      {prefix}
      {count}
      {suffix}
    </span>
  )
}
