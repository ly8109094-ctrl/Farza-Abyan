// Data Structures & Storage Key
const STORAGE_KEY = 'abyan_hiace_farza_db_v1';

let appState = {
    drivers: [] // Each item: { id, name, busNum, phone, regTime, status: 'WAITING'|'DEPARTED', destination, passengers, departTime }
};

// Initial Load
window.onload = function() {
    loadFromStorage();
    
    // If empty, populate mock demo data for Abyan Farza
    if (appState.drivers.length === 0) {
        seedInitialData();
    }

    // Set current date in reports
    const now = new Date();
    const dateStr = now.toLocaleDateString('ar-YE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('reportCurrentDate').innerText = dateStr;
    document.getElementById('printDate').innerText = 'تاريخ التقرير: ' + dateStr + ' - ' + now.toLocaleTimeString('ar-YE');

    renderAll();
};

// Seed Sample Data for quick preview
function seedInitialData() {
    const now = new Date();
    appState.drivers = [
        {
            id: '1',
            name: 'عبدالرب علي صالح',
            busNum: '48201 / أبين',
            phone: '771234567',
            regTime: new Date(now.getTime() - 3600000 * 3).toISOString(),
            status: 'WAITING'
        },
        {
            id: '2',
            name: 'محسن سالم باجمال',
            busNum: '15920 / أبين',
            phone: '733987654',
            regTime: new Date(now.getTime() - 3600000 * 2).toISOString(),
            status: 'WAITING'
        },
        {
            id: '3',
            name: 'فضل المرقشي',
            busNum: '33411 / أبين',
            phone: '770112233',
            regTime: new Date(now.getTime() - 3600000 * 1.5).toISOString(),
            status: 'WAITING'
        },
        {
            id: '4',
            name: 'ياسر الخضر الحسني',
            busNum: '9012 / أبين',
            phone: '775443322',
            regTime: new Date(now.getTime() - 3600000 * 5).toISOString(),
            status: 'DEPARTED',
            destination: 'عدن',
            passengers: 14,
            departTime: new Date(now.getTime() - 3600000 * 2.5).toISOString()
        },
        {
            id: '5',
            name: 'عوض بن عوض الجعدني',
            busNum: '6102 / أبين',
            phone: '711889900',
            regTime: new Date(now.getTime() - 3600000 * 4).toISOString(),
            status: 'DEPARTED',
            destination: 'جعار',
            passengers: 14,
            departTime: new Date(now.getTime() - 3600000 * 1).toISOString()
        }
    ];
    saveToStorage();
}

// Storage helpers
function saveToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch (e) {
        console.error("Storage error:", e);
    }
}

function loadFromStorage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            appState = JSON.parse(saved);
        } catch(e) {
            console.error("Parse error:", e);
        }
    }
}

// UI Rendering Logic
function renderAll() {
    renderWaitingList();
    renderDepartedList();
    updateStatsAndReports();
}

