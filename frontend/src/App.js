import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, Legend, 
  CartesianGrid, ResponsiveContainer, AreaChart, Area, LabelList,
  ComposedChart, Line 
} from 'recharts';

/**
 * BHARAT-DRISHTI (Final V4.0 - User Profile & Full Localization)
 * -----------------------------------------
 * NEW FEATURES:
 * 1. 👤 Identity: Shows User Name + Role (e.g., District Magistrate).
 * 2. 🕒 Security: Displays "Last Login" time in header.
 * 3. 🇮🇳 Deep Hindi: All charts, legends, and tooltips now translate fully.
 */

// --- 1. CSS STYLES ---
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap');

  :root { --primary: #0f172a; --accent: #3b82f6; }

  body {
    font-family: 'Inter', sans-serif;
    background-color: #f1f5f9;
    background-image: 
      radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
      radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), 
      radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%);
    background-attachment: fixed;
    color: #1e293b;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
  }

  .chart-container { height: 250px; width: 100%; margin-top: auto; }
  
  @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
  .animate-marquee { display: inline-block; white-space: nowrap; animation: marquee 25s linear infinite; }

  @keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
  .animate-slide-up { animation: slideUp 0.5s ease-out forwards; }
  
  .animate-border-pulse { animation: pulseBorder 2s infinite; border-width: 1px; }
  @keyframes pulseBorder { 0% { border-color: rgba(34, 197, 94, 0.2); } 50% { border-color: rgba(34, 197, 94, 0.8); } 100% { border-color: rgba(34, 197, 94, 0.2); } }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
