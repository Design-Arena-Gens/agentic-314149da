## WhatsApp Funnel Autopilot

Agentic landing + automation stack that captures U.S. WhatsApp numbers, blasts out a product campaign, and answers every reply automatically.

### Stack

- Next.js 14 (App Router, TypeScript)
- Twilio WhatsApp Business API integration
- Edge/Node API routes for outbound blasts and inbound webhooks

### Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to manage contacts, send campaign messages, and preview automation hints.

### Required Environment Variables

Create `.env.local` (or configure in Vercel):

```
TWILIO_ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+12223334444
PRODUCT_URL=https://your-product.com/offer
AUTO_REPLY_INTENT_SUMMARY=Ultra-fast replies that cover pricing, shipping, and product info.
```

### Deploy to Vercel

```bash
npm run build
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-314149da
```

Point Twilio’s WhatsApp sandbox or production number webhook to `https://agentic-314149da.vercel.app/api/webhook` for automated replies.
