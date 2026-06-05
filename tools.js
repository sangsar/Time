// ==================== tools.js ====================
// مدیریت منوی همبرگری و ابزارهای حرفه‌ای
(function() {

    // ========== ساخت SPA ==========
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
            <div style="max-width:800px; margin:20px auto; padding:0 16px 40px;">
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

    // ========== ابزارهای کمکی ==========
    function getTimeInCity(tz) {
        try { return new Date().toLocaleString('en-US', { timeZone: tz, hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false }); }
        catch(e) { return '--:--:--'; }
    }

    // ========== ابزارها ==========
    function openChronograph() {
        openAppPage('⏱️ کرنوگراف', `
            <div style="background:rgba(22,18,38,0.7); backdrop-filter:blur(20px); border:1px solid rgba(212,175,55,0.25); border-radius:20px; padding:20px;">
                <div style="text-align:center; font-size:3.5rem; font-family:'Cinzel'; color:#ede5d0;" id="chronoDisplay">00:00.00</div>
                <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-top:20px;">
                    <button class="tool-btn" id="chronoStart">▶ شروع</button>
                    <button class="tool-btn" id="chronoStop">⏸ توقف</button>
                    <button class="tool-btn" id="chronoReset">↺ ریست</button>
                    <button class="tool-btn" id="chronoLap">🏁 لاپ</button>
                </div>
                <div id="lapList" style="max-height:200px; overflow-y:auto; margin-top:15px;"></div>
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

    function openPomodoro() {
        openAppPage('🍅 پومودورو', `
            <div style="background:rgba(22,18,38,0.7); backdrop-filter:blur(20px); border:1px solid rgba(212,175,55,0.25); border-radius:20px; padding:20px;">
                <div style="text-align:center; font-size:4rem; font-family:'Cinzel'; color:#ede5d0;" id="pomDisplay">25:00</div>
                <div style="text-align:center; color:#d4af37;" id="pomStatus">آمادهٔ کار</div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:15px;">
                    <div><label style="color:#ccc;">دقیقه کار</label><input type="number" id="workMin" class="tool-input" value="25" min="1"></div>
                    <div><label style="color:#ccc;">دقیقه استراحت</label><input type="number" id="breakMin" class="tool-input" value="5" min="1"></div>
                </div>
                <div style="display:flex; gap:10px; justify-content:center; margin-top:15px;">
                    <button class="tool-btn" id="pomStart">▶</button>
                    <button class="tool-btn" id="pomPause">⏸</button>
                    <button class="tool-btn" id="pomReset">↺</button>
                </div>
            </div>
        `, () => {
            let interval, running = false, timeLeft = 1500, isWork = true;
            const disp = document.getElementById('pomDisplay'), status = document.getElementById('pomStatus');
            function upd() { const m = Math.floor(timeLeft/60), s = timeLeft%60; disp.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }
            document.getElementById('pomStart').onclick = () => { if(!running) { running = true; interval = setInterval(() => { if(timeLeft <= 0) { clearInterval(interval); running = false; isWork = !isWork; timeLeft = (isWork ? parseInt(document.getElementById('workMin').value)||25 : parseInt(document.getElementById('breakMin').value)||5) * 60; status.textContent = isWork ? 'زمان کار' : 'استراحت'; upd(); return; } timeLeft--; upd(); }, 1000); } };
            document.getElementById('pomPause').onclick = () => { clearInterval(interval); running = false; };
            document.getElementById('pomReset').onclick = () => { clearInterval(interval); running = false; isWork = true; timeLeft = (parseInt(document.getElementById('workMin').value)||25)*60; status.textContent = 'آمادهٔ کار'; upd(); };
        });
    }

    function openTimer() {
        openAppPage('⏳ تایمر', `
            <div style="background:rgba(22,18,38,0.7); backdrop-filter:blur(20px); border:1px solid rgba(212,175,55,0.25); border-radius:20px; padding:20px;">
                <div style="text-align:center; font-size:4rem; font-family:'Cinzel'; color:#ede5d0;" id="timerDisplay">00:00</div>
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

    function openAnalogClock() {
        openAppPage('🕰️ ساعت آنالوگ', `
            <div style="background:rgba(22,18,38,0.7); backdrop-filter:blur(20px); border:1px solid rgba(212,175,55,0.25); border-radius:20px; padding:20px; text-align:center;">
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

    function openWeather() {
        openAppPage('🌤️ آب‌وهوا ۷ روزه', `
            <div style="background:rgba(22,18,38,0.7); backdrop-filter:blur(20px); border:1px solid rgba(212,175,55,0.25); border-radius:20px; padding:20px;">
                <input type="text" id="weatherCity" class="tool-input" placeholder="نام شهر" value="Tehran">
                <button class="tool-btn" id="getWeather" style="margin-top:10px;">🔍 دریافت</button>
                <div id="weatherResult" style="margin-top:15px; text-align:center;"></div>
                <canvas id="weatherChart" width="700" height="300" style="width:100%; max-width:700px; margin:20px auto; display:block;"></canvas>
            </div>
        `, async () => {
            document.getElementById('getWeather').onclick = async () => {
                const city = document.getElementById('weatherCity').value || 'Tehran';
                try {
                    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
                    const geoData = await geoRes.json();
                    if(!geoData.results) { document.getElementById('weatherResult').innerHTML = 'شهر یافت نشد'; return; }
                    const {latitude, longitude, name} = geoData.results[0];
                    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=7`);
                    const weatherData = await weatherRes.json();
                    const daily = weatherData.daily;
                    document.getElementById('weatherResult').innerHTML = `<h3 style="color:#d4af37;">${name}</h3>`;
                    const ctx = document.getElementById('weatherChart').getContext('2d');
                    ctx.clearRect(0,0,700,300); ctx.fillStyle='rgba(22,18,38,0.7)'; ctx.fillRect(0,0,700,300);
                    ctx.strokeStyle='#d4af37'; ctx.lineWidth=3; ctx.beginPath();
                    for(let i=0;i<daily.temperature_2m_max.length;i++) {
                        const x = 50+i*100, y = 250-daily.temperature_2m_max[i]*5;
                        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
                        ctx.fillStyle='#d4af37'; ctx.fillText(daily.temperature_2m_max[i]+'°', x-10, y-10);
                        ctx.fillStyle='#aaa'; ctx.fillText(daily.temperature_2m_min[i]+'°', x-10, y+25);
                        ctx.fillStyle='#ccc'; ctx.fillText(daily.time[i].slice(5), x-20, 280);
                    }
                    ctx.stroke();
                } catch(e) { document.getElementById('weatherResult').innerHTML = 'خطا در دریافت'; }
            };
            document.getElementById('getWeather').click();
        });
    }

    function openWorldClock() {
        const cities = [
            {name:'Tehran', tz:'Asia/Tehran'},{name:'New York', tz:'America/New_York'},{name:'London', tz:'Europe/London'},
            {name:'Paris', tz:'Europe/Paris'},{name:'Berlin', tz:'Europe/Berlin'},{name:'Tokyo', tz:'Asia/Tokyo'},
            {name:'Beijing', tz:'Asia/Shanghai'},{name:'Sydney', tz:'Australia/Sydney'},{name:'Moscow', tz:'Europe/Moscow'},
            {name:'Brasília', tz:'America/Sao_Paulo'},{name:'New Delhi', tz:'Asia/Kolkata'},{name:'Toronto', tz:'America/Toronto'},
            {name:'Seoul', tz:'Asia/Seoul'},{name:'Dubai', tz:'Asia/Dubai'},{name:'Johannesburg', tz:'Africa/Johannesburg'},
            {name:'Los Angeles', tz:'America/Los_Angeles'},{name:'Chicago', tz:'America/Chicago'},{name:'Mexico City', tz:'America/Mexico_City'},
            {name:'Cairo', tz:'Africa/Cairo'},{name:'Istanbul', tz:'Europe/Istanbul'},{name:'Bangkok', tz:'Asia/Bangkok'},
            {name:'Singapore', tz:'Asia/Singapore'},{name:'Hong Kong', tz:'Asia/Hong_Kong'},{name:'Perth', tz:'Australia/Perth'}
        ];
        openAppPage('🌍 ساعت جهانی', `
            <div style="background:rgba(22,18,38,0.7); backdrop-filter:blur(20px); border:1px solid rgba(212,175,55,0.25); border-radius:20px; padding:20px;">
                <input type="text" id="worldSearch" class="tool-input" placeholder="🔍 جستجوی شهر...">
                <div id="worldResults" style="max-height:400px; overflow-y:auto; margin-top:10px;"></div>
            </div>
        `, () => {
            const input = document.getElementById('worldSearch'), results = document.getElementById('worldResults');
            function show(q='') {
                const filtered = cities.filter(c => c.name.toLowerCase().includes(q.toLowerCase()));
                results.innerHTML = filtered.map(c => `<div style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between;"><span>${c.name}</span><span style="font-family:Cinzel; color:#d4af37;">${getTimeInCity(c.tz)}</span></div>`).join('');
            }
            show(); input.addEventListener('input', () => show(input.value));
            setInterval(() => show(input.value), 1000);
        });
    }

    function openCalculator() {
        openAppPage('🔢 ماشین حساب', `
            <div style="background:rgba(22,18,38,0.7); backdrop-filter:blur(20px); border:1px solid rgba(212,175,55,0.25); border-radius:20px; padding:20px; max-width:350px; margin:0 auto;">
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

    function openUnitConverter() {
        const units = {
            length: { meter:1, km:1000, mile:1609.34, yard:0.9144, foot:0.3048 },
            weight: { kg:1, gram:0.001, pound:0.4536, ounce:0.02835 },
            temp: { celsius:'c', fahrenheit:'f', kelvin:'k' },
            time: { second:1, minute:60, hour:3600, day:86400 }
        };
        openAppPage('🔄 تبدیل واحد', `
            <div style="background:rgba(22,18,38,0.7); backdrop-filter:blur(20px); border:1px solid rgba(212,175,55,0.25); border-radius:20px; padding:20px;">
                <select id="unitType" class="tool-input">${Object.keys(units).map(u=>`<option>${u}</option>`).join('')}</select>
                <input type="number" id="unitInput" class="tool-input" placeholder="مقدار" value="1">
                <select id="unitFrom" class="tool-input"></select>
                <span style="color:#d4af37; text-align:center; display:block; margin:10px 0;">⬇</span>
                <select id="unitTo" class="tool-input"></select>
                <div id="unitResult" style="text-align:center; font-size:1.5rem; color:#d4af37; margin-top:15px;"></div>
            </div>
        `, () => {
            const typeSel = document.getElementById('unitType'), fromSel = document.getElementById('unitFrom'), toSel = document.getElementById('unitTo'), input = document.getElementById('unitInput'), result = document.getElementById('unitResult');
            function update() {
                const list = Object.keys(units[typeSel.value]);
                fromSel.innerHTML = toSel.innerHTML = list.map(u => `<option>${u}</option>`).join('');
                convert();
            }
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
            typeSel.addEventListener('change', update);
            fromSel.addEventListener('change', convert);
            toSel.addEventListener('change', convert);
            input.addEventListener('input', convert);
            update();
        });
    }

    function openNotes() {
        const saved = localStorage.getItem('myTimeNotes') || '';
        openAppPage('📝 یادداشت', `
            <div style="background:rgba(22,18,38,0.7); backdrop-filter:blur(20px); border:1px solid rgba(212,175,55,0.25); border-radius:20px; padding:20px;">
                <textarea id="notesArea" class="tool-input" style="height:300px; resize:vertical;">${saved}</textarea>
                <div style="display:flex; gap:10px; justify-content:center; margin-top:10px;">
                    <button class="tool-btn" id="saveNotes">💾 ذخیره</button>
                    <button class="tool-btn" id="clearNotes">🗑 پاک</button>
                </div>
                <div id="notesStatus" style="text-align:center; margin-top:10px; color:#d4af37;"></div>
            </div>
        `, () => {
            const area = document.getElementById('notesArea');
            document.getElementById('saveNotes').onclick = () => { localStorage.setItem('myTimeNotes', area.value); document.getElementById('notesStatus').textContent = '✅ ذخیره شد'; setTimeout(() => document.getElementById('notesStatus').textContent = '', 2000); };
            document.getElementById('clearNotes').onclick = () => { area.value = ''; localStorage.removeItem('myTimeNotes'); };
        });
    }

    function openDailyQuote() {
        let quotesArray = [];
        if(window.quotes && Array.isArray(window.quotes)) quotesArray = window.quotes;
        else if(typeof quotes !== 'undefined' && Array.isArray(quotes)) quotesArray = quotes;
        const randomQuote = quotesArray.length ? quotesArray[Math.floor(Math.random()*quotesArray.length)] : {text:'نقل‌قولی یافت نشد', author:''};
        const text = typeof randomQuote === 'string' ? randomQuote : randomQuote.text;
        const author = randomQuote.author || '';
        openAppPage('📜 نقل‌قول روزانه', `
            <div style="background:rgba(22,18,38,0.7); backdrop-filter:blur(20px); border:1px solid rgba(212,175,55,0.25); border-radius:20px; padding:20px; text-align:center;">
                <div style="font-size:1.4rem; font-style:italic; color:#ede5d0; line-height:2;">${text}</div>
                ${author ? `<div style="color:#d4af37; font-family:'Cormorant Garamond', serif; margin-top:15px;">— ${author}</div>` : ''}
                <button class="tool-btn" id="newQuote" style="margin-top:20px;">🔄 نقل‌قول جدید</button>
            </div>
        `, () => { document.getElementById('newQuote').onclick = () => { closeAppPage(); openDailyQuote(); }; });
    }

    // ========== منوی همبرگری ==========
    const menuCategories = [
        { name: '⏱️ زمان‌سنج‌ها', items: [
            { icon:'⏱️', text:'کرنوگراف حرفه‌ای', action: openChronograph },
            { icon:'🍅', text:'پومودورو', action: openPomodoro },
            { icon:'🕰️', text:'ساعت آنالوگ', action: openAnalogClock },
            { icon:'⏳', text:'تایمر', action: openTimer },
        ]},
        { name: '🌍 جهان', items: [
            { icon:'🌍', text:'ساعت جهانی', action: openWorldClock },
            { icon:'🌤️', text:'آب‌وهوا ۷ روزه', action: openWeather },
        ]},
        { name: '🧮 ابزارهای کاربردی', items: [
            { icon:'🔢', text:'ماشین حساب', action: openCalculator },
            { icon:'🔄', text:'تبدیل واحد', action: openUnitConverter },
            { icon:'📝', text:'یادداشت', action: openNotes },
            { icon:'📜', text:'نقل‌قول روزانه', action: openDailyQuote },
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
        console.log('✅ ابزارهای حرفه‌ای و منو فعال شدند');
    }

    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initTools);
    else initTools();

})();
