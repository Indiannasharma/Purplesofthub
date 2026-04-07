'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Comment {
  id: string
  author_name: string
  content: string
  created_at: string
  post_id: string
  guest_email: string | null
  is_approved: boolean
  blog_posts: { title: string } | null
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadComments()
  }, [])

  const loadComments = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('blog_comments')
      .select(`
        *,
        blog_posts(title)
      `)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(100)

    setComments((data || []) as any)
    setLoading(false)
  }

  const deleteComment = async (id: string) => {
    if (!confirm('Delete this comment?')) return
    const supabase = createClient()
    await supabase.from('blog_comments').update({ is_deleted: true }).eq('id', id)
    setComments((p) => p.filter((c) => c.id !== id))
  }

  const approveComment = async (id: string, approved: boolean) => {
    const supabase = createClient()
    await supabase.from('blog_comments').update({ is_approved: approved }).eq('id', id)
    await loadComments()
  }

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 900,
              color: '#fff',
              margin: '0 0 4px',
            }}
          >
            Comments 💬
          </h1>
          <p style={{ fontSize: '14px', color: '#9d8fd4', margin: 0 }}>
            {comments.length} total comments
          </p>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            color: '#9d8fd4',
          }}
        >
          Loading...
        </div>
      ) : comments.length === 0 ? (
        <div
          style={{
            background: '#1a1f2e',
            border: '1px solid rgba(124,58,237,0.12)',
            borderRadius: '20px',
            padding: '60px 24px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '40px', margin: '0 0 12px' }}>💬</p>
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>
            No comments yet
          </p>
          <p style={{ fontSize: '13px', color: '#9d8fd4', margin: 0 }}>
            Comments will appear here when readers engage with posts
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                background: '#1a1f2e',
                border: '1px solid rgba(124,58,237,0.12)',
                borderRadius: '14px',
                padding: '18px 20px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#22d3ee',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      margin: '0 0 6px',
                    }}
                  >
                    {comment.blog_posts?.title || 'Unknown Post'}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7c3aed, #22d3ee)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#fff',
                        flexShrink: 0,
                      }}
                    >
                      {comment.author_name[0].toUpperCase()}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                      {comment.author_name}
                    </span>
                    {comment.guest_email && (
                      <span style={{ fontSize: '12px', color: '#6b5fa0' }}>
                        {comment.guest_email}
                      </span>
                    )}
                    <span style={{ fontSize: '11px', color: '#4b5563' }}>
                      {new Date(comment.created_at).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <p style={{ fontSize: '14px', color: '#9d8fd4', lineHeight: 1.6, margin: 0 }}>
                    {comment.content}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => approveComment(comment.id, !comment.is_approved)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(16,185,129,0.3)',
                      background: comment.is_approved ? 'rgba(16,185,129,0.1)' : 'transparent',
                      color: '#10b981',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {comment.is_approved ? '✅ Approved' : '👁 Approve'}
                  </button>
                  <button
                    onClick={() => deleteComment(comment.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(239,68,68,0.3)',
                      background: 'rgba(239,68,68,0.08)',
                      color: '#ef4444',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