`;

// --- 2. LOGO ---
const BharatDrishtiLogo = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    <circle cx="50" cy="50" r="48" stroke="url(#grad1)" strokeWidth="2" fill="white" fillOpacity="0.1"/>
    <path d="M20 50 Q 50 20 80 50" stroke="#f97316" strokeWidth="6" strokeLinecap="round" />
    <path d="M20 50 Q 50 80 80 50" stroke="#22c55e" strokeWidth="6" strokeLinecap="round" />
    <circle cx="50" cy="50" r="12" fill="#1e3a8a" />
    <circle cx="50" cy="50" r="4" fill="white" />
    <defs><linearGradient id="grad1"><stop offset="0%" stopColor="#f97316" /><stop offset="100%" stopColor="#22c55e" /></linearGradient></defs>
  </svg>
);

// --- 3. MOCK DATABASE (With Last Login & Roles) ---
const GOV_DATABASE = [
  { email: "admin@gov.in", name: "Ramesh Gupta", role: "District Magistrate", lastLogin: "20 Jan, 09:30 AM" },
  { email: "citizen@gmail.com", name: "Rahul Kumar", role: "Citizen", lastLogin: "19 Jan, 04:15 PM" },
  { email: "paritosh@gmail.com", name: "Paritosh", role: "Sr. Data Officer", lastLogin: "20 Jan, 10:05 AM" } // Default for demo
];

const policies = [
  { text: "Free Aadhaar Update till June 2026.", status: "ACTIVE", color: "bg-green-100 text-green-700" },
  { text: "Maatru Vandana benefit ₹6000.", status: "NEW", color: "bg-blue-100 text-blue-700" },
  { text: "50k New Rural Seva Kendras.", status: "UPCOMING", color: "bg-orange-100 text-orange-700" },
  { text: "Mandatory Bio-Update Age 5 & 15.", status: "MANDATORY", color: "bg-red-100 text-red-700" }
];

// --- 4. MASTER DATA ---
const masterData = {
  india: {
    popCount: "145 Cr",
    age: [ { name: '0-5', value: 11.6, fill: '#f59e0b' }, { name: '5-18', value: 36.2, fill: '#10b981' }, { name: '18-40', value: 48.5, fill: '#3b82f6' }, { name: '40-60', value: 34.0, fill: '#8b5cf6' }, { name: '60+', value: 14.7, fill: '#64748b' } ],
    ghost: [ { district: "Bilaspur", total: 0.98, kids: 0.85, adult: 0.13 }, { district: "Hamirpur", total: 0.98, kids: 0.90, adult: 0.08 }, { district: "Darbhanga", total: 0.63, kids: 0.55, adult: 0.08 }, { district: "Jind", total: 0.98, kids: 0.70, adult: 0.28 }, { district: "Kangra", total: 0.98, kids: 0.88, adult: 0.10 } ],
    mig: [ { district: "Thane", updates: 411163 }, { district: "Pune", updates: 405834 }, { district: "S. 24 Parganas", updates: 373448 }, { district: "Murshidabad", updates: 340843 }, { district: "Surat", updates: 322384 } ],
    gender: [ { region: "North", male: 52, female: 47, other: 1 }, { region: "South", male: 49, female: 50, other: 1 }, { region: "East", male: 55, female: 44, other: 1 }, { region: "West", male: 51, female: 48, other: 1 } ],
    efficiency: [ { district: "Patna", waitTime: 45, processTime: 12 }, { district: "Gaya", waitTime: 20, processTime: 15 }, { district: "Muzaffarpur", waitTime: 60, processTime: 10 }, { district: "Bhagalpur", waitTime: 15, processTime: 18 } ],
    biometric: [ { ageGroup: "0-5", enrolled: 8.3, saturation: 42 }, { ageGroup: "5-18", enrolled: 34.5, saturation: 88 }, { ageGroup: "18-40", enrolled: 48.2, saturation: 99 }, { ageGroup: "40-60", enrolled: 33.8, saturation: 99 }, { ageGroup: "60+", enrolled: 14.5, saturation: 96 } ],
    insight: { en: "National Overview: High youth population (48.5 Cr). Migration peaks in industrial hubs.", hi: "राष्ट्रीय अवलोकन: उच्च युवा जनसंख्या। औद्योगिक केंद्रों में प्रवासन सबसे अधिक है।" }
  },
  bihar: {
    popCount: "12.9 Cr",
    age: [ { name: '0-5', value: 1.8, fill: '#f59e0b' }, { name: '5-18', value: 4.5, fill: '#10b981' }, { name: '18-40', value: 4.2, fill: '#3b82f6' }, { name: '40-60', value: 1.6, fill: '#8b5cf6' }, { name: '60+', value: 0.8, fill: '#64748b' } ],
    ghost: [ { district: "Darbhanga", total: 0.63, kids: 0.55, adult: 0.08 }, { district: "Sitamarhi", total: 0.49, kids: 0.40, adult: 0.09 }, { district: "Patna", total: 0.27, kids: 0.20, adult: 0.07 }, { district: "Gaya", total: 0.24, kids: 0.20, adult: 0.04 }, { district: "Madhubani", total: 0.48, kids: 0.40, adult: 0.08 } ],
    mig: [ { district: "Patna", updates: 222841 }, { district: "Gaya", updates: 175229 }, { district: "Madhubani", updates: 168104 }, { district: "Sitamarhi", updates: 157203 }, { district: "Darbhanga", updates: 141613 } ],
    gender: [ { region: "North Bihar", male: 56, female: 43, other: 1 }, { region: "South Bihar", male: 54, female: 45, other: 1 }, { region: "Patna", male: 52, female: 47, other: 1 }, { region: "Mithila", male: 55, female: 44, other: 1 } ],
    efficiency: [ { district: "Patna", waitTime: 55, processTime: 15 }, { district: "Gaya", waitTime: 40, processTime: 18 }, { district: "Muzaffarpur", waitTime: 65, processTime: 12 }, { district: "Darbhanga", waitTime: 35, processTime: 10 } ],
    biometric: [ { ageGroup: "0-5", enrolled: 1.2, saturation: 38 }, { ageGroup: "5-18", enrolled: 3.8, saturation: 85 }, { ageGroup: "18-40", enrolled: 4.1, saturation: 98 }, { ageGroup: "40-60", enrolled: 1.5, saturation: 98 }, { ageGroup: "60+", enrolled: 0.7, saturation: 94 } ],
    insight: { en: "Bihar Insight: High child enrolment anomaly in Darbhanga (63%). Focus on North Bihar centers.", hi: "बिहार अंतर्दृष्टि: दरभंगा में उच्च बाल नामांकन विसंगति (63%)। उत्तर बिहार केंद्रों पर ध्यान दें।" }
  },
  uttar_pradesh: {
    popCount: "24.1 Cr",
    age: [ { name: '0-5', value: 2.2, fill: '#f59e0b' }, { name: '5-18', value: 6.5, fill: '#10b981' }, { name: '18-40', value: 8.5, fill: '#3b82f6' }, { name: '40-60', value: 4.5, fill: '#8b5cf6' }, { name: '60+', value: 2.4, fill: '#64748b' } ],
    ghost: [ { district: "Bijnor", total: 0.77, kids: 0.70, adult: 0.07 }, { district: "Saharanpur", total: 0.72, kids: 0.65, adult: 0.07 }, { district: "Lalitpur", total: 0.71, kids: 0.60, adult: 0.11 }, { district: "Amroha", total: 0.69, kids: 0.60, adult: 0.09 }, { district: "Lucknow", total: 0.40, kids: 0.30, adult: 0.10 } ],
    mig: [ { district: "Bareilly", updates: 220300 }, { district: "Ghaziabad", updates: 219179 }, { district: "Bijnor", updates: 209514 }, { district: "Lucknow", updates: 193697 }, { district: "Kheri", updates: 170938 } ],
    gender: [ { region: "West UP", male: 53, female: 46, other: 1 }, { region: "East UP", male: 55, female: 44, other: 1 }, { region: "Bundelkhand", male: 57, female: 42, other: 1 }, { region: "Awadh", male: 52, female: 47, other: 1 } ],
    efficiency: [ { district: "Lucknow", waitTime: 30, processTime: 10 }, { district: "Noida", waitTime: 20, processTime: 8 }, { district: "Varanasi", waitTime: 45, processTime: 15 }, { district: "Agra", waitTime: 35, processTime: 12 } ],
    biometric: [ { ageGroup: "0-5", enrolled: 2.1, saturation: 40 }, { ageGroup: "5-18", enrolled: 6.2, saturation: 86 }, { ageGroup: "18-40", enrolled: 8.3, saturation: 99 }, { ageGroup: "40-60", enrolled: 4.4, saturation: 99 }, { ageGroup: "60+", enrolled: 2.3, saturation: 95 } ],
    insight: { en: "UP Insight: Suspicious spikes in Bijnor (77%). Noida showing 90% efficiency efficiency.", hi: "यूपी अंतर्दृष्टि: बिजनौर में संदिग्ध वृद्धि (77%)। नोएडा 90% दक्षता दिखा रहा है।" }
  },
  delhi: {
    popCount: "3.38 Cr",
    age: [ { name: '0-5', value: 0.2, fill: '#f59e0b' }, { name: '5-18', value: 0.7, fill: '#10b981' }, { name: '18-40', value: 1.5, fill: '#3b82f6' }, { name: '40-60', value: 0.8, fill: '#8b5cf6' }, { name: '60+', value: 0.3, fill: '#64748b' } ],
    ghost: [ { district: "North West", total: 0.65, kids: 0.50, adult: 0.15 }, { district: "South", total: 0.55, kids: 0.40, adult: 0.15 }, { district: "East", total: 0.45, kids: 0.35, adult: 0.10 }, { district: "Central", total: 0.30, kids: 0.20, adult: 0.10 }, { district: "New Delhi", total: 0.20, kids: 0.10, adult: 0.10 } ],
    mig: [ { district: "North West", updates: 120000 }, { district: "South", updates: 98000 }, { district: "West", updates: 85000 }, { district: "East", updates: 76000 }, { district: "Central", updates: 50000 } ],
    gender: [ { region: "North", male: 51, female: 48, other: 1 }, { region: "South", male: 50, female: 49, other: 1 }, { region: "East", male: 52, female: 47, other: 1 }, { region: "West", male: 51, female: 48, other: 1 } ],
    efficiency: [ { district: "CP", waitTime: 10, processTime: 5 }, { district: "Dwarka", waitTime: 20, processTime: 8 }, { district: "Rohini", waitTime: 35, processTime: 12 }, { district: "Laxmi Ngr", waitTime: 40, processTime: 15 } ],
    biometric: [ { ageGroup: "0-5", enrolled: 0.3, saturation: 55 }, { ageGroup: "5-18", enrolled: 0.8, saturation: 92 }, { ageGroup: "18-40", enrolled: 1.6, saturation: 99 }, { ageGroup: "40-60", enrolled: 0.8, saturation: 99 }, { ageGroup: "60+", enrolled: 0.3, saturation: 98 } ],
    insight: { en: "Delhi Insight: High efficiency in Central Delhi. Migration influx in North-West district.", hi: "दिल्ली अंतर्दृष्टि: मध्य दिल्ली में उच्च दक्षता। उत्तर-पश्चिम जिले में प्रवासन प्रवाह।" }
  },
  gujarat: {
    popCount: "7.3 Cr",
    age: [ { name: '0-5', value: 0.6, fill: '#f59e0b' }, { name: '5-18', value: 1.8, fill: '#10b981' }, { name: '18-40', value: 2.9, fill: '#3b82f6' }, { name: '40-60', value: 1.4, fill: '#8b5cf6' }, { name: '60+', value: 0.6, fill: '#64748b' } ],
    ghost: [ { district: "Surat", total: 0.55, kids: 0.40, adult: 0.15 }, { district: "Ahmedabad", total: 0.45, kids: 0.35, adult: 0.10 }, { district: "Rajkot", total: 0.35, kids: 0.25, adult: 0.10 }, { district: "Vadodara", total: 0.30, kids: 0.20, adult: 0.10 }, { district: "Kutch", total: 0.25, kids: 0.15, adult: 0.10 } ],
    mig: [ { district: "Surat", updates: 320000 }, { district: "Ahmedabad", updates: 210000 }, { district: "Vadodara", updates: 150000 }, { district: "Rajkot", updates: 110000 }, { district: "Valsad", updates: 80000 } ],
    gender: [ { region: "Saurashtra", male: 53, female: 46, other: 1 }, { region: "Kutch", male: 54, female: 45, other: 1 }, { region: "Central", male: 52, female: 47, other: 1 }, { region: "South", male: 51, female: 48, other: 1 } ],
    efficiency: [ { district: "GIFT City", waitTime: 5, processTime: 5 }, { district: "Surat", waitTime: 45, processTime: 10 }, { district: "Ahmedabad", waitTime: 30, processTime: 12 }, { district: "Rajkot", waitTime: 25, processTime: 15 } ],
    biometric: [ { ageGroup: "0-5", enrolled: 0.5, saturation: 48 }, { ageGroup: "5-18", enrolled: 1.8, saturation: 89 }, { ageGroup: "18-40", enrolled: 3.1, saturation: 99 }, { ageGroup: "40-60", enrolled: 1.4, saturation: 99 }, { ageGroup: "60+", enrolled: 0.6, saturation: 97 } ],
    insight: { en: "Gujarat Insight: Surat faces massive load due to migrant workers. GIFT City is 100% efficient.", hi: "गुजरात अंतर्दृष्टि: सूरत में प्रवासी श्रमिकों के कारण भारी भार। गिफ्ट सिटी 100% कुशल है।" }
  },
  maharashtra: {
    popCount: "13.1 Cr",
    age: [ { name: '0-5', value: 1.1, fill: '#f59e0b' }, { name: '5-18', value: 2.9, fill: '#10b981' }, { name: '18-40', value: 5.5, fill: '#3b82f6' }, { name: '40-60', value: 2.4, fill: '#8b5cf6' }, { name: '60+', value: 1.2, fill: '#64748b' } ],
    ghost: [ { district: "Bhandara", total: 0.97, kids: 0.90, adult: 0.07 }, { district: "Gondiya", total: 0.96, kids: 0.88, adult: 0.08 }, { district: "Pune", total: 0.30, kids: 0.20, adult: 0.10 }, { district: "Mumbai", total: 0.20, kids: 0.15, adult: 0.05 }, { district: "Thane", total: 0.25, kids: 0.20, adult: 0.05 } ],
    mig: [ { district: "Thane", updates: 411163 }, { district: "Pune", updates: 405834 }, { district: "Solapur", updates: 257811 }, { district: "Nashik", updates: 231315 }, { district: "Nanded", updates: 229602 } ],
    gender: [ { region: "Vidarbha", male: 52, female: 47, other: 1 }, { region: "Marathwada", male: 53, female: 46, other: 1 }, { region: "Konkan", male: 51, female: 48, other: 1 }, { region: "Mumbai", male: 50, female: 49, other: 1 } ],
    efficiency: [ { district: "Mumbai", waitTime: 15, processTime: 8 }, { district: "Pune", waitTime: 25, processTime: 10 }, { district: "Nagpur", waitTime: 30, processTime: 12 }, { district: "Nashik", waitTime: 35, processTime: 14 } ],
    biometric: [ { ageGroup: "0-5", enrolled: 1.0, saturation: 45 }, { ageGroup: "5-18", enrolled: 2.8, saturation: 90 }, { ageGroup: "18-40", enrolled: 5.4, saturation: 99 }, { ageGroup: "40-60", enrolled: 2.3, saturation: 99 }, { ageGroup: "60+", enrolled: 1.1, saturation: 97 } ],
    insight: { en: "MH Insight: Thane and Pune are migration hotspots. Mumbai centers operate at peak efficiency.", hi: "महाराष्ट्र अंतर्दृष्टि: ठाणे और पुणे प्रवासन हॉटस्पॉट हैं। मुंबई केंद्र चरम दक्षता पर काम करते हैं।" }
  }
};

// Fallback logic
['delhi', 'gujarat'].forEach(key => { if(masterData[key].age.length === 0) masterData[key] = { ...masterData['india'], popCount: masterData[key].popCount }; });

const KNOWLEDGE_BASE = [
  { keywords: ['hi', 'hello', 'namaste'], response: { en: "Namaste! I am your AI Assistant.", hi: "नमस्ते! मैं आपका एआई सहायक हूं।" } },
  { keywords: ['policy'], response: { en: "Latest: Free updates till 2026.", hi: "नवीनतम: जून 2026 तक मुफ्त आधार अपडेट।" } }
];

// --- 5. TRANSLATIONS (DEEP LOCALIZATION) ---
const t = {
  en: { 
    title: "Bharat-Drishti", 
    popTitle: "Population Demographics", 
    policyTitle: "📢 Government Directives", 
    helpTitle: "📞 Emergency Contacts", 
    ghostTitle: "Anomaly Detection", 
    migTitle: "Migration Trends", 
    genderTitle: "Gender Inclusivity Gap",
    effTitle: "Center Efficiency Audit",
    bioTitle: "Biometric Enrollment vs Saturation",
    chatTitle: "Sahayak AI", 
    chatPlaceholder: "Type your query...", 
    btnLogin: "Verify Credentials", 
    footer: "© 2026 Bharat-Drishti | UIDAI", 
    lastLogin: "Last Login",
    live: "LIVE",
    welcome: "Welcome",
    // Chart Labels
    male: "Male %", female: "Female %", other: "Other %",
    waitTime: "Avg Wait Time", processTime: "Processing Time",
    enrolled: "Enrolled (Cr)", saturation: "Saturation %",
    total: "TOTAL", kids: "0-5 YRS", adult: "18+ YRS"
  },
  hi: { 
    title: "भारत-दृष्टि", 
    popTitle: "जनसंख्या जनसांख्यिकी", 
    policyTitle: "📢 सरकारी निर्देश", 
    helpTitle: "📞 आपातकालीन संपर्क", 
    ghostTitle: "विसंगति का पता लगाना", 
    migTitle: "प्रवासन रुझान", 
    genderTitle: "लिंग समावेशिता अंतर",
    effTitle: "केंद्र दक्षता ऑडिट",
    bioTitle: "बायोमेट्रिक नामांकन बनाम संतृप्ति",
    chatTitle: "सहायक AI", 
    chatPlaceholder: "अपना प्रश्न लिखें...", 
    btnLogin: "सत्यापित करें", 
    footer: "© 2026 भारत-दृष्टि | यूआईडीएआई", 
    lastLogin: "पिछला लॉगिन",
    live: "लाइव",
    welcome: "स्वागत है",
    // Chart Labels (IMPROVISED TRANSLATIONS)
    male: "पुरुष %", female: "महिला %", other: "अन्य %",
    waitTime: "औसत प्रतीक्षा समय", processTime: "प्रक्रिया समय",
    enrolled: "नामांकित (करोड़)", saturation: "संतृप्ति %",
    total: "कुल", kids: "0-5 वर्ष", adult: "18+ वर्ष"
  }
};

// --- 6. MAIN APP ---
function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [lang, setLang] = useState('en');
  const [region, setRegion] = useState('india');
  const [time, setTime] = useState(new Date());
  const [anomalyFilter, setAnomalyFilter] = useState('total');
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState([{ sender: 'bot', text: "Namaste! How can I help?" }]);
  const [chatInput, setChatInput] = useState("");

  const data = masterData[region];
  const txt = t[lang];
  const chatScrollRef = useRef(null);

  useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => { if(chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight; }, [chatHistory, isChatOpen]);

  const handleLogin = () => {
    // Simulate Login finding specific user
    const user = GOV_DATABASE.find(u => u.email.toLowerCase() === loginEmail.toLowerCase()) || GOV_DATABASE[2]; // Default to Paritosh if unknown
    setTimeout(() => setCurrentUser(user), 800);
  };

  const sendMessage = () => { if(!chatInput.trim()) return; setChatHistory([...chatHistory, {sender:'user', text:chatInput}]); setChatInput(""); setTimeout(()=>setChatHistory(prev=>[...prev, {sender:'bot', text: lang === 'hi' ? "मैं डेटा का विश्लेषण कर रहा हूं..." : "I am analyzing the data..."}]), 800); };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <style>{styles}</style>
        <div className="glass-card p-8 w-full max-w-sm animate-slide-up items-center text-center">
            <BharatDrishtiLogo className="w-16 h-16 mb-4" />
            <h1 className="text-2xl font-bold text-slate-800 mb-1">{txt.title}</h1>
            <p className="text-xs text-slate-500 mb-6">Secure Official Login</p>
            <input className="w-full p-3 bg-slate-50 border rounded-lg text-sm mb-4" placeholder="Official Email ID" value={loginEmail} onChange={(e)=>setLoginEmail(e.target.value)} />
            <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition">{txt.btnLogin}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 font-sans text-slate-800">
      <style>{styles}</style>
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3"><BharatDrishtiLogo className="w-8 h-8" /><h1 className="font-bold text-lg hidden md:block">{txt.title}</h1></div>
        <div className="flex items-center gap-4">
           {/* CLOCK & LAST LOGIN */}
           <div className="hidden md:flex flex-col items-end">
              <span className="font-mono font-bold text-slate-700 text-sm">
                {time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </span>
              <span className="text-[9px] text-slate-400 font-medium">
                {txt.lastLogin}: {currentUser.lastLogin}
              </span>
           </div>
           
           {/* USER PROFILE BADGE */}
           <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">{currentUser.name[0]}</div>
              <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-blue-900 leading-tight">{currentUser.name}</span>
                 <span className="text-[8px] text-blue-500 font-semibold leading-tight">{currentUser.role}</span>
              </div>
           </div>

           {/* CONTROLS */}
           <div className="flex bg-slate-100 p-1 rounded-lg">
              <select value={region} onChange={(e) => setRegion(e.target.value)} className="bg-transparent text-xs font-bold p-1 outline-none cursor-pointer"><option value="india">🇮🇳 India</option><option value="bihar">📍 Bihar</option><option value="uttar_pradesh">📍 UP</option><option value="delhi">📍 Delhi</option><option value="maharashtra">📍 MH</option><option value="gujarat">📍 Gujarat</option></select>
              <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-transparent text-xs font-bold p-1 outline-none cursor-pointer"><option value="en">EN</option><option value="hi">HI</option></select>
           </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-5">
        
        {/* TICKER */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 flex items-center gap-3 overflow-hidden">
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded animate-pulse">{txt.live}</span>
            <p className="text-xs text-red-800 font-medium whitespace-nowrap animate-marquee">⚠️ High biometric failures in {region === 'india' ? 'Muzaffarpur' : data.ghost[0].district}. System load at 89%. 🟢 Aadhaar Server Active.</p>
        </div>

        {/* TOP ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {/* POPULATION */}
           <div className="glass-card p-5 border-t-4 border-orange-500 animate-slide-up" style={{animationDelay:'0.1s'}}>
              <h2 className="text-xs font-bold text-orange-600 uppercase mb-2">{txt.popTitle}</h2>
              <div className="text-3xl font-extrabold text-slate-800">{data.popCount}</div>
              <div className="flex-1 mt-2 min-h-[120px]">
                <ResponsiveContainer width="100%" height="100%"><BarChart data={data.age}><XAxis dataKey="name" hide /><Tooltip /><Bar dataKey="value" radius={[4,4,0,0]}>{data.age.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar></BarChart></ResponsiveContainer>
              </div>
           </div>
           {/* POLICIES */}
           <div className="glass-card p-0 border-t-4 border-green-500 animate-slide-up overflow-hidden" style={{animationDelay:'0.2s'}}>
              <div className="p-4 bg-white/50 border-b border-slate-100"><h2 className="text-xs font-bold text-green-600 uppercase">{txt.policyTitle}</h2></div>
              <div className="p-4 space-y-2 overflow-y-auto h-40">
                {policies.map((p, i) => (
                  <div key={i} className="p-2 rounded bg-white border border-slate-100 shadow-sm flex flex-col gap-1 animate-border-pulse">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded w-fit ${p.color}`}>{p.status}</span>
                    <span className="text-[10px] font-medium text-slate-600">{p.text}</span>
                  </div>
                ))}
              </div>
           </div>
           {/* CONTACT */}
           <div className="glass-card p-5 border-t-4 border-red-500 animate-slide-up" style={{animationDelay:'0.3s'}}>
              <h2 className="text-xs font-bold text-red-600 uppercase mb-4">{txt.helpTitle}</h2>
              <div className="grid grid-cols-2 gap-2 h-full">
                 <div className="bg-red-50 p-2 rounded text-center border border-red-100"><div className="text-lg font-bold text-red-700">1947</div><div className="text-[9px] text-red-400">UIDAI</div></div>
                 <div className="bg-blue-50 p-2 rounded text-center border border-blue-100"><div className="text-lg font-bold text-blue-700">1930</div><div className="text-[9px] text-blue-400">Cyber</div></div>
                 <div className="bg-orange-50 p-2 rounded text-center border border-orange-100"><div className="text-lg font-bold text-orange-700">1098</div><div className="text-[9px] text-orange-400">Child</div></div>
                 <div className="bg-green-50 p-2 rounded text-center border border-green-100"><div className="text-lg font-bold text-green-700">112</div><div className="text-[9px] text-green-400">Police</div></div>
              </div>
           </div>
        </div>

        {/* MIDDLE ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ANOMALY */}
            <div className="glass-card p-5 animate-slide-up" style={{animationDelay: '0.4s'}}>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold text-slate-700">{txt.ghostTitle}</h3>
                    <div className="flex gap-1 bg-slate-100 p-1 rounded">
                        {['total', 'kids', 'adult'].map(f => (
                            <button key={f} onClick={()=>setAnomalyFilter(f)} className={`text-[9px] px-2 py-1 rounded transition-all ${anomalyFilter===f ? 'bg-white shadow text-blue-600 font-bold' : 'text-slate-400'}`}>{txt[f]}</button>
                        ))}
                    </div>
                </div>
                <div className="chart-container"><ResponsiveContainer><BarChart data={data.ghost}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="district" tick={{fontSize:10}} /><YAxis tick={{fontSize:10}} /><Tooltip /><Bar dataKey={anomalyFilter} fill={anomalyFilter === 'kids' ? '#f59e0b' : '#ef4444'} radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div>
            </div>
            {/* MIGRATION */}
            <div className="glass-card p-5 animate-slide-up" style={{animationDelay: '0.5s'}}>
                <h3 className="text-sm font-bold text-slate-700 mb-2">{txt.migTitle}</h3>
                <div className="chart-container"><ResponsiveContainer><AreaChart data={data.mig}><defs><linearGradient id="cM" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="district" tick={{fontSize:10}} /><YAxis tick={{fontSize:10}} /><Tooltip /><Area type="monotone" dataKey="updates" stroke="#3b82f6" fill="url(#cM)" /></AreaChart></ResponsiveContainer></div>
            </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* GENDER GAP */}
            <div className="glass-card p-5 animate-slide-up" style={{animationDelay: '0.6s'}}>
                <h3 className="text-sm font-bold text-slate-700 mb-2">{txt.genderTitle}</h3>
                <div className="chart-container"><ResponsiveContainer><BarChart data={data.gender} layout="vertical"><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" hide /><YAxis dataKey="region" type="category" tick={{fontSize:10}} width={60} /><Tooltip /><Legend /><Bar dataKey="male" name={txt.male} stackId="a" fill="#3b82f6" /><Bar dataKey="female" name={txt.female} stackId="a" fill="#ec4899" /><Bar dataKey="other" name={txt.other} stackId="a" fill="#a855f7" radius={[0,4,4,0]} /></BarChart></ResponsiveContainer></div>
            </div>
            {/* EFFICIENCY */}
            <div className="glass-card p-5 animate-slide-up" style={{animationDelay: '0.7s'}}>
                <h3 className="text-sm font-bold text-slate-700 mb-2">{txt.effTitle}</h3>
                <div className="chart-container"><ResponsiveContainer><BarChart data={data.efficiency}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="district" tick={{fontSize:10}} /><YAxis tick={{fontSize:10}} /><Tooltip /><Legend /><Bar dataKey="waitTime" name={txt.waitTime} fill="#ef4444" radius={[4,4,0,0]} /><Bar dataKey="processTime" name={txt.processTime} fill="#10b981" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div>
            </div>
        </div>

        {/* FOOTER ROW */}
        <div className="glass-card p-5 animate-slide-up" style={{animationDelay: '0.8s'}}>
            <h3 className="text-sm font-bold text-slate-700 mb-1">{txt.bioTitle}</h3>
            <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data.biometric}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="ageGroup" tick={{fontSize:10}} />
                        <YAxis yAxisId="left" tick={{fontSize:10}} width={30} />
                        <YAxis yAxisId="right" orientation="right" tick={{fontSize:10}} width={30} domain={[0, 100]} unit="%" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="enrolled" name={txt.enrolled} fill="#3b82f6" radius={[4,4,0,0]} barSize={40} />
                        <Line yAxisId="right" type="monotone" dataKey="saturation" name={txt.saturation} stroke="#f59e0b" strokeWidth={3} dot={{r:4}} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>

      </main>

      {/* CHATBOT */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
         {isChatOpen && (
            <div className="glass-card w-80 shadow-2xl overflow-hidden animate-slide-up">
               <div className="bg-slate-800 p-3 text-white flex justify-between items-center"><span className="text-xs font-bold">{txt.chatTitle}</span><button onClick={()=>setIsChatOpen(false)}>✕</button></div>
               <div className="h-60 overflow-y-auto p-3 bg-slate-50 space-y-2" ref={chatScrollRef}>{chatHistory.map((m,i)=><div key={i} className={`p-2 rounded text-xs max-w-[85%] ${m.sender==='user'?'ml-auto bg-blue-600 text-white':'bg-white border'}`}>{m.text}</div>)}</div>
               <div className="p-2 border-t flex gap-2"><input className="flex-1 text-xs p-2 border rounded" placeholder={txt.chatPlaceholder} value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyPress={e=>e.key==='Enter'&&sendMessage()} /><button onClick={sendMessage} className="text-xs bg-blue-600 text-white px-3 rounded">➤</button></div>
            </div>
         )}
         <button onClick={()=>setIsChatOpen(!isChatOpen)} className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-xl hover:scale-110 transition">💬</button>
      </div>

      <footer className="mt-8 py-6 text-center text-xs text-slate-400">{txt.footer}</footer>
    </div>
  );
}

export default App;