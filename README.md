# 🌟 दिव्य ज्योतिष संस्थान - High Converting Landing Page

यह एक प्रीमियम, हाई-कन्वर्टिंग वैदिक ज्योतिष लैंडिंग पेज है, जिसे विशेष रूप से **Meta Ads (Facebook/Instagram)**, **Razorpay Subscriptions (₹1 Trial + ₹599 Recurring)**, और **Vercel Cloud Hosting** के लिए तैयार किया गया है।

---

## 🚀 मुख्य विशेषताएं (Key Highlights)

1. **Vercel Ready (100% Uptime):**
   - यह एक शुद्ध (Pure Modern Static + CDN) आर्किटेक्चर पर बना है।
   - इसे Vercel पर होस्ट करने के बाद, यदि आप अपना लैपटॉप बंद भी कर दें, तब भी यह दुनिया भर में 24/7 बिना किसी एरर या ब्लैंक स्क्रीन के हमेशा लाइव रहेगा।
2. **हाई-कन्वर्टिंग वैदिक डिज़ाइन:**
   - डार्क और रॉयल गोल्ड कलर पैलेट।
   - लाइव काउंटडाउन अर्जेंसी टाइमर (14:59)।
   - समस्याओं के समाधान (विवाह, करियर, धन, कुंडली दोष)।
   - वास्तविक दिखने वाले फोटोज़ और 5-स्टार रिव्यूज के साथ टेस्टिमोनियल्स।
   - मोबाइल-फ्रेंडली स्टिकी बॉटम सीटीए बार (Mobile Sticky CTA)।
3. **मेटा पिक्सल (Meta Pixel) रेडी:**
   - `PageView`: पेज लोड होते ही फायर होगा।
   - `InitiateCheckout`: जब यूजर ₹1 ट्रायल बटन दबाएगा।
   - `Purchase`: जब ₹1 का भुगतान सफलतापूर्वक पूरा हो जाएगा।
4. **रेज़रपे इंटीग्रेशन (Razorpay Recurring Ready):**
   - अभी यह "डेमो मोड" में सुरक्षित रूप से चलता है, जिससे पेज कभी क्रैश नहीं होगा।
   - जैसे ही आप अपनी `RAZORPAY_KEY_ID` डालेंगे, असली पेमेंट गेटवे सक्रिय हो जाएगा।

---

## 📁 प्रोजेक्ट फाइलें (Project Structure)

```text
astro-landing-page/
├── index.html       # मुख्य लैंडिंग पेज (HTML5 + Tailwind CSS + FontAwesome)
├── styles.css       # कस्टम एनिमेशन, वैदिक ग्लो इफेक्ट्स और स्क्रॉलबार
├── app.js           # मेटा पिक्सल इवेंट्स, टाइमर, मॉडल और रेज़रपे लॉजिक
├── vercel.json      # Vercel के लिए कॉन्फ़िगरेशन (Zero-Downtime Headers)
└── README.md        # निर्देश व गाइड
```

---

## 🛠️ क्रेडेंशियल्स कैसे सेट करें? (How to Configure Keys)

जब आप अपनी Meta Pixel ID और Razorpay Keys प्राप्त कर लें, तो बस [`app.js`](file:///C:/Users/I%20Computers/.gemini/antigravity/scratch/astro-landing-page/app.js) फ़ाइल खोलें और सबसे ऊपर ये दो लाइन बदलें:

```javascript
const APP_CONFIG = {
  // अपनी Meta Pixel ID यहाँ पेस्ट करें
  META_PIXEL_ID: "123456789012345", 
  
  // अपनी Razorpay Key ID यहाँ पेस्ट करें
  RAZORPAY_KEY_ID: "rzp_live_xxxxxxxxxxxx",

  TRIAL_AMOUNT: 1.00,
  RECURRING_AMOUNT: 599.00
};
```

---

## 🌐 Vercel पर 2 मिनट में कैसे लाइव करें? (Deploy to Vercel)

### तरीका 1: Vercel Web Dashboard (सबसे आसान)
1. [vercel.com](https://vercel.com) पर जाएं और लॉगिन करें।
2. अपने GitHub अकाउंट से इस फोल्डर को रिपॉजिटरी बनाकर कनेक्ट करें (या Vercel CLI का इस्तेमाल करें)।
3. "Deploy" बटन पर क्लिक करें। 30 सेकंड में आपकी लाइव लिंक (उदा. `https://your-astro-page.vercel.app`) तैयार हो जाएगी!

---

## 💻 अपने कंप्यूटर पर अभी कैसे देखें? (Local Preview)
आप सीधे `index.html` फ़ाइल पर डबल क्लिक करके इसे किसी भी ब्राउज़र (Chrome, Edge, Brave) में तुरंत देख सकते हैं!
