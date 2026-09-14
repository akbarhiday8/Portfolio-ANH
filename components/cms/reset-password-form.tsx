'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type RecoveryState = 'checking' | 'ready' | 'invalid';

export function CmsResetPasswordForm() {
  const recoveryStarted = useRef(false);
  const [recoveryState, setRecoveryState] = useState<RecoveryState>('checking');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (recoveryStarted.current) return;
    recoveryStarted.current = true;

    void (async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const authError = url.searchParams.get('error') || new URLSearchParams(url.hash.slice(1)).get('error');
      if (code || authError) window.history.replaceState({}, '', '/admin/reset-password');
      if (!code || authError) {
        await Promise.resolve();
        setRecoveryState('invalid');
        return;
      }

      try {
        const response = await fetch('/api/cms/auth/recovery', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        if (!response.ok) {
          setRecoveryState('invalid');
          return;
        }
        setRecoveryState('ready');
      } catch {
        setRecoveryState('invalid');
      }
    })();
  }, []);

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const passwordValue = form.get('password');
    const confirmationValue = form.get('passwordConfirmation');
    const password = typeof passwordValue === 'string' ? passwordValue : '';
    const passwordConfirmation = typeof confirmationValue === 'string' ? confirmationValue : '';

    setError('');
    if (!password || !passwordConfirmation) {
      setError('Password baru dan konfirmasi wajib diisi.');
      return;
    }
    if (password !== passwordConfirmation) {
      setError('Password baru dan konfirmasi tidak sama.');
      return;
    }

    setBusy(true);
    try {
      const response = await fetch('/api/cms/auth/reset-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password, passwordConfirmation }),
      });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? 'Password belum dapat diperbarui.');
        return;
      }
      window.location.replace('/admin/login?reset=success');
    } catch {
      setError('Layanan pemulihan sedang tidak dapat dijangkau. Coba kembali.');
    } finally {
      setBusy(false);
    }
  }

  if (recoveryState === 'checking') {
    return <output className="cms-auth-loading" aria-live="polite">Memeriksa tautan pemulihan...</output>;
  }

  if (recoveryState === 'invalid') {
    return (
      <div className="cms-auth-state">
        <p className="cms-form-error" role="alert">Tautan pemulihan tidak valid, telah kedaluwarsa, atau sudah digunakan.</p>
        <Link className="cms-auth-text-link cms-auth-back-link" href="/admin/forgot-password"><ArrowLeft size={15} /> Minta tautan baru</Link>
      </div>
    );
  }

  return (
    <form className="cms-auth-form" onSubmit={submit}>
      <div className="cms-field">
        <Label htmlFor="new-password">Password baru</Label>
        <div className="cms-password-field">
          <Input id="new-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Masukkan password baru" required />
          <button type="button" aria-label={showPassword ? 'Sembunyikan password baru' : 'Tampilkan password baru'} onClick={() => setShowPassword((value) => !value)}>
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>
      <div className="cms-field">
        <Label htmlFor="password-confirmation">Konfirmasi password baru</Label>
        <div className="cms-password-field">
          <Input id="password-confirmation" name="passwordConfirmation" type={showConfirmation ? 'text' : 'password'} autoComplete="new-password" placeholder="Ulangi password baru" required />
          <button type="button" aria-label={showConfirmation ? 'Sembunyikan konfirmasi password' : 'Tampilkan konfirmasi password'} onClick={() => setShowConfirmation((value) => !value)}>
            {showConfirmation ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>
      {error ? <p className="cms-form-error" role="alert">{error}</p> : null}
      <Button className="cms-primary-button" type="submit" disabled={busy}>
        <KeyRound size={16} />
        {busy ? 'Memperbarui...' : 'Perbarui Password'}
        <ArrowRight size={16} />
      </Button>
    </form>
  );
}
