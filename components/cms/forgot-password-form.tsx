'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CmsForgotPasswordForm() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError('');

    try {
      const response = await fetch('/api/cms/auth/forgot-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: form.get('email') }),
      });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? 'Permintaan tidak dapat diproses.');
        return;
      }
      setSent(true);
    } catch {
      setError('Layanan pemulihan sedang tidak dapat dijangkau. Coba kembali.');
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="cms-auth-state" aria-live="polite">
        <output className="cms-form-success">Jika email tersebut terdaftar, tautan reset password telah dikirim.</output>
        <p>Periksa kotak masuk dan folder spam. Tautan pemulihan hanya dapat digunakan dalam waktu terbatas.</p>
        <Link className="cms-auth-text-link cms-auth-back-link" href="/admin/login"><ArrowLeft size={15} /> Kembali ke login</Link>
      </div>
    );
  }

  return (
    <form className="cms-auth-form" onSubmit={submit}>
      <div className="cms-field">
        <Label htmlFor="recovery-email">Alamat email</Label>
        <Input id="recovery-email" name="email" type="email" autoComplete="email" placeholder="nama@email.com" required />
      </div>
      {error ? <p className="cms-form-error" role="alert">{error}</p> : null}
      <Button className="cms-primary-button" type="submit" disabled={busy}>
        <Mail size={16} />
        {busy ? 'Mengirim...' : 'Kirim Tautan Reset'}
        <ArrowRight size={16} />
      </Button>
      <Link className="cms-auth-text-link cms-auth-back-link" href="/admin/login"><ArrowLeft size={15} /> Kembali ke login</Link>
    </form>
  );
}
