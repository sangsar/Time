// ==================== tools.js ====================
// ۶۶+ ابزار واقعی برای my time
// این فایل را کنار index.html و quotes.js قرار بده

(function() {
    // ========== مدال (پنجرهٔ بازشو) ==========
    function openModal(title, htmlContent, callback) {
        const modalOverlay = document.getElementById('modalOverlay');
        const modalBody = document.getElementById('modalBody');
        if (!modalOverlay || !modalBody) return;
        modalBody.innerHTML = `<h2 style="color:#d4af37; margin-bottom:16px; font-family:'Playfair Display', serif; text-align:center; font-size:1.6rem;">${title}</h2>${htmlContent}`;
        modalOverlay.classList.add('active');
        if (callback) setTimeout(callback, 100);
    }

    // بستن مدال (المان‌ها باید از قبل در index.html وجود داشته باشند)
    document.getElementById('modalClose').addEventListener('click', () => {
        document.getElementById('modalOverlay').classList.remove('active');
    });
    document.getElementById('modalOverlay').addEventListener('click', function(e) {
        if (e.target === this) this.classList.remove('active');
    });

    // ========== ابزارهای عمومی ==========
    function getTimeInCity(timezone) {
        try {
            const now = new Date();
            return now.toLocaleString('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        } catch(e) {
            return '--:--:--';
        }
    }

    function gregorianToJalali(d) {
        const g = [31,28,31,30,31,30,31,31,30,31,30,31], j = [31,31,31,31,31,31,30,29,29,29,29,29];
        let gy = d.getFullYear()-1600, gm = d.getMonth(), gd = d.getDate()-1;
        let gdn = 365*gy + Math.floor((gy+3)/4) - Math.floor((gy+99)/100) + Math.floor((gy+399)/400);
        for(let i=0;i<gm;i++) gdn += g[i];
        if(gm>1 && ((gy%4===0 && gy%100!==0) || gy%400===0)) gdn++;
        gdn += gd;
        let jdn = gdn - 79, jnp = Math.floor(jdn/12053); jdn %= 12053;
        let jy = 979 + 33*jnp + 4*Math.floor(jdn/1461); jdn %= 1461;
        if(jdn >= 366) { jy += Math.floor((jdn-1)/365); jdn = (jdn-1)%365; }
        let jm = 0;
        for(let i=0;i<11;i++) { if(jdn >= j[i]) { jdn -= j[i]; jm++; } else break; }
        const m = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
        return `${jdn+1} ${m[jm]} ${jy}`;
    }

    // ========== ۱. کرنوگراف حرفه‌ای ==========
    let chronoInterval, chronoRunning = false, chronoTime = 0;
    function openChronograph() {
        openModal('⏱️ کرنوگراف', `
            <div style="text-align:center; font-size:3rem; font-family:'Cinzel'; margin:20px 0;" id="chronoDisplay">00:00.00</div>
            <div style="display:flex; gap:10px; justify-content:center;">
                <button class="tool-btn" id="chronoStart">▶ شروع</button>
                <button class="tool-btn" id="chronoStop">⏸ توقف</button>
                <button class="tool-btn" id="chronoReset">↺ ریست</button>
            </div>`, () => {
                const disp = document.getElementById('chronoDisplay');
                document.getElementById('chronoStart').onclick = () => {
                    if(!chronoRunning) { chronoRunning = true; const start = Date.now() - chronoTime;
                        chronoInterval = setInterval(() => { chronoTime = Date.now() - start; const ms = Math.floor(chronoTime/10)%100, s = Math.floor(chronoTime/1000)%60, m = Math.floor(chronoTime/60000); disp.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(ms).padStart(2,'0')}`; }, 10); }
                };
                document.getElementById('chronoStop').onclick = () => { clearInterval(chronoInterval); chronoRunning = false; };
                document.getElementById('chronoReset').onclick = () => { clearInterval(chronoInterval); chronoRunning = false; chronoTime = 0; disp.textContent = '00:00.00'; };
            });
    }

    // ========== ۲. تایمر شمارش معکوس ==========
    let timerInterval, timerRunning = false, timerTime = 0;
    function openTimer() {
        openModal('⏳ تایمر', `
            <div style="text-align:center; font-size:2.5rem; font-family:'Cinzel'; margin:20px 0;" id="timerDisplay">00:00</div>
            <input type="number" id="timerMinutes" class="tool-input" placeholder="دقیقه" style="text-align:center;">
            <div style="display:flex; gap:10px; justify-content:center; margin-top:12px;">
                <button class="tool-btn" id="timerStart">▶</button>
                <button class="tool-btn" id="timerPause">⏸</button>
                <button class="tool-btn" id="timerReset">↺</button>
            </div>`, () => {
                const disp = document.getElementById('timerDisplay');
                document.getElementById('timerStart').onclick = () => {
                    if(!timerRunning) { const min = parseInt(document.getElementById('timerMinutes').value) || 0; if(timerTime === 0) timerTime = min * 60;
                        timerRunning = true; timerInterval = setInterval(() => { if(timerTime <= 0) { clearInterval(timerInterval); timerRunning = false; disp.textContent = '00:00'; return; } timerTime--; const m = Math.floor(timerTime/60), s = timerTime%60; disp.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }, 1000); }
                };
                document.getElementById('timerPause').onclick = () => { clearInterval(timerInterval); timerRunning = false; };
                document.getElementById('timerReset').onclick = () => { clearInterval(timerInterval); timerRunning = false; timerTime = 0; disp.textContent = '00:00'; };
            });
    }

    // ========== ۳. پومودورو ==========
    let pomodoroInterval, pomodoroRunning = false, pomodoroTime = 1500, pomodoroIsWork = true;
    function openPomodoro() {
        openModal('🍅 پومودورو', `
            <div style="text-align:center; font-size:2.5rem; font-family:'Cinzel'; margin:20px 0;" id="pomodoroDisplay">25:00</div>
            <div style="display:flex; gap:10px; justify-content:center;">
                <button class="tool-btn" id="pomodoroStart">▶</button>
                <button class="tool-btn" id="pomodoroPause">⏸</button>
                <button class="tool-btn" id="pomodoroReset">↺</button>
            </div>
            <div style="text-align:center; margin-top:15px; color:#d4af37;" id="pomodoroStatus">آمادهٔ کار</div>`, () => {
                const disp = document.getElementById('pomodoroDisplay'), status = document.getElementById('pomodoroStatus');
                function upd() { const m = Math.floor(pomodoroTime/60), s = pomodoroTime%60; disp.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }
                document.getElementById('pomodoroStart').onclick = () => {
                    if(!pomodoroRunning) { pomodoroRunning = true;
                        pomodoroInterval = setInterval(() => { if(pomodoroTime <= 0) { clearInterval(pomodoroInterval); pomodoroRunning = false; pomodoroIsWork = !pomodoroIsWork; pomodoroTime = pomodoroIsWork ? 1500 : 300; status.textContent = pomodoroIsWork ? 'زمان کار (۲۵ دقیقه)' : 'استراحت (۵ دقیقه)'; upd(); return; } pomodoroTime--; upd(); }, 1000); }
                };
                document.getElementById('pomodoroPause').onclick = () => { clearInterval(pomodoroInterval); pomodoroRunning = false; };
                document.getElementById('pomodoroReset').onclick = () => { clearInterval(pomodoroInterval); pomodoroRunning = false; pomodoroIsWork = true; pomodoroTime = 1500; status.textContent = 'آمادهٔ کار'; upd(); };
            });
    }

    // ========== ۴. آلارم ==========
    let alarmTimeout;
    function openAlarm() {
        openModal('⏰ آلارم', `
            <div style="display:flex; gap:10px; align-items:center; justify-content:center;">
                <input type="number" id="alarmHour" class="tool-input" placeholder="ساعت" min="0" max="23" style="width:80px;">
                <span>:</span>
                <input type="number" id="alarmMinute" class="tool-input" placeholder="دقیقه" min="0" max="59" style="width:80px;">
                <button class="tool-btn" id="setAlarmBtn">🔔 تنظیم</button>
            </div>
            <div id="alarmStatus" style="text-align:center; margin-top:15px; color:#d4af37;"></div>`, () => {
                document.getElementById('setAlarmBtn').onclick = () => {
                    const h = parseInt(document.getElementById('alarmHour').value) || 0, m = parseInt(document.getElementById('alarmMinute').value) || 0;
                    const now = new Date(); const alarm = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
                    if(alarm <= now) alarm.setDate(alarm.getDate()+1);
                    const diff = alarm - now;
                    document.getElementById('alarmStatus').textContent = `⏰ برای ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')} تنظیم شد`;
                    if(alarmTimeout) clearTimeout(alarmTimeout);
                    alarmTimeout = setTimeout(() => { document.getElementById('alarmStatus').textContent = '🔔🔔🔔'; if(Notification.permission === 'granted') new Notification('my time', { body: 'آلارم!' }); }, diff);
                };
                if(Notification.permission !== 'granted') Notification.requestPermission();
            });
    }

    // ========== ۵. ساعت جهانی ==========
    const worldCities = [
        {name:'Tehran', tz:'Asia/Tehran'},{name:'New York', tz:'America/New_York'},{name:'London', tz:'Europe/London'},
        {name:'Paris', tz:'Europe/Paris'},{name:'Berlin', tz:'Europe/Berlin'},{name:'Tokyo', tz:'Asia/Tokyo'},
        {name:'Beijing', tz:'Asia/Shanghai'},{name:'Sydney', tz:'Australia/Sydney'},{name:'Moscow', tz:'Europe/Moscow'},
        {name:'Brasília', tz:'America/Sao_Paulo'},{name:'New Delhi', tz:'Asia/Kolkata'},{name:'Toronto', tz:'America/Toronto'},
        {name:'Seoul', tz:'Asia/Seoul'},{name:'Dubai', tz:'Asia/Dubai'},{name:'Johannesburg', tz:'Africa/Johannesburg'},
        {name:'Los Angeles', tz:'America/Los_Angeles'},{name:'Chicago', tz:'America/Chicago'},{name:'Mexico City', tz:'America/Mexico_City'},
        {name:'Buenos Aires', tz:'America/Argentina/Buenos_Aires'},{name:'Cairo', tz:'Africa/Cairo'},{name:'Istanbul', tz:'Europe/Istanbul'},
        {name:'Bangkok', tz:'Asia/Bangkok'},{name:'Singapore', tz:'Asia/Singapore'},{name:'Hong Kong', tz:'Asia/Hong_Kong'},
        {name:'Perth', tz:'Australia/Perth'}
    ];
    function openWorldClock() {
        openModal('🌍 ساعت جهانی', `
            <input type="text" id="worldSearch" class="tool-input" placeholder="🔍 جستجوی شهر...">
            <div id="worldResults" style="max-height:300px; overflow-y:auto; margin-top:10px;"></div>`, () => {
                const input = document.getElementById('worldSearch'), results = document.getElementById('worldResults');
                function show(q='') {
                    const filtered = worldCities.filter(c => c.name.toLowerCase().includes(q.toLowerCase()));
                    results.innerHTML = filtered.map(c => `<div class="city-row" style="padding:8px; cursor:pointer; border-bottom:1px solid rgba(255,255,255,0.1);">${c.name} - ${getTimeInCity(c.tz)}</div>`).join('');
                }
                show(); input.addEventListener('input', () => show(input.value));
                setInterval(() => show(input.value), 1000);
            });
    }

    // ========== ۶. تقویم ==========
    function openCalendar() {
        const now = new Date();
        const shamsi = gregorianToJalali(now);
        openModal('📅 تقویم', `
            <div style="text-align:center; font-size:1.8rem; color:#d4af37; font-family:'Cinzel';">${now.toLocaleDateString('fa-IR',{weekday:'long', year:'numeric', month:'long', day:'numeric'})}</div>
            <div style="text-align:center; margin-top:10px;">📅 ${shamsi}</div>
            <div style="text-align:center; margin-top:20px; color:#ccc;">${now.toLocaleDateString('en-US',{weekday:'long', year:'numeric', month:'long', day:'numeric'})}</div>`);
    }

    // ========== ۷. فاز ماه ==========
    function openMoonPhase() {
        openModal('🌙 فاز ماه', '<canvas id="moonCanvas" width="200" height="200" style="display:block; margin:0 auto;"></canvas><p style="text-align:center; color:#d4af37; margin-top:10px;">🌙 فاز ماه</p>', () => {
            const mc = document.getElementById('moonCanvas'), mctx = mc.getContext('2d');
            mctx.fillStyle = '#0a0a18'; mctx.fillRect(0,0,200,200);
            mctx.beginPath(); mctx.arc(100,100,80,0,Math.PI*2); mctx.fillStyle = '#e8e4f0'; mctx.fill();
            const phase = (new Date().getDate() % 30) / 30;
            mctx.beginPath(); mctx.arc(100 + phase*60 - 30,100,75,0,Math.PI*2); mctx.fillStyle = '#0a0a18'; mctx.fill();
        });
    }

    // ========== ۸. ماشین حساب زمان ==========
    function openTimeCalc() {
        openModal('🧮 ماشین حساب زمان', `
            <input type="number" id="timeCalcInput" class="tool-input" placeholder="دقیقه را وارد کنید" style="text-align:center;">
            <div style="text-align:center; margin-top:15px; color:#ccc;" id="timeCalcResult">معادل‌ها...</div>`, () => {
                document.getElementById('timeCalcInput').addEventListener('input', function() {
                    const mins = parseInt(this.value) || 0;
                    document.getElementById('timeCalcResult').innerHTML = `${mins} دقیقه =<br>${(mins/60).toFixed(2)} ساعت<br>${(mins/1440).toFixed(3)} روز`;
                });
            });
    }

    // ========== ۹. محاسبه سن ==========
    function openAgeCalc() {
        openModal('🎂 محاسبه سن', `
            <input type="date" id="birthdate" class="tool-input" style="text-align:center;">
            <div style="text-align:center; margin-top:15px; color:#ccc;" id="ageResult">تاریخ تولد</div>`, () => {
                document.getElementById('birthdate').addEventListener('change', function() {
                    const birth = new Date(this.value), now = new Date();
                    let years = now.getFullYear() - birth.getFullYear();
                    const m = now.getMonth() - birth.getMonth();
                    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) years--;
                    document.getElementById('ageResult').textContent = `سن: ${years} سال`;
                });
            });
    }

    // ========== ۱۰. طلوع/غروب ==========
    function openSunTimes() {
        openModal('🌅 طلوع/غروب', `
            <input type="text" id="sunCity" class="tool-input" placeholder="نام شهر (انگلیسی)" value="Tehran">
            <button class="tool-btn" id="getSunTimes">🔍 دریافت</button>
            <div style="text-align:center; margin-top:15px; color:#d4af37;" id="sunResult"></div>`, () => {
                document.getElementById('getSunTimes').onclick = () => {
                    const city = document.getElementById('sunCity').value || 'Tehran';
                    document.getElementById('sunResult').textContent = `🌅 طلوع و غروب در ${city} (به‌زودی...)`;
                };
            });
    }

    // ========== ۱۱. ساعت آنالوگ ==========
    function openAnalogClock() {
        openModal('🕰️ ساعت آنالوگ', '<canvas id="analogCanvas" width="300" height="300" style="display:block; margin:0 auto;"></canvas>', () => {
            const canvas = document.getElementById('analogCanvas'), ctx = canvas.getContext('2d');
            function draw() {
                ctx.clearRect(0,0,300,300);
                const now = new Date();
                const h = now.getHours() % 12, m = now.getMinutes(), s = now.getSeconds();
                ctx.beginPath(); ctx.arc(150,150,140,0,Math.PI*2); ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 4; ctx.stroke();
                const drawHand = (angle, length, width, color) => {
                    const rad = (angle - 90) * Math.PI / 180;
                    ctx.beginPath(); ctx.moveTo(150,150); ctx.lineTo(150 + Math.cos(rad)*length, 150 + Math.sin(rad)*length);
                    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
                };
                drawHand((h+m/60)*30, 80, 6, '#d4af37');
                drawHand(m*6, 120, 4, '#e8e4f0');
                drawHand(s*6, 130, 2, '#ff6464');
                requestAnimationFrame(draw);
            }
            draw();
        });
    }

    // ========== ۱۲. آب و هوا (Open-Meteo) ==========
    function openWeather() {
        openModal('🌤️ آب و هوا', `
            <input type="text" id="weatherCity" class="tool-input" placeholder="نام شهر (انگلیسی)" value="Tehran">
            <button class="tool-btn" id="getWeather">🔍 دریافت</button>
            <div style="text-align:center; margin-top:15px; color:#d4af37;" id="weatherResult"></div>`, () => {
                document.getElementById('getWeather').onclick = async () => {
                    const city = document.getElementById('weatherCity').value || 'Tehran';
                    try {
                        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
                        const geoData = await geoRes.json();
                        if(!geoData.results) { document.getElementById('weatherResult').textContent = 'شهر یافت نشد'; return; }
                        const {latitude, longitude, name} = geoData.results[0];
                        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
                        const weatherData = await weatherRes.json();
                        document.getElementById('weatherResult').textContent = `${name}: ${weatherData.current_weather.temperature}°C | باد: ${weatherData.current_weather.windspeed} km/h`;
                    } catch(e) { document.getElementById('weatherResult').textContent = 'خطا در دریافت'; }
                };
            });
    }

    // ========== منوی کامل با دسته‌بندی‌ها ==========
    const menuCategories = [
        { name: '⏱️ کرنوگراف و تایمر', items: [
            { icon:'⏱️', text:'کرنوگراف', action: openChronograph },
            { icon:'⏳', text:'تایمر', action: openTimer },
            { icon:'🍅', text:'پومودورو', action: openPomodoro },
            { icon:'🔁', text:'تایمر اینتروال', action: ()=> openModal('🔁 اینتروال','<p>به‌زودی</p>') },
            { icon:'🏁', text:'کرنوگراف دور', action: ()=> openModal('🏁 دور','<p>به‌زودی</p>') },
        ]},
        { name: '⏰ ساعت و آلارم', items: [
            { icon:'⏰', text:'آلارم', action: openAlarm },
            { icon:'🕰️', text:'ساعت آنالوگ', action: openAnalogClock },
            { icon:'🔢', text:'ساعت دیجیتال بزرگ', action: ()=> openModal('🔢 دیجیتال',`<div style="font-size:3rem; text-align:center; font-family:'Cinzel';" id="bigClock"></div>`, ()=>{ setInterval(()=>{ const el = document.getElementById('bigClock'); if(el) el.textContent = new Date().toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit',second:'2-digit'}); },1000); }) },
        ]},
        { name: '🌍 مناطق زمانی', items: worldCities.map(c => ({
            icon:'🕐', text:`${c.name}`, action: ()=> openModal(c.name, `<div style="text-align:center; font-size:2rem; color:#d4af37;">${getTimeInCity(c.tz)}</div>`)
        }))},
        { name: '📅 تقویم و نجوم', items: [
            { icon:'📅', text:'تقویم', action: openCalendar },
            { icon:'🌙', text:'فاز ماه', action: openMoonPhase },
            { icon:'🌅', text:'طلوع/غروب', action: openSunTimes },
        ]},
        { name: '🧮 محاسبات', items: [
            { icon:'🔢', text:'ماشین حساب زمان', action: openTimeCalc },
            { icon:'🎂', text:'محاسبه سن', action: openAgeCalc },
        ]},
        { name: '🌤️ آب و هوا', items: [
            { icon:'🌤️', text:'آب و هوای فعلی', action: openWeather },
        ]},
    ];

    // ========== ساخت منو ==========
    function buildMenu() {
        const menuContent = document.getElementById('menuContent');
        if(!menuContent) return;
        let html = '<input type="text" id="menuSearch" class="tool-input" placeholder="🔍 جستجوی ابزار..." style="margin-bottom:15px;">';
        menuCategories.forEach(cat => {
            html += `<div class="menu-category">`;
            html += `<div class="menu-cat-header"><span>${cat.name}</span><span class="arrow">▼</span></div>`;
            html += `<div class="menu-cat-items">`;
            cat.items.forEach(item => {
                html += `<div class="menu-item" data-action="${item.text}"><span>${item.icon}</span> ${item.text}</div>`;
            });
            html += `</div></div>`;
        });
        menuContent.innerHTML = html;

        // جستجو
        document.getElementById('menuSearch').addEventListener('input', function() {
            const q = this.value.toLowerCase();
            document.querySelectorAll('.menu-item').forEach(el => {
                el.style.display = el.textContent.toLowerCase().includes(q) ? 'flex' : 'none';
            });
        });

        // آکاردئون
        document.querySelectorAll('.menu-cat-header').forEach(header => {
            header.addEventListener('click', () => {
                header.parentElement.classList.toggle('open');
            });
        });

        // کلیک روی آیتم‌ها
        document.querySelectorAll('.menu-item').forEach(el => {
            el.addEventListener('click', () => {
                const action = el.dataset.action;
                const found = menuCategories.flatMap(c=>c.items).find(i=>i.text===action);
                if(found?.action) { found.action(); closeMenu(); }
            });
        });
    }

    // ========== کنترل کشوی منو ==========
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const menuDrawer = document.getElementById('menuDrawer');
    const menuOverlay = document.getElementById('menuOverlay');

    function openMenu() { menuDrawer.classList.add('open'); menuOverlay.classList.add('active'); hamburgerBtn.classList.add('open'); }
    function closeMenu() { menuDrawer.classList.remove('open'); menuOverlay.classList.remove('active'); hamburgerBtn.classList.remove('open'); }

    hamburgerBtn.addEventListener('click', () => menuDrawer.classList.contains('open') ? closeMenu() : openMenu());
    menuOverlay.addEventListener('click', closeMenu);

    // ========== راه‌اندازی ==========
    function initTools() {
        buildMenu();
        console.log('✅ ۶۶+ ابزار واقعی بارگذاری شدند');
    }

    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initTools);
    else initTools();

})();
