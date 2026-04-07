'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return new Date(date).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

interface Comment {
  id: string
  post_id: string
  parent_id: string | null
  author_name: string
  content: string
  created_at: string
  likes_count: number
  replies?: Comment[]
}

interface CommentFormProps {
  postId: string
  parentId?: string | null
  onSubmitted: () => void
  onCancel?: () => void
  placeholder?: string
}

function CommentForm({ postId, parentId = null, onSubmitted, onCancel, placeholder = 'Share your thoughts...' }: CommentFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }
    if (!content.trim()) {
      setError('Please write a comment')
      return
    }
    if (content.trim().length < 2) {
      setError('Comment is too short')
      return
    }

    setSubmitting(true)
    setError('')

    const { error: dbError } = await supabase.from('blog_comments').insert({
      post_id: postId,
      parent_id: parentId,
      author_name: name.trim(),
      guest_name: name.trim(),
      guest_email: email.trim() || null,
      content: content.trim(),
    })

    if (dbError) {
      setError(dbError.message)
    } else {
      setName('')
      setEmail('')
      setContent('')
      onSubmitted()
    }
    setSubmitting(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1.5px solid var(--blog-card-border)',
    background: 'var(--blog-popular-bg)',
    color: 'var(--blog-heading)',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {error && (
        <p
          style={{
            fontSize: '13px',
            color: '#ef4444',
            background: 'rgba(239,68,68,0.08)',
            padding: '8px 12px',
            borderRadius: '8px',
            margin: 0,
          }}
        >
          ⚠️ {error}
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }} className="comment-form-grid">
        <input
          type="text"
          placeholder="Your name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
          maxLength={50}
        />
        <input
          type="email"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
      </div>

      <textarea
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={1000}
        rows={parentId ? 3 : 4}
        style={{
          ...inputStyle,
          resize: 'vertical',
          minHeight: parentId ? '80px' : '110px',
          lineHeight: 1.6,
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '11px', color: 'var(--blog-text-muted)' }}>{content.length}/1000</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {onCancel && (
            <button
              onClick={onCancel}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: '1px solid var(--blog-card-border)',
                background: 'transparent',
                color: 'var(--blog-text-muted)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: '9px 22px',
              borderRadius: '8px',
              border: 'none',
              background: submitting ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
              transition: 'all 0.2s',
            }}
          >
            {submitting ? '⏳ Posting...' : parentId ? '↩ Reply' : '💬 Post Comment'}
          </button>
        </div>
      </div>

      <style>{`
        .comment-form-grid {
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 480px) {
          .comment-form-grid {
            grid-template-columns: 1fr !important;
          }
        }
        textarea:focus,
        input:focus {
          border-color: #7c3aed !important;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.12) !important;
        }
        textarea::placeholder,
        input::placeholder {
          color: var(--blog-text-muted);
        }
      `}</style>
    </div>
  )
}

interface CommentItemProps {
  comment: Comment
  postId: string
  onRefresh: () => void
  depth?: number
}