// Render Waiting Drivers
function renderWaitingList() {
    const searchQuery = (document.getElementById('searchWaiting').value || '').trim().toLowerCase();
    const waiting = appState.drivers
        .filter(d => d.status === 'WAITING')
        .filter(d => d.name.toLowerCase().includes(searchQuery) || d.busNum.toLowerCase().includes(searchQuery));

    const tbody = document.getElementById('waitingTableBody');
    const mobileCards = document.getElementById('waitingCardsMobile');
    const emptyState = document.getElementById('emptyWaiting');

    tbody.innerHTML = '';
    mobileCards.innerHTML = '';

    if (waiting.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');

        waiting.forEach((driver, idx) => {
            const queueNumber = idx + 1;
            const formattedTime = new Date(driver.regTime).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' });
            const isFirst = (idx === 0);

            // Table Row
            const tr = document.createElement('tr');
            tr.className = isFirst ? 'bg-amber-50/60 font-semibold' : 'hover:bg-slate-50';
            tr.innerHTML = `
                <td class="p-3 text-center">
                    <span class="inline-flex items-center justify-center w-7 h-7 rounded-full ${isFirst ? 'bg-amber-500 text-slate-900 font-extrabold shadow-sm' : 'bg-slate-200 text-slate-700 font-bold'} text-xs">
                        ${queueNumber}
                    </span>
                </td>
                <td class="p-3">
                    <div class="font-bold text-slate-800">${escapeHtml(driver.name)}</div>
                    <div class="text-[11px] text-slate-400">${driver.phone ? escapeHtml(driver.phone) : 'بدون هاتف'}</div>
                </td>
                <td class="p-3">
                    <span class="bg-slate-100 border border-slate-300 text-slate-700 text-xs px-2.5 py-1 rounded-lg font-mono font-bold">
                        ${escapeHtml(driver.busNum)}
                    </span>
                </td>
                <td class="p-3 text-slate-500 text-xs">
                    <i class="fa-regular fa-clock ml-1 text-slate-400"></i>${formattedTime}
                </td>
                <td class="p-3">
                    ${isFirst ? '<span class="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-extrabold px-2 py-0.5 rounded-md pulse-animation"><i class="fa-solid fa-flag"></i> دور التحميل الآن</span>' 
                              : '<span class="text-slate-500 text-xs font-medium">منتظر بالدور</span>'}
                </td>
                <td class="p-3 text-center">
                    <div class="flex justify-center items-center gap-1.5">
                        <button onclick="callSingleDriverVoice('${driver.id}')" class="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-2.5 py-1.5 rounded-lg shadow-sm transition flex items-center gap-1" title="نداء صوتي بالاسم ورقم الباص">
                            <i class="fa-solid fa-volume-high"></i> نداء
                        </button>
                        <button onclick="openDepartModal('${driver.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition flex items-center gap-1">
                            <i class="fa-solid fa-van-shuttle"></i> تحميل الركاب
                        </button>
                        <button onclick="deleteDriver('${driver.id}')" class="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition" title="حذف من الدور">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);

            // Mobile Card
            const card = document.createElement('div');
            card.className = `p-4 space-y-3 ${isFirst ? 'bg-amber-50/70 border-r-4 border-amber-500' : 'bg-white'}`;
            card.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="flex items-center gap-2">
                        <span class="flex items-center justify-center w-7 h-7 rounded-full ${isFirst ? 'bg-amber-500 text-slate-900 font-black' : 'bg-slate-200 text-slate-700 font-bold'} text-xs">
                            ${queueNumber}
                        </span>
                        <div>
                            <h4 class="font-bold text-slate-800 text-sm">${escapeHtml(driver.name)}</h4>
                            <p class="text-xs font-mono text-slate-500">${escapeHtml(driver.busNum)}</p>
                        </div>
                    </div>
                    ${isFirst ? '<span class="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-md">الدور الحالي</span>' : ''}
                </div>
                <div class="flex justify-between items-center text-xs text-slate-500 pt-1 border-t border-slate-100">
                    <div>
                        <i class="fa-regular fa-clock ml-1"></i> سُجل: ${formattedTime}
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="deleteDriver('${driver.id}')" class="text-slate-400 hover:text-rose-600 p-1">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                        <button onclick="callSingleDriverVoice('${driver.id}')" class="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-2.5 py-1.5 rounded-lg shadow-sm flex items-center gap-1">
                            <i class="fa-solid fa-volume-high"></i> نداء
                        </button>
                        <button onclick="openDepartModal('${driver.id}')" class="bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm">
                            تحميل الركاب
                        </button>
                    </div>
                </div>
            `;
            mobileCards.appendChild(card);
        });
    }
}

