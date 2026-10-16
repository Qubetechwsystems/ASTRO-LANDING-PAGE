// api/create-subscription.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { name, phone, service, problem, place, dob, time } = body;

    const key_id = 'rzp_live_ToVknbUG7BuLYL';
    const key_secret = 'V6LdP62mu5HhJdShEWkvbt40';
    const auth = Buffer.from(`${key_id}:${key_secret}`).toString('base64');
    const start_at = Math.floor(Date.now() / 1000) + 86400;

    const payload = {
      plan_id: 'plan_ToVm7z1bnK1M1j',
      total_count: 60,
      quantity: 1,
      start_at: start_at,
      customer_notify: 1,
      addons: [{ item: { name: '₹1 प्रारंभिक ट्रायल टोकन', amount: 100, currency: 'INR' } }],
      notes: { customer_name: name || 'Customer', customer_phone: phone || '', service_type: service || 'both' }
    };

    const response = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.description || 'Error' });

    return res.status(200).json({ success: true, subscription_id: data.id, short_url: data.short_url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
