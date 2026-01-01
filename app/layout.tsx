import './globals.css';
import type { ReactNode } from 'react';
import { ClientShell } from '@/components/client-shell';

export const metadata = {
  title: 'WhatsApp Funnel Autopilot',
  description:
    'Capture U.S. WhatsApp leads, blast product campaigns, and auto-reply to every inbound message instantly.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