// Render Departed Log
function renderDepartedList() {
    const searchQuery = (document.getElementById('searchDeparted').value || '').trim().toLowerCase();
    const destFilter = document.getElementById('filterDestination').value;

    const departed = appState.drivers
        .filter(d => d.status === 'DEPARTED')
        .filter(d => destFilter === 'ALL' || d.destination === destFilter)
        .filter(d => d.name.toLowerCase().includes(searchQuery) || d.busNum.toLowerCase().includes(searchQuery));

    const tbody = document.getElementById('departedTableBody');
    const mobileCards = document.getElementById('departedCardsMobile');
    const emptyState = document.getElementById('emptyDeparted');

    tbody.innerHTML = '';
    mobileCards.innerHTML = '';

    if (departed.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');

        departed.forEach(driver => {
            const departTimeStr = new Date(driver.departTime).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' });

            // Table Row
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-slate-50';
            tr.innerHTML = `
                <td class="p-3 font-bold text-slate-800">${escapeHtml(driver.name)}</td>
                <td class="p-3"><span class="font-mono text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200">${escapeHtml(driver.busNum)}</span></td>
                <td class="p-3"><span class="bg-brand-50 text-brand-700 text-xs font-bold px-2.5 py-1 rounded-full">${escapeHtml(driver.destination)}</span></td>
                <td class="p-3 font-extrabold text-slate-700">${driver.passengers} راكب</td>
                <td class="p-3 text-xs text-slate-500">${departTimeStr}</td>
                <td class="p-3 text-center">
                    <button onclick="revertToWaiting('${driver.id}')" class="text-xs text-amber-600 hover:text-amber-800 font-bold bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition" title="إعادة للطابور">
                        <i class="fa-solid fa-rotate-left"></i> إلغاء المغادرة
                    </button>
                </td>
            `;
            tbody.appendChild(tr);

            // Mobile Card
            const card = document.createElement('div');
            card.className = 'p-4 bg-white space-y-2';
            card.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-bold text-slate-800 text-sm">${escapeHtml(driver.name)}</h4>
                        <p class="text-xs font-mono text-slate-500">${escapeHtml(driver.busNum)}</p>
                    </div>
                    <span class="bg-brand-50 text-brand-700 text-xs font-bold px-2.5 py-0.5 rounded-full">${escapeHtml(driver.destination)}</span>
                </div>
                <div class="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div>
                        <span class="font-extrabold text-emerald-600">${driver.passengers} راكب</span> | غادر: ${departTimeStr}
                    </div>
                    <button onclick="revertToWaiting('${driver.id}')" class="text-amber-600 font-bold text-xs bg-amber-50 px-2 py-1 rounded border border-amber-200">
                        إرجاع للطابور
                    </button>
                </div>
            `;
            mobileCards.appendChild(card);
        });
    }
}

// Stats & Reports Calculation
function updateStatsAndReports() {
    const waiting = appState.drivers.filter(d => d.status === 'WAITING');
    const departed = appState.drivers.filter(d => d.status === 'DEPARTED');
    
    const totalPassengers = departed.reduce((sum, d) => sum + (parseInt(d.passengers) || 0), 0);

    // Dashboard Badges
    document.getElementById('statWaiting').innerText = waiting.length;
    document.getElementById('statDeparted').innerText = departed.length;
    document.getElementById('statPassengers').innerText = totalPassengers;
    document.getElementById('statTotal').innerText = appState.drivers.length;

    document.getElementById('badgeWaiting').innerText = waiting.length;
    document.getElementById('badgeDeparted').innerText = departed.length;

    // Report Tab Data
    document.getElementById('repTotalBuses').innerText = appState.drivers.length;
    document.getElementById('repDepartedBuses').innerText = departed.length;
    document.getElementById('repWaitingBuses').innerText = waiting.length;

    const avgPass = departed.length > 0 ? (totalPassengers / departed.length).toFixed(1) : '0';
    document.getElementById('repAvgPassengers').innerText = avgPass;

    // Destination Breakdown
    const destMap = {};
    departed.forEach(d => {
        destMap[d.destination] = (destMap[d.destination] || 0) + 1;
    });

    const destContainer = document.getElementById('destinationsBreakdown');
    destContainer.innerHTML = '';
    if (Object.keys(destMap).length === 0) {
        destContainer.innerHTML = '<p class="text-slate-400 text-xs">لا توجد رحلات مغادرة بعد.</p>';
    } else {
        for (const [dest, count] of Object.entries(destMap)) {
            const row = document.createElement('div');
            row.className = 'flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200';
            row.innerHTML = `
                <span class="font-bold text-slate-700">${dest}</span>
                <span class="bg-brand-100 text-brand-800 px-2 py-0.5 rounded font-extrabold text-xs">${count} رحلة</span>
            `;
            destContainer.appendChild(row);
        }
    }

    // Print Summary Table
    const repTable = document.getElementById('reportTableBody');
    repTable.innerHTML = '';
    if (departed.length === 0) {
        repTable.innerHTML = '<tr><td colspan="6" class="p-3 text-center text-slate-400">لا توجد رحلات مسجلة اليوم</td></tr>';
    } else {
        departed.forEach((driver, idx) => {
            const tr = document.createElement('tr');
            const dTime = new Date(driver.departTime).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' });
            tr.innerHTML = `
                <td class="p-2 border-l border-slate-200 text-center">${idx + 1}</td>
                <td class="p-2 border-l border-slate-200 font-bold">${escapeHtml(driver.name)}</td>
                <td class="p-2 border-l border-slate-200 font-mono">${escapeHtml(driver.busNum)}</td>
                <td class="p-2 border-l border-slate-200">${escapeHtml(driver.destination)}</td>
                <td class="p-2 border-l border-slate-200 font-bold text-center">${driver.passengers}</td>
                <td class="p-2 text-center">${dTime}</td>
            `;
            repTable.appendChild(tr);
        });
    }
}

// Tab Switching Logic
function switchTab(tabName) {
    const tabs = ['waiting', 'departed', 'reports'];
    tabs.forEach(t => {
        const section = document.getElementById('section' + capitalize(t));
        const btn = document.getElementById('tab' + capitalize(t) + 'Btn');
        
        if (t === tabName) {
            section.classList.remove('hidden');
            btn.className = "flex-1 py-2.5 rounded-xl transition duration-200 flex items-center justify-center gap-2 bg-white text-brand-700 shadow-sm font-bold";
        } else {
            section.classList.add('hidden');
            btn.className = "flex-1 py-2.5 rounded-xl transition duration-200 flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900";
        }
    });
}

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

// Add Driver Action
function handleAddDriver(e) {
    e.preventDefault();
    const name = document.getElementById('driverName').value.trim();
    const busNum = document.getElementById('busNumber').value.trim();
    const phone = document.getElementById('driverPhone').value.trim();

    if (!name || !busNum) return;

    const newDriver = {
        id: Date.now().toString(),
        name: name,
        busNum: busNum,
        phone: phone,
        regTime: new Date().toISOString(),
        status: 'WAITING'
    };

    appState.drivers.push(newDriver);
    saveToStorage();
    renderAll();

    document.getElementById('addDriverForm').reset();
    closeModal('addDriverModal');
    showToast(`تم تسجيل السائق (${name}) في الدور بنجاح.`);
}

// Open Departure Modal for specific driver
function openDepartModal(driverId) {
    const driver = appState.drivers.find(d => d.id === driverId);
    if (!driver) return;

    document.getElementById('departDriverId').value = driver.id;
    document.getElementById('departDriverName').innerText = driver.name;
    document.getElementById('departBusInfo').innerText = `الباص: ${driver.busNum}`;

    openModal('departModal');
}

// Confirm Departure Action
function handleDepartDriver(e) {
    e.preventDefault();
    const id = document.getElementById('departDriverId').value;
    const dest = document.getElementById('departDestination').value;
    const count = parseInt(document.getElementById('passengerCount').value) || 14;

    const driver = appState.drivers.find(d => d.id === id);
    if (driver) {
        driver.status = 'DEPARTED';
        driver.destination = dest;
        driver.passengers = count;
        driver.departTime = new Date().toISOString();

        saveToStorage();
        renderAll();
        closeModal('departModal');
        showToast(`تم تسجيل مغادرة الباص إلى (${dest}) بـ ${count} راكب.`);
    }
}

// Revert Departed Driver back to Waiting
function revertToWaiting(driverId) {
    const driver = appState.drivers.find(d => d.id === driverId);
    if (driver) {
        driver.status = 'WAITING';
        delete driver.destination;
        delete driver.passengers;
        delete driver.departTime;

        saveToStorage();
        renderAll();
        showToast(`تم إرجاع السائق (${driver.name}) إلى طابور الانتظار.`);
    }
}

// Delete Driver from Queue
function deleteDriver(driverId) {
    const driver = appState.drivers.find(d => d.id === driverId);
    if (driver) {
        appState.drivers = appState.drivers.filter(d => d.id !== driverId);
        saveToStorage();
        renderAll();
        showToast(`تم حذف السائق (${driver.name}) من الكشف.`);
    }
}

// Reset Day Data
function resetDayData() {
    appState.drivers = [];
    saveToStorage();
    renderAll();
    closeModal('resetConfirmModal');
    showToast('تم بدء يوم جديد وتم مسح كافة السجلات الحالية.');
}

// Modal Helpers
function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Toast Notifications
let toastTimeout;
function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').innerText = message;
    
    toast.classList.remove('hidden');
    
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        hideToast();
    }, 3500);
}

function hideToast() {
    document.getElementById('toast').classList.add('hidden');
}

// Security Utility for XSS protection
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}

// ==========================================
// VOICE TTS & CHIME ENGINE (YEMENI FARZA)
// ==========================================
let lastAnnouncementText = '';
let arabicVoices = [];

// Load voices dynamically on supported browsers
function initVoiceEngine() {
    if ('speechSynthesis' in window) {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            arabicVoices = voices.filter(v => v.lang.startsWith('ar') || v.lang.includes('AR'));
        };
        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }
}
initVoiceEngine();

// 1. Professional Two-Tone Chime (Web Audio API - Pure synthesized station chime)
function playStationChime() {
    return new Promise((resolve) => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return resolve();
            const ctx = new AudioContext();
            const now = ctx.currentTime;

            // First Tone: 587.33 Hz (D5)
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(587.33, now);
            gain1.gain.setValueAtTime(0.28, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.4);

            // Second Tone: 880.00 Hz (A5)
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(880.00, now + 0.22);
            gain2.gain.setValueAtTime(0.32, now + 0.22);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now + 0.22);
            osc2.stop(now + 0.85);

            setTimeout(resolve, 650);
        } catch (e) {
            resolve();
        }
    });
}

// 2. Phonetic tuning for Yemeni dialect & Terminal Terms
function optimizeForArabicSpeech(text) {
    let t = text;
    // Diacritics and phonetic replacements
    t = t.replace(/الفرزة/g, 'الفَرْزَة');
    t = t.replace(/فرزة/g, 'فَرْزَة');
    t = t.replace(/الهايص/g, 'الهَايْس');
    t = t.replace(/هايص/g, 'هَايْس');
    t = t.replace(/أبين/g, 'أَبْيَن');
    t = t.replace(/زنجبار/g, 'زِنْجِبَار');
    t = t.replace(/جعار/g, 'جِعَار');
    t = t.replace(/شقرة/g, 'شُقْرَة');
    t = t.replace(/لودر/g, 'لَوْدَر');
    t = t.replace(/المحفد/g, 'المَحْفَد');
    t = t.replace(/الشيخ عثمان/g, 'الشَّيْخ عُثْمَان');

    // Format bus number plates with clear pauses between digits
    t = t.replace(/(\d+)\s*\/\s*([\u0621-\u064A]+)/g, function(match, nums, city) {
        const spaced = nums.split('').join(' ');
        return 'رقم ' + spaced + ' ' + city;
    });

    return t;
}

// 3. Core Text-to-Speech Invoker
async function speakArabicAnnouncement(rawText, title = 'نداء فرزة أبين') {
    const cleanText = rawText.trim();
    if (!cleanText) return;

    // Trigger Browser Notification
    if ('Notification' in window && Notification.permission === 'granted') {
        try {
            new Notification(title, {
                body: cleanText,
                icon: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png'
            });
        } catch (e) {
            console.log('Notification error:', e);
        }
    }

    // Play station bell chime first
    await playStationChime();

    const spokenText = optimizeForArabicSpeech(cleanText);

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(spokenText);
        utter.lang = 'ar';
        utter.rate = 0.93; // Clear, deliberate pace for noisy bus terminal
        utter.pitch = 1.0;

        // Pick the best available Arabic voice
        if (arabicVoices.length > 0) {
            const preferred = arabicVoices.find(v => v.lang.includes('YE')) ||
                              arabicVoices.find(v => v.lang.includes('SA')) ||
                              arabicVoices[0];
            utter.voice = preferred;
        }

        window.speechSynthesis.speak(utter);
    } else {
        // Fallback to Google Translate TTS audio element
        try {
            const url = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=ar&client=tw-ob&q=' + encodeURIComponent(spokenText);
            const audio = new Audio(url);
            audio.play();
        } catch (err) {
            console.error('Audio playback fallback failed:', err);
        }
    }

    // Record last announcement banner
    lastAnnouncementText = cleanText;
    const repeatBtn = document.getElementById('repeatCallBtn');
    const lastBanner = document.getElementById('lastCallBanner');
    const lastTextEl = document.getElementById('lastCallText');
    const lastTimeEl = document.getElementById('lastCallTime');

    if (repeatBtn) repeatBtn.disabled = false;
    if (lastBanner) lastBanner.classList.remove('hidden');
    if (lastTextEl) lastTextEl.innerText = cleanText;
    if (lastTimeEl) lastTimeEl.innerText = new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' });
}

// 4. Call Next Driver in Waiting Queue
function callNextDriverInQueue() {
    const waiting = appState.drivers.filter(d => d.status === 'WAITING');
    if (waiting.length === 0) {
        showToast('لا يوجد سائقين في طابور الانتظار حالياً');
        return;
    }
    const first = waiting[0];
    const msg = `الدور الآن على السائق ${first.name}، صاحب باص رقم ${first.busNum}، التوجه فوراً للتحميل في الفَرْزَة`;
    speakArabicAnnouncement(msg, 'نداء دور السائق');
    showToast(`تم إطلاق نداء صوتي للسائق: ${first.name}`);
}

// 5. Call Single Driver from Row
function callSingleDriverVoice(driverId) {
    const driver = appState.drivers.find(d => d.id === driverId);
    if (!driver) return;
    const msg = `نداء للسائق ${driver.name}، صاحب باص رقم ${driver.busNum}، يرجى التوجه لمكتب الفَرْزَة`;
    speakArabicAnnouncement(msg, `نداء السائق ${driver.name}`);
    showToast(`تم إطلاق النداء الصوتي للسائق: ${driver.name}`);
}

// 6. Repeat Last Call
function repeatLastCall() {
    if (!lastAnnouncementText) {
        showToast('لم يتم إطلاق أي نداء سابق لإعادته');
        return;
    }
    speakArabicAnnouncement(lastAnnouncementText, 'إعادة النداء');
    showToast('تمت إعادة بث النداء الصوتي');
}

// 7. Custom Broadcast
function broadcastCustomAdminMessage() {
    const input = document.getElementById('customBroadcastInput');
    const msg = (input ? input.value : '').trim();
    if (!msg) {
        showToast('يرجى كتابة نص النداء أولاً');
        return;
    }
    speakArabicAnnouncement(msg, 'إعلان عام من إدارة الفرزة');
    showToast('تم بث النداء المخصص بنجاح');
    input.value = '';
}

// 8. Quick Broadcast Helper
function quickBroadcast(sampleText) {
    const input = document.getElementById('customBroadcastInput');
    if (input) input.value = sampleText;
    speakArabicAnnouncement(sampleText, 'إعلان من إدارة الفرزة');
    showToast('تم بث النداء');
}

// 9. Audio Test
function testAudioEngine() {
    speakArabicAnnouncement('تجربة نظام النداء الصوتي لفرزة أبين، الصوت يعمل بنجاح وبوضوح', 'فحص الصوت');
}

// 10. Web Notification Permission
function requestNotificationPermission() {
    if (!('Notification' in window)) {
        showToast('المتصفح لا يدعم نظام إشعارات سطح المكتب');
        return;
    }
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            showToast('تم تفعيل إشعارات النداء بنجاح');
            const btn = document.getElementById('notifyBtn');
            if (btn) btn.innerHTML = '<i class="fa-solid fa-bell-check text-emerald-400"></i> الإشعارات مفعلة';
        } else {
            showToast('لم يتم منح إذن الإشعارات');
        }
    });
}
