import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAutoReplySnapshot, sendCampaignMessage } from '@/lib/twilio';

const contactSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, 'Contact phone must be a 10 digit U.S. number')
});

const payloadSchema = z.object({
  contacts: z.array(contactSchema).min(1, 'Provide at least one contact to message')
});

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let parsedPayload: z.infer<typeof payloadSchema>;

  try {
    const body = await request.json();
    parsedPayload = payloadSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0]?.message ?? 'Invalid payload' },
        { status: 422 }
      );
    }

    return NextResponse.json({ message: 'Unable to parse request body' }, { status: 400 });
  }

  try {
    const results = await Promise.allSettled(parsedPayload.contacts.map((contact) => sendCampaignMessage(contact)));

    const successful = results.filter((result) => result.status === 'fulfilled').length;
    const failures = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map((result) => result.reason?.message ?? 'Unknown error');

    if (successful === 0) {
      const message = failures[0] ?? 'Failed to dispatch WhatsApp messages';
      return NextResponse.json({ message }, { status: 502 });
    }

    return NextResponse.json({
      sent: successful,
      failed: failures.length,
      failures: failures.slice(0, 5),
      autoReply: getAutoReplySnapshot()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
