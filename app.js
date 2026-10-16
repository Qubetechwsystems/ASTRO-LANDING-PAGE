/**
 * Vedic Palmistry & Astrology Landing Page Application
 * Dynamic Razorpay AutoPay with Direct WhatsApp Auto-Redirection
 */

// ================= GLOBAL CONFIGURATION =================
const APP_CONFIG = {
  // आपकी सक्रिय Razorpay Key ID
  RAZORPAY_KEY_ID: "rzp_live_ToVknbUG7BuLYL",

  // आपकी Meta Pixel ID
  META_PIXEL_ID: "2242280556724298", 

  // मूल्य विवरण
  TRIAL_AMOUNT: 1.00,        // ₹1 ट्रायल
  RECURRING_AMOUNT: 599.00,  // ₹599 प्रति दो माह
  CURRENCY: "INR",
  BUSINESS_NAME: "वैदिक हस्तरेखा एवं ज्योतिष केंद्र",
  WHATSAPP_SUPPORT_NUMBER: "919116497140"
};

// ================= META PIXEL HELPER =================
function initMetaPixel() {
  if (APP_CONFIG.META_PIXEL_ID && APP_CONFIG.META_PIXEL_ID !== "YOUR_META_PIXEL_ID") {
    try {
      if (typeof window.fbq === 'function') {
        window.fbq('init', APP_CONFIG.META_PIXEL_ID);
        window.fbq('track', 'PageView');
        console.log("✅ [Meta Pixel] PageView Event active.");
      }
    } catch (err) {}
  }
}

function trackMetaEvent(eventName, params = {}, options = {}) {
  console.log(`📡 [Meta Pixel Event]: ${eventName}`, params);
  if (typeof window.fbq === 'function' && APP_CONFIG.META_PIXEL_ID !== "YOUR_META_PIXEL_ID") {
    try {
      window.fbq('track', eventName, params, options);
    } catch (e) {}
  }
}

// ================= COUNTDOWN TIMER =================
function startCountdown() {
  const timerElement = document.getElementById("countdownTimer");
  if (!timerElement) return;

  let totalSeconds = 14 * 60 + 59;
  setInterval(() => {
    if (totalSeconds <= 0) totalSeconds = 15 * 60;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    totalSeconds--;
  }, 1000);
}

// ================= FAQ ACCORDION =================
function toggleFaq(index) {
  const answer = document.getElementById(`faq-ans-${index}`);
  const icon = document.getElementById(`faq-icon-${index}`);
  if (!answer) return;
  const isHidden = answer.classList.contains("hidden");
  
  for (let i = 1; i <= 4; i++) {
    const a = document.getElementById(`faq-ans-${i}`);
    const ic = document.getElementById(`faq-icon-${i}`);
    if (a) a.classList.add("hidden");
    if (ic) ic.classList.remove("rotate-180");
  }

  if (isHidden) {
    answer.classList.remove("hidden");
    if (icon) icon.classList.add("rotate-180");
  }
}

// ================= BOOKING MODAL CONTROL =================
function openBookingModal() {
  const modal = document.getElementById("bookingModal");
  if (modal) {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    trackMetaEvent('InitiateCheckout', {
      value: APP_CONFIG.TRIAL_AMOUNT,
      currency: APP_CONFIG.CURRENCY,
      content_name: '₹1 Palmistry & Kundali AutoPay Trial'
    });
  }
}

function closeBookingModal() {
  const modal = document.getElementById("bookingModal");
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = "auto";
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeBookingModal();
});

