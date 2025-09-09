-- Additional database tables for email automation
-- Run these in your Supabase SQL editor

-- Email logs table to track sent emails
CREATE TABLE public.email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  email_type TEXT NOT NULL CHECK (email_type IN ('initial', 'followup1', 'followup2')),
  recipient_email TEXT NOT NULL,
  provider TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'bounced')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  error_message TEXT
);

-- Scheduled emails table for follow-up automation
CREATE TABLE public.scheduled_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  email_type TEXT NOT NULL CHECK (email_type IN ('followup1', 'followup2')),
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'cancelled', 'failed')),
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_emails ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own email logs" ON public.email_logs FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.customers WHERE id = customer_id)
);

CREATE POLICY "Users can view own scheduled emails" ON public.scheduled_emails FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.customers WHERE id = customer_id)
);

-- Create indexes for performance
CREATE INDEX idx_email_logs_customer_id ON public.email_logs(customer_id);
CREATE INDEX idx_email_logs_sent_at ON public.email_logs(sent_at);
CREATE INDEX idx_scheduled_emails_customer_id ON public.scheduled_emails(customer_id);
CREATE INDEX idx_scheduled_emails_scheduled_for ON public.scheduled_emails(scheduled_for);
CREATE INDEX idx_scheduled_emails_status ON public.scheduled_emails(status);

-- Add follow_ups_scheduled column to review_requests table
ALTER TABLE public.review_requests 
ADD COLUMN follow_ups_scheduled BOOLEAN DEFAULT FALSE;

-- Function to process scheduled emails (for cron job)
CREATE OR REPLACE FUNCTION process_scheduled_emails()
RETURNS void AS $$
DECLARE
  email_record RECORD;
BEGIN
  -- Get emails scheduled for now or past
  FOR email_record IN 
    SELECT se.*, c.name, c.email, c.user_id, u.business_name
    FROM public.scheduled_emails se
    JOIN public.customers c ON se.customer_id = c.id
    JOIN public.users u ON c.user_id = u.id
    WHERE se.status = 'scheduled'
    AND se.scheduled_for <= NOW()
    AND se.attempts < 3
    ORDER BY se.scheduled_for ASC
    LIMIT 50
  LOOP
    -- Update attempts
    UPDATE public.scheduled_emails 
    SET attempts = attempts + 1
    WHERE id = email_record.id;
    
    -- Here you would trigger your email sending Edge Function
    -- For now, we'll just mark as ready for processing
    
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a view for analytics
CREATE OR REPLACE VIEW email_analytics AS
SELECT 
  DATE_TRUNC('day', sent_at) as date,
  email_type,
  provider,
  status,
  COUNT(*) as count
FROM public.email_logs
GROUP BY DATE_TRUNC('day', sent_at), email_type, provider, status
ORDER BY date DESC;

-- Grant permissions
GRANT SELECT ON email_analytics TO authenticated;

COMMENT ON TABLE public.email_logs IS 'Tracks all emails sent through the system';
COMMENT ON TABLE public.scheduled_emails IS 'Stores scheduled follow-up emails';
COMMENT ON FUNCTION process_scheduled_emails() IS 'Processes due scheduled emails - run via cron job';