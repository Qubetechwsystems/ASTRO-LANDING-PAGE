/**
 * Vedic Palmistry & Astrology Landing Page Application
 * Dynamic Razorpay AutoPay (Unlimited Users) & Meta Pixel Integration
 */

// ================= GLOBAL CONFIGURATION =================
const APP_CONFIG = {
  // आपकी नई सक्रिय Razorpay Key ID
  RAZORPAY_KEY_ID: "rzp_live_ToVknbUG7BuLYL",

  // जब आप तैयार हों, यहाँ अपनी Meta Pixel ID डालें
  META_PIXEL_ID: "YOUR_META_PIXEL_ID", 

  // मूल्य विवरण
  TRIAL_AMOUNT: 1.00,        // ₹1 ट्रायल
  RECURRING_AMOUNT: 599.00,  // ₹599 प्रति दो माह
  CURRENCY: "INR",
  BUSINESS_NAME: "वैदिक हस्तरेखा एवं ज्योतिष केंद्र",
  WHATSAPP_SUPPORT_NUMBER: "919876543210"
};

// ================= META PIXEL HELPER =================
function initMetaPixel() {
  if (APP_CONFIG.META_PIXEL_ID && APP_CONFIG.META_PIXEL_ID !== "YOUR_META_PIXEL_ID") {
    try {
      if (typeof window.fbq === 'function') {
        window.fbq('init', APP_CONFIG.META_PIXEL_ID);
        window.fbq('track', 'PageView');
        console.log("✅ [Meta Pixel] PageView Event fired successfully.");
      }
    } catch (err) {
      console.warn("⚠️ [Meta Pixel] Init Error:", err);
    }
  } else {
    console.info("ℹ️ [Meta Pixel] Ready for Live Pixel ID.");
  }
}

function trackMetaEvent(eventName, params = {}) {
  console.log(`📡 [Meta Pixel Event]: ${eventName}`, params);
  if (typeof window.fbq === 'function' && APP_CONFIG.META_PIXEL_ID !== "YOUR_META_PIXEL_ID") {
    try {
      window.fbq('track', eventName, params);
    } catch (e) {
      console.warn(`Error tracking ${eventName}:`, e);
    }
  }
}

// ================= COUNTDOWN TIMER =================
function startCountdown() {
  const timerElement = document.getElementById("countdownTimer");
  if (!timerElement) return;

  let totalSeconds = 14 * 60 + 59; // 14:59

  setInterval(() => {
    if (totalSeconds <= 0) {
      totalSeconds = 15 * 60;
    }
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
    
    // Meta Pixel: InitiateCheckout
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

// ================= FORM SUBMISSION & DYNAMIC AUTOPAY =================
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

  const payBtn = document.getElementById("payBtn");
  if (payBtn) {
    payBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> सुरक्षित ऑटो-पे तैयार हो रहा है...';
    payBtn.disabled = true;
  }

  // Meta Pixel Event
  trackMetaEvent('InitiateCheckout', {
    value: APP_CONFIG.TRIAL_AMOUNT,
    currency: APP_CONFIG.CURRENCY,
    content_name: '₹1 Palmistry & Kundali AutoPay Trial',
    customer_phone: phone,
    customer_name: name
  });

  // ग्राहक डेटा सुरक्षित करें
  try {
    localStorage.setItem("astro_lead", JSON.stringify({
      name, phone, service, dob, time, place, problem,
      timestamp: new Date().toISOString()
    }));
  } catch (e) {}

  try {
    // बैकएंड API से इस ग्राहक के लिए बिल्कुल फ्रेश और यूनिक ऑटो-पे लिंक बनाएं
    const response = await fetch('/api/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name, phone, service, dob, time, place, problem
      })
    });

    const data = await response.json();

    if (data.success && data.short_url) {
      console.log("✅ Fresh Unique AutoPay Created:", data.subscription_id);
      // ग्राहक को तुरंत उसके व्यक्तिगत ऑटो-पे पेज पर रीडायरेक्ट करें (0% डोमेन एरर)
      window.location.href = data.short_url;
    } else {
      throw new Error(data.error || "ऑटो-पे बनाने में समस्या आई।");
    }

  } catch (err) {
    console.error("AutoPay Error:", err);
    alert("त्रुटि: " + err.message + "\nकृपया पुनः प्रयास करें।");
    if (payBtn) {
      payBtn.innerHTML = '<i class="fa-solid fa-shield-check"></i> <span>सुरक्षित भुगतान करें — ₹1</span>';
      payBtn.disabled = false;
    }
  }
}

// ================= DOM INITIALIZATION =================
document.addEventListener("DOMContentLoaded", () => {
  initMetaPixel();
  startCountdown();
  console.log("🌟 [Vedic Astrology Page] Dynamic Unlimited AutoPay System Ready.");
});
