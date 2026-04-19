
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Post, PostSection } from './types';
import { persistence } from '../../utils/persistence';
import { isRemoteEnabled, supa, hasOwnerWriteKey } from '../../utils/supabaseClient';
import { getVisitorId } from '../../utils/visitorId';

type Tally = Record<string, number>;

type PostsContextValue = {
  posts: Post[];
  loading: boolean;
  remote: boolean;
  syncError: string | null;
  addPost: (p: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'hearts'>) => Promise<Post>;
  updatePost: (id: string, patch: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  toggleHeart: (id: string) => Promise<void>;
  heartedIds: Record<string, boolean>;
  tagClicks: Tally;
  recordTagClick: (tag: string) => Promise<void>;
  folderClicks: Tally;
  recordFolderClick: (folder: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const PostsContext = createContext<PostsContextValue | null>(null);

const POSTS_KEY = 'tracktt.posts.v4';
const TAG_CLICKS_KEY = 'tracktt.tagClicks.v1';
const FOLDER_CLICKS_KEY = 'tracktt.folderClicks.v1';
const HEARTED_KEY = 'tracktt.hearted.v1';

const seedPosts: Post[] = [
  {
    id: 'seed-1',
    title: 'Bitcoin at $67K — The Thesis, The Signal',
    sections: [
      {
        heading: 'The Thesis',
        body: 'Sound money is, in the end, a discipline of character. A civilization that lowers its time preference builds cathedrals, libraries, and long-dated infrastructure. When money is debased, the calculus of patience inverts — we consume the future to survive the present. Bitcoin is the first politically neutral bearer asset with a fixed supply schedule, and that scarcity is not a feature of code alone — it is the cumulative work of every node that refuses to blink.',
      },
      {
        heading: 'The Receipt',
        body: 'Position opened at $67,400 with a 5-year horizon. I am not trading this — I am sitting with it. If the thesis is wrong, it is wrong about human nature, not about a chart. Revisit: halving cycle + 18 months.',
        conviction: 92,
      },
    ],
    tags: [
      { label: 'Champion', value: 'Satoshi Nakamoto' },
      { label: 'Proxy', value: 'BTC' },
      { label: 'Price', value: '$67,400' },
    ],
    folder: 'Theses',
    createdAt: Date.now() - 1000 * 60 * 60 * 72,
    updatedAt: Date.now() - 1000 * 60 * 60 * 72,
    published: true,
    replyToId: null,
    hearts: 42,
    aiModel: 'gpt-4o',
  },
  {
    id: 'seed-2',
    title: 'Tesla — Long the Operator, Not the Narrative',
    sections: [
      {
        heading: 'The Thesis',
        body: 'There is a certain calm among people who have thought through their positions. They do not need to convince you. They have done the reading, the stress testing, the mental rehearsal of drawdowns. The Tesla position is not about quarterly deliveries — it is a bet on an operator who compounds engineering advantages across automotive, energy, and autonomy. Conviction is not volume — it is preparation.',
      },
      {
        heading: 'The Receipt',
        body: 'Entry $392. Horizon: 5–10 years. Sizing is deliberate — large enough to matter, small enough to sleep. I will not average down on narrative; I will average down on fundamentals if margins compress for the right reasons.',
        conviction: 78,
      },
    ],
    tags: [
      { label: 'Champion', value: 'Elon Musk' },
      { label: 'Proxy', value: 'TSLA' },
      { label: 'Price', value: '$392' },
    ],
    folder: 'Theses',
    createdAt: Date.now() - 1000 * 60 * 60 * 36,
    updatedAt: Date.now() - 1000 * 60 * 60 * 36,
    published: true,
    replyToId: null,
    hearts: 17,
    aiModel: 'claude-3.5-sonnet',
  },
  {
    id: 'seed-3',
    title: 'Follow-up: Infrastructure Over Narrative',
    sections: [
      {
        heading: 'The Update',
        body: 'To extend the earlier Tesla note — the builders who last are the ones indifferent to narrative cycles. They ship through bull and bear. The market eventually re-rates real infrastructure; it always has. I am adding Tesla\'s Megapack and Supercharger network to the list of under-appreciated compounders.',
      },
      {
        heading: 'The Receipt',
        body: 'No change to position size. Added a note to the thesis file: "Re-evaluate if Supercharger licensing revenue exceeds $2B annualized." Still patient. Still unbothered by the weekly tape.',
        conviction: 84,
      },
    ],
    tags: [
      { label: 'Theme', value: 'Infrastructure' },
      { label: 'Horizon', value: '5–10 yrs' },
    ],
    folder: 'Updates',
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
    updatedAt: Date.now() - 1000 * 60 * 60 * 8,
    published: true,
    replyToId: 'seed-2',
    hearts: 9,
    aiModel: 'gpt-4o',
  },
];

function migrate(raw: any): any {
  if (!Array.isArray(raw)) return raw;
  return raw.map((p: any) => {
    let next = { ...p };
    if (Array.isArray(p.tags)) {
      next.tags = p.tags.map((t: any) =>
        typeof t === 'string' ? { label: 'Tag', value: t } : t
      );
    }
    if (!Array.isArray(p.sections)) {
      const body = typeof p.body === 'string' ? p.body : '';
      const paragraphs = body.split(/\n\s*\n/);
      let s1 = body;
      let s2 = '';
      if (paragraphs.length >= 2) {
        const mid = Math.ceil(paragraphs.length / 2);
        s1 = paragraphs.slice(0, mid).join('\n\n');
        s2 = paragraphs.slice(mid).join('\n\n');
      }
      next.sections = [
        { heading: 'The Thesis', body: s1 },
        { heading: 'The Receipt', body: s2 },
      ];
      delete next.body;
    }

    if (Array.isArray(next.tags) && Array.isArray(next.sections)) {
      const convIdx = next.tags.findIndex(
        (t: any) => typeof t?.label === 'string' && t.label.toLowerCase() === 'conviction'
      );
      if (convIdx >= 0) {
        const raw = String(next.tags[convIdx].value || '');
        const m = raw.match(/(\d{1,3})/);
        if (m) {
          const n = Math.max(0, Math.min(100, parseInt(m[1], 10)));
          const h2 = next.sections[1] || next.sections[0];
          if (h2 && (h2.conviction === undefined || h2.conviction === null)) {
            h2.conviction = n;
          }
        }
        next.tags = next.tags.filter((_: any, i: number) => i !== convIdx);
      }
    }

    return next;
  });
}

// DB row <-> app model
type PostRow = {
  id: string;
  title: string;
  sections: PostSection[];
  tags: { label: string; value: string }[];
  folder: string;
  published: boolean;
  reply_to_id: string | null;
  ai_model: string | null;
  hearts: number;
  created_at: string;
  updated_at: string;
};

function rowToPost(r: PostRow, heartsOverride?: number): Post {
  return {
    id: r.id,
    title: r.title,
    sections: Array.isArray(r.sections) ? r.sections : [],
    tags: Array.isArray(r.tags) ? r.tags : [],
    folder: r.folder || 'Theses',
    published: !!r.published,
    replyToId: r.reply_to_id,
    aiModel: r.ai_model,
    hearts:
      typeof heartsOverride === 'number'
        ? heartsOverride
        : typeof r.hearts === 'number'
        ? r.hearts
        : 0,
    createdAt: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
    updatedAt: r.updated_at ? new Date(r.updated_at).getTime() : Date.now(),
  };
}

function postToRow(p: Partial<Post>): Partial<PostRow> {
  const row: Partial<PostRow> = {};
  if (p.id !== undefined) row.id = p.id;
  if (p.title !== undefined) row.title = p.title;
  if (p.sections !== undefined) row.sections = p.sections;
  if (p.tags !== undefined) row.tags = p.tags;
  if (p.folder !== undefined) row.folder = p.folder;
  if (p.published !== undefined) row.published = p.published;
  if (p.replyToId !== undefined) row.reply_to_id = p.replyToId || null;
  if (p.aiModel !== undefined) row.ai_model = p.aiModel || null;
  return row;
}

export function PostsProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [tagClicks, setTagClicks] = useState<Tally>({});
  const [folderClicks, setFolderClicks] = useState<Tally>({});
  const [heartedIds, setHeartedIds] = useState<Record<string, boolean>>({});
  const [syncError, setSyncError] = useState<string | null>(null);
  const remote = isRemoteEnabled();
  const visitorIdRef = useRef<string | null>(null);

  /**
   * Counts hearts for every post by grouping rows in the hearts table.
   * This is the source of truth — we stopped depending on `posts.hearts`
   * (which relied on a trigger that, per user report, was not keeping
   * the count in sync). A direct count is boring, correct, and fast
   * thanks to the `hearts_post_idx` index.
   */
  const fetchHeartCounts = useCallback(
    async (postIds: string[]): Promise<Record<string, number>> => {
      const counts: Record<string, number> = {};
      if (postIds.length === 0) return counts;
      // Fetch all heart rows whose post_id is in our set, then tally.
      // Even with 10k hearts this is a single cheap query.
      const idList = postIds.map((id) => `"${id.replace(/"/g, '\\"')}"`).join(',');
      const rows = await supa.select<{ post_id: string }>(
        `hearts?select=post_id&post_id=in.(${encodeURIComponent(idList)})`
      );
      rows.forEach((r) => {
        counts[r.post_id] = (counts[r.post_id] || 0) + 1;
      });
      return counts;
    },
    []
  );

  const loadFromSupabase = useCallback(async () => {
    const rows = await supa.select<PostRow>('posts?select=*&order=created_at.desc');
    const ids = (rows || []).map((r) => r.id);

    // Authoritative heart counts straight from the hearts table
    let counts: Record<string, number> = {};
    try {
      counts = await fetchHeartCounts(ids);
    } catch (e) {
      console.warn('fetchHeartCounts failed, falling back to posts.hearts', e);
    }

    const list = (rows || []).map((r) =>
      rowToPost(r, counts[r.id] !== undefined ? counts[r.id] : r.hearts)
    );

    // Fetch this visitor's hearts so we can highlight them
    try {
      const vid = visitorIdRef.current;
      if (vid) {
        const mine = await supa.select<{ post_id: string }>(
          `hearts?select=post_id&visitor_id=eq.${encodeURIComponent(vid)}`
        );
        const map: Record<string, boolean> = {};
        mine.forEach((h) => (map[h.post_id] = true));
        setHeartedIds(map);
      }
    } catch (e) {
      console.warn('Failed to load visitor hearts', e);
    }

    return list;
  }, [fetchHeartCounts]);

  const loadFromLocal = useCallback(async (): Promise<Post[]> => {
    const raw = await persistence.getItem(POSTS_KEY);
    if (raw) return migrate(JSON.parse(raw));
    const older =
      (await persistence.getItem('tracktt.posts.v3')) ||
      (await persistence.getItem('inkwell.posts.v2')) ||
      (await persistence.getItem('inkwell.posts.v1'));
    if (older) {
      const migrated = migrate(JSON.parse(older));
      await persistence.setItem(POSTS_KEY, JSON.stringify(migrated));
      return migrated;
    }
    await persistence.setItem(POSTS_KEY, JSON.stringify(seedPosts));
    return seedPosts;
  }, []);

  const refresh = useCallback(async () => {
    try {
      if (remote) {
        const list = await loadFromSupabase();
        setPosts(list);
        setSyncError(null);
      } else {
        setPosts(await loadFromLocal());
      }
    } catch (e: any) {
      console.error('refresh failed', e);
      setSyncError(e?.message || 'Failed to sync with server.');
      // Fall back to whatever's local so UI isn't empty
      const local = await loadFromLocal();
      setPosts(local);
    }
  }, [remote, loadFromSupabase, loadFromLocal]);

  useEffect(() => {
    (async () => {
      try {
        visitorIdRef.current = await getVisitorId();

        // Tally click counters always live locally — they're personal UI
        // affordances (trending based on *your* taps), not shared data.
        const tc = await persistence.getItem(TAG_CLICKS_KEY);
        if (tc) setTagClicks(JSON.parse(tc));
        const fc = await persistence.getItem(FOLDER_CLICKS_KEY);
        if (fc) setFolderClicks(JSON.parse(fc));

        if (!remote) {
          // Local-only: hydrate hearts from localStorage
          const h = await persistence.getItem(HEARTED_KEY);
          if (h) setHeartedIds(JSON.parse(h));
        }

        await refresh();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll every 20s when remote so hearts/new posts trickle in across devices
  useEffect(() => {
    if (!remote) return;
    const id = window.setInterval(() => {
      refresh().catch(() => {});
    }, 20000);
    const onFocus = () => refresh().catch(() => {});
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, [remote, refresh]);

  const persistLocal = useCallback(async (next: Post[]) => {
    setPosts(next);
    if (!remote) {
      await persistence.setItem(POSTS_KEY, JSON.stringify(next));
    }
  }, [remote]);

  const addPost: PostsContextValue['addPost'] = async (p) => {
    const now = Date.now();
    const id = `p_${now}_${Math.random().toString(36).slice(2, 7)}`;
    const post: Post = {
      ...p,
      id,
      createdAt: now,
      updatedAt: now,
      hearts: 0,
    };

    if (remote) {
      if (!hasOwnerWriteKey()) {
        throw new Error('Owner write key missing. Set VITE_OWNER_WRITE_KEY on Vercel.');
      }
      const inserted = await supa.insert<PostRow>(
        'posts',
        { ...postToRow(post), id, hearts: 0 },
        true
      );
      const created = inserted?.[0] ? rowToPost(inserted[0], 0) : post;
      setPosts((prev) => [created, ...prev.filter((x) => x.id !== created.id)]);
      return created;
    }

    await persistLocal([post, ...posts]);
    return post;
  };

  const updatePost: PostsContextValue['updatePost'] = async (id, patch) => {
    if (remote) {
      if (!hasOwnerWriteKey()) {
        throw new Error('Owner write key missing. Set VITE_OWNER_WRITE_KEY on Vercel.');
      }
      const updated = await supa.update<PostRow>(
        `posts?id=eq.${encodeURIComponent(id)}`,
        postToRow(patch),
        true
      );
      if (updated?.[0]) {
        // Preserve the live heart count we already have in state,
        // since PATCH returns whatever's in posts.hearts (which we no
        // longer trust as the source of truth).
        const current = posts.find((x) => x.id === id);
        const p = rowToPost(updated[0], current?.hearts);
        setPosts((prev) => prev.map((x) => (x.id === id ? p : x)));
      }
      return;
    }
    const next = posts.map((p) =>
      p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p
    );
    await persistLocal(next);
  };

  const deletePost: PostsContextValue['deletePost'] = async (id) => {
    if (remote) {
      if (!hasOwnerWriteKey()) {
        throw new Error('Owner write key missing. Set VITE_OWNER_WRITE_KEY on Vercel.');
      }
      await supa.remove(`posts?id=eq.${encodeURIComponent(id)}`, true);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      return;
    }
    await persistLocal(posts.filter((p) => p.id !== id));
  };

  const toggleHeart: PostsContextValue['toggleHeart'] = async (id) => {
    const isHearted = !!heartedIds[id];
    const vid = visitorIdRef.current;

    // Optimistic UI
    const delta = isHearted ? -1 : 1;
    const prevPosts = posts;
    const prevHearted = heartedIds;
    const nextHearted = { ...heartedIds };
    if (isHearted) delete nextHearted[id];
    else nextHearted[id] = true;
    setHeartedIds(nextHearted);
    setPosts((list) =>
      list.map((p) => (p.id === id ? { ...p, hearts: Math.max(0, p.hearts + delta) } : p))
    );

    if (remote && vid) {
      try {
        if (isHearted) {
          await supa.remove(
            `hearts?post_id=eq.${encodeURIComponent(id)}&visitor_id=eq.${encodeURIComponent(vid)}`
          );
        } else {
          // Idempotent insert — if this visitor already hearted (e.g. a
          // duplicate tap race), the unique constraint would normally
          // throw. We swallow that 409 and treat it as success.
          await supa.insertIgnoreConflict('hearts', { post_id: id, visitor_id: vid });
        }

        // Re-count this post's hearts directly from the hearts table.
        // This is the fix for "heart count always goes back to 0" —
        // we no longer trust the denormalized posts.hearts column.
        try {
          const n = await supa.count(
            `hearts?post_id=eq.${encodeURIComponent(id)}`
          );
          setPosts((list) =>
            list.map((x) => (x.id === id ? { ...x, hearts: n } : x))
          );
        } catch (err) {
          console.warn('Heart count refetch failed', err);
        }
      } catch (e) {
        console.error('toggleHeart failed, rolling back', e);
        // Roll back optimistic update
        setHeartedIds(prevHearted);
        setPosts(prevPosts);
        setSyncError('Could not save your reaction. Please try again.');
        setTimeout(() => setSyncError(null), 3500);
      }
      return;
    }

    // Local-only mode
    await persistence.setItem(HEARTED_KEY, JSON.stringify(nextHearted));
    await persistLocal(
      posts.map((p) => (p.id === id ? { ...p, hearts: Math.max(0, p.hearts + delta) } : p))
    );
  };

  const recordTagClick = async (tag: string) => {
    const next = { ...tagClicks, [tag]: (tagClicks[tag] || 0) + 1 };
    setTagClicks(next);
    await persistence.setItem(TAG_CLICKS_KEY, JSON.stringify(next));
  };

  const recordFolderClick = async (folder: string) => {
    const next = { ...folderClicks, [folder]: (folderClicks[folder] || 0) + 1 };
    setFolderClicks(next);
    await persistence.setItem(FOLDER_CLICKS_KEY, JSON.stringify(next));
  };

  return (
    <PostsContext.Provider
      value={{
        posts,
        loading,
        remote,
        syncError,
        addPost,
        updatePost,
        deletePost,
        toggleHeart,
        heartedIds,
        tagClicks,
        recordTagClick,
        folderClicks,
        recordFolderClick,
        refresh,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error('usePosts must be used within PostsProvider');
  return ctx;
}

export const DEFAULT_SECTIONS: PostSection[] = [
  { heading: 'The Thesis', body: '' },
  { heading: 'The Receipt', body: '', conviction: null },
];
