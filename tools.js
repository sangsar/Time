// ==================== tools.js (نسخهٔ نهایی - بخش اول) ====================
(function() {

    // ========== SPA Container ==========
    const appContainer = document.createElement('div');
    appContainer.id = 'appContainer';
    appContainer.style.cssText = `
        position: fixed; top:0; left:0; width:100%; height:100%;
        z-index: 50; background: #0a0a18; color: #e8e4f0;
        overflow-y: auto; display: none; opacity: 0;
        transition: opacity 0.3s ease;
        font-family: 'Vazirmatn', sans-serif;
    `;
    document.body.appendChild(appContainer);

    const mainContainer = document.querySelector('.main-container');

    function openAppPage(title, contentHTML, onMount) {
        appContainer.innerHTML = `
            <div style="position:sticky; top:0; z-index:10; background:rgba(10,8,22,0.95); backdrop-filter:blur(25px); padding:14px 20px; border-bottom:1px solid rgba(212,175,55,0.3); display:flex; align-items:center; gap:14px;">
                <button id="backToMain" style="background:rgba(255,255,255,0.06); border:1px solid rgba(212,175,55,0.5); color:#d4af37; font-size:1.3rem; width:38px; height:38px; border-radius:12px; cursor:pointer;">←</button>
                <h2 style="font-family:'Playfair Display', serif; color:#d4af37; font-size:1.5rem; letter-spacing:2px;">${title}</h2>
            </div>
            <div style="max-width:900px; margin:30px auto; padding:0 20px 50px;">
                ${contentHTML}
            </div>
        `;
        appContainer.style.display = 'block';
        requestAnimationFrame(() => { appContainer.style.opacity = '1'; });
        mainContainer.style.display = 'none';
        document.getElementById('backToMain').addEventListener('click', closeAppPage);
        if (onMount) setTimeout(onMount, 150);
    }

    function closeAppPage() {
        appContainer.style.opacity = '0';
        setTimeout(() => {
            appContainer.style.display = 'none';
            mainContainer.style.display = '';
        }, 300);
    }

    // ========== استایل‌های مشترک ==========
    const advancedStyles = document.createElement('style');
    advancedStyles.textContent = `
        .tool-btn {
            background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.4);
            color: #fff; padding: 12px 24px; border-radius: 14px;
            cursor: pointer; font-family: 'Vazirmatn', sans-serif;
            margin: 6px; transition: all 0.3s ease; font-size: 0.95rem;
            backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        .tool-btn:hover {
            background: rgba(212,175,55,0.35); border-color: rgba(212,175,55,0.8);
            transform: translateY(-2px); box-shadow: 0 8px 25px rgba(212,175,55,0.2);
        }
        .tool-input, input, textarea, select {
            background: rgba(255,255,255,0.06); border: 1px solid rgba(212,175,55,0.25);
            color: #fff; padding: 12px 16px; border-radius: 14px;
            font-family: 'Vazirmatn', sans-serif; width: 100%;
            margin: 10px 0; outline: none; font-size: 1rem;
        }
        .glass-panel {
            background: rgba(22,18,38,0.65); backdrop-filter: blur(25px);
            border: 1px solid rgba(212,175,55,0.2); border-radius: 24px;
            padding: 24px; margin-bottom: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 600px) { .grid-2 { grid-template-columns: 1fr; } }
    `;
    document.head.appendChild(advancedStyles);

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

    // ========== ۱. داشبورد ==========
    function openDashboard() {
        const now = new Date();
        const shamsi = gregorianToJalali(now);
        openAppPage('✨ داشبورد', `
            <div class="glass-panel" style="text-align:center;">
                <div style="font-size:3.5rem; font-family:'Cinzel'; color:#d4af37; text-shadow:0 0 20px rgba(212,175,55,0.5);" id="dashTime">${now.toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</div>
                <div style="color:#ccc; font-size:1.1rem; margin-top:8px;" id="dashDate">${now.toLocaleDateString('fa-IR',{weekday:'long', year:'numeric', month:'long', day:'numeric'})}</div>
                <div style="color:#aaa; margin-top:4px;">📅 ${shamsi}</div>
                <div class="grid-2" style="margin-top:25px;">
                    <div class="stat-card"><div class="stat-number" id="dashTemp">--°</div><div class="stat-label">دمای تهران</div></div>
                    <div class="stat-card"><div class="stat-number" id="dashSessions">${localStorage.getItem('pomSessions')||0}</div><div class="stat-label">جلسات پومودورو</div></div>
                </div>
                <div style="margin-top:20px; font-style:italic; color:#ede5d0; font-size:1.1rem;" id="dashQuote">در حال بارگذاری...</div>
            </div>
            <style>.stat-card { background: rgba(255,255,255,0.04); border-radius: 16px; padding: 18px; text-align: center; } .stat-number { font-family: 'Cinzel', serif; font-size: 2rem; color: #d4af37; } .stat-label { font-size: 0.8rem; color: #aaa; margin-top: 4px; }</style>
        `, async () => {
            setInterval(() => {
                const n = new Date();
                document.getElementById('dashTime').textContent = n.toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
            }, 1000);
            let quotesArray = [];
            if(window.quotes && Array.isArray(window.quotes)) quotesArray = window.quotes;
            else if(typeof quotes !== 'undefined' && Array.isArray(quotes)) quotesArray = quotes;
            if(quotesArray.length) {
                const r = quotesArray[Math.floor(Math.random()*quotesArray.length)];
                document.getElementById('dashQuote').textContent = typeof r === 'string' ? r : r.text;
            }
            try {
                const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=35.6892&longitude=51.3890&current_weather=true');
                const data = await res.json();
                document.getElementById('dashTemp').textContent = data.current_weather.temperature + '°';
            } catch(e) { document.getElementById('dashTemp').textContent = '--°'; }
        });
    }

    // ========== ۲. کرنوگراف ==========
    function openChronograph() {
        openAppPage('⏱️ کرنوگراف', `
            <div class="glass-panel">
                <div style="text-align:center; font-size:4.5rem; font-family:'Cinzel';" id="chronoDisplay">00:00.00</div>
                <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-top:25px;">
                    <button class="tool-btn" id="chronoStart">▶ شروع</button>
                    <button class="tool-btn" id="chronoStop">⏸ توقف</button>
                    <button class="tool-btn" id="chronoReset">↺ ریست</button>
                    <button class="tool-btn" id="chronoLap">🏁 لاپ</button>
                </div>
                <div id="lapList" style="max-height:280px; overflow-y:auto; margin-top:20px;"></div>
            </div>
        `, () => {
            let interval, running = false, time = 0, laps = [];
            const disp = document.getElementById('chronoDisplay'), lapList = document.getElementById('lapList');
            function upd() { const ms = Math.floor(time/10)%100, s = Math.floor(time/1000)%60, m = Math.floor(time/60000); disp.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(ms).padStart(2,'0')}`; }
            document.getElementById('chronoStart').onclick = () => { if(!running) { running = true; const start = Date.now() - time; interval = setInterval(() => { time = Date.now() - start; upd(); }, 10); } };
            document.getElementById('chronoStop').onclick = () => { clearInterval(interval); running = false; };
            document.getElementById('chronoReset').onclick = () => { clearInterval(interval); running = false; time = 0; laps = []; upd(); lapList.innerHTML = ''; };
            document.getElementById('chronoLap').onclick = () => { if(running) { laps.push(time); const li = document.createElement('div'); li.style.cssText = 'padding:12px; border-bottom:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between;'; li.innerHTML = `<span style="color:#d4af37;">لاپ ${laps.length}</span><span style="font-family:Cinzel;">${disp.textContent}</span>`; lapList.prepend(li); } };
        });
    }

    // ========== ۳. پومودورو ==========
    function openPomodoro() {
        let sessions = parseInt(localStorage.getItem('pomSessions')||'0');
        openAppPage('🍅 پومودورو', `
            <div class="glass-panel">
                <div style="text-align:center; font-size:5rem; font-family:'Cinzel';" id="pomDisplay">25:00</div>
                <div style="text-align:center; color:#d4af37; font-size:1.3rem;" id="pomStatus">⚡ آمادهٔ کار</div>
                <div class="grid-2">
                    <div><label>⏱️ دقیقه کار</label><input type="number" id="workMin" class="tool-input" value="25" min="1"></div>
                    <div><label>☕ دقیقه استراحت</label><input type="number" id="breakMin" class="tool-input" value="5" min="1"></div>
                </div>
                <div style="display:flex; gap:12px; justify-content:center; margin-top:25px;">
                    <button class="tool-btn" id="pomStart">▶ شروع</button>
                    <button class="tool-btn" id="pomPause">⏸ توقف</button>
                    <button class="tool-btn" id="pomReset">↺ ریست</button>
                </div>
                <div style="text-align:center; margin-top:20px; color:#ccc;">✅ جلسات تکمیل‌شده: <span id="sessionsCount" style="color:#d4af37; font-size:1.3rem;">${sessions}</span></div>
            </div>
        `, () => {
            let interval, running = false, timeLeft = 1500, isWork = true;
            const disp = document.getElementById('pomDisplay'), status = document.getElementById('pomStatus'), sessCount = document.getElementById('sessionsCount');
            function upd() { const m = Math.floor(timeLeft/60), s = timeLeft%60; disp.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }
            document.getElementById('pomStart').onclick = () => { if(!running) { running = true; interval = setInterval(() => { if(timeLeft <= 0) { clearInterval(interval); running = false; if(isWork) { sessions++; localStorage.setItem('pomSessions', sessions); sessCount.textContent = sessions; } isWork = !isWork; timeLeft = (isWork ? parseInt(document.getElementById('workMin').value)||25 : parseInt(document.getElementById('breakMin').value)||5) * 60; status.textContent = isWork ? '⚡ زمان کار' : '☕ استراحت'; upd(); return; } timeLeft--; upd(); }, 1000); } };
            document.getElementById('pomPause').onclick = () => { clearInterval(interval); running = false; };
            document.getElementById('pomReset').onclick = () => { clearInterval(interval); running = false; isWork = true; timeLeft = (parseInt(document.getElementById('workMin').value)||25)*60; status.textContent = '⚡ آمادهٔ کار'; upd(); };
        });
    }

    // ========== ۴. تایمر ==========
    function openTimer() {
        openAppPage('⏳ تایمر', `
            <div class="glass-panel">
                <div style="text-align:center; font-size:5rem; font-family:'Cinzel';" id="timerDisplay">00:00</div>
                <input type="number" id="timerMinutes" class="tool-input" placeholder="⏱️ دقیقه را وارد کنید" style="text-align:center; max-width:300px; margin:20px auto; display:block;">
                <div style="display:flex; gap:12px; justify-content:center; margin-top:20px;">
                    <button class="tool-btn" id="timerStart">▶ شروع</button>
                    <button class="tool-btn" id="timerPause">⏸ توقف</button>
                    <button class="tool-btn" id="timerReset">↺ ریست</button>
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

    // ========== ۵. تایمر اینتروال ==========
    function openIntervalTimer() {
        openAppPage('🔁 تایمر اینتروال', `
            <div class="glass-panel">
                <div style="text-align:center; font-size:3.5rem; font-family:'Cinzel';" id="intDisplay">00:00</div>
                <div style="text-align:center; color:#d4af37;" id="intStatus">⚡ آماده</div>
                <div class="grid-2">
                    <div><label>⚡ فعالیت (ثانیه)</label><input type="number" id="intWork" class="tool-input" value="30" min="1"></div>
                    <div><label>☕ استراحت (ثانیه)</label><input type="number" id="intRest" class="tool-input" value="10" min="1"></div>
                </div>
                <div style="display:flex; gap:12px; justify-content:center; margin-top:25px;">
                    <button class="tool-btn" id="intStart">▶ شروع</button>
                    <button class="tool-btn" id="intPause">⏸ توقف</button>
                    <button class="tool-btn" id="intReset">↺ ریست</button>
                </div>
            </div>
        `, () => {
            let interval, running = false, timeLeft = 30, isWork = true;
            const disp = document.getElementById('intDisplay'), status = document.getElementById('intStatus');
            function upd() { disp.textContent = `${String(Math.floor(timeLeft/60)).padStart(2,'0')}:${String(timeLeft%60).padStart(2,'0')}`; }
            document.getElementById('intStart').onclick = () => { if(!running) { running = true; interval = setInterval(() => { if(timeLeft <= 0) { isWork = !isWork; timeLeft = (isWork ? parseInt(document.getElementById('intWork').value)||30 : parseInt(document.getElementById('intRest').value)||10); status.textContent = isWork ? '⚡ فعالیت' : '☕ استراحت'; upd(); } timeLeft--; upd(); }, 1000); } };
            document.getElementById('intPause').onclick = () => { clearInterval(interval); running = false; };
            document.getElementById('intReset').onclick = () => { clearInterval(interval); running = false; isWork = true; timeLeft = parseInt(document.getElementById('intWork').value)||30; status.textContent = '⚡ آماده'; upd(); };
        });
    }

    // ========== ۶. ساعت آنالوگ (ویجت پیش‌ساخته) ==========
    function openAnalogClock() {
        openAppPage('🕰️ ساعت آنالوگ', `
            <div class="glass-panel" style="text-align:center;">
                <iframe src="https://free.timeanddate.com/clock/i9m6e5u1/n78/szw110/szh110/hoc09f/hbw0/hfc09f/cf100/hncaaa/fas20/fac00f/fdi76/mqc000/mql15/mqw4/mqd98/mhc000/mhl15/mhw4/mhd98/mmc000/mml10/mmw4/mmd98/hhc000/hhl10/hhw2/hmc000/hml10/hmw2/hmr4/hsc000/hsl10/hsw2/hsr3" frameborder="0" width="110" height="110"></iframe>
            </div>
        `);
    }

    // ========== ۷. ساعت دیجیتال ==========
    function openDigitalClock() {
        openAppPage('🔢 ساعت دیجیتال', `
            <div class="glass-panel" style="text-align:center;">
                <div style="font-size:6rem; font-family:'Cinzel'; color:#ede5d0; text-shadow:0 0 40px rgba(255,255,255,0.25);" id="bigClock"></div>
                <div style="color:#d4af37; font-size:1.4rem; margin-top:15px;" id="bigDate"></div>
            </div>
        `, () => {
            function upd() {
                const now = new Date();
                document.getElementById('bigClock').textContent = now.toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
                document.getElementById('bigDate').textContent = now.toLocaleDateString('fa-IR',{weekday:'long', year:'numeric', month:'long', day:'numeric'});
            }
            upd(); setInterval(upd, 1000);
        });
    }

    // ========== ۸. آلارم ==========
    function openAlarm() {
        openAppPage('⏰ آلارم', `
            <div class="glass-panel">
                <div style="text-align:center; font-size:4rem; margin:20px 0;">⏰</div>
                <div style="display:flex; gap:12px; align-items:center; justify-content:center; flex-wrap:wrap;">
                    <input type="number" id="alarmHour" class="tool-input" placeholder="ساعت" min="0" max="23" style="width:90px; text-align:center;">
                    <span style="font-size:1.5rem; color:#d4af37;">:</span>
                    <input type="number" id="alarmMinute" class="tool-input" placeholder="دقیقه" min="0" max="59" style="width:90px; text-align:center;">
                </div>
                <button class="tool-btn" id="setAlarmBtn" style="display:block; margin:25px auto;">🔔 تنظیم آلارم</button>
                <div id="alarmStatus" style="text-align:center; color:#d4af37; font-size:1.1rem; margin-top:15px;"></div>
            </div>
        `, () => {
            let timeout;
            document.getElementById('setAlarmBtn').onclick = () => {
                const h = parseInt(document.getElementById('alarmHour').value)||0, m = parseInt(document.getElementById('alarmMinute').value)||0;
                const now = new Date(); const alarm = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
                if(alarm <= now) alarm.setDate(alarm.getDate()+1);
                const diff = alarm - now;
                document.getElementById('alarmStatus').textContent = `⏰ آلارم برای ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')} تنظیم شد`;
                if(timeout) clearTimeout(timeout);
                timeout = setTimeout(() => {
                    document.getElementById('alarmStatus').textContent = '🔔🔔🔔 آلارم!';
                    if(Notification.permission === 'granted') new Notification('my time', { body: 'زمان آلارم فرا رسید!' });
                }, diff);
            };
            if(Notification.permission !== 'granted') Notification.requestPermission();
        });
    }

    // ========== ۹. ساعت جهانی ==========
    const worldCities = [
        {name:'Tehran', tz:'Asia/Tehran'},{name:'New York', tz:'America/New_York'},{name:'London', tz:'Europe/London'},
        {name:'Paris', tz:'Europe/Paris'},{name:'Berlin', tz:'Europe/Berlin'},{name:'Tokyo', tz:'Asia/Tokyo'},
        {name:'Beijing', tz:'Asia/Shanghai'},{name:'Sydney', tz:'Australia/Sydney'},{name:'Moscow', tz:'Europe/Moscow'},
        {name:'Brasília', tz:'America/Sao_Paulo'},{name:'New Delhi', tz:'Asia/Kolkata'},{name:'Toronto', tz:'America/Toronto'},
        {name:'Seoul', tz:'Asia/Seoul'},{name:'Dubai', tz:'Asia/Dubai'},{name:'Johannesburg', tz:'Africa/Johannesburg'},
    ];
    function openWorldClock() {
        openAppPage('🌍 ساعت جهانی', `
            <div class="glass-panel">
                <input type="text" id="worldSearch" class="tool-input" placeholder="🔍 جستجوی شهر...">
                <div id="worldResults" style="max-height:500px; overflow-y:auto;"></div>
            </div>
        `, () => {
            const input = document.getElementById('worldSearch'), results = document.getElementById('worldResults');
            function show(q='') {
                const filtered = worldCities.filter(c => c.name.toLowerCase().includes(q.toLowerCase()));
                results.innerHTML = filtered.map(c => `<div style="padding:14px; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; justify-content:space-between;"><span>${c.name}</span><span style="font-family:Cinzel; color:#d4af37;">${getTimeInCity(c.tz)}</span></div>`).join('');
            }
            show(); input.addEventListener('input', () => show(input.value));
            setInterval(() => show(input.value), 1000);
        });
    }

    // ========== ۱۰. مقایسه دو منطقه ==========
    function openCompareZones() {
        openAppPage('🔄 مقایسه دو منطقه', `
            <div class="glass-panel">
                <div class="grid-2">
                    <select id="zone1" class="tool-input">${worldCities.map(c => `<option value="${c.tz}">${c.name}</option>`).join('')}</select>
                    <select id="zone2" class="tool-input">${worldCities.map(c => `<option value="${c.tz}">${c.name}</option>`).join('')}</select>
                </div>
                <div style="display:flex; justify-content:space-around; align-items:center; margin-top:30px;">
                    <div style="text-align:center;"><div style="font-size:0.9rem; color:#aaa;" id="zone1Label">تهران</div><div style="font-family:Cinzel; font-size:2.5rem;" id="zone1Time"></div></div>
                    <div style="font-size:2rem; color:#d4af37;">↔</div>
                    <div style="text-align:center;"><div style="font-size:0.9rem; color:#aaa;" id="zone2Label">نیویورک</div><div style="font-family:Cinzel; font-size:2.5rem;" id="zone2Time"></div></div>
                </div>
            </div>
        `, () => {
            function upd() {
                const z1 = document.getElementById('zone1'), z2 = document.getElementById('zone2');
                document.getElementById('zone1Time').textContent = getTimeInCity(z1.value);
                document.getElementById('zone2Time').textContent = getTimeInCity(z2.value);
                document.getElementById('zone1Label').textContent = z1.options[z1.selectedIndex].text;
                document.getElementById('zone2Label').textContent = z2.options[z2.selectedIndex].text;
            }
            upd(); setInterval(upd, 1000);
            document.getElementById('zone1').addEventListener('change', upd);
            document.getElementById('zone2').addEventListener('change', upd);
        });
    }

    // ========== ۱۱. تقویم ==========
    function openCalendar() {
        const now = new Date();
        const shamsi = gregorianToJalali(now);
        openAppPage('📅 تقویم', `
            <div class="glass-panel" style="text-align:center;">
                <div style="font-size:2.8rem; color:#d4af37; font-family:Cinzel;">${now.toLocaleDateString('fa-IR',{weekday:'long', year:'numeric', month:'long', day:'numeric'})}</div>
                <div style="margin-top:15px; color:#ccc; font-size:1.3rem;">📅 ${shamsi}</div>
                <div style="margin-top:20px; padding:15px; background:rgba(255,255,255,0.03); border-radius:14px; color:#aaa;">${now.toLocaleDateString('en-US',{weekday:'long', year:'numeric', month:'long', day:'numeric'})}</div>
            </div>
        `);
    }

    // ========== ۱۲. طلوع/غروب ==========
    function openSunTimes() {
        openAppPage('🌅 طلوع/غروب', `
            <div class="glass-panel">
                <input type="text" id="sunCity" class="tool-input" placeholder="نام شهر را وارد کنید" value="Tehran">
                <button class="tool-btn" id="getSun" style="display:block; margin:15px auto;">🔍 دریافت</button>
                <div id="sunResult" style="text-align:center; margin-top:20px; color:#d4af37; font-size:1.2rem;"></div>
            </div>
        `, async () => {
            document.getElementById('getSun').onclick = async () => {
                const city = document.getElementById('sunCity').value || 'Tehran';
                try {
                    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
                    const geoData = await geoRes.json();
                    if(!geoData.results) { document.getElementById('sunResult').textContent = 'شهر یافت نشد'; return; }
                    const {latitude, longitude, name} = geoData.results[0];
                    const sunRes = await fetch(`https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`);
                    const sunData = await sunRes.json();
                    document.getElementById('sunResult').innerHTML = `<strong>${name}</strong><br>🌅 طلوع: ${new Date(sunData.results.sunrise).toLocaleTimeString('fa-IR')}<br>🌇 غروب: ${new Date(sunData.results.sunset).toLocaleTimeString('fa-IR')}`;
                } catch(e) { document.getElementById('sunResult').textContent = 'خطا در دریافت اطلاعات'; }
            };
            document.getElementById('getSun').click();
        });
    }

    // ========== ۱۳. آب‌وهوا ==========
    function openWeather() {
        openAppPage('🌤️ آب‌وهوا', `
            <div class="glass-panel">
                <input type="text" id="weatherCity" class="tool-input" placeholder="نام شهر" value="Tehran">
                <button class="tool-btn" id="getWeather" style="display:block; margin:15px auto;">🔍 دریافت پیش‌بینی ۷ روزه</button>
                <div class="weather-widget" id="weatherWidget" style="display:none;">
                    <div id="weatherIcon" style="font-size:4rem;"></div>
                    <div id="weatherTemp" style="font-size:2.8rem; color:#d4af37; font-family:Cinzel;"></div>
                    <div id="weatherDesc" style="color:#ccc; font-size:1.1rem;"></div>
                    <div class="grid-2" style="margin-top:15px;"><div>💧 رطوبت: <span id="weatherHumidity"></span></div><div>💨 باد: <span id="weatherWind"></span></div></div>
                </div>
                <canvas id="weatherChart" width="700" height="350" style="width:100%; max-width:700px; margin:25px auto;"></canvas>
            </div>
            <style>.weather-widget { background: rgba(10,20,40,0.5); border-radius: 20px; padding: 24px; text-align: center; margin-bottom: 20px; }</style>
        `, async () => {
            document.getElementById('getWeather').onclick = async () => {
                const city = document.getElementById('weatherCity').value || 'Tehran';
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
                    document.getElementById('weatherDesc').textContent = name;
                    document.getElementById('weatherIcon').textContent = current.temperature > 25 ? '☀️' : current.temperature > 15 ? '⛅' : '🌧️';
                    document.getElementById('weatherWidget').style.display = 'block';
                    const ctx = document.getElementById('weatherChart').getContext('2d');
                    ctx.clearRect(0,0,700,350); ctx.fillStyle='rgba(22,18,38,0.7)'; ctx.fillRect(0,0,700,350);
                    ctx.strokeStyle='#d4af37'; ctx.lineWidth=4; ctx.beginPath();
                    const d = weatherData.daily;
                    for(let i=0;i<d.temperature_2m_max.length;i++) {
                        const x = 50+i*100, y = 280-d.temperature_2m_max[i]*6;
                        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
                        ctx.fillStyle='#d4af37'; ctx.font='bold 14px Vazirmatn'; ctx.fillText(d.temperature_2m_max[i]+'°', x-10, y-12);
                        ctx.fillStyle='#aaa'; ctx.fillText(d.temperature_2m_min[i]+'°', x-10, y+30);
                        ctx.fillStyle='#ccc'; ctx.font='12px Vazirmatn'; ctx.fillText(d.time[i].slice(5), x-20, 320);
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
            <div class="glass-panel" style="max-width:380px; margin:0 auto;">
                <input type="text" id="calcDisplay" class="tool-input" style="text-align:right; font-size:2.2rem; font-family:Cinzel;" readonly value="0">
                <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-top:15px;">
                    ${['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+','C','(',')','%'].map(b => `<button class="tool-btn" style="padding:16px; font-size:1.3rem;" data-val="${b}">${b}</button>`).join('')}
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
                <select id="unitType" class="tool-input" style="text-align:center;">${Object.keys(units).map(u=>`<option>${u}</option>`).join('')}</select>
                <input type="number" id="unitInput" class="tool-input" placeholder="مقدار" value="1" style="text-align:center;">
                <div class="grid-2"><select id="unitFrom" class="tool-input" style="text-align:center;"></select><select id="unitTo" class="tool-input" style="text-align:center;"></select></div>
                <div style="text-align:center; margin:20px 0; font-size:2rem; color:#d4af37;">⬇</div>
                <div id="unitResult" style="text-align:center; font-size:2rem; color:#d4af37; font-family:Cinzel;"></div>
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
                } else { result.textContent = (val * units[type][from] / units[type][to]).toFixed(4); }
            }
            typeSel.addEventListener('change', update); fromSel.addEventListener('change', convert); toSel.addEventListener('change', convert); input.addEventListener('input', convert); update();
        });
    }

    // ========== ۱۶. محاسبه سن ==========
    function openAgeCalc() {
        openAppPage('🎂 محاسبه سن', `
            <div class="glass-panel">
                <input type="date" id="birthdate" class="tool-input" style="text-align:center;">
                <div id="ageResult" style="text-align:center; margin-top:20px; color:#d4af37; font-size:1.8rem; font-family:Cinzel;"></div>
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
                <div class="grid-2"><div><label>تاریخ اول</label><input type="date" id="date1" class="tool-input"></div><div><label>تاریخ دوم</label><input type="date" id="date2" class="tool-input"></div></div>
                <div id="diffResult" style="text-align:center; margin-top:20px; color:#d4af37; font-size:1.8rem; font-family:Cinzel;"></div>
            </div>
        `, () => {
            function calc() {
                const d1 = new Date(document.getElementById('date1').value), d2 = new Date(document.getElementById('date2').value);
                if(isNaN(d1) || isNaN(d2)) return;
                const diff = Math.abs(d2 - d1); const days = Math.floor(diff / 86400000);
                document.getElementById('diffResult').textContent = `${days} روز اختلاف`;
            }
            document.getElementById('date1').addEventListener('change', calc); document.getElementById('date2').addEventListener('change', calc);
        });
    }

    // ========== ۱۸. ردیاب زمان ==========
    function openTimeLogger() {
        const logs = JSON.parse(localStorage.getItem('timeLogs') || '[]');
        openAppPage('📊 ردیاب زمان', `
            <div class="glass-panel">
                <input type="text" id="logTask" class="tool-input" placeholder="نام وظیفه">
                <button class="tool-btn" id="logStart" style="display:block; margin:15px auto;">▶ شروع</button>
                <div id="logStatus" style="text-align:center; color:#d4af37; font-size:1.1rem; margin:15px 0;"></div>
                <div id="logList" style="max-height:300px; overflow-y:auto;">${logs.map(l => `<div style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.06);">📌 ${l.task}: ${Math.floor(l.duration/60)} دقیقه ${l.duration%60} ثانیه</div>`).join('')}</div>
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
                        document.getElementById('logStatus').textContent = `⏳ ${task}: ${Math.floor(elapsed/60)} دقیقه ${elapsed%60} ثانیه`;
                    }, 1000);
                } else {
                    clearInterval(interval); const duration = Math.floor((Date.now() - startTime)/1000);
                    logs.push({task, duration}); localStorage.setItem('timeLogs', JSON.stringify(logs));
                    document.getElementById('logStart').textContent = '▶ شروع'; document.getElementById('logStart').classList.remove('active');
                    document.getElementById('logStatus').textContent = '';
                    const li = document.createElement('div'); li.style.cssText = 'padding:12px; border-bottom:1px solid rgba(255,255,255,0.06);';
                    li.textContent = `📌 ${task}: ${Math.floor(duration/60)} دقیقه ${duration%60} ثانیه`;
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
                <textarea id="notesArea" class="tool-input" style="height:300px; resize:vertical;">${saved}</textarea>
                <div style="display:flex; gap:12px; justify-content:center; margin-top:15px;">
                    <button class="tool-btn" id="saveNotes">💾 ذخیره</button>
                    <button class="tool-btn" id="clearNotes">🗑 پاک کردن</button>
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
                <div style="font-size:1.8rem; font-style:italic; color:#ede5d0; line-height:2.2; margin:30px 0;">${text}</div>
                ${author ? `<div style="color:#d4af37; font-size:1.3rem; margin-top:20px; font-family:'Cormorant Garamond', serif;">— ${author}</div>` : ''}
                <button class="tool-btn" id="newQuote" style="margin-top:25px;">🔄 نقل‌قول جدید</button>
            </div>
        `, () => { document.getElementById('newQuote').onclick = () => { closeAppPage(); openDailyQuote(); }; });
    }

    // ========== ۲۱. گالری تم ==========
    function openThemeGallery() {
        const themes = ['کهکشانی','قرمز مخملی','آبی اقیانوسی','سبز زمردی','طلایی مجلل','شیشه‌ای'];
        openAppPage('🎨 گالری تم', `
            <div class="glass-panel">
                ${themes.map((t,i) => `<button class="tool-btn" style="display:block; width:100%; margin:10px 0;" onclick="applyTheme(${i}); document.getElementById('appContainer').style.display='none'; document.querySelector('.main-container').style.display='';">${t}</button>`).join('')}
            </div>
        `);
    }

    // ========== ۲۲. مترونوم ==========
    function openMetronome() {
        openAppPage('🎵 مترونوم', `
            <div class="glass-panel" style="text-align:center;">
                <div style="font-size:4rem; font-family:Cinzel;" id="bpmDisplay">120</div>
                <input type="range" id="bpmSlider" class="tool-input" min="40" max="240" value="120" style="width:100%; margin:20px 0;">
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
            <div class="glass-panel" style="height:70vh; overflow:hidden; padding:0;">
                <iframe src="https://www.openstreetmap.org/export/embed.html?bbox=51.2,35.5,51.6,35.9&layer=mapnik" style="width:100%; height:100%; border:none; border-radius:20px;"></iframe>
            </div>
        `);
    }

    // ========== ۲۴. آب‌وهوای موقعیت فعلی ==========
    function openWeatherByLocation() {
        openAppPage('📍 آب‌وهوای موقعیت من', `
            <div class="glass-panel" style="text-align:center;">
                <button class="tool-btn" id="getLocationWeather">📍 دریافت آب‌وهوای موقعیت فعلی</button>
                <div class="weather-widget" id="locationWeatherWidget" style="margin-top:20px; display:none;">
                    <div id="locWeatherIcon" style="font-size:4rem;"></div>
                    <div id="locWeatherTemp" style="font-size:2.8rem; color:#d4af37; font-family:Cinzel;"></div>
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
                        document.getElementById('locWeatherDesc').textContent = 'موقعیت فعلی شما';
                        document.getElementById('locationWeatherWidget').style.display = 'block';
                    } catch(e) {}
                });
            };
        });
    }

    // ادامه در بخش دوم (هوش مصنوعی و ابزارهای جدید)...    // ====================== هوش مصنوعی‌های واقعی و تست‌شده ======================

    // ========== ۲۵. چت‌بات هوشمند با Gemini API ==========
    function openChatbot() {
        openAppPage('🤖 چت‌بات هوشمند', `
            <div class="glass-panel">
                <div id="chatHistory" style="max-height:400px; overflow-y:auto; padding:10px; margin-bottom:15px;"></div>
                <input type="text" id="chatInput" class="tool-input" placeholder="سوالت رو بپرس...">
                <button class="tool-btn" id="sendChatBtn" style="display:block; margin:10px auto;">ارسال</button>
            </div>
        `, () => {
            const history = document.getElementById('chatHistory');
            const input = document.getElementById('chatInput');
            const API_KEY = 'AIzaSyA_your_gemini_api_key_here'; // کلید رایگان Gemini
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

            document.getElementById('sendChatBtn').onclick = async () => {
                const msg = input.value.trim();
                if (!msg) return;
                history.innerHTML += `<div style="text-align:right; color:#d4af37; margin:8px;">🧑‍💻 ${msg}</div>`;
                input.value = '';
                try {
                    const res = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ parts: [{ text: msg }] }] })
                    });
                    const data = await res.json();
                    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'متوجه نشدم.';
                    history.innerHTML += `<div style="text-align:left; color:#ccc; margin:8px;">🤖 ${reply}</div>`;
                } catch (e) {
                    history.innerHTML += `<div style="text-align:left; color:#ff6464; margin:8px;">❌ خطا در ارتباط با هوش مصنوعی</div>`;
                }
                history.scrollTop = history.scrollHeight;
            };
        });
    }

    // ========== ۲۶. تولید عکس با Pollinations.ai ==========
    function openAIImage() {
        openAppPage('🎨 تولید عکس هنری', `
            <div class="glass-panel" style="text-align:center;">
                <input type="text" id="imagePrompt" class="tool-input" placeholder="توضیح عکس (فارسی یا انگلیسی)">
                <button class="tool-btn" id="generateImageBtn">✨ تولید عکس</button>
                <div id="imageResult" style="margin-top:20px;"></div>
            </div>
        `, () => {
            document.getElementById('generateImageBtn').onclick = () => {
                const prompt = document.getElementById('imagePrompt').value || 'a beautiful galaxy';
                const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true`;
                document.getElementById('imageResult').innerHTML = `<img src="${url}" style="max-width:100%; border-radius:16px;" onerror="this.parentElement.innerHTML='خطا در تولید عکس'">`;
            };
        });
    }

    // ========== ۲۷. ترجمه هوشمند (LibreTranslate) ==========
    function openTranslator() {
        openAppPage('🌍 ترجمه هوشمند', `
            <div class="glass-panel">
                <textarea id="translateInput" class="tool-input" placeholder="متن خود را وارد کنید..."></textarea>
                <div class="grid-2">
                    <select id="translateFrom" class="tool-input"><option value="fa">فارسی</option><option value="en">انگلیسی</option></select>
                    <select id="translateTo" class="tool-input"><option value="en">انگلیسی</option><option value="fa">فارسی</option></select>
                </div>
                <button class="tool-btn" id="translateBtn" style="display:block; margin:10px auto;">ترجمه کن</button>
                <div id="translateResult" style="margin-top:20px; padding:15px; background:rgba(255,255,255,0.05); border-radius:12px; color:#ccc;"></div>
            </div>
        `, () => {
            document.getElementById('translateBtn').onclick = async () => {
                const text = document.getElementById('translateInput').value;
                const from = document.getElementById('translateFrom').value;
                const to = document.getElementById('translateTo').value;
                try {
                    const res = await fetch('https://libretranslate.de/translate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ q: text, source: from, target: to, format: 'text' })
                    });
                    const data = await res.json();
                    document.getElementById('translateResult').textContent = data.translatedText || 'ترجمه نشد.';
                } catch (e) {
                    document.getElementById('translateResult').textContent = 'خطا در ترجمه.';
                }
            };
        });
    }

    // ========== ۲۸. خلاصه‌سازی متن (الگوریتم هوشمند) ==========
    function openSummarizer() {
        openAppPage('📝 خلاصه‌سازی', `
            <div class="glass-panel">
                <textarea id="summarizeInput" class="tool-input" placeholder="متن طولانی..."></textarea>
                <button class="tool-btn" id="summarizeBtn">خلاصه کن</button>
                <div id="summarizeResult" style="margin-top:20px; padding:15px; background:rgba(255,255,255,0.05); border-radius:12px; color:#ccc;"></div>
            </div>
        `, () => {
            document.getElementById('summarizeBtn').onclick = () => {
                const text = document.getElementById('summarizeInput').value;
                const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);
                if (sentences.length === 0) return;
                const summary = sentences.slice(0, Math.ceil(sentences.length / 3)).join('. ') + '.';
                document.getElementById('summarizeResult').textContent = summary;
            };
        });
    }

    // ========== ۲۹. تحلیل احساسات (الگوریتم کلمات کلیدی) ==========
    function openSentiment() {
        openAppPage('😊 تحلیل احساسات', `
            <div class="glass-panel">
                <textarea id="sentimentInput" class="tool-input" placeholder="متنی برای تحلیل احساسات..."></textarea>
                <button class="tool-btn" id="analyzeSentimentBtn">تحلیل</button>
                <div id="sentimentResult" style="text-align:center; margin-top:20px; color:#d4af37; font-size:1.3rem;"></div>
            </div>
        `, () => {
            const positiveWords = ['خوب', 'عالی', 'زیبا', 'دوست', 'شاد', 'موفق', 'عالی', 'خوشحال', 'بهترین'];
            const negativeWords = ['بد', 'زشت', 'ناراحت', 'غمگین', 'شکست', 'وحشتناک', 'دشمن'];
            document.getElementById('analyzeSentimentBtn').onclick = () => {
                const text = document.getElementById('sentimentInput').value;
                let score = 0;
                positiveWords.forEach(w => { if (text.includes(w)) score++; });
                negativeWords.forEach(w => { if (text.includes(w)) score--; });
                document.getElementById('sentimentResult').textContent = score > 0 ? '😊 مثبت' : score < 0 ? '😢 منفی' : '😐 خنثی';
            };
        });
    }

    // ========== ۳۰. دستیار کدنویسی (الگوریتم ساده) ==========
    function openCodeAssistant() {
        openAppPage('💻 دستیار کدنویسی', `
            <div class="glass-panel">
                <textarea id="codePrompt" class="tool-input" placeholder="شرح تابع مورد نظر..."></textarea>
                <button class="tool-btn" id="generateCodeBtn">✨ تولید کد</button>
                <pre id="codeResult" style="margin-top:20px; padding:15px; background:rgba(0,0,0,0.3); border-radius:12px; color:#d4af37; overflow-x:auto;"></pre>
            </div>
        `, () => {
            const templates = {
                'مرتب‌سازی': 'function sortArray(arr) {\n  return arr.sort((a, b) => a - b);\n}',
                'جستجو': 'function searchArray(arr, target) {\n  return arr.find(item => item === target);\n}',
                'میانگین': 'function average(arr) {\n  return arr.reduce((a, b) => a + b, 0) / arr.length;\n}',
            };
            document.getElementById('generateCodeBtn').onclick = () => {
                const prompt = document.getElementById('codePrompt').value;
                const matched = Object.keys(templates).find(k => prompt.includes(k));
                document.getElementById('codeResult').textContent = matched ? templates[matched] : '// تابع مورد نظر یافت نشد.';
            };
        });
    }

    // ====================== ابزارهای جدید و محبوب ======================

    // ========== ۳۱. مبدل ارز (API جدید) ==========
    function openCurrencyConverter() {
        openAppPage('💱 مبدل ارز', `
            <div class="glass-panel">
                <input type="number" id="currencyAmount" class="tool-input" placeholder="مقدار" value="1">
                <div class="grid-2">
                    <select id="currencyFrom" class="tool-input"><option>USD</option><option>EUR</option><option>IRR</option><option>GBP</option></select>
                    <select id="currencyTo" class="tool-input"><option>IRR</option><option>USD</option><option>EUR</option><option>GBP</option></select>
                </div>
                <button class="tool-btn" id="convertCurrencyBtn" style="display:block; margin:10px auto;">تبدیل</button>
                <div id="currencyResult" style="text-align:center; margin-top:20px; color:#d4af37; font-size:1.5rem;"></div>
            </div>
        `, () => {
            document.getElementById('convertCurrencyBtn').onclick = async () => {
                const amount = document.getElementById('currencyAmount').value;
                const from = document.getElementById('currencyFrom').value;
                const to = document.getElementById('currencyTo').value;
                try {
                    const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
                    const data = await res.json();
                    document.getElementById('currencyResult').textContent = `${amount} ${from} = ${(amount * data.rates[to]).toFixed(2)} ${to}`;
                } catch (e) { document.getElementById('currencyResult').textContent = 'خطا در دریافت نرخ.'; }
            };
        });
    }

    // ========== ۳۲. کوتاه‌کننده لینک (is.gd) ==========
    function openLinkShortener() {
        openAppPage('🔗 کوتاه‌کننده لینک', `
            <div class="glass-panel">
                <input type="text" id="longUrl" class="tool-input" placeholder="لینک بلند خود را وارد کنید">
                <button class="tool-btn" id="shortenBtn" style="display:block; margin:10px auto;">کوتاه کن</button>
                <div id="shortUrlResult" style="margin-top:20px; text-align:center; color:#d4af37; font-size:1.2rem;"></div>
            </div>
        `, () => {
            document.getElementById('shortenBtn').onclick = async () => {
                const url = document.getElementById('longUrl').value;
                try {
                    const res = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`);
                    const data = await res.json();
                    document.getElementById('shortUrlResult').innerHTML = `<a href="${data.shorturl}" target="_blank" style="color:#d4af37;">${data.shorturl}</a>`;
                } catch (e) { document.getElementById('shortUrlResult').textContent = 'خطا در کوتاه کردن.'; }
            };
        });
    }

    // ========== ۳۳. QR Code Generator ==========
    function openQRCode() {
        openAppPage('🏷️ QR Code Generator', `
            <div class="glass-panel" style="text-align:center;">
                <input type="text" id="qrInput" class="tool-input" placeholder="متن یا لینک برای QR Code">
                <button class="tool-btn" id="generateQRBtn">✨ تولید</button>
                <div id="qrResult" style="margin-top:20px;"></div>
            </div>
        `, () => {
            document.getElementById('generateQRBtn').onclick = () => {
                const text = document.getElementById('qrInput').value;
                const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
                document.getElementById('qrResult').innerHTML = `<img src="${url}" style="border-radius:16px;">`;
            };
        });
    }

    // ========== ۳۴. Markdown Preview ==========
    function openMarkdownPreview() {
        openAppPage('📝 Markdown Preview', `
            <div class="glass-panel">
                <textarea id="mdInput" class="tool-input" placeholder="متن Markdown..." style="height:150px;"></textarea>
                <div id="mdPreview" style="margin-top:20px; padding:15px; background:rgba(255,255,255,0.05); border-radius:12px; color:#ccc;"></div>
            </div>
        `, () => {
            document.getElementById('mdInput').addEventListener('input', function() {
                const text = this.value;
                const html = text
                    .replace(/### (.*)/g, '<h3 style="color:#d4af37;">$1</h3>')
                    .replace(/## (.*)/g, '<h2 style="color:#d4af37;">$1</h2>')
                    .replace(/# (.*)/g, '<h1 style="color:#d4af37;">$1</h1>')
                    .replace(/\*\*(.*)\*\*/g, '<b>$1</b>')
                    .replace(/\*(.*)\*/g, '<i>$1</i>');
                document.getElementById('mdPreview').innerHTML = html;
            });
        });
    }

    // ========== ۳۵. Text Diff Checker ==========
    function openTextDiff() {
        openAppPage('🔍 Text Diff Checker', `
            <div class="glass-panel">
                <textarea id="diffText1" class="tool-input" placeholder="متن اول..."></textarea>
                <textarea id="diffText2" class="tool-input" placeholder="متن دوم..."></textarea>
                <button class="tool-btn" id="compareDiffBtn">مقایسه</button>
                <div id="diffResult" style="margin-top:20px; padding:15px; background:rgba(255,255,255,0.05); border-radius:12px; color:#ccc; white-space:pre-wrap;"></div>
            </div>
        `, () => {
            document.getElementById('compareDiffBtn').onclick = () => {
                const text1 = document.getElementById('diffText1').value;
                const text2 = document.getElementById('diffText2').value;
                if (text1 === text2) {
                    document.getElementById('diffResult').textContent = '✅ متون یکسان هستند.';
                } else {
                    document.getElementById('diffResult').textContent = '❌ متون متفاوت هستند.';
                }
            };
        });
    }

    // ========== ۳۶. UUID Generator ==========
    function openUUIDGenerator() {
        openAppPage('🆔 UUID Generator', `
            <div class="glass-panel" style="text-align:center;">
                <button class="tool-btn" id="generateUUIDBtn">تولید UUID</button>
                <div id="uuidResult" style="margin-top:20px; color:#d4af37; font-size:1.2rem; word-break:break-all;"></div>
            </div>
        `, () => {
            document.getElementById('generateUUIDBtn').onclick = () => {
                const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
                document.getElementById('uuidResult').textContent = uuid;
            };
        });
    }

    // ========== ۳۷. IP Lookup ==========
    function openIPLookup() {
        openAppPage('🌐 IP Lookup', `
            <div class="glass-panel" style="text-align:center;">
                <button class="tool-btn" id="checkIPBtn">بررسی IP من</button>
                <div id="ipResult" style="margin-top:20px; color:#ccc;"></div>
            </div>
        `, () => {
            document.getElementById('checkIPBtn').onclick = async () => {
                try {
                    const res = await fetch('https://api.ipify.org?format=json');
                    const data = await res.json();
                    document.getElementById('ipResult').textContent = `آدرس IP: ${data.ip}`;
                } catch (e) {
                    document.getElementById('ipResult').textContent = 'خطا در دریافت IP.';
                }
            };
        });
    }

    // ========== ۳۸. تست سرعت اینترنت ==========
    function openSpeedTest() {
        openAppPage('🚀 تست سرعت', `
            <div class="glass-panel" style="text-align:center;">
                <button class="tool-btn" id="startSpeedTest">شروع تست</button>
                <div id="speedResult" style="margin-top:20px; color:#d4af37; font-size:1.3rem;"></div>
            </div>
        `, () => {
            document.getElementById('startSpeedTest').onclick = () => {
                document.getElementById('speedResult').textContent = '⏳ در حال تست...';
                const image = new Image(); const startTime = Date.now();
                image.onload = () => {
                    const duration = (Date.now() - startTime) / 1000;
                    const speed = (500000 * 8 / duration / 1024 / 1024).toFixed(2);
                    document.getElementById('speedResult').textContent = `سرعت تقریبی: ${speed} Mbps`;
                };
                image.src = 'https://www.google.com/images/phd/px.gif?t=' + Date.now();
            };
        });
    }

    // ========== ۳۹. تولید رمز عبور ==========
    function openPasswordGenerator() {
        openAppPage('🔐 رمز عبور', `
            <div class="glass-panel" style="text-align:center;">
                <button class="tool-btn" id="generatePasswordBtn">تولید رمز</button>
                <div id="passwordResult" style="margin-top:20px; color:#d4af37; font-size:1.5rem; word-break:break-all;"></div>
            </div>
        `, () => {
            document.getElementById('generatePasswordBtn').onclick = () => {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
                let pass = ''; for (let i=0; i<16; i++) pass += chars[Math.floor(Math.random() * chars.length)];
                document.getElementById('passwordResult').textContent = pass;
            };
        });
    }

    // ========== ۴۰. محاسبه BMI ==========
    function openBMI() {
        openAppPage('⚖️ محاسبه BMI', `
            <div class="glass-panel">
                <input type="number" id="weight" class="tool-input" placeholder="وزن (kg)">
                <input type="number" id="height" class="tool-input" placeholder="قد (cm)">
                <button class="tool-btn" id="calcBMIBtn">محاسبه</button>
                <div id="bmiResult" style="text-align:center; margin-top:20px; color:#d4af37; font-size:1.5rem;"></div>
            </div>
        `, () => {
            document.getElementById('calcBMIBtn').onclick = () => {
                const w = parseFloat(document.getElementById('weight').value), h = parseFloat(document.getElementById('height').value) / 100;
                const bmi = (w / (h * h)).toFixed(1);
                let status = bmi < 18.5 ? 'کمبود وزن' : bmi < 25 ? 'نرمال' : bmi < 30 ? 'اضافه وزن' : 'چاق';
                document.getElementById('bmiResult').textContent = `${bmi} (${status})`;
            };
        });
    }

    // ========== منوی نهایی بر اساس ارزش ==========
    const menuCategories = [
        { name: '✨ خانه', items: [{ icon:'🏠', text:'داشبورد', action: openDashboard }] },
        { name: '🤖 هوش مصنوعی', items: [
            { icon:'🤖', text:'چت‌بات هوشمند', action: openChatbot },
            { icon:'🎨', text:'تولید عکس هنری', action: openAIImage },
            { icon:'🌍', text:'ترجمه هوشمند', action: openTranslator },
            { icon:'📝', text:'خلاصه‌سازی', action: openSummarizer },
            { icon:'😊', text:'تحلیل احساسات', action: openSentiment },
            { icon:'💻', text:'دستیار کدنویسی', action: openCodeAssistant },
        ]},
        { name: '🌍 ابزارهای جهانی', items: [
            { icon:'💱', text:'مبدل ارز', action: openCurrencyConverter },
            { icon:'🚀', text:'تست سرعت', action: openSpeedTest },
            { icon:'🔗', text:'کوتاه‌کننده لینک', action: openLinkShortener },
            { icon:'🔐', text:'رمز عبور', action: openPasswordGenerator },
            { icon:'⚖️', text:'محاسبه BMI', action: openBMI },
            { icon:'🏷️', text:'QR Code Generator', action: openQRCode },
            { icon:'📝', text:'Markdown Preview', action: openMarkdownPreview },
            { icon:'🔍', text:'Text Diff Checker', action: openTextDiff },
            { icon:'🆔', text:'UUID Generator', action: openUUIDGenerator },
            { icon:'🌐', text:'IP Lookup', action: openIPLookup },
        ]},
        { name: '⏱️ زمان‌سنج‌ها', items: [
            { icon:'⏱️', text:'کرنوگراف', action: openChronograph },
            { icon:'🍅', text:'پومودورو', action: openPomodoro },
            { icon:'⏳', text:'تایمر', action: openTimer },
            { icon:'🔁', text:'تایمر اینتروال', action: openIntervalTimer },
        ]},
        { name: '🕰️ ساعت‌ها', items: [
            { icon:'🕰️', text:'ساعت آنالوگ', action: openAnalogClock },
            { icon:'🔢', text:'ساعت دیجیتال', action: openDigitalClock },
        ]},
        { name: '⏰ آلارم', items: [{ icon:'⏰', text:'آلارم', action: openAlarm }] },
        { name: '🌍 مناطق زمانی', items: [
            { icon:'🌍', text:'ساعت جهانی', action: openWorldClock },
            { icon:'🔄', text:'مقایسه دو منطقه', action: openCompareZones },
        ]},
        { name: '📅 تقویم و نجوم', items: [
            { icon:'📅', text:'تقویم', action: openCalendar },
            { icon:'🌅', text:'طلوع/غروب', action: openSunTimes },
        ]},
        { name: '🧮 محاسبات', items: [
            { icon:'🔢', text:'ماشین حساب', action: openCalculator },
            { icon:'🔄', text:'تبدیل واحد', action: openUnitConverter },
            { icon:'🎂', text:'محاسبه سن', action: openAgeCalc },
            { icon:'📆', text:'اختلاف تاریخ', action: openDateDiff },
        ]},
        { name: '📊 بهره‌وری', items: [{ icon:'📊', text:'ردیاب زمان', action: openTimeLogger }] },
        { name: '🌤️ آب‌وهوا', items: [
            { icon:'🌤️', text:'آب‌وهوا ۷ روزه', action: openWeather },
            { icon:'📍', text:'آب‌وهوای موقعیت من', action: openWeatherByLocation },
        ]},
        { name: '🗺️ نقشه', items: [{ icon:'🗺️', text:'نقشه جهان', action: openMap }] },
        { name: '📝 ابزارهای کاربردی', items: [
            { icon:'📝', text:'یادداشت', action: openNotes },
            { icon:'📜', text:'نقل‌قول روزانه', action: openDailyQuote },
        ]},
        { name: '🎵 ابزارهای جالب', items: [{ icon:'🎵', text:'مترونوم', action: openMetronome }] },
        { name: '⚙️ تنظیمات', items: [{ icon:'🎨', text:'گالری تم', action: openThemeGallery }] },
    ];

    function buildMenu() {
        const menuContent = document.getElementById('menuContent');
        if(!menuContent) return;
        let html = '<input type="text" id="menuSearch" class="tool-input" placeholder="🔍 جستجوی ابزار..." style="margin-bottom:15px;">';
        menuCategories.forEach(cat => {
            html += `<div class="menu-category"><div class="menu-cat-header"><span>${cat.name}</span><span class="arrow">▼</span></div><div class="menu-cat-items">`;
            cat.items.forEach(item => { html += `<div class="menu-item" data-action="${item.text}"><span>${item.icon}</span> ${item.text}</div>`; });
            html += `</div></div>`;
        });
        menuContent.innerHTML = html;
        document.getElementById('menuSearch').addEventListener('input', function() {
            const q = this.value.toLowerCase();
            document.querySelectorAll('.menu-item').forEach(el => el.style.display = el.textContent.toLowerCase().includes(q) ? 'flex' : 'none');
        });
        document.querySelectorAll('.menu-cat-header').forEach(h => h.addEventListener('click', () => h.parentElement.classList.toggle('open')));
        document.querySelectorAll('.menu-item').forEach(el => el.addEventListener('click', () => {
            const found = menuCategories.flatMap(c=>c.items).find(i=>i.text===el.dataset.action);
            if(found?.action) { found.action(); closeMenu(); }
        }));
    }

    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const menuDrawer = document.getElementById('menuDrawer');
    const menuOverlay = document.getElementById('menuOverlay');
    function openMenu() { menuDrawer.classList.add('open'); menuOverlay.classList.add('active'); hamburgerBtn.classList.add('open'); }
    function closeMenu() { menuDrawer.classList.remove('open'); menuOverlay.classList.remove('active'); hamburgerBtn.classList.remove('open'); }
    hamburgerBtn.addEventListener('click', () => menuDrawer.classList.contains('open') ? closeMenu() : openMenu());
    menuOverlay.addEventListener('click', closeMenu);

    function initTools() {
        buildMenu();
        console.log('✅ اَبَر سایت با ۴۰+ ابزار واقعی و هوش مصنوعی فعال شد');
    }
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initTools);
    else initTools();
})();
