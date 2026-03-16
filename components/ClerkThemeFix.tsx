'use client'

import { useEffect } from 'react'

export default function ClerkThemeFix() {
  useEffect(() => {
    function applyFix() {
      const title = document.querySelector<HTMLElement>('.cl-headerTitle')
      const subtitle = document.querySelector<HTMLElement>('.cl-headerSubtitle')
      if (title) title.style.setProperty('color', '#e2d9f3', 'important')
      if (subtitle) subtitle.style.setProperty('color', '#9d8fd4', 'important')
    }

    applyFix()

    const observer = new MutationObserver(applyFix)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])

  return null
}
