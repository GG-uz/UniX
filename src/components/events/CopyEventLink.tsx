'use client';

import { useState } from 'react';
import { Link2 } from 'lucide-react';
import { officialEvent } from '@/lib/officialEvent';

export function CopyEventLink() {
  const [copied, setCopied] = useState(false);
  const [manualUrl, setManualUrl] = useState('');

  async function copy() {
    const url = new URL(officialEvent.href, window.location.origin).href;
    try {
      await navigator.clipboard.writeText(url);
      setManualUrl('');
      setCopied(true);
    } catch {
      setCopied(false);
      setManualUrl(url);
    }
  }

  return (
    <div>
      <button type="button" onClick={copy} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-400 px-5 font-bold text-neutral-950 hover:bg-amber-300">
        <Link2 size={18} aria-hidden="true" /> Скопировать ссылку
      </button>
      <span role="status" className="ml-3 text-sm">{copied && 'Ссылка скопирована'}</span>
      {manualUrl && (
        <label className="mt-3 block text-sm">
          Скопируйте адрес вручную:
          <input readOnly value={manualUrl} onFocus={e => e.target.select()} className="mt-1 block w-full rounded-lg border border-neutral-700 bg-neutral-900 p-3" />
        </label>
      )}
    </div>
  );
}
