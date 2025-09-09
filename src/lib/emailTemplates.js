// Email templates for review requests and follow-ups
export const emailTemplates = {
  reviewRequest: {
    subject: "How was your experience with {businessName}?",
    getHtml: ({ customerName, businessName, reviewUrl }) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Review Request</title>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: white; padding: 30px; border: 1px solid #e1e5e9; border-top: none; }
              .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
              .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; border-radius: 0 0 10px 10px; }
              .stars { font-size: 24px; color: #ffc107; margin: 15px 0; }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>How was your experience?</h1>
              <div class="stars">⭐⭐⭐⭐⭐</div>
          </div>
          <div class="content">
              <p>Hi ${customerName},</p>
              <p>Thank you for choosing <strong>${businessName}</strong>! We hope you had an excellent experience with our service.</p>
              <p>Your feedback is incredibly valuable to us and helps other customers make informed decisions. Would you mind taking just 2 minutes to share your experience?</p>
              <div style="text-align: center;">
                  <a href="${reviewUrl}" class="cta-button">Leave Your Review</a>
              </div>
              <p>If you had any issues or concerns, please don't hesitate to reach out to us directly. We're always here to help!</p>
              <p>Thank you for your time!</p>
              <p>Best regards,<br>The ${businessName} Team</p>
          </div>
          <div class="footer">
              <p>This email was sent because you recently used our services. If you believe this was sent in error, please ignore this message.</p>
          </div>
      </body>
      </html>
    `,
    getText: ({ customerName, businessName, reviewUrl }) => `
      Hi ${customerName},

      Thank you for choosing ${businessName}! We hope you had an excellent experience with our service.

      Your feedback is incredibly valuable to us and helps other customers make informed decisions. Would you mind taking just 2 minutes to share your experience?

      Leave your review here: ${reviewUrl}

      If you had any issues or concerns, please don't hesitate to reach out to us directly. We're always here to help!

      Thank you for your time!

      Best regards,
      The ${businessName} Team
    `
  },

  followUp1: {
    subject: "Quick follow-up: Your feedback matters to {businessName}",
    getHtml: ({ customerName, businessName, reviewUrl }) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Follow-up Review Request</title>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: white; padding: 25px; border: 1px solid #e1e5e9; border-top: none; }
              .cta-button { display: inline-block; background: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 15px 0; }
              .footer { background: #f8f9fa; padding: 15px; text-align: center; color: #6c757d; font-size: 14px; border-radius: 0 0 10px 10px; }
          </style>
      </head>
      <body>
          <div class="header">
              <h2>Just a friendly reminder</h2>
              <p>Your opinion matters to us</p>
          </div>
          <div class="content">
              <p>Hi ${customerName},</p>
              <p>We sent you a review request a few days ago and wanted to follow up in case you missed it.</p>
              <p>Your feedback about your experience with <strong>${businessName}</strong> would mean the world to us and takes less than 2 minutes.</p>
              <div style="text-align: center;">
                  <a href="${reviewUrl}" class="cta-button">Share Your Experience</a>
              </div>
              <p>If you've already left a review, thank you so much! If not, we'd be grateful for just a moment of your time.</p>
              <p>Warm regards,<br>The ${businessName} Team</p>
          </div>
          <div class="footer">
              <p>This is a follow-up to our previous message. You can safely ignore this if you've already provided feedback.</p>
          </div>
      </body>
      </html>
    `,
    getText: ({ customerName, businessName, reviewUrl }) => `
      Hi ${customerName},

      We sent you a review request a few days ago and wanted to follow up in case you missed it.

      Your feedback about your experience with ${businessName} would mean the world to us and takes less than 2 minutes.

      Share your experience: ${reviewUrl}

      If you've already left a review, thank you so much! If not, we'd be grateful for just a moment of your time.

      Warm regards,
      The ${businessName} Team
    `
  },

  followUp2: {
    subject: "Final request: Help others discover {businessName}",
    getHtml: ({ customerName, businessName, reviewUrl }) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Final Review Request</title>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #fd7e14 0%, #e83e8c 100%); color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: white; padding: 25px; border: 1px solid #e1e5e9; border-top: none; }
              .cta-button { display: inline-block; background: #fd7e14; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 15px 0; }
              .footer { background: #f8f9fa; padding: 15px; text-align: center; color: #6c757d; font-size: 14px; border-radius: 0 0 10px 10px; }
          </style>
      </head>
      <body>
          <div class="header">
              <h2>One last request</h2>
              <p>Help others discover great service</p>
          </div>
          <div class="content">
              <p>Hi ${customerName},</p>
              <p>This is our final request for your feedback about your experience with <strong>${businessName}</strong>.</p>
              <p>We understand you're busy, but your review helps other customers choose services with confidence. It truly makes a difference!</p>
              <div style="text-align: center;">
                  <a href="${reviewUrl}" class="cta-button">Leave Quick Review</a>
              </div>
              <p>If you prefer not to receive these messages, we completely understand. This will be our last reminder.</p>
              <p>Thank you for considering it!</p>
              <p>Best wishes,<br>The ${businessName} Team</p>
          </div>
          <div class="footer">
              <p>This is our final follow-up message. No more reminders will be sent after this.</p>
          </div>
      </body>
      </html>
    `,
    getText: ({ customerName, businessName, reviewUrl }) => `
      Hi ${customerName},

      This is our final request for your feedback about your experience with ${businessName}.

      We understand you're busy, but your review helps other customers choose services with confidence. It truly makes a difference!

      Leave a quick review: ${reviewUrl}

      If you prefer not to receive these messages, we completely understand. This will be our last reminder.

      Thank you for considering it!

      Best wishes,
      The ${businessName} Team
    `
  }
};

// Helper function to generate review URL
export const generateReviewUrl = (customerId, customerName, businessName) => {
  const baseUrl = window.location.origin;
  const params = new URLSearchParams({
    name: customerName,
    business: businessName
  });
  return `${baseUrl}/review/${customerId}?${params.toString()}`;
};

// Helper function to replace template variables
export const processTemplate = (template, variables) => {
  let processed = template;
  Object.keys(variables).forEach(key => {
    const placeholder = `{${key}}`;
    processed = processed.replace(new RegExp(placeholder, 'g'), variables[key]);
  });
  return processed;
};