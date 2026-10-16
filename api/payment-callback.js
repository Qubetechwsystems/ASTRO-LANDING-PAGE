// api/payment-callback.js - Handles Razorpay Subscription post-payment redirect
import crypto from 'crypto';

export default async function handler(req, res) {
  let body = req.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      try {
        const params = new URLSearchParams(body);
        body = Object.fromEntries(params);
      } catch (e2) {
        body = {};
      }
    }
  }

  const payment_id = body.razorpay_payment_id || req.query?.razorpay_payment_id || '';
  const subscription_id = body.razorpay_subscription_id || req.query?.razorpay_subscription_id || '';

  const meta_token = 'EAAQFaOjysW8BSnT2Lwf8nDhrDKmWcExxN0DIr2FHwGvBw8H4ZAvmPl7Pq5ZA9liceupcq5xmwZA1q9D3ZBmSEQfAcT4jp2fuivdAubRoIrZAw7QXSfZBtrIx27DZCvg7ipsn5kk6e05BZAhtisWBvn4w2qJTuoaRy3sBx7awN64O4wRnUd1xREZBcGBTdTStoTcnliAZDZD';
  const pixel_id = '2242280556724298';

  let customerPhone = '';
  let customerName = '';

  if (payment_id) {
    try {
      const key_id = 'rzp_live_ToVknbUG7BuLYL';
      const key_secret = 'V6LdP62mu5HhJdShEWkvbt40';
      const auth = Buffer.from(`${key_id}:${key_secret}`).toString('base64');
      const rzpRes = await fetch(`https://api.razorpay.com/v1/payments/${payment_id}`, {
        headers: { 'Authorization': `Basic ${auth}` }
      });
      const pData = await rzpRes.json();
      if (pData && pData.contact) {
        customerPhone = pData.contact.replace(/[^0-9]/g, '').slice(-10);
      }
      if (pData && pData.notes && pData.notes.customer_name) {
        customerName = pData.notes.customer_name;
      }
    } catch (e) {
      console.warn('Razorpay payment fetch error:', e);
    }

    try {
      const hash = (v) => v ? crypto.createHash('sha256').update(v.trim().toLowerCase()).digest('hex') : '';
      const capiEvent = {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_id: payment_id,
        event_source_url: 'https://astro-landing-page-gold.vercel.app',
        user_data: {
          ph: customerPhone ? [hash(`91${customerPhone}`)] : []
        },
        custom_data: {
          currency: 'INR',
          value: 1.00,
          content_name: '₹1 Palmistry & Kundali Consultation'
        }
      };

      await fetch(`https://graph.facebook.com/v20.0/${pixel_id}/events?access_token=${meta_token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [capiEvent] })
      });
    } catch (capiErr) {
      console.warn('Meta CAPI error:', capiErr);
    }
  }

  const redirectUrl = `https://astro-landing-page-gold.vercel.app/thank-you.html?razorpay_payment_id=${payment_id}&phone=${customerPhone}&name=${encodeURIComponent(customerName)}`;
  res.writeHead(302, { Location: redirectUrl });
  res.end();
}
