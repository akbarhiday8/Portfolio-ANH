'use client';

import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CmsAuthForm({ mode, redirectPath = '/admin' }: { mode: 'login' | 'register'; redirectPath?: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get('password') ?? '');
    if (mode === 'register' && password !== String(form.get('confirmPassword') ?? '')) {
      setError('Konfirmasi kata sandi belum sama.');
      return;
    }
    setBusy(true);
    setError('');
    const response = await fetch(`/api/cms/auth/${mode}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        displayName: form.get('displayName'),
        email: form.get('email'),
        password,
      }),
    });
    const result = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) {
      setError(result.error ?? 'Permintaan tidak dapat diproses.');
      setBusy(false);
      if (response.status === 409) window.setTimeout(() => { window.location.href = `${redirectPath}/login`; }, 900);
      return;
    }
    window.location.href = redirectPath;
  }

  return (
    <form className="cms-auth-form" onSubmit={submit}>
      {mode === 'register' ? (
        <div className="cms-field">
          <Label htmlFor="displayName">Nama admin</Label>
          <Input id="displayName" name="displayName" autoComplete="name" minLength={2} placeholder="Akbar Nur Hidayanto" required />
        </div>
      ) : null}
      <div className="cms-field">
        <Label htmlFor="email">Alamat email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="nama@email.com" required />
      </div>
      <div className="cms-field">
        <Label htmlFor="password">Kata sandi</Label>
        <div className="cms-password-field">
          <Input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={10} placeholder="Minimal 10 karakter" required />
          <button type="button" aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} onClick={() => setShowPassword((value) => !value)}>
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>
      {mode === 'register' ? (
        <div className="cms-field">
          <Label htmlFor="confirmPassword">Ulangi kata sandi</Label>
          <Input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={10} placeholder="Ketik kembali kata sandi" required />
        </div>
      ) : null}
      {error ? <p className="cms-form-error" role="alert">{error}</p> : null}
      <Button className="cms-primary-button" type="submit" disabled={busy}>
        <LockKeyhole size={16} />
        {busy ? 'Memproses...' : mode === 'register' ? 'Buat akun admin' : 'Masuk ke CMS'}
        <ArrowRight size={16} />
      </Button>
    </form>
  );
}
