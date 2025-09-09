import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Email templates (simplified versions)
const emailTemplates = {
  followup1: {
    subject: "Quick follow-up: Your feedback matters to {businessName}",
    getHtml: (variables: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
          <h2>Just a friendly reminder</h2>
          <p>Your opinion matters to us</p>
        </div>
        <div style="background: white; padding: 25px; border: 1px solid #e1e5e9; border-top: none;">
          <p>Hi ${variables.customerName},</p>
          <p>We sent you a review request a few days ago and wanted to follow up in case you missed it.</p>
          <p>Your feedback about your experience with <strong>${variables.businessName}</strong> would mean the world to us and takes less than 2 minutes.</p>
          <div style="text-align: center;">
            <a href="${variables.reviewUrl}" style="display: inline-block; background: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 15px 0;">Share Your Experience</a>
          </div>
          <p>If you've already left a review, thank you so much! If not, we'd be grateful for just a moment of your time.</p>
          <p>Warm regards,<br>The ${variables.businessName} Team</p>
        </div>
      </div>
    `
  },
  followup2: {
    subject: "Final request: Help others discover {businessName}",
    getHtml: (variables: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #fd7e14 0%, #e83e8c 100%); color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
          <h2>One last request</h2>
          <p>Help others discover great service</p>
        </div>
        <div style="background: white; padding: 25px; border: 1px solid #e1e5e9; border-top: none;">
          <p>Hi ${variables.customerName},</p>
          <p>This is our final request for your feedback about your experience with <strong>${variables.businessName}</strong>.</p>
          <p>We understand you're busy, but your review helps other customers choose services with confidence. It truly makes a difference!</p>
          <div style="text-align: center;">
            <a href="${variables.reviewUrl}" style="display: inline-block; background: #fd7e14; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 15px 0;">Leave Quick Review</a>
          </div>
          <p>If you prefer not to receive these messages, we completely understand. This will be our last reminder.</p>
          <p>Thank you for considering it!</p>
          <p>Best wishes,<br>The ${variables.businessName} Team</p>
        </div>
      </div>
    `
  }
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

    console.log('Processing scheduled emails...')

    // Get scheduled emails that are due
    const { data: scheduledEmails, error: fetchError } = await supabase
      .from('scheduled_emails')
      .select(`
        *,
        customers (
          id,
          name,
          email,
          user_id,
          users (
            business_name
          )
        )
      `)
      .eq('status', 'scheduled')
      .lte('scheduled_for', new Date().toISOString())
      .lt('attempts', 3)
      .limit(50)

    if (fetchError) {
      console.error('Failed to fetch scheduled emails:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch scheduled emails', details: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${scheduledEmails?.length || 0} emails to process`)

    let processedCount = 0
    let errorCount = 0

    // Process each scheduled email
    for (const scheduledEmail of scheduledEmails || []) {
      try {
        // Update attempts count
        await supabase
          .from('scheduled_emails')
          .update({ attempts: scheduledEmail.attempts + 1 })
          .eq('id', scheduledEmail.id)

        const customer = scheduledEmail.customers
        const businessName = customer.users?.business_name || 'Our Business'

        // Generate review URL
        const baseUrl = Deno.env.get('SITE_URL') || 'http://localhost:5173'
        const params = new URLSearchParams({
          name: customer.name,
          business: businessName
        })
        const reviewUrl = `${baseUrl}/review/${customer.id}?${params.toString()}`

        // Prepare template variables
        const variables = {
          customerName: customer.name,
          businessName,
          reviewUrl
        }

        // Get template
        const template = emailTemplates[scheduledEmail.email_type as keyof typeof emailTemplates]
        if (!template) {
          throw new Error(`Unknown email type: ${scheduledEmail.email_type}`)
        }

        const subject = template.subject.replace('{businessName}', businessName)
        const html = template.getHtml(variables)
        const text = `Hi ${variables.customerName},\n\nPlease visit ${reviewUrl} to leave your review.\n\nThank you!\n${businessName} Team`

        // Send email via send-email function
        const emailResponse = await supabase.functions.invoke('send-email', {
          body: {
            to: customer.email,
            subject,
            html,
            text
          }
        })

        if (emailResponse.error) {
          throw new Error(`Email sending failed: ${emailResponse.error.message}`)
        }

        // Mark as sent
        await supabase
          .from('scheduled_emails')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', scheduledEmail.id)

        // Log the email
        await supabase
          .from('email_logs')
          .insert([{
            customer_id: customer.id,
            email_type: scheduledEmail.email_type,
            recipient_email: customer.email,
            provider: emailResponse.data?.provider || 'unknown',
            status: 'sent',
            sent_at: new Date().toISOString()
          }])

        processedCount++
        console.log(`Sent ${scheduledEmail.email_type} to ${customer.email}`)

      } catch (emailError) {
        console.error(`Failed to process email ${scheduledEmail.id}:`, emailError)
        errorCount++

        // Mark as failed if max attempts reached
        if (scheduledEmail.attempts >= 2) {
          await supabase
            .from('scheduled_emails')
            .update({ status: 'failed' })
            .eq('id', scheduledEmail.id)

          // Log the failure
          await supabase
            .from('email_logs')
            .insert([{
              customer_id: scheduledEmail.customer_id,
              email_type: scheduledEmail.email_type,
              recipient_email: scheduledEmail.customers?.email || 'unknown',
              provider: 'system',
              status: 'failed',
              sent_at: new Date().toISOString(),
              error_message: emailError.message
            }])
        }
      }
    }

    console.log(`Processing complete: ${processedCount} sent, ${errorCount} errors`)

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: processedCount,
        errors: errorCount,
        total: scheduledEmails?.length || 0
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Scheduled email processing error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process scheduled emails', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})