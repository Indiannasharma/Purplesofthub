'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const REACTIONS = [
  { type: 'love', emoji: '💜', label: 'Love' },
  { type: 'fire', emoji: '🔥', label: 'Fire' },
  { type: 'mind_blown', emoji: '🤯', label: 'Mind Blown' },
]

function getAnonId(): string {
  let id = localStorage.getItem('psw_anon_id')
  if (!id) {
    id = `anon_${Math.random().toString(36).substring(2)}_${Date.now()}`
    localStorage.setItem('psw_anon_id', id)
  }
  return id
}

interface Props {
  postId: string
}

export default function BlogReactions({ postId }: Props) {
  const [counts, setCounts] = useState<Record<string, number>>({
    love: 0,
    fire: 0,
    mind_blown: 0,
  })
  const [userReaction, setUserReaction] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [animating, setAnimating] = useState<string | null>(null)

  useEffect(() => {
    loadReactions()
  }, [postId])

  const loadReactions = async () => {
    const anonId = getAnonId()

    const { data } = await supabase
      .from('blog_likes')
      .select('reaction, anonymous_id, user_id')
      .eq('post_id', postId)

    if (data) {
      const newCounts: Record<string, number> = {
        love: 0,
        fire: 0,
        mind_blown: 0,
      }
      data.forEach((like: any) => {
        newCounts[like.reaction] = (newCounts[like.reaction] || 0) + 1
        if (like.anonymous_id === anonId) {
          setUserReaction(like.reaction)
        }
      })
      setCounts(newCounts)
    }
    setLoading(false)
  }

  const handleReaction = async (reactionType: string) => {
    const anonId = getAnonId()
    setAnimating(reactionType)
    setTimeout(() => setAnimating(null), 600)

    if (userReaction === reactionType) {
      // Unlike
      setUserReaction(null)
      setCounts((p) => ({
        ...p,
        [reactionType]: Math.max((p[reactionType] || 0) - 1, 0),
      }))
      await supabase
        .from('blog_likes')
        .delete()
        .eq('post_id', postId)
        .eq('anonymous_id', anonId)
    } else {
      // Remove old reaction first
      if (userReaction) {
        setCounts((p) => ({
          ...p,
          [userReaction]: Math.max((p[userReaction] || 0) - 1, 0),
        }))
        await supabase
          .from('blog_likes')
          .delete()
          .eq('post_id', postId)
          .eq('anonymous_id', anonId)
      }
      // Add new reaction
      setUserReaction(reactionType)
      setCounts((p) => ({
        ...p,
        [reactionType]: (p[reactionType] || 0) + 1,
      }))
      await supabase.from('blog_likes').insert({
        post_id: postId,
        reaction: reactionType,
        anonymous_id: anonId,
      })
    }
  }

  const totalReactions = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div
      style={{
        margin: '28px 0',
        padding: '14px 16px',
        background: 'var(--blog-sidebar-bg)',
        border: '1px solid var(--blog-card-border)',
        borderRadius: '14px',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
      }}
    >
      {/* Label */}
      <span
        style={{
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--blog-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          whiteSpace: 'nowrap',
          marginRight: '2px',
        }}
      >
        {totalReactions > 0 ? `${totalReactions} reaction${totalReactions !== 1 ? 's' : ''}` : 'React:'}
      </span>

      {/* Reaction pills */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
        {REACTIONS.map((reaction) => {
          const isActive = userReaction === reaction.type
          const isAnimating = animating === reaction.type
          const count = counts[reaction.type] || 0

          return (
            <button
              key={reaction.type}
              onClick={() => handleReaction(reaction.type)}
              disabled={loading}
              title={reaction.label}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '100px',
                border: isActive
                  ? '1px solid rgba(124,58,237,0.55)'
                  : '1px solid var(--blog-card-border)',
                background: isActive ? 'rgba(124,58,237,0.12)' : 'transparent',
                cursor: loading ? 'default' : 'pointer',
                transition: 'all 0.2s',
                transform: isAnimating ? 'scale(1.2)' : 'scale(1)',
                boxShadow: isActive ? '0 0 10px rgba(124,58,237,0.2)' : 'none',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            >
              <span
                style={{
                  fontSize: isAnimating ? '16px' : '14px',
                  transition: 'font-size 0.15s',
                  lineHeight: 1,
                  display: 'block',
                }}
              >
                {reaction.emoji}
              </span>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: isActive ? '#a855f7' : 'var(--blog-text-muted)',
                  lineHeight: 1,
                  minWidth: '8px',
                }}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* "You reacted" badge */}
      {userReaction && (
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '10px',
            fontWeight: 600,
            color: '#a855f7',
            background: 'rgba(124,58,237,0.08)',
            border: '1px solid rgba(124,58,237,0.2)',
            padding: '3px 9px',
            borderRadius: '100px',
            whiteSpace: 'nowrap',
          }}
        >
          You reacted!
        </span>
      )}
    </div>
  )
}
