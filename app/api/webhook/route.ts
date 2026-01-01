import { NextRequest } from 'next/server';
import { twiml } from 'twilio';
import { generateAutoReply } from '@/lib/replies';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const body = String(formData.get('Body') ?? '').trim();

  const response = new twiml.MessagingResponse();
  const reply = generateAutoReply(body);
  response.message(reply);

  return new Response(response.toString(), {
    status: 200,
    headers: {
      'Content-Type': 'text/xml'
    }
  });
}

export async function GET() {
  return new Response('OK', { status: 200 });
}
