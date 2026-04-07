'use client'

import { useEffect, useState, useRef } from 'react'
import { useInView } from 'framer-motion'

interface TypewriterProps {
  text: string | string[]
  speed?: number
  delay?: number
  cursor?: boolean
  loop?: boolean
  className?: string
}

export function Typewriter({
  text,
  speed = 40,
  delay = 0,
  cursor = true,
  loop = false,
  className = ''
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [textArrayIndex, setTextArrayIndex] = useState(0)
  const [showCursor, setShowCursor] = useState(true)
  const [started, setStarted] = useState(false)

  const ref = useRef(null)
  const isInView = useInView(ref, {
    once: true,
    margin: '-50px'
  })

  // Array of texts or single text
  const texts = Array.isArray(text) ? text : [text]
  const currentText = texts[textArrayIndex]

  // Start after delay when in view
  useEffect(() => {
    if (!isInView) return

    const timer = setTimeout(() => {
      setStarted(true)
    }, delay * 1000)

    return () => clearTimeout(timer)
  }, [isInView, delay])

  // Typewriter logic
  useEffect(() => {
    if (!started) return

    let timer: NodeJS.Timeout

    if (!isDeleting) {
      // Typing forward
      if (currentIndex < currentText.length) {
        timer = setTimeout(() => {
          setDisplayText(currentText.slice(0, currentIndex + 1))
          setCurrentIndex((prev) => prev + 1)
        }, speed)
      } else if (loop && texts.length > 1) {
        // Pause before deleting
        timer = setTimeout(() => {
          setIsDeleting(true)
        }, 2000)
      }
    } else {
      // Deleting
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText((prev) => prev.slice(0, -1))
        }, speed / 2)
      } else {
        // Move to next text
        setIsDeleting(false)
        setCurrentIndex(0)
        setTextArrayIndex((prev) => (prev + 1) % texts.length)
      }
    }

    return () => clearTimeout(timer)
  }, [
    started,
    currentIndex,
    isDeleting,
    displayText,
    currentText,
    speed,
    loop,
    texts
  ])

  // Blinking cursor
  useEffect(() => {
    if (!cursor) return

    const cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 530)

    return () => clearInterval(cursorTimer)
  }, [cursor])

  return (
    <span ref={ref} className={className}>
      {displayText}
      {cursor && (
        <span
          style={{
            opacity: showCursor ? 1 : 0,
            color: '#a855f7',
            fontWeight: 300,
            marginLeft: '1px',
            transition: 'opacity 0.1s'
          }}
        >
          |
        </span>
      )}
    </span>
  )
}
