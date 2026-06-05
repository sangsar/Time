// ==================== tools.js ====================
// ابزارهای حرفه‌ای برای my time
// هر ابزار یک صفحهٔ کامل با تم هماهنگ دارد
(function() {

    // ===================== ساختار SPA =====================
    const appContainer = document.createElement('div');
    appContainer.id = 'appContainer';
    appContainer.style.cssText = `
        position: fixed; top:0; left:0; width:100%; height:100%;
        z-index: 50; background: #0a0a18; color: #e8e4f0;
        overflow-y: auto; display: none;
        font-family: 'Vazirmatn', sans-serif;
        -webkit-font-smoothing: antialiased;
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

    // ===================== ابزارهای کمکی =====================
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

    const style = `
        .tool-btn {
            background: rgba(212,175,55,0.2); border: 1px solid rgba(212,175,55,0.4);
            color: #fff; padding: 10px 20px; border-radius: 12px;
            cursor: pointer; font-family: 'Vazirmatn', sans-serif;
            margin: 5px; transition: 0.3s; font-size: 1rem;
        }
        .tool-btn:hover { background: rgba(212,175,55,0.4); }
        .tool-input, input, textarea {
            background: rgba(255,255,255,0.08); border: 1px solid rgba(212,175,55,0.3);
            color: #fff; padding: 10px 15px; border-radius: 12px;
            font-family: 'Vazirmatn', sans-serif; width: 100%;
            margin: 8px 0; outline: none; font-size: 1rem;
        }
        .lap-list { max-height: 200px; overflow-y: auto; margin-top: 15px; }
        .lap-item { padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; }
        .glass-panel {
            background: rgba(22,18,38,0.7); backdrop-filter: blur(20px);
            border: 1px solid rgba(212,175,55,0.25); border-radius: 20px;
            padding: 20px; margin-bottom: 20px;
        }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 600px) { .grid-2 { grid-template-columns: 1fr; } }
    `;
    const styleTag = document.createElement('style');
    styleTag.textContent = style;
    document.head.appendChild(styleTag);

    // ===================== ۱. کرنوگراف حرفه‌ای با لاپ =====================
    function openChronograph() {
        openAppPage('⏱️ کرنوگراف', `
            <div class="glass-panel">
                <div style="text-align:center; font-size:3.5rem; font-family:'Cinzel', serif; margin:20px 0; color:#ede5d0;" id="chronoDisplay">00:00.00</div>
                <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                    <button class="tool-btn" id="chronoStart">▶ شروع</button>
                    <button class="tool-btn" id="chronoStop">⏸ توقف</button>
                    <button class="tool-btn" id="chronoReset">↺ ریست</button>
                    <button class="tool-btn" id="chronoLap">🏁 لاپ</button>
                </div>
                <div class="lap-list" id="lapList"></div>
            </div>
        `, () => {
            let interval, running = false, time = 0, laps = [];
            const disp = document.getElementById('chronoDisplay'), lapList = document.getElementById('lapList');
            function updateDisp() {
                const ms = Math.floor(time/10)%100, s = Math.floor(time/1000)%60, m = Math.floor(time/60000);
                disp.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(ms).padStart(2,'0')}`;
            }
            document.getElementById('chronoStart').onclick = () => {
                if(!running) { running = true; const start = Date.now() - time;
                    interval = setInterval(() => { time = Date.now() - start; updateDisp(); }, 10); }
            };
            document.getElementById('chronoStop').onclick = () => { clearInterval(interval); running = false; };
            document.getElementById('chronoReset').onclick = () => { clearInterval(interval); running = false; time = 0; laps = []; updateDisp(); lapList.innerHTML = ''; };
            document.getElementById('chronoLap').onclick = () => {
                if(running) {
                    laps.push(time);
                    const li = document.createElement('div');
                    li.className = 'lap-item';
                    li.innerHTML = `<span>لاپ ${laps.length}</span><span style="font-family:'Cinzel';">${disp.textContent}</span>`;
                    lapList.prepend(li);
                }
            };
        });
    }

    // ===================== ۲. پومودورو با تنظیمات =====================
    function openPomodoro() {
        openAppPage('🍅 پومودورو', `
            <div class="glass-panel">
                <div style="text-align:center; font-size:4rem; font-family:'Cinzel', serif; margin:20px 0; color:#ede5d0;" id="pomDisplay">25:00</div>
                <div style="text-align:center; color:#d4af37; margin-bottom:15px;" id="pomStatus">آمادهٔ کار</div>
                <div class="grid-2">
                    <div><label>دقیقه کار</label><input type="number" id="workMin" class="tool-input" value="25" min="1"></div>
                    <div><label>دقیقه استراحت</label><input type="number" id="breakMin" class="tool-input" value="5" min="1"></div>
                </div>
                <div style="display:flex; gap:10px; justify-content:center; margin-top:15px;">
                    <button class="tool-btn" id="pomStart">▶ شروع</button>
                    <button class="tool-btn" id="pomPause">⏸ توقف</button>
                    <button class="tool-btn" id="pomReset">↺ ریست</button>
                </div>
            </div>
        `, () => {
            let interval, running = false, timeLeft = 1500, isWork = true;
            const disp = document.getElementById('pomDisplay'), status = document.getElementById('pomStatus');
            function update() { const m = Math.floor(timeLeft/60), s = timeLeft%60; disp.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }
            document.getElementById('pomStart').onclick = () => {
                if(!running) {
                    running = true;
                    interval = setInterval(() => {
                        if(timeLeft <= 0) {
                            clearInterval(interval); running = false;
                            isWork = !isWork;
                            timeLeft = (isWork ? parseInt(document.getElementById('workMin').value)||25 : parseInt(document.getElementById('breakMin').value)||5) * 60;
                            status.textContent = isWork ? 'زمان کار' : 'استراحت';
                            update();
                            return;
                        }
                        timeLeft--; update();
                    }, 1000);
                }
            };
            document.getElementById('pomPause').onclick = () => { clearInterval(interval); running = false; };
            document.getElementById('pomReset').onclick = () => { clearInterval(interval); running = false; isWork = true; timeLeft = (parseInt(document.getElementById('workMin').value)||25)*60; status.textContent = 'آمادهٔ کار'; update(); };
        });
    }

    // ===================== ۳. ساعت آنالوگ پیشرفته =====================
    function openAnalogClock() {
        openAppPage('🕰️ ساعت آنالوگ', `
            <div class="glass-panel" style="text-align:center;">
                <canvas id="analogCanvas" width="350" height="350"></canvas>
            </div>
        `, () => {
            const canvas = document.getElementById('analogCanvas'), ctx = canvas.getContext('2d');
            function draw() {
                ctx.clearRect(0,0,350,350);
                const now = new Date();
                const h = now.getHours()%12, m = now.getMinutes(), s = now.getSeconds();
                // صفحه
                ctx.beginPath(); ctx.arc(175,175,160,0,Math.PI*2);
                ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 6; ctx.stroke();
                ctx.fillStyle = 'rgba(20,15,35,0.5)'; ctx.fill();
                // اعداد
                ctx.fillStyle = '#d4af37'; ctx.font = 'bold 18px Cinzel'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                for(let i=1;i<=12;i++) {
                    const angle = (i*30 - 90) * Math.PI/180;
                    ctx.fillText(i, 175 + Math.cos(angle)*130, 175 + Math.sin(angle)*130);
                }
                // عقربه‌ها
                const drawHand = (angle, length, width, color) => {
                    const rad = (angle - 90) * Math.PI/180;
                    ctx.beginPath(); ctx.moveTo(175,175); ctx.lineTo(175+Math.cos(rad)*length, 175+Math.sin(rad)*length);
                    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.stroke();
                };
                drawHand((h+m/60)*30, 90, 8, '#d4af37');
                drawHand(m*6, 130, 5, '#e8e4f0');
                drawHand(s*6, 140, 2, '#ff6464');
                ctx.beginPath(); ctx.arc(175,175,10,0,Math.PI*2); ctx.fillStyle = '#d4af37'; ctx.fill();
                requestAnimationFrame(draw);
            }
            draw();
        });
    }

    // ===================== ۴. تایمر شمارش معکوس =====================
    function openTimer() {
        openAppPage('⏳ تایمر', `
            <div class="glass-panel">
                <div style="text-align:center; font-size:4rem; font-family:'Cinzel', serif; margin:20px 0;" id="timerDisplay">00:00</div>
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
            document.getElementById('timerStart').onclick = () => {
                if(!running) {
                    if(timeLeft === 0) timeLeft = (parseInt(document.getElementById('timerMinutes').value)||0)*60;
                    running = true;
                    interval = setInterval(() => { if(timeLeft<=0){clearInterval(interval); running=false; upd(); return; } timeLeft--; upd(); }, 1000);
                }
            };
            document.getElementById('timerPause').onclick = () => { clearInterval(interval); running = false; };
            document.getElementById('timerReset').onclick = () => { clearInterval(interval); running = false; timeLeft = 0; upd(); };
        });
    }

    // ===================== ۵. آب‌وهوا با نمودار ۷ روزه =====================
    function openWeather() {
        openAppPage('🌤️ آب‌وهوا', `
            <div class="glass-panel">
                <input type="text" id="weatherCity" class="tool-input" placeholder="نام شهر (انگلیسی)" value="Tehran">
                <button class="tool-btn" id="getWeather">🔍 دریافت پیش‌بینی ۷ روزه</button>
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
                    let html = `<h3 style="color:#d4af37;">${name}</h3>`;
                    const ctx = document.getElementById('weatherChart').getContext('2d');
                    const temps = daily.temperature_2m_max;
                    const mins = daily.temperature_2m_min;
                    const dates = daily.time;
                    // نمودار
                    ctx.clearRect(0,0,700,300);
                    ctx.fillStyle = 'rgba(22,18,38,0.7)'; ctx.fillRect(0,0,700,300);
                    ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 3;
                    ctx.beginPath();
                    for(let i=0;i<temps.length;i++) {
                        const x = 50 + i*100, y = 250 - temps[i]*5;
                        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
                        ctx.fillStyle = '#d4af37'; ctx.fillText(temps[i]+'°', x-10, y-10);
                        ctx.fillStyle = '#aaa'; ctx.fillText(mins[i]+'°', x-10, y+25);
                        ctx.fillStyle = '#ccc'; ctx.fillText(dates[i].slice(5), x-20, 280);
                    }
                    ctx.stroke();
                    document.getElementById('weatherResult').innerHTML = html;
                } catch(e) { document.getElementById('weatherResult').innerHTML = 'خطا در دریافت'; }
            };
            document.getElementById('getWeather').click();
        });
    }

    // ===================== ۶. ساعت جهانی =====================
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
            <div class="glass-panel">
                <input type="text" id="worldSearch" class="tool-input" placeholder="🔍 جستجوی شهر...">
                <div id="worldResults" style="max-height:400px; overflow-y:auto; margin-top:10px;"></div>
            </div>
        `, () => {
            const input = document.getElementById('worldSearch'), results = document.getElementById('worldResults');
            function show(q='') {
                const filtered = cities.filter(c => c.name.toLowerCase().includes(q.toLowerCase()));
                results.innerHTML = filtered.map(c => `<div style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between;"><span>${c.name}</span><span style="font-family:'Cinzel'; color:#d4af37;">${getTimeInCity(c.tz)}</span></div>`).join('');
            }
            show(); input.addEventListener('input', () => show(input.value));
            setInterval(() => show(input.value), 1000);
        });
    }

    // ===================== ۷. ماشین حساب =====================
    function openCalculator() {
        openAppPage('🔢 ماشین حساب', `
            <div class="glass-panel" style="max-width:350px; margin:0 auto;">
                <input type="text" id="calcDisplay" class="tool-input" style="text-align:right; font-size:2rem; font-family:'Cinzel';" readonly value="0">
                <div style="display:grid; grid-template-columns: repeat(4,1fr); gap:8px; margin-top:10px;">
                    ${['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+','C','(',')','%'].map(b => `<button class="tool-btn" style="padding:15px; font-size:1.2rem;" data-val="${b}">${b}</button>`).join('')}
                </div>
            </div>
        `, () => {
            const disp = document.getElementById('calcDisplay');
            let expr = '';
            document.querySelectorAll('#calcDisplay + div button').forEach(btn => {
                btn.addEventListener('click', () => {
                    const val = btn.dataset.val;
                    if(val === 'C') { expr = ''; disp.value = '0'; }
                    else if(val === '=') { try { expr = eval(expr).toString(); disp.value = expr; } catch(e) { disp.value = 'خطا'; expr = ''; } }
                    else { expr += val; disp.value = expr; }
                });
            });
        });
    }

    // ===================== ۸. تبدیل واحد =====================
    function openUnitConverter() {
        openAppPage('🔄 تبدیل واحد', `
            <div class="glass-panel">
                <select id="unitType" class="tool-input">
                    <option value="length">طول</option>
                    <option value="weight">وزن</option>
                    <option value="temp">دما</option>
                    <option value="time">زمان</option>
                </select>
                <input type="number" id="unitInput" class="tool-input" placeholder="مقدار" value="1">
                <select id="unitFrom" class="tool-input"></select>
                <span style="color:#d4af37; text-align:center; display:block; margin:10px 0;">⬇</span>
                <select id="unitTo" class="tool-input"></select>
                <div id="unitResult" style="text-align:center; font-size:1.5rem; color:#d4af37; margin-top:15px;"></div>
            </div>
        `, () => {
            const units = {
                length: { meter:1, km:1000, mile:1609.34, yard:0.9144, foot:0.3048 },
                weight: { kg:1, gram:0.001, pound:0.4536, ounce:0.02835 },
                temp: { celsius:'c', fahrenheit:'f', kelvin:'k' },
                time: { second:1, minute:60, hour:3600, day:86400 }
            };
            const typeSel = document.getElementById('unitType'), fromSel = document.getElementById('unitFrom'), toSel = document.getElementById('unitTo'), input = document.getElementById('unitInput'), result = document.getElementById('unitResult');
            function updateUnits() {
                const type = typeSel.value;
                const list = Object.keys(units[type]);
                fromSel.innerHTML = toSel.innerHTML = list.map(u => `<option>${u}</option>`).join('');
                convert();
            }
            function convert() {
                const type = typeSel.value, val = parseFloat(input.value)||0;
                const from = fromSel.value, to = toSel.value;
                if(type === 'temp') {
                    let c;
                    if(from === 'celsius') c = val;
                    else if(from === 'fahrenheit') c = (val-32)*5/9;
                    else c = val - 273.15;
                    let res;
                    if(to === 'celsius') res = c;
                    else if(to === 'fahrenheit') res = c*9/5+32;
                    else res = c + 273.15;
                    result.textContent = res.toFixed(2);
                } else {
                    const ratio = units[type][from] / units[type][to];
                    result.textContent = (val * ratio).toFixed(4);
                }
            }
            typeSel.addEventListener('change', updateUnits);
            fromSel.addEventListener('change', convert);
            toSel.addEventListener('change', convert);
            input.addEventListener('input', convert);
            updateUnits();
        });
    }

    // ===================== ۹. یادداشت =====================
    function openNotes() {
        const saved = localStorage.getItem('myTimeNotes') || '';
        openAppPage('📝 یادداشت', `
            <div class="glass-panel">
                <textarea id="notesArea" class="tool-input" style="height:300px; resize:vertical;">${saved}</textarea>
                <div style="display:flex; gap:10px; justify-content:center; margin-top:10px;">
                    <button class="tool-btn" id="saveNotes">💾 ذخیره</button>
                    <button class="tool-btn" id="clearNotes">🗑 پاک کردن</button>
                </div>
                <div id="notesStatus" style="text-align:center; margin-top:10px; color:#d4af37;"></div>
            </div>
        `, () => {
            const area = document.getElementById('notesArea');
            document.getElementById('saveNotes').onclick = () => {
                localStorage.setItem('myTimeNotes', area.value);
                document.getElementById('notesStatus').textContent = '✅ ذخیره شد';
                setTimeout(() => document.getElementById('notesStatus').textContent = '', 2000);
            };
            document.getElementById('clearNotes').onclick = () => { area.value = ''; localStorage.removeItem('myTimeNotes'); };
        });
    }

    // ===================== ۱۰. نقشه =====================
    function openMap() {
        openAppPage('🗺️ نقشه', `
            <div class="glass-panel" style="height:60vh; overflow:hidden; border-radius:20px;">
                <iframe src="https://www.openstreetmap.org/export/embed.html?bbox=51.2,35.5,51.6,35.9&layer=mapnik" style="width:100%; height:100%; border:none;"></iframe>
            </div>
        `);
    }

    // ===================== ۱۱. نقل‌قول روزانه =====================
    function openDailyQuote() {
        let quotesArray = [];
        if(window.quotes && Array.isArray(window.quotes)) quotesArray = window.quotes;
        else if(typeof quotes !== 'undefined' && Array.isArray(quotes)) quotesArray = quotes;
        const randomQuote = quotesArray.length ? quotesArray[Math.floor(Math.random()*quotesArray.length)] : {text:'نقل‌قولی یافت نشد', author:''};
        const text = typeof randomQuote === 'string' ? randomQuote : randomQuote.text;
        const author = randomQuote.author || '';
        openAppPage('📜 نقل‌قول روزانه', `
            <div class="glass-panel" style="text-align:center;">
                <div style="font-size:1.4rem; font-style:italic; color:#ede5d0; line-height:2; margin:30px 0;">${text}</div>
                ${author ? `<div style="color:#d4af37; font-family:'Cormorant Garamond', serif;">— ${author}</div>` : ''}
                <button class="tool-btn" id="newQuote" style="margin-top:20px;">🔄 نقل‌قول جدید</button>
            </div>
        `, () => {
            document.getElementById('newQuote').onclick = () => { closeAppPage(); openDailyQuote(); };
        });
    }

    // ===================== منوی همبرگری =====================
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
            { icon:'🗺️', text:'نقشه', action: openMap },
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

    // ===================== راه‌اندازی =====================
    function initTools() {
        buildMenu();
        console.log('✅ ابزارهای حرفه‌ای بارگذاری شدند');
    }

    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initTools);
    else initTools();

})();
