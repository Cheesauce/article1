
import React, { useEffect, useRef, useState } from 'react';
import './ShareMenu.css';
import { Post } from '../posts/types';
import Icon from '../../components/Icon';

type Props = {
  post: Post;
  onClose: () => void;
};

export default function ShareMenu({ post, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [onClose]);

  const url = `${window.location.origin}${window.location.pathname}#post-${post.id}`;
  const text = `"${post.title}" — via @TracktheThesis`;
  const enc = encodeURIComponent;

  const targets = [
    {
      name: 'X',
      href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`,
    },
    {
      name: 'Threads',
      href: `https://www.threads.net/intent/post?text=${enc(text + ' ' + url)}`,
    },
    {
      name: 'Messenger',
      href: `https://www.facebook.com/dialog/send?link=${enc(url)}&app_id=0&redirect_uri=${enc(url)}`,
    },
    {
      name: 'Instagram',
      href: `https://www.instagram.com/`,
    },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* no-op */
    }
  };

  return (
    <div className="share-menu" ref={ref}>
      <div className="share-menu-header">Share post</div>
      {targets.map((t) => (
        <a
          key={t.name}
          href={t.href}
          target="_blank"
          rel="noopener noreferrer"
          className="share-item"
        >
          <Icon name="share" size={14} /> Share to {t.name}
        </a>
      ))}
      <button className="share-item" onClick={copy}>
        {copied ? <Icon name="check" size={14} /> : <Icon name="link" size={14} />}
        {copied ? 'Link copied' : 'Copy link'}
      </button>
    </div>
  );
}
