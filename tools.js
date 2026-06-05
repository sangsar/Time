// ==================== tools.js (بخش اول) ====================
(function() {

    // ========== ساختار SPA ==========
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
        .tool-btn:active { transform: scale(0.96); }
        .tool-input, input, textarea, select {
            background: rgba(255,255,255,0.06); border: 1px solid rgba(212,175,55,0.25);
            color: #fff; padding: 12px 16px; border-radius: 14px;
            font-family: 'Vazirmatn', sans-serif; width: 100%;
            margin: 10px 0; outline: none; font-size: 1rem;
            transition: border-color 0.3s, box-shadow 0.3s;
        }
        .tool-input:focus, input:focus, textarea:focus, select:focus {
            border-color: #d4af37; box-shadow: 0 0 0 3px rgba(212,175,55,0.15);
        }
        .glass-panel {
            background: rgba(22,18,38,0.65); backdrop-filter: blur(25px);
            -webkit-backdrop-filter: blur(25px);
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

    // ========== ۱. داشبورد حرفه‌ای ==========
    function openDashboard() {
        const now = new Date();
        const shamsi = gregorianToJalali(now);
        openAppPage('✨ داشبورد', `
            <div class="glass-panel" style="text-align:center;">
                <div style="font-size:3.5rem; font-family:'Cinzel'; color:#d4af37; text-shadow:0 0 20px rgba(212,175,55,0.5);" id="dashTime"></div>
                <div style="color:#ccc; font-size:1.1rem; margin-top:8px;" id="dashDate">${now.toLocaleDateString('fa-IR',{weekday:'long', year:'numeric', month:'long', day:'numeric'})}</div>
                <div style="color:#aaa; margin-top:4px;">📅 ${shamsi}</div>
                <div class="grid-2" style="margin-top:25px;">
                    <div class="stat-card"><div class="stat-number" id="dashTemp">--°</div><div class="stat-label">دمای تهران</div></div>
                    <div class="stat-card"><div class="stat-number" id="dashSessions">${localStorage.getItem('pomSessions')||0}</div><div class="stat-label">جلسات پومودورو</div></div>
                </div>
                <div style="margin-top:20px; font-style:italic; color:#ede5d0; font-size:1.1rem;" id="dashQuote">در حال بارگذاری...</div>
            </div>
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

    // ========== ۲. کرنوگراف حرفه‌ای ==========
    function openChronograph() {
        openAppPage('⏱️ کرنوگراف', `
            <div class="glass-panel">
                <div style="text-align:center; font-size:4.5rem; font-family:'Cinzel'; color:#ede5d0;" id="chronoDisplay">00:00.00</div>
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

    // ادامهٔ توابع پایه (تایمر، آلارم، ساعت جهانی و...) در بخش دوم...    // ====================== هوش مصنوعی ======================
    const HF_TOKEN = 'hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // توکن رایگان از huggingface.co/settings/tokens

    async function queryAI(model, data) {
        try {
            const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${HF_TOKEN}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            return result;
        } catch(e) { return null; }
    }

    // ========== ۲۶. چت‌بات هوشمند ==========
    function openChatbot() {
        openAppPage('🤖 چت‌بات هوشمند', `
            <div class="glass-panel">
                <div id="chatHistory" style="max-height:400px; overflow-y:auto; padding:10px; margin-bottom:15px;"></div>
                <input type="text" id="chatInput" class="tool-input" placeholder="سوالت رو به انگلیسی بپرس...">
                <button class="tool-btn" id="sendChatBtn" style="display:block; margin:10px auto;">ارسال</button>
            </div>
        `, () => {
            const history = document.getElementById('chatHistory');
            const input = document.getElementById('chatInput');
            document.getElementById('sendChatBtn').onclick = async () => {
                const msg = input.value.trim();
                if (!msg) return;
                history.innerHTML += `<div style="text-align:right; color:#d4af37; margin:8px;">🧑‍💻 ${msg}</div>`;
                input.value = '';
                const result = await queryAI('microsoft/DialoGPT-medium', { inputs: { text: msg } });
                const reply = result?.generated_text || 'متوجه نشدم.';
                history.innerHTML += `<div style="text-align:left; color:#ccc; margin:8px;">🤖 ${reply}</div>`;
                history.scrollTop = history.scrollHeight;
            };
        });
    }

    // ========== ۲۷. تولید عکس با هوش مصنوعی ==========
    function openAIImage() {
        openAppPage('🎨 تولید عکس هنری', `
            <div class="glass-panel" style="text-align:center;">
                <input type="text" id="imagePrompt" class="tool-input" placeholder="توضیح عکس (انگلیسی)">
                <button class="tool-btn" id="generateImageBtn">✨ تولید عکس</button>
                <div id="imageResult" style="margin-top:20px;"></div>
            </div>
        `, () => {
            document.getElementById('generateImageBtn').onclick = async () => {
                const prompt = document.getElementById('imagePrompt').value;
                document.getElementById('imageResult').innerHTML = '⏳ در حال تولید...';
                const result = await queryAI('stabilityai/stable-diffusion-2-1', { inputs: prompt });
                if (result) {
                    const blob = new Blob([result], { type: 'image/png' });
                    const url = URL.createObjectURL(blob);
                    document.getElementById('imageResult').innerHTML = `<img src="${url}" style="max-width:100%; border-radius:16px;">`;
                } else {
                    document.getElementById('imageResult').innerHTML = 'خطا در تولید.';
                }
            };
        });
    }

    // ========== ۲۸. تحلیل احساسات ==========
    function openSentiment() {
        openAppPage('😊 تحلیل احساسات', `
            <div class="glass-panel">
                <textarea id="sentimentInput" class="tool-input" placeholder="متنی برای تحلیل..."></textarea>
                <button class="tool-btn" id="analyzeSentimentBtn">تحلیل</button>
                <div id="sentimentResult" style="text-align:center; margin-top:20px; color:#d4af37; font-size:1.3rem;"></div>
            </div>
        `, () => {
            document.getElementById('analyzeSentimentBtn').onclick = async () => {
                const text = document.getElementById('sentimentInput').value;
                const result = await queryAI('distilbert-base-uncased-finetuned-sst-2-english', { inputs: text });
                const label = result?.[0]?.[0]?.label;
                document.getElementById('sentimentResult').textContent = label === 'POSITIVE' ? '😊 مثبت' : '😢 منفی';
            };
        });
    }

    // ========== ۲۹. خلاصه‌سازی حرفه‌ای ==========
    function openSummarizer() {
        openAppPage('📝 خلاصه‌سازی', `
            <div class="glass-panel">
                <textarea id="summarizeInput" class="tool-input" placeholder="متن طولانی..."></textarea>
                <button class="tool-btn" id="summarizeBtn">خلاصه کن</button>
                <div id="summarizeResult" style="margin-top:20px; padding:15px; background:rgba(255,255,255,0.05); border-radius:12px; color:#ccc;"></div>
            </div>
        `, () => {
            document.getElementById('summarizeBtn').onclick = async () => {
                const text = document.getElementById('summarizeInput').value;
                const result = await queryAI('facebook/bart-large-cnn', { inputs: text });
                document.getElementById('summarizeResult').textContent = result?.[0]?.summary_text || 'خلاصه‌سازی نشد.';
            };
        });
    }

    // ========== ۳۰. ترجمه هوشمند ==========
    function openTranslator() {
        openAppPage('🌍 ترجمه هوشمند', `
            <div class="glass-panel">
                <textarea id="translateInput" class="tool-input" placeholder="متن فارسی یا انگلیسی..."></textarea>
                <button class="tool-btn" id="translateBtn">ترجمه (انگلیسی ← فارسی)</button>
                <div id="translateResult" style="margin-top:20px; color:#d4af37; font-size:1.2rem;"></div>
            </div>
        `, () => {
            document.getElementById('translateBtn').onclick = async () => {
                const text = document.getElementById('translateInput').value;
                const result = await queryAI('Helsinki-NLP/opus-mt-en-fa', { inputs: text });
                document.getElementById('translateResult').textContent = result?.[0]?.translation_text || 'ترجمه نشد.';
            };
        });
    }

    // ========== ۳۱. متن به گفتار ==========
    function openTTS() {
        openAppPage('🗣️ متن به گفتار', `
            <div class="glass-panel">
                <textarea id="ttsInput" class="tool-input" placeholder="متنی برای خواندن..."></textarea>
                <button class="tool-btn" id="ttsBtn">🔊 بخوان</button>
            </div>
        `, () => {
            document.getElementById('ttsBtn').onclick = () => {
                const text = document.getElementById('ttsInput').value;
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'fa-IR';
                speechSynthesis.speak(utterance);
            };
        });
    }

    // ========== ۳۲. گفتار به متن ==========
    function openSTT() {
        openAppPage('🎤 گفتار به متن', `
            <div class="glass-panel">
                <button class="tool-btn" id="sttBtn">🎤 شروع ضبط</button>
                <div id="sttResult" style="margin-top:20px; padding:15px; background:rgba(255,255,255,0.05); border-radius:12px; color:#ccc;"></div>
            </div>
        `, () => {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) { document.getElementById('sttResult').textContent = 'مرورگر پشتیبانی نمی‌کند.'; return; }
            const recognition = new SpeechRecognition();
            recognition.lang = 'fa-IR';
            document.getElementById('sttBtn').onclick = () => recognition.start();
            recognition.onresult = (event) => { document.getElementById('sttResult').textContent = event.results[0][0].transcript; };
        });
    }

    // ========== ۳۳. تشخیص زبان ==========
    function openLanguageDetector() {
        openAppPage('🔍 تشخیص زبان', `
            <div class="glass-panel">
                <textarea id="langInput" class="tool-input" placeholder="متنی برای تشخیص زبان..."></textarea>
                <button class="tool-btn" id="detectLangBtn">تشخیص</button>
                <div id="langResult" style="text-align:center; margin-top:20px; color:#d4af37; font-size:1.3rem;"></div>
            </div>
        `, () => {
            document.getElementById('detectLangBtn').onclick = async () => {
                const text = document.getElementById('langInput').value;
                const result = await queryAI('papluca/xlm-roberta-base-language-detection', { inputs: text });
                document.getElementById('langResult').textContent = `زبان: ${result?.[0]?.[0]?.label || 'نامشخص'}`;
            };
        });
    }

    // ========== ۳۴. پیش‌بینی عددی ==========
    function openNumericPredict() {
        openAppPage('📊 پیش‌بینی عددی', `
            <div class="glass-panel">
                <input type="text" id="numbersInput" class="tool-input" placeholder="اعداد با کاما (مثلاً 1,2,3,4)">
                <button class="tool-btn" id="predictBtn">پیش‌بینی عدد بعدی</button>
                <div id="predictResult" style="text-align:center; margin-top:20px; color:#d4af37; font-size:1.5rem;"></div>
            </div>
        `, () => {
            document.getElementById('predictBtn').onclick = () => {
                const input = document.getElementById('numbersInput').value;
                const nums = input.split(',').map(Number).filter(n => !isNaN(n));
                if (nums.length < 2) return;
                const next = nums[nums.length-1] + (nums[nums.length-1] - nums[nums.length-2]);
                document.getElementById('predictResult').textContent = `عدد بعدی: ${next}`;
            };
        });
    }

    // ========== ۳۵. تولید پالت رنگ هوشمند ==========
    function openAIColor() {
        openAppPage('🎨 پالت رنگ هوشمند', `
            <div class="glass-panel">
                <input type="text" id="colorPrompt" class="tool-input" placeholder="حالت رنگ (مثلاً sunset)">
                <button class="tool-btn" id="generateColorBtn">✨ تولید</button>
                <div id="colorPalette" style="display:flex; gap:10px; justify-content:center; margin-top:20px;"></div>
            </div>
        `, () => {
            document.getElementById('generateColorBtn').onclick = async () => {
                const prompt = document.getElementById('colorPrompt').value || 'beautiful';
                const result = await queryAI('gpt2', { inputs: `Generate hex color palette for ${prompt}: #` });
                const hex = result?.[0]?.generated_text?.match(/#[0-9A-F]{6}/gi)?.[0] || '#d4af37';
                const palette = document.getElementById('colorPalette');
                palette.innerHTML = '';
                for (let i=0; i<5; i++) {
                    const div = document.createElement('div');
                    div.style.cssText = `width:60px; height:60px; border-radius:12px; background:${hex}; filter:brightness(${100+i*20}%);`;
                    palette.appendChild(div);
                }
            };
        });
    }

    // ========== ۳۶. دستیار کدنویسی ==========
    function openCodeAssistant() {
        openAppPage('💻 دستیار کدنویسی', `
            <div class="glass-panel">
                <textarea id="codePrompt" class="tool-input" placeholder="توضیح تابع مورد نظر..."></textarea>
                <button class="tool-btn" id="generateCodeBtn">✨ تولید کد</button>
                <pre id="codeResult" style="margin-top:20px; padding:15px; background:rgba(0,0,0,0.3); border-radius:12px; color:#d4af37; overflow-x:auto;"></pre>
            </div>
        `, () => {
            document.getElementById('generateCodeBtn').onclick = async () => {
                const prompt = document.getElementById('codePrompt').value;
                const result = await queryAI('codeparrot/codeparrot', { inputs: prompt });
                document.getElementById('codeResult').textContent = result?.[0]?.generated_text || '// کدی تولید نشد.';
            };
        });
    }

    // ========== ۳۷. مشاور زمان ==========
    function openTimeAdvisor() {
        openAppPage('⏰ مشاور زمان', `
            <div class="glass-panel" style="text-align:center;">
                <div id="advisorResult" style="font-size:1.3rem; color:#ede5d0; margin:20px 0;"></div>
                <button class="tool-btn" id="getAdviceBtn">🔮 دریافت مشاوره</button>
            </div>
        `, () => {
            const advices = [
                'اکنون بهترین زمان برای شروع یک پروژه جدید است.',
                'کمی استراحت کن و ذهنت را آزاد بگذار.',
                'الان وقت مناسبی برای یادگیری یک مهارت جدید است.',
                'به کارهای عقب‌افتاده‌ات برس، وقت مناسبی است.',
                'اکنون زمان خلوت و تمرکز عمیق است.'
            ];
            document.getElementById('getAdviceBtn').onclick = () => {
                const advice = advices[Math.floor(Math.random() * advices.length)];
                document.getElementById('advisorResult').textContent = advice;
            };
        });
    }

    // ========== ۳۸. تکمیل خودکار متن ==========
    function openAutocomplete() {
        openAppPage('✍️ تکمیل خودکار', `
            <div class="glass-panel">
                <textarea id="autocompleteInput" class="tool-input" placeholder="شروع یک جمله..."></textarea>
                <button class="tool-btn" id="autocompleteBtn">✨ تکمیل کن</button>
                <div id="autocompleteResult" style="margin-top:20px; color:#ccc; font-size:1.2rem;"></div>
            </div>
        `, () => {
            document.getElementById('autocompleteBtn').onclick = async () => {
                const text = document.getElementById('autocompleteInput').value;
                const result = await queryAI('gpt2', { inputs: text });
                document.getElementById('autocompleteResult').textContent = result?.[0]?.generated_text || 'ادامه‌ای یافت نشد.';
            };
        });
    }

    // ========== ۳۹. ایده‌پردازی ==========
    function openIdeaGenerator() {
        openAppPage('💡 ایده‌پردازی', `
            <div class="glass-panel">
                <input type="text" id="ideaTopic" class="tool-input" placeholder="موضوع ایده">
                <button class="tool-btn" id="generateIdeaBtn">✨ ایده بده</button>
                <div id="ideaResult" style="margin-top:20px; color:#d4af37; font-size:1.3rem;"></div>
            </div>
        `, () => {
            const ideas = ['یک اپلیکیشن برای مدیریت زمان', 'ابزاری برای تحلیل احساسات', 'پلتفرم آموزش آنلاین', 'بازی تعاملی', 'دستیار هوشمند شخصی'];
            document.getElementById('generateIdeaBtn').onclick = () => {
                document.getElementById('ideaResult').textContent = ideas[Math.floor(Math.random() * ideas.length)];
            };
        });
    }

    // ========== ۴۰. تحلیل داده ==========
    function openDataAnalysis() {
        openAppPage('📈 تحلیل داده', `
            <div class="glass-panel">
                <textarea id="dataInput" class="tool-input" placeholder="داده‌های عددی (هر خط یک عدد)"></textarea>
                <button class="tool-btn" id="analyzeDataBtn">تحلیل</button>
                <div id="dataResult" style="margin-top:20px; color:#ccc;"></div>
            </div>
        `, () => {
            document.getElementById('analyzeDataBtn').onclick = () => {
                const text = document.getElementById('dataInput').value;
                const nums = text.split('\n').map(Number).filter(n => !isNaN(n));
                if (!nums.length) return;
                const sum = nums.reduce((a,b) => a+b, 0);
                const avg = sum / nums.length;
                const max = Math.max(...nums);
                const min = Math.min(...nums);
                document.getElementById('dataResult').innerHTML = `
                    مجموع: ${sum}<br>میانگین: ${avg.toFixed(2)}<br>بیشینه: ${max}<br>کمینه: ${min}
                `;
            };
        });
    }

    // ========== ابزارهای جهانی پرطرفدار ==========

    // ========== ۴۱. مبدل ارز زنده ==========
    function openCurrencyConverter() {
        openAppPage('💱 مبدل ارز', `
            <div class="glass-panel">
                <input type="number" id="currencyAmount" class="tool-input" placeholder="مقدار" value="1">
                <select id="currencyFrom" class="tool-input"><option>USD</option><option>EUR</option><option>IRR</option></select>
                <select id="currencyTo" class="tool-input"><option>IRR</option><option>USD</option><option>EUR</option></select>
                <button class="tool-btn" id="convertCurrencyBtn">تبدیل</button>
                <div id="currencyResult" style="text-align:center; margin-top:20px; color:#d4af37; font-size:1.5rem;"></div>
            </div>
        `, () => {
            document.getElementById('convertCurrencyBtn').onclick = async () => {
                const amount = document.getElementById('currencyAmount').value;
                const from = document.getElementById('currencyFrom').value;
                const to = document.getElementById('currencyTo').value;
                try {
                    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
                    const data = await res.json();
                    const result = (amount * data.rates[to]).toFixed(2);
                    document.getElementById('currencyResult').textContent = `${amount} ${from} = ${result} ${to}`;
                } catch(e) { document.getElementById('currencyResult').textContent = 'خطا در دریافت.'; }
            };
        });
    }

    // ========== ۴۲. تست سرعت اینترنت ==========
    function openSpeedTest() {
        openAppPage('🚀 تست سرعت', `
            <div class="glass-panel" style="text-align:center;">
                <button class="tool-btn" id="startSpeedTest">شروع تست</button>
                <div id="speedResult" style="margin-top:20px; color:#d4af37; font-size:1.3rem;"></div>
            </div>
        `, () => {
            document.getElementById('startSpeedTest').onclick = () => {
                document.getElementById('speedResult').textContent = '⏳ در حال تست...';
                const image = new Image();
                const startTime = Date.now();
                image.onload = () => {
                    const duration = (Date.now() - startTime) / 1000;
                    const bits = 500000 * 8;
                    const speed = (bits / duration / 1024 / 1024).toFixed(2);
                    document.getElementById('speedResult').textContent = `سرعت تقریبی: ${speed} Mbps`;
                };
                image.src = 'https://www.google.com/images/phd/px.gif?t=' + Date.now();
            };
        });
    }

    // ========== ۴۳. کوتاه‌کننده لینک ==========
    function openLinkShortener() {
        openAppPage('🔗 کوتاه‌کننده لینک', `
            <div class="glass-panel">
                <input type="text" id="longUrl" class="tool-input" placeholder="لینک بلند">
                <button class="tool-btn" id="shortenBtn">کوتاه کن</button>
                <div id="shortUrlResult" style="margin-top:20px; text-align:center; color:#d4af37;"></div>
            </div>
        `, () => {
            document.getElementById('shortenBtn').onclick = async () => {
                const url = document.getElementById('longUrl').value;
                try {
                    const res = await fetch(`https://api.shrtco.de/v2/shorten?url=${encodeURIComponent(url)}`);
                    const data = await res.json();
                    document.getElementById('shortUrlResult').textContent = data.result?.short_link || 'خطا';
                } catch(e) {}
            };
        });
    }

    // ========== ۴۴. تولید رمز عبور قوی ==========
    function openPasswordGenerator() {
        openAppPage('🔐 رمز عبور', `
            <div class="glass-panel">
                <button class="tool-btn" id="generatePasswordBtn">تولید رمز</button>
                <div id="passwordResult" style="margin-top:20px; text-align:center; color:#d4af37; font-size:1.5rem; word-break:break-all;"></div>
            </div>
        `, () => {
            document.getElementById('generatePasswordBtn').onclick = () => {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
                let pass = '';
                for (let i=0; i<16; i++) pass += chars[Math.floor(Math.random() * chars.length)];
                document.getElementById('passwordResult').textContent = pass;
            };
        });
    }

    // ========== ۴۵. ماشین حساب BMI ==========
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
                const w = parseFloat(document.getElementById('weight').value);
                const h = parseFloat(document.getElementById('height').value) / 100;
                const bmi = (w / (h * h)).toFixed(1);
                let status = bmi < 18.5 ? 'کمبود وزن' : bmi < 25 ? 'نرمال' : bmi < 30 ? 'اضافه وزن' : 'چاق';
                document.getElementById('bmiResult').textContent = `${bmi} (${status})`;
            };
        });
    }

    // ========== ۴۶. ویرایشگر ساده عکس ==========
    function openImageEditor() {
        openAppPage('🖼️ ویرایشگر عکس', `
            <div class="glass-panel" style="text-align:center;">
                <input type="file" id="imageUpload" accept="image/*" class="tool-input">
                <br>
                <button class="tool-btn" id="grayscaleBtn">سیاه و سفید</button>
                <button class="tool-btn" id="blurBtn">محو کردن</button>
                <canvas id="imageCanvas" style="max-width:100%; margin-top:20px; border-radius:16px;"></canvas>
            </div>
        `, () => {
            const canvas = document.getElementById('imageCanvas');
            const ctx = canvas.getContext('2d');
            let img = new Image();
            document.getElementById('imageUpload').onchange = (e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (event) => {
                    img.onload = () => { canvas.width = img.width; canvas.height = img.height; ctx.drawImage(img,0,0); };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            };
            document.getElementById('grayscaleBtn').onclick = () => {
                const imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
                for (let i=0; i<imageData.data.length; i+=4) {
                    const avg = (imageData.data[i] + imageData.data[i+1] + imageData.data[i+2]) / 3;
                    imageData.data[i] = imageData.data[i+1] = imageData.data[i+2] = avg;
                }
                ctx.putImageData(imageData,0,0);
            };
            document.getElementById('blurBtn').onclick = () => { ctx.filter = 'blur(5px)'; ctx.drawImage(img,0,0); ctx.filter = 'none'; };
        });
    }

    // ========== منوی نهایی بر اساس ارزش ==========
    const menuCategories = [
        { name: '✨ خانه', items: [{ icon:'🏠', text:'داشبورد', action: openDashboard }] },
        { name: '🤖 هوش مصنوعی', items: [
            { icon:'🤖', text:'چت‌بات هوشمند', action: openChatbot },
            { icon:'🎨', text:'تولید عکس هنری', action: openAIImage },
            { icon:'💻', text:'دستیار کدنویسی', action: openCodeAssistant },
            { icon:'📝', text:'خلاصه‌سازی', action: openSummarizer },
            { icon:'😊', text:'تحلیل احساسات', action: openSentiment },
            { icon:'🌍', text:'ترجمه هوشمند', action: openTranslator },
            { icon:'🗣️', text:'متن به گفتار', action: openTTS },
            { icon:'🎤', text:'گفتار به متن', action: openSTT },
            { icon:'🔍', text:'تشخیص زبان', action: openLanguageDetector },
            { icon:'✍️', text:'تکمیل خودکار', action: openAutocomplete },
            { icon:'💡', text:'ایده‌پردازی', action: openIdeaGenerator },
            { icon:'📊', text:'پیش‌بینی عددی', action: openNumericPredict },
            { icon:'🎨', text:'پالت رنگ هوشمند', action: openAIColor },
            { icon:'⏰', text:'مشاور زمان', action: openTimeAdvisor },
            { icon:'📈', text:'تحلیل داده', action: openDataAnalysis },
        ]},
        { name: '🌍 ابزارهای جهانی', items: [
            { icon:'💱', text:'مبدل ارز', action: openCurrencyConverter },
            { icon:'🚀', text:'تست سرعت', action: openSpeedTest },
            { icon:'🔗', text:'کوتاه‌کننده لینک', action: openLinkShortener },
            { icon:'🔐', text:'رمز عبور', action: openPasswordGenerator },
            { icon:'⚖️', text:'محاسبه BMI', action: openBMI },
            { icon:'🖼️', text:'ویرایشگر عکس', action: openImageEditor },
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
            { icon:'🌙', text:'فاز ماه', action: openMoonPhase },
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
            cat.items.forEach(item => {
                html += `<div class="menu-item" data-action="${item.text}"><span>${item.icon}</span> ${item.text}</div>`;
            });
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
        console.log('✅ اَبَر سایت با ۵۰+ ابزار و هوش مصنوعی فعال شد');
    }
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initTools);
    else initTools();
})();
