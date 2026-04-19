

import React, { useMemo, useState } from 'react';
import './PublicPage.css';
import { usePosts } from '../posts/PostsContext';
import { matchesQuery, tagKey } from '../posts/searchUtils';
import { Tag } from '../posts/types';
import SearchBar from '../../components/SearchBar';
import Icon from '../../components/Icon';
import PostCard from './PostCard';
import TagPill, { paletteFor } from '../../components/TagPill';

type SortMode = 'latest' | 'popular';

export default function PublicPage() {
  const { posts, tagClicks, recordTagClick, recordFolderClick } = usePosts();
  const [query, setQuery] = useState('');
  const [activeTagKey, setActiveTagKey] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('latest');

  const published = useMemo(() => posts.filter((p) => p.published), [posts]);

  const allTags = useMemo(() => {
    const map = new Map<string, { tag: Tag; count: number }>();
    published.forEach((p) =>
      p.tags.forEach((t) => {
        const k = tagKey(t);
        const prev = map.get(k);
        if (prev) prev.count += 1;
        else map.set(k, { tag: t, count: 1 });
      })
    );
    return Array.from(map.entries())
      .sort((a, b) => {
        const clicksDiff = (tagClicks[b[0]] || 0) - (tagClicks[a[0]] || 0);
        if (clicksDiff !== 0) return clicksDiff;
        return b[1].count - a[1].count;
      })
      .slice(0, 18);
  }, [published, tagClicks]);

  const allFolders = useMemo(() => {
    const map: Record<string, number> = {};
    published.forEach((p) => (map[p.folder] = (map[p.folder] || 0) + 1));
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [published]);

  const trending = useMemo(() => {
    const byKey = new Map<string, Tag>();
    allTags.forEach(([k, v]) => byKey.set(k, v.tag));
    return Object.entries(tagClicks)
      .filter(([k]) => byKey.has(k))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k, n]) => ({ key: k, tag: byKey.get(k)!, count: n }));
  }, [tagClicks, allTags]);

  const filtered = useMemo(() => {
    const list = published.filter((p) => {
      if (activeTagKey && !p.tags.some((t) => tagKey(t) === activeTagKey)) return false;
      if (activeFolder && p.folder !== activeFolder) return false;
      return matchesQuery(p, query);
    });
    if (sortMode === 'popular') {
      return [...list].sort((a, b) => b.hearts - a.hearts || b.createdAt - a.createdAt);
    }
    return [...list].sort((a, b) => b.createdAt - a.createdAt);
  }, [published, query, activeTagKey, activeFolder, sortMode]);

  const recent = useMemo(() => {
    return [...published].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
  }, [published]);

  const onTag = (t: Tag) => {
    const k = tagKey(t);
    setActiveTagKey(k === activeTagKey ? null : k);
    if (k !== activeTagKey) recordTagClick(k);
  };
  const onFolder = (f: string) => {
    setActiveFolder(f === activeFolder ? null : f);
    if (f !== activeFolder) recordFolderClick(f);
  };

  const activeTagObj = activeTagKey
    ? allTags.find(([k]) => k === activeTagKey)?.[1].tag
    : null;

  return (
    <div className="public-page">
      <section className="read-header">
        <div>
          <h1 className="read-title">The Feed</h1>
          <p className="read-sub">Theses, receipts, and follow-ups — in chronological honesty.</p>
        </div>
        <div className="read-search">
          <SearchBar value={query} onChange={setQuery} />
        </div>
      </section>

      <div className="public-grid">
        <main className="feed">
          <div className="feed-toolbar">
            <div className="sort-tabs">
              <button
                className={`sort-tab ${sortMode === 'latest' ? 'active' : ''}`}
                onClick={() => setSortMode('latest')}
              >
                Latest
              </button>
              <button
                className={`sort-tab ${sortMode === 'popular' ? 'active' : ''}`}
                onClick={() => setSortMode('popular')}
              >
                Popular
              </button>
            </div>
            <span className="feed-count">{filtered.length} post{filtered.length === 1 ? '' : 's'}</span>
          </div>

          {(activeTagKey || activeFolder) && (
            <div className="active-filters">
              {activeTagObj && (
                <button className="filter-pill" onClick={() => setActiveTagKey(null)}>
                  <Icon name="tag" size={12} />
                  <span>{activeTagObj.label}: {activeTagObj.value}</span>
                  <Icon name="close" size={12} />
                </button>
              )}
              {activeFolder && (
                <button className="filter-pill" onClick={() => setActiveFolder(null)}>
                  <Icon name="folder" size={12} /> {activeFolder}
                  <Icon name="close" size={12} />
                </button>
              )}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="no-results">
              <p>No posts match your search.</p>
              <button className="ghost-btn" onClick={() => { setQuery(''); setActiveTagKey(null); setActiveFolder(null); }}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className="post-feed">
              {filtered.map((p, i) => (
                <PostCard
                  key={p.id}
                  post={p}
                  allPosts={published}
                  onTagClick={onTag}
                  onFolderClick={onFolder}
                  isNew={sortMode === 'latest' && i === 0 && Date.now() - p.createdAt < 1000 * 60 * 60 * 24}
                />
              ))}
            </div>
          )}
        </main>

        <aside className="public-aside">
          {recent.length > 0 && (
            <div className="aside-card">
              <h3>
                <Icon name="sparkle" size={14} /> Recent
              </h3>
              <ul className="recent-list">
                {recent.map((p) => (
                  <li key={p.id}>
                    <button
                      className="recent-link"
                      onClick={() => {
                        const el = document.getElementById(`post-${p.id}`);
                        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                    >
                      <span className="recent-title">{p.title}</span>
                      <span className="recent-meta">
                        <Icon name="folder" size={11} /> {p.folder}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="aside-card">
            <h3>
              <Icon name="folder" size={14} /> Topics
            </h3>
            <div className="chip-group">
              {allFolders.map(([name, count]) => (
                <button
                  key={name}
                  className={`chip folder ${activeFolder === name ? 'active' : ''}`}
                  onClick={() => onFolder(name)}
                >
                  {name}
                  <span className="chip-count">{count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="aside-card">
            <h3>
              <Icon name="tag" size={14} /> Tags
            </h3>
            <div className="chip-group tag-chips">
              {allTags.map(([k, { tag, count }]) => (
                <span key={k} className={`tag-chip-wrap ${activeTagKey === k ? 'active' : ''}`}>
                  <TagPill tag={tag} onClick={() => onTag(tag)} />
                  <span className="tag-chip-count">{count}</span>
                </span>
              ))}
            </div>
          </div>

          {trending.length > 0 && (
            <div className="aside-card">
              <h3>
                <Icon name="sparkle" size={14} /> Trending
              </h3>
              <ol className="trending">
                {trending.map(({ key, tag, count }) => {
                  const p = paletteFor(tag.value);
                  return (
                    <li key={key}>
                      <button className="trend-link" onClick={() => onTag(tag)}>
                        <span className="trend-dot" style={{ background: p.dot }} />
                        <span className="trend-label">{tag.label}:</span>
                        <span className="trend-value">{tag.value}</span>
                      </button>
                      <span className="trend-count">{count} views</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