function CommentItem({ comment, postId, onRefresh, depth = 0 }: CommentItemProps) {
  const [replying, setReplying] = useState(false)
  const [showReplies, setShowReplies] = useState(true)
  const replyCount = comment.replies?.length || 0

  return (
    <div
      style={{
        marginLeft: depth > 0 ? 'clamp(20px, 4vw, 40px)' : '0',
        borderLeft: depth > 0 ? '2px solid var(--blog-card-border)' : 'none',
        paddingLeft: depth > 0 ? '16px' : '0',
      }}
    >
      <div
        style={{
          background: depth === 0 ? 'var(--blog-sidebar-bg)' : 'var(--blog-popular-bg)',
          border: '1px solid var(--blog-card-border)',
          borderRadius: '16px',
          padding: '18px 20px',
          marginBottom: '12px',
          backdropFilter: 'blur(10px)',
          transition: 'border-color 0.2s',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed, #22d3ee)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 800,
                color: '#fff',
                flexShrink: 0,
                boxShadow: '0 0 10px rgba(124,58,237,0.3)',
              }}
            >
              {getInitials(comment.author_name)}
            </div>

            <div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--blog-heading)', margin: '0 0 2px' }}>
                {comment.author_name}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--blog-text-muted)', margin: 0 }}>
                {timeAgo(comment.created_at)}
              </p>
            </div>
          </div>

          {depth < 2 && (
            <button
              onClick={() => setReplying(!replying)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 12px',
                borderRadius: '100px',
                border: '1px solid var(--blog-card-border)',
                background: 'transparent',
                color: 'var(--blog-text-muted)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
            >
              ↩ Reply
            </button>
          )}
        </div>

        <p
          style={{
            fontSize: '15px',
            color: 'var(--blog-body)',
            lineHeight: 1.7,
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {comment.content}
        </p>
      </div>

      {replying && (
        <div
          style={{
            background: 'var(--blog-popular-bg)',
            border: '1px solid var(--blog-card-border)',
            borderRadius: '14px',
            padding: '16px',
            marginBottom: '12px',
          }}
        >
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#a855f7', margin: '0 0 12px' }}>
            ↩ Replying to {comment.author_name}
          </p>
          <CommentForm
            postId={postId}
            parentId={comment.id}
            placeholder={`Reply to ${comment.author_name}...`}
            onSubmitted={() => {
              setReplying(false)
              setShowReplies(true)
              onRefresh()
            }}
            onCancel={() => setReplying(false)}
          />
        </div>
      )}

      {replyCount > 0 && (
        <div>
          <button
            onClick={() => setShowReplies(!showReplies)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 0',
              marginBottom: '10px',
              background: 'transparent',
              border: 'none',
              color: '#a855f7',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {showReplies ? '▼' : '▶'} {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
          </button>

          {showReplies && comment.replies?.map((reply) => (
            <CommentItem key={reply.id} comment={reply} postId={postId} onRefresh={onRefresh} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

interface Props {
  postId: string
}

export default function BlogComments({ postId }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    loadComments()
  }, [postId, sortBy])

  const loadComments = async () => {
    setLoading(true)

    const { data, count } = await supabase
      .from('blog_comments')
      .select('*', { count: 'exact' })
      .eq('post_id', postId)
      .eq('is_deleted', false)
      .eq('is_approved', true)
      .is('parent_id', null)
      .order('created_at', { ascending: sortBy === 'oldest' })

    if (data) {
      const withReplies = await Promise.all(
        data.map(async (comment: Comment) => {
          const { data: replies } = await supabase
            .from('blog_comments')
            .select('*')
            .eq('post_id', postId)
            .eq('parent_id', comment.id)
            .eq('is_deleted', false)
            .eq('is_approved', true)
            .order('created_at', { ascending: true })

          return {
            ...comment,
            replies: replies || [],
          }
        })
      )
      setComments(withReplies)
      setTotalCount(count || 0)
    }
    setLoading(false)
  }

  return (
    <div style={{ marginTop: '48px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(20px, 3vw, 26px)',
            fontWeight: 900,
            color: 'var(--blog-heading)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          💬 Comments
          {totalCount > 0 && (
            <span
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: '#a855f7',
                background: 'rgba(124,58,237,0.1)',
                border: '1px solid rgba(124,58,237,0.2)',
                padding: '3px 12px',
                borderRadius: '100px',
              }}
            >
              {totalCount}
            </span>
          )}
        </h2>

        {totalCount > 1 && (
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['newest', 'oldest'] as const).map((sort) => (
              <button
                key={sort}
                onClick={() => setSortBy(sort)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '100px',
                  border: sortBy === sort ? 'none' : '1px solid var(--blog-card-border)',
                  background: sortBy === sort ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'transparent',
                  color: sortBy === sort ? '#fff' : 'var(--blog-text-muted)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s',
                }}
              >
                {sort}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          background: 'var(--blog-sidebar-bg)',
          border: '1px solid var(--blog-card-border)',
          borderRadius: '20px',
          padding: 'clamp(20px, 3vw, 28px)',
          backdropFilter: 'blur(10px)',
          marginBottom: '32px',
        }}
      >
        <p
          style={{
            fontSize: '15px',
            fontWeight: 700,
            color: 'var(--blog-heading)',
            margin: '0 0 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          ✍️ Leave a Comment
        </p>
        <CommentForm postId={postId} onSubmitted={loadComments} />
      </div>

      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            color: 'var(--blog-text-muted)',
            fontSize: '14px',
          }}
        >
          Loading comments...
        </div>
      ) : comments.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            background: 'var(--blog-popular-bg)',
            border: '1px solid var(--blog-card-border)',
            borderRadius: '20px',
          }}
        >
          <p style={{ fontSize: '40px', margin: '0 0 12px' }}>💬</p>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--blog-heading)', margin: '0 0 6px' }}>
            No comments yet
          </p>
          <p style={{ fontSize: '13px', color: 'var(--blog-text-muted)', margin: 0 }}>
            Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={postId} onRefresh={loadComments} depth={0} />
          ))}
        </div>
      )}
    </div>
  )
}
