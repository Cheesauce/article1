
import { Post, Tag } from './types';

export function tagMatchesText(tag: Tag, q: string): boolean {
  return (
    tag.label.toLowerCase().includes(q) ||
    tag.value.toLowerCase().includes(q) ||
    `${tag.label}:${tag.value}`.toLowerCase().includes(q)
  );
}

export function postFullText(post: Post): string {
  return post.sections.map((s) => `${s.heading} ${s.body}`).join(' ');
}

export function matchesQuery(post: Post, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase().trim();

  if (/^\d{4}(-\d{2}){0,2}$/.test(q)) {
    const d = new Date(post.createdAt);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (iso.startsWith(q)) return true;
  }

  if (q.startsWith('#')) {
    const tag = q.slice(1);
    return post.tags.some((t) => tagMatchesText(t, tag));
  }

  if (post.title.toLowerCase().includes(q)) return true;
  if (postFullText(post).toLowerCase().includes(q)) return true;
  if (post.folder.toLowerCase().includes(q)) return true;
  if (post.tags.some((t) => tagMatchesText(t, q))) return true;

  return false;
}

export function tagKey(t: Tag): string {
  return `${t.label}:${t.value}`;
}

export function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = Date.now();
  const diff = now - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatFullDate(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function postExcerpt(post: Post, max = 280): string {
  const first = post.sections[0]?.body || post.sections[1]?.body || '';
  if (first.length <= max) return first;
  return first.slice(0, max).trimEnd() + '…';
}
