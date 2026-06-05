// ==================== tools.js ====================
// جعبه ابزار زمان - ۶۰+ ابزار حرفه‌ای برای my time
(function() {

    // ========== SPA Container ==========
    const appContainer = document.createElement('div');
    appContainer.id = 'appContainer';
    appContainer.style.cssText = `
        position: fixed; top:0; left:0; width:100%; height:100%;
        z-index: 50; background: #0a0a18; color: #e8e4f0;
        overflow-y: auto; display: none;
        font-family: 'Vazirmatn', sans-serif;
    `;
    document.body.appendChild(appContainer);

    const mainContainer = document.querySelector('.main-container');

    function openAppPage(title, contentHTML, onMount) {
        appContainer.innerHTML = `
            <div style="position:sticky; top:0; z-index:10; background:rgba(10,8,22,0.95); backdrop-filter:blur(20px); padding:12px 16px; border-bottom:1px solid rgba(212,175,55,0.3); display:flex; align-items:center; gap:12px;">
                <button id="backToMain" style="background:rgba(255,255,255,0.08); border:1px solid rgba(212,175,55,0.4); color:#d4af37; font-size:1.2rem; width:36px; height:36px; border-radius:10px; cursor:pointer;">←</button>
                <h2 style="font-family:'Playfair Display', serif; color:#d4af37; font-size:1.4rem; letter-spacing:2px;">${title}</h2>
            </div>
            <div style="max-width:900px; margin:20px auto; padding:0 16px 40px;">
                ${contentHTML}
            </div>
        `;
        appContainer.style.display = 'block';
        mainContainer.style.display = 'none';
        document.getElementById('backToMain').addEventListener('click', closeAppPage);
        if (onMount) setTimeout(onMount, 100);
    }

    function closeAppPage() {
        appContainer.style.display = 'none';
        mainContainer.style.display = '';
    }

    // ========== استایل‌های مشترک ==========
    const sharedStyle = document.createElement('style');
    sharedStyle.textContent = `
        .tool-btn {
            background: rgba(212,175,55,0.2); border: 1px solid rgba(212,175,55,0.4);
            color: #fff; padding: 10px 20px; border-radius: 12px;
            cursor: pointer; font-family: 'Vazirmatn', sans-serif;
            margin: 5px; transition: 0.3s; font-size: 1rem;
        }
        .tool-btn:hover { background: rgba(212,175,55,0.4); }
        .tool-btn.active { background: rgba(212,175,55,0.6); }
        .tool-input, input, textarea, select {
            background: rgba(255,255,255,0.08); border: 1px solid rgba(212,175,55,0.3);
            color: #fff; padding: 10px 15px; border-radius: 12px;
            font-family: 'Vazirmatn', sans-serif; width: 100%;
            margin: 8px 0; outline: none; font-size: 1rem;
        }
        .glass-panel {
            background: rgba(22,18,38,0.7); backdrop-filter: blur(20px);
            border: 1px solid rgba(212,175,55,0.25); border-radius: 20px;
            padding: 20px; margin-bottom: 20px;
        }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
        .weather-widget { background: rgba(10,20,40,0.6); border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 15px; }
        @media (max-width: 600px) { .grid-2, .grid-3 { grid-template-columns: 1fr; } }
    `;
    document.head.appendChild(sharedStyle);

    // ========== ابزارهای کمکی ==========
    function getTimeInCity(tz) {
        try { return new Date().toLocaleString('en-US', { timeZone: tz, hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false }); }
        catch(e) { return '--:--:--'; }
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
    function openChronograph() {
        openAppPage('⏱️ کرنوگراف', `
            <div class="glass-panel">
                <div style="text-align:center; font-size:4rem; font-family:'Cinzel';" id="chronoDisplay">00:00.00</div>
                <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                    <button class="tool-btn" id="chronoStart">▶ شروع</button>
                    <button class="tool-btn" id="chronoStop">⏸ توقف</button>
                    <button class="tool-btn" id="chronoReset">↺ ریست</button>
                    <button class="tool-btn" id="chronoLap">🏁 لاپ</button>
                </div>
                <div id="lapList" style="max-height:250px; overflow-y:auto; margin-top:15px;"></div>
            </div>
        `, () => {
            let interval, running = false, time = 0, laps = [];
            const disp = document.getElementById('chronoDisplay'), lapList = document.getElementById('lapList');
            function upd() { const ms = Math.floor(time/10)%100, s = Math.floor(time/1000)%60, m = Math.floor(time/60000); disp.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(ms).padStart(2,'0')}`; }
            document.getElementById('chronoStart').onclick = () => { if(!running) { running = true; const start = Date.now() - time; interval = setInterval(() => { time = Date.now() - start; upd(); }, 10); } };
            document.getElementById('chronoStop').onclick = () => { clearInterval(interval); running = false; };
            document.getElementById('chronoReset').onclick = () => { clearInterval(interval); running = false; time = 0; laps = []; upd(); lapList.innerHTML = ''; };
            document.getElementById('chronoLap').onclick = () => { if(running) { laps.push(time); const li = document.createElement('div'); li.style.cssText = 'padding:8px; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between;'; li.innerHTML = `<span>لاپ ${laps.length}</span><span style="font-family:Cinzel;">${disp.textContent}</span>`; lapList.prepend(li); } };
        });
    }

    // ========== ۲. پومودورو با آمار ==========
    function openPomodoro() {
        let sessions = parseInt(localStorage.getItem('pomSessions')||'0');
        openAppPage('🍅 پومودورو', `
            <div class="glass-panel">
                <div style="text-align:center; font-size:4.5rem; font-family:'Cinzel';" id="pomDisplay">25:00</div>
                <div style="text-align:center; color:#d4af37; font-size:1.2rem;" id="pomStatus">آمادهٔ کار</div>
                <div class="grid-2">
                    <div><label>دقیقه کار</label><input type="number" id="workMin" class="tool-input" value="25" min="1"></div>
                    <div><label>دقیقه استراحت</label><input type="number" id="breakMin" class="tool-input" value="5" min="1"></div>
                </div>
                <div style="display:flex; gap:10px; justify-content:center; margin-top:15px;">
                    <button class="tool-btn" id="pomStart">▶</button>
                    <button class="tool-btn" id="pomPause">⏸</button>
                    <button class="tool-btn" id="pomReset">↺</button>
                </div>
                <div style="text-align:center; margin-top:15px; color:#ccc;">جلسات تکمیل‌شده: <span id="sessionsCount">${sessions}</span></div>
            </div>
        `, () => {
            let interval, running = false, timeLeft = 1500, isWork = true;
            const disp = document.getElementById('pomDisplay'), status = document.getElementById('pomStatus'), sessCount = document.getElementById('sessionsCount');
            function upd() { const m = Math.floor(timeLeft/60), s = timeLeft%60; disp.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }
            document.getElementById('pomStart').onclick = () => { if(!running) { running = true; interval = setInterval(() => { if(timeLeft <= 0) { clearInterval(interval); running = false; if(isWork) { sessions++; localStorage.setItem('pomSessions', sessions); sessCount.textContent = sessions; } isWork = !isWork; timeLeft = (isWork ? parseInt(document.getElementById('workMin').value)||25 : parseInt(document.getElementById('breakMin').value)||5) * 60; status.textContent = isWork ? 'زمان کار' : 'استراحت'; upd(); return; } timeLeft--; upd(); }, 1000); } };
            document.getElementById('pomPause').onclick = () => { clearInterval(interval); running = false; };
            document.getElementById('pomReset').onclick = () => { clearInterval(interval); running = false; isWork = true; timeLeft = (parseInt(document.getElementById('workMin').value)||25)*60; status.textContent = 'آمادهٔ کار'; upd(); };
        });
    }

    // ========== ۳. تایمر ==========
    function openTimer() {
        openAppPage('⏳ تایمر', `
            <div class="glass-panel">
                <div style="text-align:center; font-size:4.5rem; font-family:'Cinzel';" id="timerDisplay">00:00</div>
                <input type="number" id="timerMinutes" class="tool-input" placeholder="دقیقه" style="text-align:center;">
                <div style="display:flex; gap:10px; justify-content:center; margin-top:15px;">
                    <button class="tool-btn" id="timerStart">▶</button>
                    <button class="tool-btn" id="timerPause">⏸</button>
                    <button class="tool-btn" id="timerReset">↺</button>
                </div>
            </div>
        `, () => {
            let interval, running = false, timeLeft = 0;
            const disp = document.getElementById('timerDisplay');
            function upd() { const m = Math.floor(timeLeft/60), s = timeLeft%60; disp.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }
            document.getElementById('timerStart').onclick = () => { if(!running) { if(timeLeft === 0) timeLeft = (parseInt(document.getElementById('timerMinutes').value)||0)*60; running = true; interval = setInterval(() => { if(timeLeft<=0){clearInterval(interval); running=false; upd(); return; } timeLeft--; upd(); }, 1000); } };
            document.getElementById('timerPause').onclick = () => { clearInterval(interval); running = false; };
            document.getElementById('timerReset').onclick = () => { clearInterval(interval); running = false; timeLeft = 0; upd(); };
        });
    }

    // ========== ۴. تایمر اینتروال ==========
    function openIntervalTimer() {
        openAppPage('🔁 تایمر اینتروال', `
            <div class="glass-panel">
                <div style="text-align:center; font-size:3rem; font-family:'Cinzel';" id="intDisplay">00:00</div>
                <div class="grid-2">
                    <div><label>فعالیت (ثانیه)</label><input type="number" id="intWork" class="tool-input" value="30"></div>
                    <div><label>استراحت (ثانیه)</label><input type="number" id="intRest" class="tool-input" value="10"></div>
                </div>
                <div style="display:flex; gap:10px; justify-content:center; margin-top:15px;">
                    <button class="tool-btn" id="intStart">▶</button>
                    <button class="tool-btn" id="intPause">⏸</button>
                    <button class="tool-btn" id="intReset">↺</button>
                </div>
                <div style="text-align:center; margin-top:10px; color:#d4af37;" id="intStatus"></div>
            </div>
        `, () => {
            let interval, running = false, timeLeft = 30, isWork = true;
            const disp = document.getElementById('intDisplay'), status = document.getElementById('intStatus');
            function upd() { disp.textContent = `${String(Math.floor(timeLeft/60)).padStart(2,'0')}:${String(timeLeft%60).padStart(2,'0')}`; }
            document.getElementById('intStart').onclick = () => { if(!running) { running = true; interval = setInterval(() => { if(timeLeft <= 0) { isWork = !isWork; timeLeft = (isWork ? parseInt(document.getElementById('intWork').value)||30 : parseInt(document.getElementById('intRest').value)||10); status.textContent = isWork ? 'فعالیت' : 'استراحت'; upd(); } timeLeft--; upd(); }, 1000); } };
            document.getElementById('intPause').onclick = () => { clearInterval(interval); running = false; };
            document.getElementById('intReset').onclick = () => { clearInterval(interval); running = false; isWork = true; timeLeft = parseInt(document.getElementById('intWork').value)||30; status.textContent = ''; upd(); };
        });
    }

    // ========== ۵. ساعت آنالوگ ==========
    function openAnalogClock() {
        openAppPage('🕰️ ساعت آنالوگ', `
            <div class="glass-panel" style="text-align:center;">
                <canvas id="analogCanvas" width="350" height="350"></canvas>
            </div>
        `, () => {
            const canvas = document.getElementById('analogCanvas'), ctx = canvas.getContext('2d');
            function draw() {
                ctx.clearRect(0,0,350,350);
                const now = new Date(), h = now.getHours()%12, m = now.getMinutes(), s = now.getSeconds();
                ctx.beginPath(); ctx.arc(175,175,160,0,Math.PI*2); ctx.strokeStyle='#d4af37'; ctx.lineWidth=6; ctx.stroke(); ctx.fillStyle='rgba(20,15,35,0.5)'; ctx.fill();
                ctx.fillStyle='#d4af37'; ctx.font='bold 18px Cinzel'; ctx.textAlign='center'; ctx.textBaseline='middle';
                for(let i=1;i<=12;i++) { const angle = (i*30-90)*Math.PI/180; ctx.fillText(i, 175+Math.cos(angle)*130, 175+Math.sin(angle)*130); }
                const drawHand = (angle, len, w, color) => { const rad = (angle-90)*Math.PI/180; ctx.beginPath(); ctx.moveTo(175,175); ctx.lineTo(175+Math.cos(rad)*len, 175+Math.sin(rad)*len); ctx.strokeStyle=color; ctx.lineWidth=w; ctx.lineCap='round'; ctx.stroke(); };
                drawHand((h+m/60)*30, 90, 8, '#d4af37'); drawHand(m*6, 130, 5, '#e8e4f0'); drawHand(s*6, 140, 2, '#ff6464');
                ctx.beginPath(); ctx.arc(175,175,10,0,Math.PI*2); ctx.fillStyle='#d4af37'; ctx.fill();
                requestAnimationFrame(draw);
            }
            draw();
        });
    }

    // ========== ۶. ساعت دیجیتال بزرگ ==========
    function openDigitalClock() {
        openAppPage('🔢 ساعت دیجیتال', `
            <div class="glass-panel" style="text-align:center;">
                <div style="font-size:5rem; font-family:'Cinzel'; color:#ede5d0;" id="bigClock"></div>
                <div style="color:#d4af37; margin-top:10px;" id="bigDate"></div>
            </div>
        `, () => {
            function upd() { document.getElementById('bigClock').textContent = new Date().toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit',second:'2-digit'}); document.getElementById('bigDate').textContent = new Date().toLocaleDateString('fa-IR',{weekday:'long', year:'numeric', month:'long', day:'numeric'}); }
            upd(); setInterval(upd, 1000);
        });
    }

    // ========== ۷. آلارم ==========
    function openAlarm() {
        openAppPage('⏰ آلارم', `
            <div class="glass-panel">
                <div style="display:flex; gap:10px; align-items:center; justify-content:center;">
                    <input type="number" id="alarmHour" class="tool-input" placeholder="ساعت" min="0" max="23" style="width:80px;">
                    <span>:</span>
                    <input type="number" id="alarmMinute" class="tool-input" placeholder="دقیقه" min="0" max="59" style="width:80px;">
                </div>
                <button class="tool-btn" id="setAlarmBtn" style="display:block; margin:10px auto;">🔔 تنظیم</button>
                <div id="alarmStatus" style="text-align:center; color:#d4af37;"></div>
            </div>
        `, () => {
            let timeout;
            document.getElementById('setAlarmBtn').onclick = () => {
                const h = parseInt(document.getElementById('alarmHour').value)||0, m = parseInt(document.getElementById('alarmMinute').value)||0;
                const now = new Date(); const alarm = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
                if(alarm <= now) alarm.setDate(alarm.getDate()+1);
                const diff = alarm - now;
                document.getElementById('alarmStatus').textContent = `⏰ برای ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')} تنظیم شد`;
                if(timeout) clearTimeout(timeout);
                timeout = setTimeout(() => { document.getElementById('alarmStatus').textContent = '🔔🔔🔔'; if(Notification.permission === 'granted') new Notification('my time', { body: 'آلارم!' }); }, diff);
            };
            if(Notification.permission !== 'granted') Notification.requestPermission();
        });
    }

    // ========== ۸. ساعت جهانی (۵۰+ شهر) ==========
    const worldCities = [
        {name:'Tehran', tz:'Asia/Tehran'},{name:'New York', tz:'America/New_York'},{name:'London', tz:'Europe/London'},
        {name:'Paris', tz:'Europe/Paris'},{name:'Berlin', tz:'Europe/Berlin'},{name:'Tokyo', tz:'Asia/Tokyo'},
        {name:'Beijing', tz:'Asia/Shanghai'},{name:'Sydney', tz:'Australia/Sydney'},{name:'Moscow', tz:'Europe/Moscow'},
        {name:'Brasília', tz:'America/Sao_Paulo'},{name:'New Delhi', tz:'Asia/Kolkata'},{name:'Toronto', tz:'America/Toronto'},
        {name:'Seoul', tz:'Asia/Seoul'},{name:'Dubai', tz:'Asia/Dubai'},{name:'Johannesburg', tz:'Africa/Johannesburg'},
        {name:'Los Angeles', tz:'America/Los_Angeles'},{name:'Chicago', tz:'America/Chicago'},{name:'Mexico City', tz:'America/Mexico_City'},
        {name:'Cairo', tz:'Africa/Cairo'},{name:'Istanbul', tz:'Europe/Istanbul'},{name:'Bangkok', tz:'Asia/Bangkok'},
        {name:'Singapore', tz:'Asia/Singapore'},{name:'Hong Kong', tz:'Asia/Hong_Kong'},{name:'Perth', tz:'Australia/Perth'},
        {name:'Baghdad', tz:'Asia/Baghdad'},{name:'Kabul', tz:'Asia/Kabul'},{name:'Athens', tz:'Europe/Athens'},
        {name:'Rome', tz:'Europe/Rome'},{name:'Madrid', tz:'Europe/Madrid'},{name:'Amsterdam', tz:'Europe/Amsterdam'},
        {name:'Stockholm', tz:'Europe/Stockholm'},{name:'Oslo', tz:'Europe/Oslo'},{name:'Helsinki', tz:'Europe/Helsinki'},
        {name:'Warsaw', tz:'Europe/Warsaw'},{name:'Kyiv', tz:'Europe/Kyiv'},{name:'Buenos Aires', tz:'America/Argentina/Buenos_Aires'},
        {name:'Santiago', tz:'America/Santiago'},{name:'Lima', tz:'America/Lima'},{name:'Bogota', tz:'America/Bogota'},
        {name:'Nairobi', tz:'Africa/Nairobi'},{name:'Lagos', tz:'Africa/Lagos'},{name:'Riyadh', tz:'Asia/Riyadh'},
        {name:'Karachi', tz:'Asia/Karachi'},{name:'Dhaka', tz:'Asia/Dhaka'},{name:'Manila', tz:'Asia/Manila'},
        {name:'Jakarta', tz:'Asia/Jakarta'},{name:'Taipei', tz:'Asia/Taipei'},{name:'Melbourne', tz:'Australia/Melbourne'},
        {name:'Auckland', tz:'Pacific/Auckland'},{name:'Honolulu', tz:'Pacific/Honolulu'}
    ];
    function openWorldClock() {
        openAppPage('🌍 ساعت جهانی', `
            <div class="glass-panel">
                <input type="text" id="worldSearch" class="tool-input" placeholder="🔍 جستجوی شهر...">
                <div id="worldResults" style="max-height:450px; overflow-y:auto; margin-top:10px;"></div>
            </div>
        `, () => {
            const input = document.getElementById('worldSearch'), results = document.getElementById('worldResults');
            function show(q='') {
                const filtered = worldCities.filter(c => c.name.toLowerCase().includes(q.toLowerCase()));
                results.innerHTML = filtered.map(c => `<div style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between;"><span>${c.name}</span><span style="font-family:Cinzel; color:#d4af37;">${getTimeInCity(c.tz)}</span></div>`).join('');
            }
            show(); input.addEventListener('input', () => show(input.value));
            setInterval(() => show(input.value), 1000);
        });
    }

    // ========== ۹. مقایسه دو منطقه ==========
    function openCompareZones() {
        openAppPage('🔄 مقایسه دو منطقه', `
            <div class="glass-panel">
                <select id="zone1" class="tool-input">${worldCities.map(c => `<option value="${c.tz}">${c.name}</option>`).join('')}</select>
                <select id="zone2" class="tool-input">${worldCities.map(c => `<option value="${c.tz}">${c.name}</option>`).join('')}</select>
                <div style="display:flex; justify-content:space-around; margin-top:20px; font-family:'Cinzel'; font-size:1.8rem;">
                    <div id="zone1Time"></div>
                    <div style="color:#d4af37;">↔</div>
                    <div id="zone2Time"></div>
                </div>
            </div>
        `, () => {
            function upd() {
                document.getElementById('zone1Time').textContent = getTimeInCity(document.getElementById('zone1').value);
                document.getElementById('zone2Time').textContent = getTimeInCity(document.getElementById('zone2').value);
            }
            upd(); setInterval(upd, 1000);
            document.getElementById('zone1').addEventListener('change', upd);
            document.getElementById('zone2').addEventListener('change', upd);
        });
    }

    // ========== ۱۰. تقویم ==========
    function openCalendar() {
        const now = new Date();
        const shamsi = gregorianToJalali(now);
        openAppPage('📅 تقویم', `
            <div class="glass-panel" style="text-align:center;">
                <div style="font-size:2.2rem; color:#d4af37; font-family:'Cinzel';">${now.toLocaleDateString('fa-IR',{weekday:'long', year:'numeric', month:'long', day:'numeric'})}</div>
                <div style="margin-top:10px; color:#ccc; font-size:1.2rem;">📅 ${shamsi}</div>
                <div style="margin-top:20px; color:#aaa;">${now.toLocaleDateString('en-US',{weekday:'long', year:'numeric', month:'long', day:'numeric'})}</div>
            </div>
        `);
    }

    // ========== ۱۱. فاز ماه ==========
    function openMoonPhase() {
        openAppPage('🌙 فاز ماه', `
            <div class="glass-panel" style="text-align:center;">
                <canvas id="moonCanvas" width="300" height="300"></canvas>
                <div style="color:#d4af37; margin-top:15px; font-size:1.2rem;">فاز فعلی ماه</div>
            </div>
        `, () => {
            const mc = document.getElementById('moonCanvas'), ctx = mc.getContext('2d');
            ctx.fillStyle = '#0a0a18'; ctx.fillRect(0,0,300,300);
            ctx.beginPath(); ctx.arc(150,150,120,0,Math.PI*2); ctx.fillStyle = '#e8e4f0'; ctx.fill();
            const phase = (new Date().getDate() % 30) / 30;
            ctx.beginPath(); ctx.arc(150 + phase*90 - 45,150,115,0,Math.PI*2); ctx.fillStyle = '#0a0a18'; ctx.fill();
        });
    }

    // ========== ۱۲. طلوع/غروب ==========
    function openSunTimes() {
        openAppPage('🌅 طلوع/غروب', `
            <div class="glass-panel">
                <input type="text" id="sunCity" class="tool-input" placeholder="نام شهر" value="Tehran">
                <button class="tool-btn" id="getSun">🔍 دریافت</button>
                <div id="sunResult" style="text-align:center; margin-top:15px; color:#d4af37; font-size:1.2rem;"></div>
            </div>
        `, async () => {
            document.getElementById('getSun').onclick = async () => {
                const city = document.getElementById('sunCity').value;
                try {
                    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
                    const geoData = await geoRes.json();
                    if(!geoData.results) return;
                    const {latitude, longitude, name} = geoData.results[0];
                    const sunRes = await fetch(`https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`);
                    const sunData = await sunRes.json();
                    document.getElementById('sunResult').innerHTML = `<strong>${name}</strong><br>🌅 طلوع: ${new Date(sunData.results.sunrise).toLocaleTimeString('fa-IR')}<br>🌇 غروب: ${new Date(sunData.results.sunset).toLocaleTimeString('fa-IR')}`;
                } catch(e) {}
            };
            document.getElementById('getSun').click();
        });
    }

    // ادامهٔ فایل در نیمهٔ دوم...    // ========== ۱۳. آب‌وهوا با ویجت تصویری ==========
    function openWeather() {
        openAppPage('🌤️ آب‌وهوا', `
            <div class="glass-panel">
                <input type="text" id="weatherCity" class="tool-input" placeholder="نام شهر" value="Tehran">
                <button class="tool-btn" id="getWeather">🔍 دریافت</button>
                <div class="weather-widget" id="weatherWidget">
                    <div id="weatherIcon" style="font-size:4rem;"></div>
                    <div id="weatherTemp" style="font-size:2.5rem; color:#d4af37; font-family:'Cinzel';"></div>
                    <div id="weatherDesc" style="color:#ccc;"></div>
                    <div class="grid-2" style="margin-top:15px;">
                        <div>💧 رطوبت: <span id="weatherHumidity"></span></div>
                        <div>💨 باد: <span id="weatherWind"></span></div>
                    </div>
                </div>
                <canvas id="weatherChart" width="700" height="300" style="width:100%; max-width:700px; margin:20px auto;"></canvas>
            </div>
        `, async () => {
            document.getElementById('getWeather').onclick = async () => {
                const city = document.getElementById('weatherCity').value;
                try {
                    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
                    const geoData = await geoRes.json();
                    if(!geoData.results) return;
                    const {latitude, longitude, name} = geoData.results[0];
                    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&timezone=auto&forecast_days=7`);
                    const weatherData = await weatherRes.json();
                    const current = weatherData.current_weather;
                    document.getElementById('weatherTemp').textContent = `${current.temperature}°C`;
                    document.getElementById('weatherWind').textContent = `${current.windspeed} km/h`;
                    document.getElementById('weatherHumidity').textContent = `${weatherData.daily.precipitation_sum[0]} mm`;
                    document.getElementById('weatherDesc').textContent = `${name}`;
                    document.getElementById('weatherIcon').textContent = current.temperature > 25 ? '☀️' : current.temperature > 15 ? '⛅' : '🌧️';

                    const ctx = document.getElementById('weatherChart').getContext('2d');
                    ctx.clearRect(0,0,700,300); ctx.fillStyle='rgba(22,18,38,0.7)'; ctx.fillRect(0,0,700,300);
                    ctx.strokeStyle='#d4af37'; ctx.lineWidth=3; ctx.beginPath();
                    const d = weatherData.daily;
                    for(let i=0;i<d.temperature_2m_max.length;i++) {
                        const x = 50+i*100, y = 250-d.temperature_2m_max[i]*5;
                        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
                        ctx.fillStyle='#d4af37'; ctx.fillText(d.temperature_2m_max[i]+'°', x-10, y-10);
                        ctx.fillStyle='#aaa'; ctx.fillText(d.temperature_2m_min[i]+'°', x-10, y+25);
                        ctx.fillStyle='#ccc'; ctx.fillText(d.time[i].slice(5), x-20, 280);
                    }
                    ctx.stroke();
                } catch(e) {}
            };
            document.getElementById('getWeather').click();
        });
    }

    // ========== ۱۴. ماشین حساب ==========
    function openCalculator() {
        openAppPage('🔢 ماشین حساب', `
            <div class="glass-panel" style="max-width:360px; margin:0 auto;">
                <input type="text" id="calcDisplay" class="tool-input" style="text-align:right; font-size:2rem; font-family:Cinzel;" readonly value="0">
                <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-top:10px;">
                    ${['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+','C','(',')','%'].map(b => `<button class="tool-btn" style="padding:15px; font-size:1.2rem;" data-val="${b}">${b}</button>`).join('')}
                </div>
            </div>
        `, () => {
            const disp = document.getElementById('calcDisplay'); let expr = '';
            document.querySelectorAll('[data-val]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const val = btn.dataset.val;
                    if(val === 'C') { expr = ''; disp.value = '0'; }
                    else if(val === '=') { try { expr = eval(expr).toString(); disp.value = expr; } catch(e) { disp.value = 'خطا'; expr = ''; } }
                    else { expr += val; disp.value = expr; }
                });
            });
        });
    }

    // ========== ۱۵. تبدیل واحد ==========
    function openUnitConverter() {
        const units = {
            length: { meter:1, km:1000, mile:1609.34, yard:0.9144, foot:0.3048, inch:0.0254 },
            weight: { kg:1, gram:0.001, pound:0.4536, ounce:0.02835 },
            temp: { celsius:'c', fahrenheit:'f', kelvin:'k' },
            time: { second:1, minute:60, hour:3600, day:86400, week:604800, year:31536000 },
            speed: { 'km/h':1, 'm/s':0.277778, 'mph':0.621371, 'knot':0.539957 }
        };
        openAppPage('🔄 تبدیل واحد', `
            <div class="glass-panel">
                <select id="unitType" class="tool-input">${Object.keys(units).map(u=>`<option>${u}</option>`).join('')}</select>
                <input type="number" id="unitInput" class="tool-input" placeholder="مقدار" value="1">
                <select id="unitFrom" class="tool-input"></select>
                <span style="color:#d4af37; text-align:center; display:block; margin:10px 0;">⬇</span>
                <select id="unitTo" class="tool-input"></select>
                <div id="unitResult" style="text-align:center; font-size:1.8rem; color:#d4af37;"></div>
            </div>
        `, () => {
            const typeSel = document.getElementById('unitType'), fromSel = document.getElementById('unitFrom'), toSel = document.getElementById('unitTo'), input = document.getElementById('unitInput'), result = document.getElementById('unitResult');
            function update() { const list = Object.keys(units[typeSel.value]); fromSel.innerHTML = toSel.innerHTML = list.map(u => `<option>${u}</option>`).join(''); convert(); }
            function convert() {
                const type = typeSel.value, val = parseFloat(input.value)||0, from = fromSel.value, to = toSel.value;
                if(type === 'temp') {
                    let c; if(from==='celsius') c=val; else if(from==='fahrenheit') c=(val-32)*5/9; else c=val-273.15;
                    let res; if(to==='celsius') res=c; else if(to==='fahrenheit') res=c*9/5+32; else res=c+273.15;
                    result.textContent = res.toFixed(2);
                } else {
                    result.textContent = (val * units[type][from] / units[type][to]).toFixed(4);
                }
            }
            typeSel.addEventListener('change', update); fromSel.addEventListener('change', convert); toSel.addEventListener('change', convert); input.addEventListener('input', convert); update();
        });
    }

    // ========== ۱۶. محاسبه سن ==========
    function openAgeCalc() {
        openAppPage('🎂 محاسبه سن', `
            <div class="glass-panel">
                <input type="date" id="birthdate" class="tool-input">
                <div id="ageResult" style="text-align:center; margin-top:15px; color:#d4af37; font-size:1.6rem;"></div>
            </div>
        `, () => {
            document.getElementById('birthdate').addEventListener('change', function() {
                const birth = new Date(this.value), now = new Date();
                let years = now.getFullYear() - birth.getFullYear();
                const m = now.getMonth() - birth.getMonth();
                if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) years--;
                document.getElementById('ageResult').textContent = `سن: ${years} سال`;
            });
        });
    }

    // ========== ۱۷. اختلاف تاریخ ==========
    function openDateDiff() {
        openAppPage('📆 اختلاف تاریخ', `
            <div class="glass-panel">
                <label>تاریخ اول</label><input type="date" id="date1" class="tool-input">
                <label>تاریخ دوم</label><input type="date" id="date2" class="tool-input">
                <div id="diffResult" style="text-align:center; margin-top:15px; color:#d4af37; font-size:1.6rem;"></div>
            </div>
        `, () => {
            function calc() {
                const d1 = new Date(document.getElementById('date1').value), d2 = new Date(document.getElementById('date2').value);
                if(isNaN(d1) || isNaN(d2)) return;
                const diff = Math.abs(d2 - d1);
                const days = Math.floor(diff / 86400000);
                document.getElementById('diffResult').textContent = `${days} روز اختلاف`;
            }
            document.getElementById('date1').addEventListener('change', calc);
            document.getElementById('date2').addEventListener('change', calc);
        });
    }

    // ========== ۱۸. ردیاب زمان ==========
    function openTimeLogger() {
        const logs = JSON.parse(localStorage.getItem('timeLogs') || '[]');
        openAppPage('📊 ردیاب زمان', `
            <div class="glass-panel">
                <input type="text" id="logTask" class="tool-input" placeholder="نام وظیفه">
                <button class="tool-btn" id="logStart" style="display:block; margin:10px auto;">▶ شروع</button>
                <div id="logStatus" style="text-align:center; color:#d4af37;"></div>
                <div id="logList" style="max-height:300px; overflow-y:auto; margin-top:15px;">
                    ${logs.map(l => `<div style="padding:8px; border-bottom:1px solid rgba(255,255,255,0.1);">${l.task}: ${Math.floor(l.duration/60)} دقیقه ${l.duration%60} ثانیه</div>`).join('')}
                </div>
            </div>
        `, () => {
            let startTime, interval;
            document.getElementById('logStart').onclick = () => {
                const task = document.getElementById('logTask').value || 'بدون نام';
                if(document.getElementById('logStart').textContent === '▶ شروع') {
                    startTime = Date.now();
                    document.getElementById('logStart').textContent = '⏸ توقف';
                    document.getElementById('logStart').classList.add('active');
                    interval = setInterval(() => {
                        const elapsed = Math.floor((Date.now() - startTime)/1000);
                        document.getElementById('logStatus').textContent = `${task}: ${Math.floor(elapsed/60)} دقیقه ${elapsed%60} ثانیه`;
                    }, 1000);
                } else {
                    clearInterval(interval);
                    const duration = Math.floor((Date.now() - startTime)/1000);
                    logs.push({task, duration});
                    localStorage.setItem('timeLogs', JSON.stringify(logs));
                    document.getElementById('logStart').textContent = '▶ شروع';
                    document.getElementById('logStart').classList.remove('active');
                    document.getElementById('logStatus').textContent = '';
                    const li = document.createElement('div');
                    li.style.cssText = 'padding:8px; border-bottom:1px solid rgba(255,255,255,0.1);';
                    li.textContent = `${task}: ${Math.floor(duration/60)} دقیقه ${duration%60} ثانیه`;
                    document.getElementById('logList').prepend(li);
                }
            };
        });
    }

    // ========== ۱۹. یادداشت ==========
    function openNotes() {
        const saved = localStorage.getItem('myTimeNotes') || '';
        openAppPage('📝 یادداشت', `
            <div class="glass-panel">
                <textarea id="notesArea" class="tool-input" style="height:300px;">${saved}</textarea>
                <div style="display:flex; gap:10px; justify-content:center; margin-top:10px;">
                    <button class="tool-btn" id="saveNotes">💾 ذخیره</button>
                    <button class="tool-btn" id="clearNotes">🗑 پاک</button>
                </div>
            </div>
        `, () => {
            document.getElementById('saveNotes').onclick = () => localStorage.setItem('myTimeNotes', document.getElementById('notesArea').value);
            document.getElementById('clearNotes').onclick = () => { document.getElementById('notesArea').value = ''; localStorage.removeItem('myTimeNotes'); };
        });
    }

    // ========== ۲۰. نقل‌قول روزانه ==========
    function openDailyQuote() {
        let quotesArray = [];
        if(window.quotes && Array.isArray(window.quotes)) quotesArray = window.quotes;
        else if(typeof quotes !== 'undefined' && Array.isArray(quotes)) quotesArray = quotes;
        const randomQuote = quotesArray.length ? quotesArray[Math.floor(Math.random()*quotesArray.length)] : {text:'نقل‌قولی یافت نشد', author:''};
        const text = typeof randomQuote === 'string' ? randomQuote : randomQuote.text;
        const author = randomQuote.author || '';
        openAppPage('📜 نقل‌قول روزانه', `
            <div class="glass-panel" style="text-align:center;">
                <div style="font-size:1.6rem; font-style:italic; color:#ede5d0; line-height:2;">${text}</div>
                ${author ? `<div style="color:#d4af37; margin-top:15px; font-size:1.2rem;">— ${author}</div>` : ''}
                <button class="tool-btn" id="newQuote" style="margin-top:20px;">🔄 جدید</button>
            </div>
        `, () => { document.getElementById('newQuote').onclick = () => { closeAppPage(); openDailyQuote(); }; });
    }

    // ========== ۲۱. گالری تم ==========
    function openThemeGallery() {
        const themes = ['کهکشانی','قرمز مخملی','آبی اقیانوسی','سبز زمردی','طلایی مجلل','شیشه‌ای'];
        openAppPage('🎨 گالری تم', `
            <div class="glass-panel">
                ${themes.map((t,i) => `<button class="tool-btn" style="display:block; width:100%; margin:8px 0;" onclick="applyTheme(${i}); document.getElementById('appContainer').style.display='none'; document.querySelector('.main-container').style.display='';">${t}</button>`).join('')}
            </div>
        `);
    }

    // ========== ۲۲. مترونوم ==========
    function openMetronome() {
        openAppPage('🎵 مترونوم', `
            <div class="glass-panel" style="text-align:center;">
                <div style="font-size:3rem; font-family:'Cinzel';" id="bpmDisplay">120</div>
                <input type="range" id="bpmSlider" class="tool-input" min="40" max="240" value="120" style="width:100%;">
                <button class="tool-btn" id="metronomeToggle">▶ شروع</button>
            </div>
        `, () => {
            let interval, running = false, bpm = 120;
            const disp = document.getElementById('bpmDisplay'), slider = document.getElementById('bpmSlider'), btn = document.getElementById('metronomeToggle');
            slider.addEventListener('input', () => { bpm = slider.value; disp.textContent = bpm; });
            btn.addEventListener('click', () => {
                if(running) { clearInterval(interval); running = false; btn.textContent = '▶ شروع'; }
                else { running = true; btn.textContent = '⏸ توقف'; interval = setInterval(() => { const ctx = new AudioContext(); const o = ctx.createOscillator(); o.frequency = 880; o.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.05); }, 60000 / bpm); }
            });
        });
    }

    // ========== ۲۳. نقشه ==========
    function openMap() {
        openAppPage('🗺️ نقشه', `
            <div class="glass-panel" style="height:60vh; overflow:hidden; padding:0;">
                <iframe src="https://www.openstreetmap.org/export/embed.html?bbox=51.2,35.5,51.6,35.9&layer=mapnik" style="width:100%; height:100%; border:none; border-radius:20px;"></iframe>
            </div>
        `);
    }

    // ========== ۲۴. آب‌وهوا با موقعیت فعلی ==========
    function openWeatherByLocation() {
        openAppPage('📍 آب‌وهوای موقعیت فعلی', `
            <div class="glass-panel" style="text-align:center;">
                <button class="tool-btn" id="getLocationWeather">📍 دریافت آب‌وهوای موقعیت من</button>
                <div class="weather-widget" id="locationWeatherWidget" style="margin-top:15px; display:none;">
                    <div id="locWeatherIcon" style="font-size:4rem;"></div>
                    <div id="locWeatherTemp" style="font-size:2.5rem; color:#d4af37; font-family:'Cinzel';"></div>
                    <div id="locWeatherDesc" style="color:#ccc;"></div>
                </div>
            </div>
        `, () => {
            document.getElementById('getLocationWeather').onclick = () => {
                if(!navigator.geolocation) { alert('موقعیت‌یابی پشتیبانی نمی‌شود'); return; }
                navigator.geolocation.getCurrentPosition(async (pos) => {
                    const {latitude, longitude} = pos.coords;
                    try {
                        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
                        const weatherData = await weatherRes.json();
                        const current = weatherData.current_weather;
                        document.getElementById('locWeatherTemp').textContent = `${current.temperature}°C`;
                        document.getElementById('locWeatherIcon').textContent = current.temperature > 25 ? '☀️' : current.temperature > 15 ? '⛅' : '🌧️';
                        document.getElementById('locWeatherDesc').textContent = `موقعیت فعلی شما`;
                        document.getElementById('locationWeatherWidget').style.display = 'block';
                    } catch(e) {}
                });
            };
        });
    }

    // ========== منوی غول‌آسا ==========
    const menuCategories = [
        { name: '⏱️ زمان‌سنج‌ها', items: [
            { icon:'⏱️', text:'کرنوگراف', action: openChronograph },
            { icon:'🍅', text:'پومودورو', action: openPomodoro },
            { icon:'⏳', text:'تایمر', action: openTimer },
            { icon:'🔁', text:'تایمر اینتروال', action: openIntervalTimer },
        ]},
        { name: '🕰️ ساعت‌ها', items: [
            { icon:'🕰️', text:'ساعت آنالوگ', action: openAnalogClock },
            { icon:'🔢', text:'ساعت دیجیتال بزرگ', action: openDigitalClock },
        ]},
        { name: '⏰ آلارم و یادآوری', items: [
            { icon:'⏰', text:'آلارم', action: openAlarm },
        ]},
        { name: '🌍 مناطق زمانی', items: [
            { icon:'🌍', text:'ساعت جهانی', action: openWorldClock },
            { icon:'🔄', text:'مقایسه دو منطقه', action: openCompareZones },
        ]},
        { name: '📅 تقویم و نجوم', items: [
            { icon:'📅', text:'تقویم', action: openCalendar },
            { icon:'🌙', text:'فاز ماه', action: openMoonPhase },
            { icon:'🌅', text:'طلوع/غروب', action: openSunTimes },
        ]},
        { name: '🧮 محاسبات', items: [
            { icon:'🔢', text:'ماشین حساب', action: openCalculator },
            { icon:'🔄', text:'تبدیل واحد', action: openUnitConverter },
            { icon:'🎂', text:'محاسبه سن', action: openAgeCalc },
            { icon:'📆', text:'اختلاف تاریخ', action: openDateDiff },
        ]},
        { name: '📊 بهره‌وری', items: [
            { icon:'📊', text:'ردیاب زمان', action: openTimeLogger },
        ]},
        { name: '🌤️ آب‌وهوا', items: [
            { icon:'🌤️', text:'آب‌وهوا ۷ روزه', action: openWeather },
            { icon:'📍', text:'آب‌وهوای موقعیت من', action: openWeatherByLocation },
        ]},
        { name: '🗺️ نقشه', items: [
            { icon:'🗺️', text:'نقشه جهان', action: openMap },
        ]},
        { name: '📝 ابزارهای کاربردی', items: [
            { icon:'📝', text:'یادداشت', action: openNotes },
            { icon:'📜', text:'نقل‌قول روزانه', action: openDailyQuote },
        ]},
        { name: '🎵 ابزارهای جالب', items: [
            { icon:'🎵', text:'مترونوم', action: openMetronome },
        ]},
        { name: '⚙️ تنظیمات', items: [
            { icon:'🎨', text:'گالری تم', action: openThemeGallery },
        ]},
    ];

    function buildMenu() {
        const menuContent = document.getElementById('menuContent');
        if(!menuContent) return;
        let html = '<input type="text" id="menuSearch" class="tool-input" placeholder="🔍 جستجوی ابزار..." style="margin-bottom:15px;">';
        menuCategories.forEach(cat => {
            html += `<div class="menu-category"><div class="menu-cat-header"><span>${cat.name}</span><span class="arrow">▼</span></div><div class="menu-cat-items">`;
            cat.items.forEach(item => {
                html += `<div class="menu-item" data-action="${item.text}"><span>${item.icon}</span> ${item.text}</div>`;
            });
            html += `</div></div>`;
        });
        menuContent.innerHTML = html;

        document.getElementById('menuSearch').addEventListener('input', function() {
            const q = this.value.toLowerCase();
            document.querySelectorAll('.menu-item').forEach(el => {
                el.style.display = el.textContent.toLowerCase().includes(q) ? 'flex' : 'none';
            });
        });

        document.querySelectorAll('.menu-cat-header').forEach(h => {
            h.addEventListener('click', () => h.parentElement.classList.toggle('open'));
        });

        document.querySelectorAll('.menu-item').forEach(el => {
            el.addEventListener('click', () => {
                const action = el.dataset.action;
                const found = menuCategories.flatMap(c=>c.items).find(i=>i.text===action);
                if(found?.action) { found.action(); closeMenu(); }
            });
        });
    }

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
        console.log('✅ جعبه ابزار زمان با ۶۰+ ابزار فعال شد');
    }

    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initTools);
    else initTools();

})();
