'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';

type Contact = {
  id: string;
  name: string;
  phone: string;
};

type SendStatus =
  | { state: 'idle' }
  | { state: 'sending'; processed: number; total: number }
  | { state: 'success'; sent: number }
  | { state: 'error'; message: string };

const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[^\d]/g, ''))
  .refine((value) => value.length === 10, {
    message: 'Enter a valid 10 digit US phone number'
  });

const storageKey = 'agentic-whatsapp-assistant.contacts.v1';

const exampleResponses = [
  'Sure! Here is the product link again 👉 {product_url}',
  "Absolutely, let's get you the purchase link: {product_url}",
  'Happy to help! You can order it here: {product_url}',
  'Great question! Tap this link to see the offer: {product_url}'
];

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<SendStatus>({ state: 'idle' });
  const [autoReply, setAutoReply] = useState('');

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Contact[];
        setContacts(parsed);
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(contacts));
  }, [contacts]);

  const contactCount = contacts.length;

  const phonePreview = useMemo(() => {
    try {
      const normalized = phoneSchema.parse(phone);
      return `+1 ${normalized.slice(0, 3)} ${normalized.slice(3, 6)} ${normalized.slice(6)}`;
    } catch {
      return null;
    }
  }, [phone]);

  const handleAddContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = phoneSchema.safeParse(phone);
    if (!result.success) {
      setStatus({ state: 'error', message: result.error.errors[0]?.message ?? 'Invalid phone number' });
      return;
    }

    if (contacts.some((contact) => contact.phone === result.data)) {
      setStatus({ state: 'error', message: 'This number is already in your list' });
      return;
    }

    const trimmedName = name.trim() || '(Unnamed contact)';

    setContacts((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: trimmedName,
        phone: result.data
      }
    ]);
    setName('');
    setPhone('');
    setStatus({ state: 'idle' });
  };

  const handleSendLink = async () => {
    if (contacts.length === 0) {
      setStatus({ state: 'error', message: 'Add at least one contact before sending' });
      return;
    }

    setStatus({ state: 'sending', processed: 0, total: contacts.length });

    try {
      const response = await fetch('/api/send-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contacts })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message ?? 'Failed to send WhatsApp broadcasts');
      }

      const payload = (await response.json()) as { sent: number; autoReply?: string };
      if (payload.autoReply) {
        setAutoReply(payload.autoReply);
      }
      setStatus({ state: 'success', sent: payload.sent });
    } catch (error) {
      setStatus({ state: 'error', message: error instanceof Error ? error.message : 'Unexpected error occurred' });
    }
  };

  const handleRemove = (id: string) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== id));
  };

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">WhatsApp Funnel Autopilot</h1>
            <p className="mt-2 max-w-2xl text-base text-slate-300">
              Collect verified U.S. leads, launch WhatsApp product campaigns instantly, and auto-reply to every incoming
              question with a tailored response that keeps customers on the purchase path.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-400/40 bg-cyan-500/10 px-6 py-4 text-sm text-cyan-100 shadow-lg shadow-cyan-500/25">
            <p className="font-medium uppercase tracking-[0.2em] text-cyan-300">Ready Status</p>
            <p className="mt-2 text-2xl font-semibold text-white">{contactCount} contacts synced</p>
          </div>
        </div>
        {status.state === 'error' && (
          <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {status.message}
          </div>
        )}
        {status.state === 'success' && (
          <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            Broadcast delivered to {status.sent} contact{status.sent === 1 ? '' : 's'} via WhatsApp. Monitor replies in
            the Twilio console or your CRM.
          </div>
        )}
        {status.state === 'sending' && (
          <div className="rounded-xl border border-cyan-500/50 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
            Sending campaign {Math.min(status.processed + 1, status.total)} / {status.total}…
          </div>
        )}
      </header>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,2fr),minmax(0,3fr)]">
        <div className="space-y-6">
          <form className="space-y-4 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-inner shadow-slate-900/80" onSubmit={handleAddContact}>
            <div>
              <h2 className="text-xl font-semibold text-white">Inbound Capture</h2>
              <p className="mt-1 text-sm text-slate-400">
                Capture a lead&apos;s name and verify their U.S. WhatsApp number. We normalize and store it locally so you can
                launch compliant broadcasts.
              </p>
            </div>
            <div className="space-y-3">
              <label className="flex flex-col gap-1 text-sm text-slate-300">
                Name
                <input
                  className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-base text-white shadow-inner shadow-black/60 outline-none transition focus:border-cyan-400 focus:shadow-cyan-500/20"
                  placeholder="Skylar Rivera"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-300">
                U.S. WhatsApp Number
                <input
                  className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-base text-white shadow-inner shadow-black/60 outline-none transition focus:border-cyan-400 focus:shadow-cyan-500/20"
                  placeholder="(555) 555-5555"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </label>
            </div>
            {phonePreview && (
              <p className="text-xs text-slate-400">Will send as: <span className="font-mono text-slate-200">{phonePreview}</span></p>
            )}
            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500 px-4 py-2.5 text-base font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-400/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            >
              Save contact
            </button>
          </form>

          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-inner shadow-slate-900/80">
            <h2 className="text-xl font-semibold text-white">Automated Responses</h2>
            <p className="mt-1 text-sm text-slate-400">
              Customize reply scripts inside <code className="rounded bg-slate-800/80 px-1.5 py-0.5 text-xs text-cyan-200">/app/api/webhook/route.ts</code>. Each incoming WhatsApp message triggers a webhook and delivers a smart reply referencing your product URL.
            </p>
            <div className="mt-4 space-y-3 rounded-xl border border-slate-800/70 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Sample reply variations</p>
              <ul className="space-y-2 text-sm text-slate-300">
                {exampleResponses.map((phrase) => (
                  <li key={phrase} className="rounded-lg border border-slate-800/80 bg-slate-950/70 px-3 py-2">
                    {phrase}
                  </li>
                ))}
              </ul>
            </div>
            {autoReply && (
              <div className="mt-4 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                Current auto-reply script detected:
                <div className="mt-2 font-mono text-xs text-emerald-200/90">{autoReply}</div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-inner shadow-slate-900/80">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Audience Manager</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Your contacts are stored locally for rapid iteration. Export the JSON payload into a CRM or pipe it into an
                  API workflow when you&apos;re ready.
                </p>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(JSON.stringify(contacts, null, 2))}
                className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-slate-200 transition hover:border-cyan-400 hover:text-white"
              >
                Copy JSON
              </button>
            </div>
            <div className="mt-6 space-y-3">
              {contacts.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-700 bg-slate-950/40 px-4 py-6 text-center text-sm text-slate-500">
                  No contacts yet. Add your first U.S. WhatsApp lead above.
                </p>
              ) : (
                contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-950/50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{contact.name}</p>
                      <p className="text-xs text-slate-400">+1 {contact.phone.slice(0, 3)}-{contact.phone.slice(3, 6)}-{contact.phone.slice(6)}</p>
                    </div>
                    <button
                      onClick={() => handleRemove(contact.id)}
                      className="rounded-md border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300 transition hover:border-rose-500 hover:text-rose-300"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-cyan-500/40 bg-cyan-500/5 p-6 shadow-lg shadow-cyan-500/20">
            <div>
              <h2 className="text-xl font-semibold text-white">Launch WhatsApp Broadcast</h2>
              <p className="mt-1 text-sm text-cyan-100/80">
                Sends your configured product URL plus a campaign hook to every saved contact via Twilio&apos;s WhatsApp
                Business API.
              </p>
            </div>
            <button
              onClick={handleSendLink}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 px-5 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 transition hover:shadow-emerald-400/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
            >
              Send campaign
            </button>
            <div className="rounded-xl border border-cyan-400/40 bg-slate-950/40 p-4 text-xs text-cyan-100/80">
              <p className="font-semibold uppercase tracking-[0.25em] text-cyan-200/80">Deployment checklist</p>
              <ul className="mt-2 space-y-2">
                <li>• Set <code className="rounded bg-slate-900 px-1 py-0.5 text-[0.7rem] text-cyan-200">TWILIO_ACCOUNT_SID</code> and <code className="rounded bg-slate-900 px-1 py-0.5 text-[0.7rem] text-cyan-200">TWILIO_AUTH_TOKEN</code> in the Vercel project.</li>
                <li>• Configure <code className="rounded bg-slate-900 px-1 py-0.5 text-[0.7rem] text-cyan-200">TWILIO_WHATSAPP_FROM</code> with your approved business number (format <code className="rounded bg-slate-900 px-1 py-0.5 text-[0.7rem] text-cyan-200">whatsapp:+1...</code>).</li>
                <li>• Set <code className="rounded bg-slate-900 px-1 py-0.5 text-[0.7rem] text-cyan-200">PRODUCT_URL</code> to the destination you want to promote.</li>
                <li>• Point Twilio&apos;s incoming webhook to <code className="rounded bg-slate-900 px-1 py-0.5 text-[0.7rem] text-cyan-200">/api/webhook</code> for auto-responses.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