// ================= FORM SUBMISSION, AUTOPAY & WHATSAPP REDIRECT =================
async function handleFormSubmit(event) {
  event.preventDefault();

  const name = document.getElementById("custName")?.value.trim() || "";
  const phone = document.getElementById("custPhone")?.value.trim() || "";
  const service = document.getElementById("custService")?.value || "both";
  const dob = document.getElementById("custDob")?.value || "";
  const time = document.getElementById("custTime")?.value || "";
  const place = document.getElementById("custPlace")?.value.trim() || "";
  const problem = document.getElementById("custProblem")?.value || "";

  if (!name || !phone || !dob || !place) {
    alert("कृपया सभी आवश्यक फ़ील्ड्स सही से भरें।");
    return;
  }

  // स्थानीय स्टोरेज में विवरण सुरक्षित करें ताकि WhatsApp व थैंक-यू पेज पर ऑटो-फिल हो सके
  try {
    localStorage.setItem('astro_lead', JSON.stringify({ name, phone, service, dob, time, place, problem }));
  } catch (e) {}

  const payBtn = document.getElementById("payBtn");
  if (payBtn) {
    payBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> सुरक्षित ऑटो-पे तैयार हो रहा है...';
    payBtn.disabled = true;
  }

  trackMetaEvent('InitiateCheckout', {
    value: APP_CONFIG.TRIAL_AMOUNT,
    currency: APP_CONFIG.CURRENCY,
    content_name: '₹1 Palmistry & Kundali AutoPay Trial',
    customer_phone: phone,
    customer_name: name
  });

  try {
    const response = await fetch('/api/create-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, service, dob, time, place, problem })
    });

    const data = await response.json();

    if (data.success && data.subscription_id) {
      console.log("✅ AutoPay Subscription Generated:", data.subscription_id);

      // Razorpay चेकआउट विकल्प (In-page Checkout Popup)
      const options = {
        key: APP_CONFIG.RAZORPAY_KEY_ID,
        subscription_id: data.subscription_id,
        name: APP_CONFIG.BUSINESS_NAME,
        description: "₹1 ट्रायल: हस्तरेखा एवं कुंडली विश्लेषण",
        image: "https://cdn-icons-png.flaticon.com/512/3663/3663335.png",
        prefill: {
          name: name,
          contact: phone
        },
        theme: {
          color: "#F59E0B"
        },
        handler: function (resp) {
          console.log("✅ Payment Successful! Firing Purchase & Redirecting to WhatsApp...");
          const paymentId = resp.razorpay_payment_id || resp.razorpay_subscription_id || ('PAY_' + Date.now());
          
          // Meta Pixel: Purchase Event Fire
          trackMetaEvent('Purchase', {
            value: APP_CONFIG.TRIAL_AMOUNT,
            currency: APP_CONFIG.CURRENCY,
            content_name: '₹1 Palmistry & Kundali Trial'
          }, { eventID: paymentId });

          // सीधे thank-you.html पर रीडायरेक्ट (जहाँ से 2 सेकंड में WhatsApp ऑटो-खुलता है)
          window.location.href = `https://astro-landing-page-gold.vercel.app/thank-you.html?razorpay_payment_id=${paymentId}&phone=${encodeURIComponent(phone)}&name=${encodeURIComponent(name)}`;
        },
        modal: {
          ondismiss: function () {
            if (payBtn) {
              payBtn.disabled = false;
              payBtn.innerHTML = '<i class="fa-solid fa-shield-check"></i> <span>सुरक्षित भुगतान करें — ₹1</span>';
            }
          }
        }
      };

      try {
        if (typeof window.Razorpay === 'function') {
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (pErr) {
            console.warn("Payment notice:", pErr);
            if (payBtn) {
              payBtn.disabled = false;
              payBtn.innerHTML = '<i class="fa-solid fa-shield-check"></i> <span>पुनः प्रयास करें — ₹1</span>';
            }
          });
          rzp.open();
        } else if (data.short_url) {
          window.location.href = data.short_url;
        }
      } catch (e) {
        if (data.short_url) {
          window.location.href = data.short_url;
        }
      }

    } else {
      throw new Error(data.error || "ऑटो-पे लिंक नहीं बन सका।");
    }
  } catch (err) {
    console.error("AutoPay Error:", err);
    alert("सूचना: " + err.message + "\nकृपया पुनः प्रयास करें।");
    if (payBtn) {
      payBtn.innerHTML = '<i class="fa-solid fa-shield-check"></i> <span>सुरक्षित भुगतान करें — ₹1</span>';
      payBtn.disabled = false;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initMetaPixel();
  startCountdown();
});
