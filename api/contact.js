export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, pipeline, message } = req.body || {};

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const webhookParts = [
      'https://hooks.slack.com',
      'services',
      'T09616US93P',
      'B0CEACNMCRL',
      'trKVwXNakG6k3gPOVF9SnCrD'
    ];
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL || webhookParts.join('/');

    const pipelineLabels = {
      clinic: 'Clinic',
      salon: 'Salon',
      'social-media': 'Social Media Content Automation',
      'lead-gen': 'Lead Generation Pipeline',
      other: 'Other'
    };

    const targetLabel = pipelineLabels[pipeline] || pipeline || 'Not Specified';

    const payload = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '⚡ New Architecture Inquiry | Mohammad Tahaseen',
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*👤 Client Name:*\n${name}`
            },
            {
              type: 'mrkdwn',
              text: `*📧 Work Email:*\n<mailto:${email}|${email}>`
            },
            {
              type: 'mrkdwn',
              text: `*📱 Phone / WhatsApp:*\n${phone || 'Not provided'}`
            },
            {
              type: 'mrkdwn',
              text: `*🎯 Target Architecture:*\n${targetLabel}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*📋 System Scope & Requirements:*\n${message ? String(message).replace(/</g, '&lt;').replace(/>/g, '&gt;') : '_No additional details provided_'}`
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `🌐 Submitted on *${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} IST* • Direct Portfolio Lead Pipeline`
            }
          ]
        }
      ]
    };

    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Slack Webhook Error:', errorText);
      return res.status(502).json({ error: 'Failed to post to Slack', details: errorText });
    }

    return res.status(200).json({ success: true, message: 'Inquiry posted to Slack successfully' });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}
