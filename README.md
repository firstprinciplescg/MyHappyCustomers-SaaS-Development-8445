# MyHappyCustomers - SaaS Review Management Platform

A comprehensive SaaS platform for automating customer review requests, managing feedback, and tracking sentiment for small businesses.

## Features

- **Customer Management**: Add and organize customer information
- **Automated Review Requests**: Send review requests immediately after service
- **Sentiment Analysis**: Automatically route positive/negative feedback
- **Smart Routing**: Public reviews for positive feedback, private alerts for negative
- **Real-time Dashboard**: Analytics and insights on review performance
- **Alert System**: Notifications for negative feedback and missed reviews
- **Follow-up Automation**: Scheduled follow-ups for non-respondents

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Real-time**: Supabase Realtime subscriptions
- **Email**: SendGrid/MailerSend integration
- **AI**: OpenAI API for sentiment analysis
- **Deployment**: Vercel/Netlify ready

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd myhappycustomers
npm install
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the following SQL in your Supabase SQL editor:

```sql
-- Create users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  business_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- Create customers table
CREATE TABLE public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service_date DATE NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create review_requests table
CREATE TABLE public.review_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  follow_up_1_sent BOOLEAN DEFAULT FALSE,
  follow_up_2_sent BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'responded', 'expired'))
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative')) NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5)
);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('missing', 'negative')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own customers" ON public.customers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own review requests" ON public.review_requests FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.customers WHERE id = customer_id)
);
CREATE POLICY "Users can view own reviews" ON public.reviews FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.customers WHERE id = customer_id)
);
CREATE POLICY "Users can view own alerts" ON public.alerts FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_customers_user_id ON public.customers(user_id);
CREATE INDEX idx_review_requests_customer_id ON public.review_requests(customer_id);
CREATE INDEX idx_reviews_customer_id ON public.reviews(customer_id);
CREATE INDEX idx_alerts_user_id ON public.alerts(user_id);
```

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Update the values:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## Database Schema

### Tables Overview

- **users**: Business owner profiles
- **customers**: Customer contact information and service details
- **review_requests**: Tracking sent review requests and follow-ups
- **reviews**: Customer feedback and sentiment analysis
- **alerts**: Notifications for negative feedback or missing reviews

## Key Features Implementation

### Automated Review Requests
- Customers are automatically sent review requests after being added
- Follow-up emails sent after 5 and 10 days if no response
- Implemented via Supabase Edge Functions and scheduled functions

### Sentiment-Based Routing
- Positive reviews (4-5 stars) → Redirect to public review sites
- Negative reviews (1-3 stars) → Private feedback + admin alert
- Uses simple keyword analysis and rating thresholds

### Real-time Dashboard
- Live updates via Supabase Realtime subscriptions
- Analytics on conversion rates, sentiment breakdown
- Recent activity feed and quick actions

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Netlify Deployment

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Add environment variables in Netlify dashboard

## Edge Functions (Optional)

For automated email sending and follow-ups, create Supabase Edge Functions:

```typescript
// supabase/functions/send-review-request/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // Email sending logic here
  // Integration with SendGrid or similar
})
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.