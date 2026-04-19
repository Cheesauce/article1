
import React from 'react';
import './SyncBanner.css';
import { usePosts } from '../features/posts/PostsContext';
import Icon from './Icon';

export default function SyncBanner() {
  const { remote, syncError } = usePosts();

  if (syncError) {
    return (
      <div className="sync-banner err">
        <Icon name="close" size={13} />
        <span>{syncError}</span>
      </div>
    );
  }

  if (!remote) {
    return (
      <div className="sync-banner warn">
        <span className="sync-dot" />
        <span>
          <strong>Local-only mode.</strong> Posts are saved to this browser only.
          Configure Supabase env vars on Vercel to publish globally.
        </span>
      </div>
    );
  }

  return null;
}
