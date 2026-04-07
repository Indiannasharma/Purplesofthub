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
        margin: '40px 0',
        padding: '28px',
        background: 'var(--blog-sidebar-bg)',
        border: '1px solid var(--blog-card-border)',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '16px',
              fontWeight: 800,
              color: 'var(--blog-heading)',
              margin: '0 0 4px',
            }}
          >
            Reactions
          </h3>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--blog-text-muted)',
              margin: 0,
            }}
          >
            {totalReactions > 0
              ? `${totalReactions} ${totalReactions === 1 ? 'reaction' : 'reactions'} so far`
              : 'Be the first to react!'}
          </p>
        </div>

        {userReaction && (
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#a855f7',
              background: 'rgba(124,58,237,0.1)',
              border: '1px solid rgba(124,58,237,0.25)',
              padding: '4px 12px',
              borderRadius: '100px',
            }}
          >
            You reacted!
          </span>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        {REACTIONS.map((reaction) => {
          const isActive = userReaction === reaction.type
          const isAnimating = animating === reaction.type
          const count = counts[reaction.type] || 0

          return (
            <button
              key={reaction.type}
              onClick={() => handleReaction(reaction.type)}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '100px',
                border: isActive ? '1.5px solid rgba(124,58,237,0.6)' : '1.5px solid var(--blog-card-border)',
                background: isActive ? 'rgba(124,58,237,0.15)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                transform: isAnimating ? 'scale(1.25)' : 'scale(1)',
                boxShadow: isActive ? '0 0 16px rgba(124,58,237,0.25)' : 'none',
                fontFamily: 'inherit',
              }}
            >
              <span
                style={{
                  fontSize: isAnimating ? '26px' : '22px',
                  transition: 'font-size 0.2s',
                  display: 'block',
                  lineHeight: 1,
                }}
              >
                {reaction.emoji}
              </span>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: isActive ? '#a855f7' : 'var(--blog-text-muted)',
                    lineHeight: 1,
                    marginBottom: '2px',
                  }}
                >
                  {reaction.label}
                </span>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: isActive ? '#a855f7' : 'var(--blog-heading)',
                    lineHeight: 1,
                  }}
                >
                  {count}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
