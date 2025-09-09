import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScheduleRequest {
  customerId: string
  userId: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get request body
    const scheduleRequest: ScheduleRequest = await req.json()
    const { customerId, userId } = scheduleRequest

    // Validate required fields
    if (!customerId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: customerId, userId' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Calculate follow-up dates
    const now = new Date()
    const followUp1Date = new Date(now.getTime() + (5 * 24 * 60 * 60 * 1000)) // 5 days
    const followUp2Date = new Date(now.getTime() + (10 * 24 * 60 * 60 * 1000)) // 10 days

    // Create scheduled email records
    const scheduledEmails = [
      {
        customer_id: customerId,
        email_type: 'followup1',
        scheduled_for: followUp1Date.toISOString(),
        status: 'scheduled'
      },
      {
        customer_id: customerId,
        email_type: 'followup2',
        scheduled_for: followUp2Date.toISOString(),
        status: 'scheduled'
      }
    ]

    // Insert scheduled emails
    const { data, error } = await supabase
      .from('scheduled_emails')
      .insert(scheduledEmails)
      .select()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to schedule follow-ups', details: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Scheduled ${data.length} follow-up emails for customer ${customerId}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        scheduledEmails: data,
        message: `Scheduled ${data.length} follow-up emails`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Follow-up scheduling error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to schedule follow-ups', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})