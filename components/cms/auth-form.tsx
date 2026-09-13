'use client';

import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CmsAuthForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const passwordValue = form.get('password');
    const password = typeof passwordValue === 'string' ? passwordValue : '';
    setBusy(true);
    setError('');
    const response = await fetch('/api/cms/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: form.get('email'),
        password,
      }),
    });
    const result = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) {
      setError(result.error ?? 'Permintaan tidak dapat diproses.');
      setBusy(false);
      return;
    }
    window.location.href = '/admin';
  }

  return (
    <form className="cms-auth-form" onSubmit={submit}>
      <div className="cms-field">
        <Label htmlFor="email">Alamat email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="nama@email.com" required />
      </div>
      <div className="cms-field">
        <Label htmlFor="password">Kata sandi</Label>
        <div className="cms-password-field">
          <Input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Masukkan kata sandi" required />
          <button type="button" aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} onClick={() => setShowPassword((value) => !value)}>
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>
      {error ? <p className="cms-form-error" role="alert">{error}</p> : null}
      <Button className="cms-primary-button" type="submit" disabled={busy}>
        <LockKeyhole size={16} />
        {busy ? 'Memproses...' : 'Masuk ke CMS'}
        <ArrowRight size={16} />
      </Button>
    </form>
  );
}
