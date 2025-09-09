import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string
  subject: string
  html: string
  text: string
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
    const emailRequest: EmailRequest = await req.json()
    const { to, subject, html, text } = emailRequest

    // Validate required fields
    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, html' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Try SendGrid first if API key is available
    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY')
    
    if (sendGridApiKey) {
      console.log('Sending email via SendGrid to:', to)
      const result = await sendEmailWithSendGrid(sendGridApiKey, { to, subject, html, text })
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          provider: 'sendgrid',
          messageId: result.messageId 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fallback to logging (for development/testing)
    console.log('=== EMAIL SIMULATION ===')
    console.log('To:', to)
    console.log('Subject:', subject)
    console.log('Text:', text)
    console.log('========================')

    return new Response(
      JSON.stringify({ 
        success: true, 
        provider: 'simulation',
        message: 'Email simulated (no provider configured)' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Email sending error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function sendEmailWithSendGrid(apiKey: string, emailData: EmailRequest) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: emailData.to }],
        subject: emailData.subject
      }],
      from: { 
        email: 'noreply@myhappycustomers.com', 
        name: 'MyHappyCustomers' 
      },
      content: [
        { type: 'text/html', value: emailData.html },
        { type: 'text/plain', value: emailData.text }
      ],
      tracking_settings: {
        click_tracking: { enable: true },
        open_tracking: { enable: true }
      }
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SendGrid API error: ${response.status} - ${error}`)
  }

  // SendGrid returns 202 for success but no body
  return { 
    messageId: response.headers.get('x-message-id') || 'unknown',
    status: response.status 
  }
}