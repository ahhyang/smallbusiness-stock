# SmartStore

**Smart Store Management Platform** — 帮助小型 F&B 和零售商家管理库存、订单、预约和销售。

## Live demo

**https://smartstore-demo-pi.vercel.app**

Login: `demo@store.com` / `demo123`

Allow browser notifications when prompted. On login you get an AI briefing popup; low stock and out-of-stock events also trigger toast + modal alerts.

AI Assistant uses **OpenRouter** (with rule-based fallback). Set `OPENROUTER_API_KEY` in Vercel / `.env.local` — never commit real keys.

## Features

- **Dashboard** — Today's sales, orders, bookings, low stock alerts
- **Orders** — Pending → Confirmed → Preparing → Ready → Completed workflow
- **Bookings** — Pickup reservations with auto inventory deduction
- **Inventory** — Raw materials + finished products, stock in/adjustment
- **Products** — Recipe-based ingredient mapping
- **Sales** — Charts and reports (today/week/month)
- **AI Assistant** — OpenRouter-powered answers using live store data
- **AI Alerts** — Popups / toasts / browser notifications for low stock and busy orders
- **Multi-Branch** — Switch between branches or view all
- **WhatsApp** — One-click message with pre-filled order details
- **Customers** — Top spenders and WhatsApp follow-up

## Quick Start (Demo Mode)

No database required — runs with in-memory demo data:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo login:** `demo@store.com` / `demo123`

## Production Setup (Vercel + Neon)

1. Create a [Neon](https://neon.tech) PostgreSQL database
2. Copy `.env.example` to `.env.local`:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-random-secret
```

3. Push schema and seed:

```bash
npm run db:push
npm run db:seed
```

4. Deploy to [Vercel](https://vercel.com) and add environment variables

## Demo Flow

1. Login → see Dashboard with today's stats
2. Create a Booking (20 drinks, 3PM pickup)
3. System auto-creates order + deducts inventory
4. Check Inventory → Milk shows low stock
5. Ask AI: "为什么 Milk 快没了？"

## Tech Stack

- **Next.js 16** (App Router)
- **Tailwind CSS 4**
- **Drizzle ORM** + Neon PostgreSQL
- **Recharts** for sales charts
- **JWT** session auth

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/     # Protected pages
│   ├── api/             # API routes
│   └── login/
├── components/
├── lib/
│   ├── ai/              # AI assistant logic
│   ├── data/            # Data access layer
│   ├── db/              # Drizzle schema
│   └── demo-store.ts    # In-memory demo data
└── scripts/seed.ts
```

## License

MIT
