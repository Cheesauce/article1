
import React, { useEffect, useState } from 'react';
import './App.css';
import OwnerPage from './features/owner/OwnerPage';
import PublicPage from './features/public/PublicPage';
import AboutPage from './features/about/AboutPage';
import LoginPage from './features/auth/LoginPage';
import { PostsProvider } from './features/posts/PostsContext';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import BrandLogo from './components/BrandLogo';
import Icon from './components/Icon';
import SyncBanner from './components/SyncBanner';

type Route = 'about' | 'read' | 'studio' | 'login';

const VALID_ROUTES: Route[] = ['about', 'read', 'studio', 'login'];

function parseHash(): Route {
  const hash = window.location.hash.replace('#', '') as Route;
  return VALID_ROUTES.includes(hash) ? hash : 'read';
}

function Shell() {
  const { isOwner, logout, loading } = useAuth();
  const [route, setRoute] = useState<Route>(() => parseHash());

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (!loading && route === 'studio' && !isOwner) {
      window.location.hash = 'login';
    }
    if (!loading && route === 'login' && isOwner) {
      window.location.hash = 'studio';
    }
  }, [route, isOwner, loading]);

  const go = (r: Route) => {
    window.location.hash = r;
    setRoute(r);
  };

  const onLogout = async () => {
    await logout();
    go('read');
  };

  const renderRoute = () => {
    if (route === 'about') return <AboutPage onRead={() => go('read')} />;
    if (route === 'read') return <PublicPage />;
    if (route === 'login') {
      if (isOwner) return <OwnerPage />;
      return (
        <LoginPage
          onSuccess={() => go('studio')}
          onCancel={() => go('read')}
        />
      );
    }
    if (route === 'studio') {
      if (!isOwner) {
        return (
          <LoginPage
            onSuccess={() => go('studio')}
            onCancel={() => go('read')}
          />
        );
      }
      return <OwnerPage />;
    }
    return <PublicPage />;
  };

  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="brand" onClick={() => go('read')}>
          <BrandLogo size={38} />
        </div>
        <nav className="nav-links">
          <button
            className={route === 'read' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => go('read')}
          >
            Read
          </button>
          <button
            className={route === 'about' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => go('about')}
          >
            About
          </button>
          {isOwner ? (
            <>
              <button
                className={route === 'studio' ? 'nav-btn active' : 'nav-btn'}
                onClick={() => go('studio')}
              >
                Studio
              </button>
              <button
                className="nav-btn logout"
                onClick={onLogout}
                title="Sign out"
              >
                <Icon name="close" size={13} />
                <span className="logout-text">Logout</span>
              </button>
            </>
          ) : (
            <button
              className={route === 'login' ? 'nav-btn login active' : 'nav-btn login'}
              onClick={() => go('login')}
            >
              Login
            </button>
          )}
        </nav>
      </header>
      <main className="app-main">
        {isOwner && <SyncBanner />}
        {renderRoute()}
      </main>
      <footer className="app-footer">
        <span className="footer-handle">@TracktheThesis</span>
        <span className="footer-sep">—</span>
        <span className="footer-motto">We keep receipts.</span>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <PostsProvider>
        <Shell />
      </PostsProvider>
    </AuthProvider>
  );
}

export default App;
