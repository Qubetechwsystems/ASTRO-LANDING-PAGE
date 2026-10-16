// api/razorpay-webhook.js - Webhook from Razorpay directly to Meta Conversions API
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).send('OK');

  try {
    let event = req.body;
    if (typeof event === 'string') {
      try {
        event = JSON.parse(event);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON' });
      }
    }

    const eventType = event.event || '';
    console.log('Received Razorpay Webhook Event:', eventType);

    if (eventType === 'payment.captured' || eventType === 'subscription.authenticated' || eventType === 'subscription.charged') {
      const payment = event.payload?.payment?.entity || {};
      const payment_id = payment.id || ('pay_' + Date.now());
      const contact = payment.contact || '';
      const cleanPhone = contact.replace(/[^0-9]/g, '').slice(-10);

      const meta_token = 'EAAQFaOjysW8BSnT2Lwf8nDhrDKmWcExxN0DIr2FHwGvBw8H4ZAvmPl7Pq5ZA9liceupcq5xmwZA1q9D3ZBmSEQfAcT4jp2fuivdAubRoIrZAw7QXSfZBtrIx27DZCvg7ipsn5kk6e05BZAhtisWBvn4w2qJTuoaRy3sBx7awN64O4wRnUd1xREZBcGBTdTStoTcnliAZDZD';
      const pixel_id = '2242280556724298';

      const hash = (v) => v ? crypto.createHash('sha256').update(v.trim().toLowerCase()).digest('hex') : '';
      const capiEvent = {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_id: payment_id,
        event_source_url: 'https://astro-landing-page-gold.vercel.app',
        user_data: {
          ph: cleanPhone ? [hash(`91${cleanPhone}`)] : []
        },
        custom_data: {
          currency: 'INR',
          value: 1.00,
          content_name: '₹1 Palmistry & Kundali Consultation'
        }
      };

      const fbRes = await fetch(`https://graph.facebook.com/v20.0/${pixel_id}/events?access_token=${meta_token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [capiEvent] })
      });
      const fbData = await fbRes.json();
      console.log('Meta CAPI response from webhook:', fbData);
    }

    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(200).json({ status: 'error', message: err.message });
  }
}
