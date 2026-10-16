// api/create-subscription.js - Dynamic Razorpay AutoPay & Invoice Generator
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

    // 1. स्वच्छ फोन नंबर व ईमेल
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
    const validContact = cleanPhone ? `91${cleanPhone}` : '919116497140';
    const validEmail = `astro_${cleanPhone || Date.now()}@divyaastro.com`;

    // 2. ग्राहक (Customer) बनाएं या मौजूद ग्राहक का ID खोजें
    let customer_id = null;
    try {
      const custRes = await fetch('https://api.razorpay.com/v1/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name || 'Astro Seeker',
          contact: validContact,
          email: validEmail
        })
      });
      const custData = await custRes.json();
      if (custData && custData.id) {
        customer_id = custData.id;
      } else {
        // यदि ग्राहक पहले से मौजूद हो, तो उसे खोजें
        const searchRes = await fetch(`https://api.razorpay.com/v1/customers?contact=${validContact}`, {
          headers: { 'Authorization': `Basic ${auth}` }
        });
        const searchData = await searchRes.json();
        if (searchData.items && searchData.items.length > 0) {
          customer_id = searchData.items[0].id;
        }
      }
    } catch (e) {
      console.warn('Customer lookup warning:', e);
    }

    // 3. ₹1 ट्रायल + ₹599 द्विमासिक ऑटो-पे सब्सक्रिप्शन पेलोड
    const payload = {
      plan_id: 'plan_ToVm7z1bnK1M1j', // ₹599 / 2 माह प्लान
      total_count: 60,
      quantity: 1,
      customer_notify: 1,
      addons: [
        {
          item: {
            name: '₹1 प्रारंभिक ट्रायल टोकन',
            amount: 100, // ₹1 = 100 पैसे
            currency: 'INR'
          }
        }
      ],
      notes: {
        customer_name: name || '',
        customer_phone: cleanPhone || '',
        service_type: service || 'both',
        dob: dob || '',
        place: place || ''
      }
    };

    if (customer_id) {
      payload.customer_id = customer_id;
    }

    // 4. Razorpay Subscriptions API कॉल
    const response = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Razorpay Subscription Error:', data);
      return res.status(response.status).json({ error: data.error?.description || 'AutoPay generation failed' });
    }

    // 5. ₹1 ट्रायल इनवॉइस का सक्रिय वर्किंग लिंक प्राप्त करें
    let activeInvoiceUrl = null;
    try {
      const invRes = await fetch(`https://api.razorpay.com/v1/invoices?subscription_id=${data.id}`, {
        headers: { 'Authorization': `Basic ${auth}` }
      });
      const invData = await invRes.json();
      if (invData.items && invData.items.length > 0) {
        activeInvoiceUrl = invData.items[0].short_url;
      }
    } catch (invErr) {
      console.warn('Invoice fetch notice:', invErr);
    }

    return res.status(200).json({
      success: true,
      subscription_id: data.id,
      short_url: activeInvoiceUrl || data.short_url,
      customer_id: customer_id
    });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
