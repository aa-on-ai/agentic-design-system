'use client'

import React, { useMemo, useState } from 'react'

type Reply = {
  id: string
  author: string
  avatar: string
  text: string
  time: string
}

type CommentItem = {
  id: string
  author: string
  avatar: string
  assignee?: {
    name: string
    avatar: string
  }
  text: string
  time: string
  resolved: boolean
  replies: Reply[]
}

export default function CommentsPanelPage() {
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    c1: true,
    c2: true,
    c3: false,
    c4: false,
  })
  const [comments, setComments] = useState<CommentItem[]>([
    {
      id: 'c1',
      author: 'Maya Chen',
      avatar: 'MC',
      assignee: { name: 'Alex Rivera', avatar: 'AR' },
      text: 'Can we tighten the spacing between the title and the subtitle? It feels a little airy compared to the rest of the layout.',
      time: '8m ago',
      resolved: false,
      replies: [
        {
          id: 'r1',
          author: 'Alex Rivera',
          avatar: 'AR',
          text: 'Yep — I can reduce it by 8px and align it with the card spacing system.',
          time: '6m ago',
        },
        {
          id: 'r2',
          author: 'Maya Chen',
          avatar: 'MC',
          text: 'Perfect, thanks.',
          time: '4m ago',
        },
      ],
    },
    {
      id: 'c2',
      author: 'Jordan Lee',
      avatar: 'JL',
      assignee: { name: 'Priya Nair', avatar: 'PN' },
      text: 'The primary button color is slightly darker than what we use in the marketing site. Should we unify the token?',
      time: '22m ago',
      resolved: false,
      replies: [
        {
          id: 'r3',
          author: 'Priya Nair',
          avatar: 'PN',
          text: 'Good catch. I’ll switch this to the brand/600 token and update the component spec.',
          time: '18m ago',
        },
      ],
    },
    {
      id: 'c3',
      author: 'Olivia Park',
      avatar: 'OP',
      assignee: { name: 'Noah Kim', avatar: 'NK' },
      text: 'Looks good now. Marking this as resolved once the handoff notes are added.',
      time: '1h ago',
      resolved: true,
      replies: [
        {
          id: 'r4',
          author: 'Noah Kim',
          avatar: 'NK',
          text: 'Added handoff notes and linked the dev-ready frame.',
          time: '58m ago',
        },
      ],
    },
    {
      id: 'c4',
      author: 'Sofia Patel',
      avatar: 'SP',
      assignee: { name: 'Maya Chen', avatar: 'MC' },
      text: 'Could we pin the toolbar in prototype mode? It scrolls away on shorter screens.',
      time: '2h ago',
      resolved: true,
      replies: [],
    },
  ])

  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const filteredComments = useMemo(() => {
    if (filter === 'resolved') return comments.filter((c) => c.resolved)
    if (filter === 'unresolved') return comments.filter((c) => !c.resolved)
    return comments
  }, [comments, filter])

  const counts = useMemo(
    () => ({
      all: comments.length,
      unresolved: comments.filter((c) => !c.resolved).length,
      resolved: comments.filter((c) => c.resolved).length,
    }),
    [comments]
  )

  const toggleResolved = (id: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, resolved: !c.resolved } : c))
    )
  }

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const addReply = (commentId: string) => {
    const value = drafts[commentId]?.trim()
    if (!value) return

    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              replies: [
                ...c.replies,
                {
                  id: `${commentId}-${Date.now()}`,
                  author: 'You',
                  avatar: 'YO',
                  text: value,
                  time: 'now',
                },
              ],
            }
          : c
      )
    )
    setDrafts((prev) => ({ ...prev, [commentId]: '' }))
    setExpanded((prev) => ({ ...prev, [commentId]: true }))
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <div className="hidden flex-1 items-center justify-center border-r border-white/10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.15),_transparent_35%),linear-gradient(to_bottom,_rgba(255,255,255,0.02),_rgba(255,255,255,0))] p-10 lg:flex">
          <div className="relative h-[720px] w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-rose-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
                Product detail page · Frame 14
              </div>
            </div>

            <div className="relative h-full bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px] p-10">
              <div className="mx-auto grid h-[520px] max-w-3xl grid-cols-5 gap-6">
                <div className="col-span-3 rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="mb-4 h-8 w-40 rounded-lg bg-white/10" />
                  <div className="mb-3 h-5 w-64 rounded bg-white/10" />
                  <div className="mb-8 h-4 w-80 rounded bg-white/5" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-32 rounded-xl bg-white/5" />
                    <div className="h-32 rounded-xl bg-white/5" />
                    <div className="col-span-2 h-36 rounded-xl bg-white/5" />
                  </div>
                </div>
                <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="mb-4 h-6 w-28 rounded bg-white/10" />
                  <div className="space-y-3">
                    <div className="h-12 rounded-xl bg-white/5" />
                    <div className="h-12 rounded-xl bg-white/5" />
                    <div className="h-12 rounded-xl bg-white/5" />
                    <div className="mt-6 h-24 rounded-2xl bg-white/5" />
                  </div>
                </div>
              </div>

              <div className="absolute left-[28%] top-[24%] flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/15 px-3 py-1.5 text-xs text-amber-200 shadow-lg shadow-amber-500/10">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/30 font-semibold">
                  1
                </span>
                Spacing comment
              </div>

              <div className="absolute left-[58%] top-[38%] flex items-center gap-2 rounded-full border border-indigo-400/40 bg-indigo-400/15 px-3 py-1.5 text-xs text-indigo-200 shadow-lg shadow-indigo-500/10">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-400/30 font-semibold">
                  2
                </span>
                Button token
              </div>

              <div className="absolute left-[64%] top-[62%] flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-3 py-1.5 text-xs text-emerald-200 shadow-lg shadow-emerald-500/10">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/30 font-semibold">
                  3
                </span>
                Resolved thread
              </div>
            </div>
          </div>
        </div>

        <aside className="flex w-full max-w-xl flex-col border-l border-white/10 bg-neutral-925 lg:w-[440px] lg:max-w-none">
          <div className="border-b border-white/10 px-5 py-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold tracking-tight">Comments</h1>
                <p className="text-sm text-neutral-400">Discuss changes, assign owners, and resolve threads.</p>
              </div>
              <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-200 transition hover:bg-white/10">
                New comment
              </button>
            </div>

            <div className="flex gap-2 rounded-2xl bg-white/5 p-1">
              {[
                { key: 'unresolved', label: 'Unresolved', count: counts.unresolved },
                { key: 'resolved', label: 'Resolved', count: counts.resolved },
                { key: 'all', label: 'All', count: counts.all },
              ].map((tab) => {
                const active = filter === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key as 'all' | 'unresolved' | 'resolved')}
                    className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
                      active
                        ? 'bg-white text-neutral-950 shadow-sm'
                        : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`ml-2 inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] ${
                        active ? 'bg-neutral-200 text-neutral-900' : 'bg-white/10 text-neutral-300'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-4">
              {filteredComments.map((comment, index) => {
                const isOpen = expanded[comment.id]
                return (
                  <div
                    key={comment.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-sm shadow-black/20"
                  >
                    <div className="mb-3 flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-sm font-semibold text-white">
                        {comment.avatar}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-white">{comment.author}</span>
                          <span className="text-xs text-neutral-500">{comment.time}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              comment.resolved
                                ? 'bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/20'
                                : 'bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/20'
                            }`}
                          >
                            {comment.resolved ? 'Resolved' : 'Unresolved'}
                          </span>
                          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-neutral-400">
                            #{index + 1}
                          </span>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-neutral-200">{comment.text}</p>

                        {comment.assignee && (
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-xs text-neutral-500">Assigned to</span>
                            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-sky-500 text-[11px] font-semibold text-white">
                                {comment.assignee.avatar}
                              </div>
                              <span className="text-xs font-medium text-neutral-200">{comment.assignee.name}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => toggleExpanded(comment.id)}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-neutral-300 transition hover:bg-white/10 hover:text-white"
                      >
                        {isOpen ? 'Hide thread' : `Show thread (${comment.replies.length})`}
                      </button>

                      <button
                        onClick={() => toggleResolved(comment.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          comment.resolved
                            ? 'border border-amber-400/20 bg-amber-400/10 text-amber-300 hover:bg-amber-400/15'
                            : 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/15'
                        }`}
                      >
                        {comment.resolved ? 'Reopen' : 'Resolve'}
                      </button>

                      <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-neutral-300 transition hover:bg-white/10 hover:text-white">
                        Jump to canvas
                      </button>
                    </div>

                    {isOpen && (
                      <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                        {comment.replies.length > 0 && (
                          <div className="space-y-3">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-400 to-pink-500 text-[11px] font-semibold text-white">
                                  {reply.avatar}
                                </div>
                                <div className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-white">{reply.author}</span>
                                    <span className="text-xs text-neutral-500">{reply.time}</span>
                                  </div>
                                  <p className="mt-1 text-sm leading-6 text-neutral-300">{reply.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neutral-300 to-neutral-500 text-[11px] font-semibold text-neutral-900">
                            YO
                          </div>
                          <div className="flex-1">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-2">
                              <textarea
                                value={drafts[comment.id] || ''}
                                onChange={(e) =>
                                  setDrafts((prev) => ({ ...prev, [comment.id]: e.target.value }))
                                }
                                placeholder="Write a reply..."
                                className="min-h-[84px] w-full resize-none bg-transparent px-2 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none"
                              />
                              <div className="flex items-center justify-between border-t border-white/10 px-2 pt-2">
                                <div className="flex items-center gap-2 text-xs text-neutral-500">
                                  <span className="rounded-md border border-white/10 bg-black/20 px-2 py-1">
                                    @ mention
                                  </span>
                                  <span className="rounded-md border border-white/10 bg-black/20 px-2 py-1">
                                    Attach
                                  </span>
                                </div>
                                <button
                                  onClick={() => addReply(comment.id)}
                                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-neutral-950 transition hover:bg-neutral-200"
                                >
                                  Reply
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {filteredComments.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-6 py-12 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-neutral-300">
                    💬
                  </div>
                  <h3 className="text-sm font-medium text-white">No comments in this filter</h3>
                  <p className="mt-1 text-sm text-neutral-500">Try switching between unresolved, resolved, or all threads.</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
