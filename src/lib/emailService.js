import { supabase } from './supabase';
import { emailTemplates, generateReviewUrl, processTemplate } from './emailTemplates';

// Email service abstraction for different providers
export class EmailService {
  constructor() {
    this.sendGridApiKey = import.meta.env.VITE_SENDGRID_API_KEY;
    this.provider = this.sendGridApiKey ? 'sendgrid' : 'supabase';
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      if (this.provider === 'sendgrid') {
        return await this.sendWithSendGrid({ to, subject, html, text });
      } else {
        return await this.sendWithSupabase({ to, subject, html, text });
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendWithSendGrid({ to, subject, html, text }) {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.sendGridApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }]
        }],
        from: { 
          email: 'noreply@myhappycustomers.com', 
          name: 'MyHappyCustomers' 
        },
        subject,
        content: [
          { type: 'text/html', value: html },
          { type: 'text/plain', value: text }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SendGrid error: ${error}`);
    }

    return { success: true, provider: 'sendgrid' };
  }

  async sendWithSupabase({ to, subject, html, text }) {
    // Use Supabase Edge Functions for email sending
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, html, text }
    });

    if (error) {
      throw new Error(`Supabase Functions error: ${error.message}`);
    }

    return { success: true, provider: 'supabase', data };
  }
}

// Review request automation
export class ReviewRequestService {
  constructor() {
    this.emailService = new EmailService();
  }

  async sendReviewRequest(customerId, userId, type = 'initial') {
    try {
      // Get customer and user details
      const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!customer || !user) {
        throw new Error('Customer or user not found');
      }

      // Generate review URL
      const reviewUrl = generateReviewUrl(
        customerId,
        customer.name,
        user.business_name || 'Our Business'
      );

      // Select appropriate template
      let template;
      switch (type) {
        case 'followup1':
          template = emailTemplates.followUp1;
          break;
        case 'followup2':
          template = emailTemplates.followUp2;
          break;
        default:
          template = emailTemplates.reviewRequest;
      }

      // Process template variables
      const variables = {
        customerName: customer.name,
        businessName: user.business_name || 'Our Business',
        reviewUrl
      };

      const subject = processTemplate(template.subject, variables);
      const html = template.getHtml(variables);
      const text = template.getText(variables);

      // Send email
      const result = await this.emailService.sendEmail({
        to: customer.email,
        subject,
        html,
        text
      });

      // Log email sent (for tracking and debugging)
      await this.logEmailSent(customerId, type, customer.email, result);

      return result;
    } catch (error) {
      console.error(`Failed to send ${type} review request:`, error);
      throw error;
    }
  }

  async logEmailSent(customerId, type, email, result) {
    try {
      const { error } = await supabase
        .from('email_logs')
        .insert([{
          customer_id: customerId,
          email_type: type,
          recipient_email: email,
          provider: result.provider,
          status: result.success ? 'sent' : 'failed',
          sent_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Failed to log email:', error);
      }
    } catch (error) {
      console.error('Email logging error:', error);
    }
  }

  async scheduleFollowUps(customerId, userId) {
    try {
      // Schedule follow-up emails using Supabase Edge Functions or cron jobs
      const { error } = await supabase.functions.invoke('schedule-follow-ups', {
        body: { customerId, userId }
      });

      if (error) {
        console.error('Failed to schedule follow-ups:', error);
        // Fallback: create database records for manual processing
        await this.createFollowUpRecords(customerId);
      }
    } catch (error) {
      console.error('Follow-up scheduling error:', error);
      // Fallback: create database records for manual processing
      await this.createFollowUpRecords(customerId);
    }
  }

  async createFollowUpRecords(customerId) {
    const followUps = [
      {
        customer_id: customerId,
        scheduled_for: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
        email_type: 'followup1',
        status: 'scheduled'
      },
      {
        customer_id: customerId,
        scheduled_for: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
        email_type: 'followup2',
        status: 'scheduled'
      }
    ];

    const { error } = await supabase
      .from('scheduled_emails')
      .insert(followUps);

    if (error) {
      console.error('Failed to create follow-up records:', error);
    }
  }
}

// Automated review request workflow
export const automateReviewRequest = async (customerData, userId) => {
  try {
    const reviewService = new ReviewRequestService();

    // Send initial review request
    await reviewService.sendReviewRequest(customerData.id, userId, 'initial');

    // Schedule follow-up emails
    await reviewService.scheduleFollowUps(customerData.id, userId);

    // Update review request status
    const { error } = await supabase
      .from('review_requests')
      .update({ 
        sent_at: new Date().toISOString(),
        status: 'sent',
        follow_ups_scheduled: true
      })
      .eq('customer_id', customerData.id);

    if (error) {
      console.error('Failed to update review request status:', error);
    }

    return { success: true, message: 'Review request sent and follow-ups scheduled' };
  } catch (error) {
    console.error('Automated review request failed:', error);
    throw error;
  }
};

export default ReviewRequestService;