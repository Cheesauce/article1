

import React, { useMemo, useState } from 'react';
import './OwnerPage.css';
import { usePosts, DEFAULT_SECTIONS } from '../posts/PostsContext';
import { Post, Tag, PostSection } from '../posts/types';
import { runAIAssistant, AI_MODELS, proposeTitle } from '../ai/aiAssistant';
import { matchesQuery, formatDate, tagKey } from '../posts/searchUtils';
import SearchBar from '../../components/SearchBar';
import Icon from '../../components/Icon';
import FolderList from './FolderList';
import TagEditor from './TagEditor';
import TagPill from '../../components/TagPill';
import ConvictionInput from './ConvictionInput';

export default function OwnerPage() {
  const { posts, addPost, updatePost, deletePost } = usePosts();

  const [title, setTitle] = useState('');
  const [sections, setSections] = useState<PostSection[]>(
    DEFAULT_SECTIONS.map((s) => ({ ...s }))
  );
  const [tags, setTags] = useState<Tag[]>([]);
  const [folder, setFolder] = useState('Theses');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [aiModel, setAiModel] = useState(AI_MODELS[0].id);
  const [aiInstruction, setAiInstruction] = useState('');
  const [aiResults, setAiResults] = useState<Record<number, string>>({});
  const [aiLoading, setAiLoading] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [activeFolder, setActiveFolder] = useState<string | null>(null);

  const folders = useMemo(() => {
    const map: Record<string, number> = {};
    posts.forEach((p) => (map[p.folder] = (map[p.folder] || 0) + 1));
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [posts]);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (activeFolder && p.folder !== activeFolder) return false;
      return matchesQuery(p, query);
    });
  }, [posts, query, activeFolder]);

  const replyTarget = replyToId ? posts.find((p) => p.id === replyToId) : null;

  const resetForm = () => {
    setTitle('');
    setSections(DEFAULT_SECTIONS.map((s) => ({ ...s })));
    setTags([]);
    setFolder('Theses');
    setReplyToId(null);
    setAiResults({});
    setAiInstruction('');
    setEditingId(null);
  };

  const updateSection = (idx: number, patch: Partial<PostSection>) => {
    setSections((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const onRunAI = async (idx: number) => {
    setAiLoading(idx);
    try {
      const result = await runAIAssistant({
        text: sections[idx].body,
        model: aiModel,
        instruction: aiInstruction,
        context: sections[idx].heading,
      });
      setAiResults((prev) => ({ ...prev, [idx]: result }));
    } finally {
      setAiLoading(null);
    }
  };

  const applyAI = (idx: number) => {
    const r = aiResults[idx];
    if (r) updateSection(idx, { body: r });
  };

  const hasContent = sections.some((s) => s.body.trim());

  const onPublish = async (published: boolean) => {
    if (!hasContent) return;
    const finalTitle = title.trim() || proposeTitle(sections[0].body || sections[1].body);
    const cleanSections = sections.map((s, i) => ({
      heading: s.heading.trim() || 'Section',
      body: s.body.trim(),
      conviction: i === 1 ? (typeof s.conviction === 'number' ? s.conviction : null) : null,
    }));
    if (editingId) {
      await updatePost(editingId, {
        title: finalTitle,
        sections: cleanSections,
        tags,
        folder: folder.trim() || 'Theses',
        replyToId,
        aiModel,
        published,
      });
    } else {
      await addPost({
        title: finalTitle,
        sections: cleanSections,
        tags,
        folder: folder.trim() || 'Theses',
        replyToId,
        aiModel,
        published,
      });
    }
    resetForm();
  };

  const onEdit = (p: Post) => {
    setEditingId(p.id);
    setTitle(p.title);
    setSections(
      p.sections.length >= 2
        ? p.sections.slice(0, 2).map((s) => ({ ...s }))
        : [
            p.sections[0] || { heading: 'The Thesis', body: '' },
            { heading: 'The Receipt', body: '', conviction: null },
          ]
    );
    setTags(p.tags);
    setFolder(p.folder);
    setReplyToId(p.replyToId || null);
    setAiModel(p.aiModel || AI_MODELS[0].id);
    setAiResults({});
    setAiInstruction('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="owner-page">
      <div className="owner-header">
        <div>
          <h1 className="page-title">Studio</h1>
          <p className="page-sub">
            Draft a thesis, refine it with AI, and publish. Two headers per post — the argument and the receipt.
          </p>
        </div>
      </div>

      <div className="owner-grid">
        <section className="compose card">
          <div className="compose-header">
            <h2>{editingId ? 'Edit Post' : 'New Post'}</h2>
            {editingId && (
              <button className="ghost-btn" onClick={resetForm}>
                <Icon name="close" size={14} /> Cancel edit
              </button>
            )}
          </div>

          {replyTarget && (
            <div className="reply-chip">
              <Icon name="reply" size={14} />
              <span>Replying to <em>"{replyTarget.title}"</em></span>
              <button onClick={() => setReplyToId(null)} aria-label="Remove reply">
                <Icon name="close" size={12} />
              </button>
            </div>
          )}

          <div className="main-title-wrap">
            <label className="field-label">Main Title</label>
            <input
              className="title-input"
              placeholder="e.g. Bitcoin at $67K — The Thesis, The Signal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="sections-wrap">
            {sections.map((sec, idx) => (
              <div key={idx} className="section-block">
                <div className="section-block-head">
                  <span className="section-index">H{idx + 1}</span>
                  <input
                    className="section-heading-input"
                    value={sec.heading}
                    onChange={(e) => updateSection(idx, { heading: e.target.value })}
                    placeholder={idx === 0 ? 'Header 1 (e.g. The Thesis)' : 'Header 2 (e.g. The Receipt)'}
                  />
                </div>
                <textarea
                  className="section-body-input"
                  value={sec.body}
                  onChange={(e) => updateSection(idx, { body: e.target.value })}
                  placeholder={
                    idx === 0
                      ? 'Lay out the argument. Why this, why now, why you.'
                      : 'Log the receipt — price, size, horizon, the commitment.'
                  }
                  rows={6}
                />

                {idx === 1 && (
                  <ConvictionInput
                    value={typeof sec.conviction === 'number' ? sec.conviction : null}
                    onChange={(n) => updateSection(idx, { conviction: n })}
                  />
                )}

                <div className="section-ai-row">
                  <button
                    className="ghost-btn small"
                    onClick={() => onRunAI(idx)}
                    disabled={aiLoading !== null || !sec.body.trim()}
                    type="button"
                  >
                    <Icon name="sparkle" size={13} />
                    {aiLoading === idx ? 'Refining…' : `Refine H${idx + 1} with AI`}
                  </button>
                  {aiResults[idx] && (
                    <button
                      className="secondary-btn small"
                      onClick={() => applyAI(idx)}
                      type="button"
                    >
                      <Icon name="check" size={13} /> Apply
                    </button>
                  )}
                </div>
                {aiResults[idx] && (
                  <div className="ai-result">
                    <div className="ai-result-label">Suggested revision · H{idx + 1}</div>
                    <textarea
                      value={aiResults[idx]}
                      onChange={(e) =>
                        setAiResults((prev) => ({ ...prev, [idx]: e.target.value }))
                      }
                      rows={6}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="meta-row">
            <div className="meta-field">
              <label>Topic</label>
              <input
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                placeholder="e.g. Theses"
              />
            </div>
            <div className="meta-field grow">
              <label>Tags (label → value)</label>
              <TagEditor tags={tags} onChange={setTags} />
            </div>
          </div>

          <div className="ai-panel">
            <div className="ai-header">
              <div className="ai-title">
                <Icon name="sparkle" size={16} />
                <span>AI Assistant</span>
              </div>
              <select
                className="model-select"
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
              >
                {AI_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} · {m.vendor}
                  </option>
                ))}
              </select>
            </div>
            <input
              className="ai-instruction"
              placeholder="Optional guidance applied to all sections: 'tighten tone, sound like Adam Back'"
              value={aiInstruction}
              onChange={(e) => setAiInstruction(e.target.value)}
            />
            <p className="ai-hint">
              Use the <strong>Refine</strong> button under each header to polish that section independently.
            </p>
          </div>

          <div className="publish-row">
            <button className="ghost-btn" onClick={() => onPublish(false)} disabled={!hasContent}>
              Save as draft
            </button>
            <button className="primary-btn large" onClick={() => onPublish(true)} disabled={!hasContent}>
              <Icon name="send" size={14} />
              {editingId ? 'Save & Publish' : 'Publish'}
            </button>
          </div>
        </section>

        <aside className="sidebar">
          <div className="card">
            <h3 className="sidebar-title">Library</h3>
            <SearchBar value={query} onChange={setQuery} />
            <FolderList
              folders={folders}
              active={activeFolder}
              onSelect={(f) => setActiveFolder(f === activeFolder ? null : f)}
            />
          </div>

          <div className="card">
            <div className="list-header">
              <h3 className="sidebar-title">
                {activeFolder ? `In "${activeFolder}"` : 'All posts'}
              </h3>
              <span className="count">{filtered.length}</span>
            </div>
            <div className="post-list">
              {filtered.length === 0 && <div className="empty">No posts yet.</div>}
              {filtered.map((p) => {
                const parent = p.replyToId ? posts.find((x) => x.id === p.replyToId) : null;
                const conv = p.sections[1]?.conviction;
                return (
                  <div key={p.id} className={`post-row ${!p.published ? 'draft' : ''}`}>
                    <div className="post-row-head">
                      <span className="post-row-title">{p.title}</span>
                      {!p.published && <span className="pill">Draft</span>}
                    </div>
                    <div className="post-row-meta">
                      <Icon name="folder" size={12} /> {p.folder}
                      <span>·</span>
                      <span>{formatDate(p.createdAt)}</span>
                      {typeof conv === 'number' && (
                        <>
                          <span>·</span>
                          <span className="conv-mini" title={`Conviction ${conv}/100`}>
                            <span className="conv-mini-dot" />
                            {conv}/100
                          </span>
                        </>
                      )}
                      {parent && (
                        <>
                          <span>·</span>
                          <span className="parent-hint">
                            <Icon name="reply" size={12} /> "{parent.title}"
                          </span>
                        </>
                      )}
                    </div>
                    {p.tags.length > 0 && (
                      <div className="post-row-tags">
                        {p.tags.slice(0, 4).map((t, i) => (
                          <TagPill key={tagKey(t) + i} tag={t} />
                        ))}
                        {p.tags.length > 4 && (
                          <span className="more-tag">+{p.tags.length - 4}</span>
                        )}
                      </div>
                    )}
                    <div className="post-row-actions">
                      <button className="icon-btn" onClick={() => setReplyToId(p.id)} title="Reply to">
                        <Icon name="reply" size={14} /> Reply
                      </button>
                      <button className="icon-btn" onClick={() => onEdit(p)} title="Edit">
                        <Icon name="edit" size={14} /> Edit
                      </button>
                      <button
                        className="icon-btn danger"
                        onClick={() => {
                          if (confirm('Delete this post?')) deletePost(p.id);
                        }}
                        title="Delete"
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

