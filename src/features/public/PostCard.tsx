

import React, { useState } from 'react';
import './PostCard.css';
import { Post, Tag } from '../posts/types';
import { usePosts } from '../posts/PostsContext';
import { formatDate, formatFullDate, tagKey } from '../posts/searchUtils';
import Icon from '../../components/Icon';
import ShareMenu from './ShareMenu';
import TagPill from '../../components/TagPill';
import ConvictionBadge from './ConvictionBadge';

type Props = {
  post: Post;
  allPosts: Post[];
  onTagClick: (t: Tag) => void;
  onFolderClick: (f: string) => void;
  isNew?: boolean;
};

const PREVIEW_MAX = 340;

export default function PostCard({ post, allPosts, onTagClick, onFolderClick, isNew }: Props) {
  const { toggleHeart, heartedIds } = usePosts();
  const hearted = !!heartedIds[post.id];
  const [shareOpen, setShareOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const parent = post.replyToId ? allPosts.find((p) => p.id === post.replyToId) : null;
  const totalLen = post.sections.reduce((n, s) => n + s.body.length, 0);
  const isLong = totalLen > PREVIEW_MAX + 100;

  const renderSectionBody = (body: string, allowTruncate: boolean) => {
    let text = body;
    if (allowTruncate && !expanded && text.length > PREVIEW_MAX) {
      text = text.slice(0, PREVIEW_MAX).trimEnd() + '…';
    }
    return text.split(/\n\s*\n/).map((para, i) => <p key={i}>{para}</p>);
  };

  const onHeart = () => toggleHeart(post.id);

  // Pull conviction off the H2 (receipt) section so we can render it at the
  // bottom of the post, not beside the heading.
  const conviction = post.sections[1]?.conviction;
  const hasConviction = typeof conviction === 'number';

  return (
    <article className="post-card">
      {isNew && <span className="new-badge">New</span>}

      {parent && (
        <div
          className="reply-banner"
          onClick={() => {
            const el = document.getElementById(`post-${parent.id}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
        >
          <Icon name="reply" size={13} />
          <span>Replying to <em>"{parent.title}"</em></span>
        </div>
      )}

      <div id={`post-${post.id}`} className="post-anchor" />

      <header className="post-head">
        <div className="avatar" title="Track the Thesis">
          <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
            <circle cx="24" cy="24" r="11" fill="none" stroke="#fff" strokeWidth="1.4" opacity="0.7" />
            <rect x="13.5" y="16.8" width="21" height="2.2" rx="0.6" fill="#fff" />
            <rect x="18.6" y="19" width="2.2" height="11.5" rx="0.6" fill="#fff" />
            <rect x="27.2" y="19" width="2.2" height="11.5" rx="0.6" fill="#fff" />
            <circle cx="36" cy="34" r="2.2" fill="#f7931a" />
          </svg>
        </div>
        <div className="post-meta">
          <div className="author-row">
            <span className="author">Track the Thesis</span>
            <span className="handle">@TracktheThesis</span>
            <span className="dot">·</span>
            <span className="time" title={formatFullDate(post.createdAt)}>
              {formatDate(post.createdAt)}
            </span>
          </div>

          <div className="header-chips">
            <button
              className="folder-chip-inline"
              onClick={() => onFolderClick(post.folder)}
              title={`Folder: ${post.folder}`}
            >
              <Icon name="folder" size={12} />
              <span>{post.folder}</span>
            </button>

            {post.tags.length > 0 && (
              <div className="header-tags">
                {post.tags.map((t, i) => (
                  <TagPill
                    key={tagKey(t) + i}
                    tag={t}
                    onClick={() => onTagClick(t)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <h2 className="post-title">{post.title}</h2>

      <div className="post-sections">
        {post.sections.map((sec, idx) =>
          sec.body.trim() ? (
            <section key={idx} className="post-section">
              <h3 className="post-section-heading">
                <span className="section-rule" aria-hidden="true" />
                <span>{sec.heading}</span>
              </h3>
              <div className="post-section-body">
                {renderSectionBody(sec.body, idx === 0 && isLong)}
              </div>
            </section>
          ) : null
        )}
      </div>

      {isLong && (
        <button className="more-btn" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}

      {hasConviction && (
        <div className="post-conviction-row">
          <ConvictionBadge value={conviction as number} />
        </div>
      )}

      <footer className="post-actions">
        <button
          className={`action heart ${hearted ? 'active' : ''}`}
          onClick={onHeart}
          aria-label={hearted ? 'Remove heart' : 'Heart'}
          title={hearted ? 'Tap to undo' : 'Heart this post'}
        >
          <Icon name="heart" size={16} filled={hearted} />
          <span>{post.hearts}</span>
        </button>
        <div className="share-wrap">
          <button
            className="action"
            onClick={() => setShareOpen((v) => !v)}
            aria-label="Share"
          >
            <Icon name="share" size={16} />
            <span>Share</span>
          </button>
          {shareOpen && (
            <ShareMenu post={post} onClose={() => setShareOpen(false)} />
          )}
        </div>
      </footer>
    </article>
  );
}

