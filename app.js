/**
 * Vedic Palmistry & Astrology Landing Page Application
 * Production Ready with Razorpay Live & Meta Pixel Architecture
 */

// ================= GLOBAL CONFIGURATION =================
const APP_CONFIG = {
  // आपकी Razorpay Live Key ID (सक्रिय मर्चेंट की)
  RAZORPAY_KEY_ID: "rzp_live_TmxdqEPmP29Kfb",

  // जब आप तैयार हों, यहाँ अपनी Meta Pixel ID डालें
  META_PIXEL_ID: "YOUR_META_PIXEL_ID", 

  // मूल्य विवरण
  TRIAL_AMOUNT: 1.00,        // ₹1 ट्रायल
  RECURRING_AMOUNT: 599.00,  // ₹599 द्विमासिक
  CURRENCY: "INR",
  BUSINESS_NAME: "वैदिक हस्तरेखा एवं ज्योतिष केंद्र",
  WHATSAPP_SUPPORT_NUMBER: "919876543210" // यहाँ अपना व्हाट्सएप नंबर डालें
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
    console.info("ℹ️ [Meta Pixel] Ready. जब आप Pixel ID देंगे, तब ऑटोमैटिकली इवेंट्स सिंक हो जाएंगे।");
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
      content_name: '₹1 Palmistry & Kundali Trial'
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

// ================= FORM SUBMISSION & RAZORPAY CHECKOUT =================
function handleFormSubmit(event) {
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
    payBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> रेज़रपे सुरक्षित गेटवे लोड हो रहा है...';
    payBtn.disabled = true;
  }

  // लाइव रेज़रपे चेकआउट खोलें
  launchLiveRazorpayCheckout({
    name,
    phone,
    service,
    dob,
    time,
    place,
    problem,
    btn: payBtn
  });
}

function launchLiveRazorpayCheckout(data) {
  const options = {
    key: APP_CONFIG.RAZORPAY_KEY_ID,
    amount: Math.round(APP_CONFIG.TRIAL_AMOUNT * 100), // ₹1 = 100 पैसे
    currency: APP_CONFIG.CURRENCY,
    name: APP_CONFIG.BUSINESS_NAME,
    description: "₹1 ट्रायल: हस्तरेखा एवं संपूर्ण कुंडली विश्लेषण",
    image: "https://cdn-icons-png.flaticon.com/512/3663/3663335.png",
    prefill: {
      name: data.name,
      contact: data.phone
    },
    notes: {
      service_type: data.service,
      dob: data.dob,
      time: data.time || "N/A",
      place: data.place,
      problem: data.problem,
      subscription_term: "₹1 Trial, then ₹599 bi-monthly"
    },
    theme: {
      color: "#F59E0B"
    },
    handler: function (response) {
      console.log("✅ Razorpay Payment Succeeded:", response);
      
      // Meta Pixel: Purchase Event Fire
      trackMetaEvent('Purchase', {
        value: APP_CONFIG.TRIAL_AMOUNT,
        currency: APP_CONFIG.CURRENCY,
        content_name: 'Palmistry & Kundali ₹1 Trial',
        transaction_id: response.razorpay_payment_id
      });

      showSuccessScreen(data.name, data.phone, data.service, response.razorpay_payment_id);
    },
    modal: {
      ondismiss: function() {
        if (data.btn) {
          data.btn.innerHTML = '<i class="fa-solid fa-shield-check"></i> <span>सुरक्षित भुगतान करें — ₹1</span>';
          data.btn.disabled = false;
        }
      }
    }
  };

  try {
    if (typeof window.Razorpay === 'function') {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        console.error("Payment Failed:", resp.error);
        alert("भुगतान असफल रहा: " + (resp.error.description || "कृपया पुनः प्रयास करें"));
        if (data.btn) {
          data.btn.innerHTML = '<i class="fa-solid fa-shield-check"></i> <span>सुरक्षित भुगतान करें — ₹1</span>';
          data.btn.disabled = false;
        }
      });
      rzp.open();
    } else {
      throw new Error("Razorpay SDK not loaded");
    }
  } catch (err) {
    console.error("Razorpay Launch Error:", err);
    alert("रेज़रपे खोलने में समस्या आई: " + err.message);
    if (data.btn) {
      data.btn.innerHTML = '<i class="fa-solid fa-shield-check"></i> <span>सुरक्षित भुगतान करें — ₹1</span>';
      data.btn.disabled = false;
    }
  }
}

// सफलता स्क्रीन
function showSuccessScreen(name, phone, service, paymentId) {
  const modalContent = document.querySelector("#bookingModal > div");
  if (!modalContent) return;

  const serviceText = service === "both" 
    ? "हस्तरेखा + जन्मकुंडली दोनों विश्लेषण" 
    : (service === "palm_only" ? "हस्तरेखा विश्लेषण" : "जन्मकुंडली विश्लेषण");

  modalContent.innerHTML = `
    <div class="text-center py-5 px-2">
      <div class="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.35)]">
        <i class="fa-solid fa-check"></i>
      </div>
      
      <h3 class="text-xl font-bold text-white mb-1">सफल पंजीकरण, ${name}!</h3>
      <p class="text-xs text-amber-300 font-medium mb-4">आपका ₹1 ट्रायल परामर्श सफलतापूर्वक बुक हो गया है।</p>
      
      <div class="bg-black/50 border border-amber-500/30 rounded-xl p-4 text-left text-xs space-y-2 mb-5">
        <div class="flex justify-between">
          <span class="text-slate-400">पेमेंट ट्रांजैक्शन ID:</span>
          <span class="text-emerald-400 font-mono font-semibold">${paymentId || 'RZP_' + Date.now()}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">चुनी गई सेवा:</span>
          <span class="text-white font-semibold">${serviceText}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">रजिस्टर्ड व्हाट्सएप नंबर:</span>
          <span class="text-white font-semibold">+91 ${phone}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">रिपोर्ट मिलने की समय-सीमा:</span>
          <span class="text-amber-300 font-bold">24 से 48 घंटे के भीतर</span>
        </div>
        <div class="flex justify-between border-t border-amber-500/15 pt-2">
          <span class="text-slate-400">ट्रायल टोकन राशि:</span>
          <span class="text-emerald-400 font-bold">₹1.00 (सफल)</span>
        </div>
      </div>

      <!-- Action Box for Palm Photos on WhatsApp -->
      <a href="https://wa.me/${APP_CONFIG.WHATSAPP_SUPPORT_NUMBER}?text=${encodeURIComponent('जय श्री राम, मैंने ₹1 ट्रायल लिया है। मेरा नाम ' + name + ' है और ट्रांजैक्शन ID ' + paymentId + ' है। यह मेरी दोनों हथेलियों की फोटो है:')}" target="_blank" class="block w-full p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm text-center shadow-lg transition mb-3">
        <i class="fa-brands fa-whatsapp text-lg align-middle mr-1.5"></i>
        <span>व्हाट्सएप पर हथेली की फोटो अभी भेजें</span>
      </a>

      <button onclick="closeBookingModal(); location.reload();" class="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-gray-950 font-bold py-3 px-6 rounded-xl text-xs sm:text-sm transition">
        पूर्ण हुआ (वापस पेज पर जाएं)
      </button>
    </div>
  `;
}

// ================= DOM INITIALIZATION =================
document.addEventListener("DOMContentLoaded", () => {
  initMetaPixel();
  startCountdown();
  console.log("🌟 [Vedic Astrology Page] Live Razorpay & Meta Pixel Integration Ready.");
});
