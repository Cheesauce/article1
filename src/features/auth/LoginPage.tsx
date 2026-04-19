
import React, { useState } from 'react';
import './LoginPage.css';
import { useAuth } from './AuthContext';
import Icon from '../../components/Icon';
import BrandLogo from '../../components/BrandLogo';

type Props = {
  onSuccess: () => void;
  onCancel: () => void;
};

export default function LoginPage({ onSuccess, onCancel }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) onSuccess();
    else setError(res.error || 'Login failed.');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <BrandLogo size={44} showWordmark={false} />
        </div>
        <h1 className="login-title">Studio access</h1>
        <p className="login-sub">
          Sign in to draft, refine, and publish. Only the owner can compose.
        </p>

        <form onSubmit={submit} className="login-form">
          <label className="login-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              autoComplete="email"
              required
              autoFocus
            />
          </label>

          <label className="login-field">
            <span>Password</span>
            <div className="pw-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPw((v) => !v)}
                tabIndex={-1}
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          {error && (
            <div className="login-error" role="alert">
              <Icon name="close" size={14} />
              <span>{error}</span>
            </div>
          )}

          <button className="login-submit" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <button type="button" className="login-cancel" onClick={onCancel}>
            Back to reading
          </button>
        </form>

        <div className="login-footer">
          <span className="login-lock">🔒 Protected area</span>
        </div>
      </div>
    </div>
  );
}
