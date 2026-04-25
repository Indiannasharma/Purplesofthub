'use client'

import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'

type TypewriterState = {
  wordIndex: number
  charIndex: number
  isDeleting: boolean
}

interface PersistentTypewriterProps {
  words: string[]
  storageKey?: string
  typingDelay?: number
  deletingDelay?: number
  pauseDelay?: number
  className?: string
  style?: CSSProperties
}

const DEFAULT_STATE: TypewriterState = {
  wordIndex: 0,
  charIndex: 0,
  isDeleting: false,
}

export default function PersistentTypewriter({
  words,
  storageKey = 'purplesofthub-home-typewriter',
  typingDelay = 80,
  deletingDelay = 40,
  pauseDelay = 2000,
  className,
  style,
}: PersistentTypewriterProps) {
  const [displayText, setDisplayText] = useState('')
  const stateRef = useRef<TypewriterState>(DEFAULT_STATE)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (!words.length) return

    const saved = window.localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<TypewriterState>
        stateRef.current = {
          wordIndex: typeof parsed.wordIndex === 'number' ? parsed.wordIndex % words.length : 0,
          charIndex: typeof parsed.charIndex === 'number' ? Math.max(0, parsed.charIndex) : 0,
          isDeleting: Boolean(parsed.isDeleting),
        }
      } catch {
        stateRef.current = DEFAULT_STATE
      }
    }

    const persist = () => {
      window.localStorage.setItem(storageKey, JSON.stringify(stateRef.current))
    }

    const syncDisplay = () => {
      const currentWord = words[stateRef.current.wordIndex] || ''
      setDisplayText(currentWord.substring(0, stateRef.current.charIndex))
    }

    const scheduleNext = (delay: number) => {
      timeoutRef.current = window.setTimeout(tick, delay)
    }

    const tick = () => {
      const currentWord = words[stateRef.current.wordIndex] || ''
      const { charIndex, isDeleting } = stateRef.current

      if (!isDeleting) {
        if (charIndex < currentWord.length) {
          const nextCharIndex = charIndex + 1
          stateRef.current = { ...stateRef.current, charIndex: nextCharIndex }
          setDisplayText(currentWord.substring(0, nextCharIndex))
          persist()
          scheduleNext(typingDelay)
          return
        }

        stateRef.current = { ...stateRef.current, isDeleting: true }
        persist()
        scheduleNext(pauseDelay)
        return
      }

      if (charIndex > 0) {
        const nextCharIndex = charIndex - 1
        stateRef.current = { ...stateRef.current, charIndex: nextCharIndex }
        setDisplayText(currentWord.substring(0, nextCharIndex))
        persist()
        scheduleNext(deletingDelay)
        return
      }

      stateRef.current = {
        wordIndex: (stateRef.current.wordIndex + 1) % words.length,
        charIndex: 0,
        isDeleting: false,
      }
      persist()
      setDisplayText('')
      scheduleNext(typingDelay)
    }

    syncDisplay()
    scheduleNext(typingDelay)

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [words, storageKey, typingDelay, deletingDelay, pauseDelay])

  if (!words.length) return null

  return <span className={className} style={style}>{displayText}</span>
}
