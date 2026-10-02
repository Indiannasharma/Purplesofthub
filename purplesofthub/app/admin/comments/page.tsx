'use client'

import { useEffect, useState } from 'react'
import { AdminErrorState } from "@/components/admin/AdminErrorState";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
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
  const [readError, setReadError] = useState(false);



  async function loadComments() {
    try {
      setReadError(false);

    const supabase = createClient()
    const { data , error: readFailure1} = await supabase
      .from('blog_comments')
      .select(`
        *,
        blog_posts(title)
      `)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(100)
      .returns<Comment[]>()
      if (readFailure1) throw readFailure1;

    setComments(data || [])
    setLoading(false)

    } catch { setReadError(true); } finally { setLoading(false); }
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

  useEffect(() => {
    // Resolve external reads in a callback after the committed render.
    void Promise.resolve().then(async () => {
    loadComments()
      })
  }, [])

  if (readError) return <AdminPage className="cc-module"><AdminErrorState title="Could not load these records" description="Refresh to try again. No record counts are shown while the read has failed." onRetry={() => window.location.reload()} /></AdminPage>;

  return (
    <AdminPage className="cc-module admin-form admin-adopted">
      <AdminPageHeader title={<>Comments</>} description={<>{comments.length} total comments</>} />

      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            color: "var(--cc-text-secondary)",
          }}
        >
          Loading...
        </div>
      ) : comments.length === 0 ? (
        <div
          style={{
            background: "var(--cc-surface)",
            border: "1px solid var(--cc-border)",
            borderRadius: 12,
            padding: '60px 24px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '40px', margin: '0 0 12px' }}>💬</p>
          <p style={{ fontSize: '16px', fontWeight: 600, color: "var(--cc-text)", margin: '0 0 6px' }}>
            No comments yet
          </p>
          <p style={{ fontSize: '13px', color: "var(--cc-text-secondary)", margin: 0 }}>
            Comments will appear here when readers engage with posts
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                background: "var(--cc-surface)",
                border: "1px solid var(--cc-border)",
                borderRadius: 12,
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
                      fontWeight: 600,
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
                        fontWeight: 600,
                        color: "var(--cc-text)",
                        flexShrink: 0,
                      }}
                    >
                      {comment.author_name[0].toUpperCase()}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: "var(--cc-text)" }}>
                      {comment.author_name}
                    </span>
                    {comment.guest_email && (
                      <span style={{ fontSize: '12px', color: "var(--cc-text-muted)" }}>
                        {comment.guest_email}
                      </span>
                    )}
                    <span style={{ fontSize: '11px', color: "var(--cc-text-muted)" }}>
                      {new Date(comment.created_at).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <p style={{ fontSize: '14px', color: "var(--cc-text-secondary)", lineHeight: 1.6, margin: 0 }}>
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
                      color: "var(--cc-success)",
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
                      color: "var(--cc-error)",
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
    </AdminPage>
  )
}
