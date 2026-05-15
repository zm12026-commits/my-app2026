/**
 * ぷりぷりダイアリー - Compact & Voice
 */

document.addEventListener('DOMContentLoaded', () => {
    let entries = JSON.parse(localStorage.getItem('puri-diary-entries')) || [];
    
    const diaryForm = document.getElementById('diary-form');
    const dateInput = document.getElementById('date-input');
    const textInput = document.getElementById('text-input');
    const voiceBtn = document.getElementById('voice-btn');
    const entriesContainer = document.getElementById('entries-container');
    const fortuneModal = document.getElementById('fortune-modal');
    const fortuneResult = document.getElementById('fortune-result');
    const starsContainer = document.getElementById('stars-container');
    const canvas = document.getElementById('mood-chart');
    const ctx = canvas.getContext('2d');
    const bgmAudio = document.getElementById('bgm-audio');
    const bgmToggle = document.getElementById('bgm-toggle');

    const moodValues = { happy: 5, good: 4, normal: 3, sad: 2, cry: 1 };
    const moodIcons = { happy: '😊', good: '🙂', normal: '😐', sad: '😟', cry: '😭' };

    // BGM
    let isPlaying = false;
    bgmToggle.onclick = () => {
        if (isPlaying) {
            bgmAudio.pause();
            bgmToggle.innerHTML = '<i class="fas fa-music"></i>';
        } else {
            bgmAudio.play().catch(() => {});
            bgmToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
        isPlaying = !isPlaying;
    };

    // グラフ
    const drawChart = () => {
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            last7Days.push(d.toISOString().split('T')[0]);
        }

        const data = last7Days.map(date => {
            const entry = entries.find(e => e.date === date);
            return entry ? moodValues[entry.mood] : null;
        });

        const rect = canvas.parentNode.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const p = 10;
        const w = canvas.width - p*2;
        const h = canvas.height - p*2;
        const step = w / 6;

        ctx.strokeStyle = '#ffe0eb';
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(p, p + (h/4)*i);
            ctx.lineTo(p + w, p + (h/4)*i);
            ctx.stroke();
        }

        const pts = data.map((v, i) => v ? ({ x: p + step*i, y: p + h - ((v-1)/4)*h }) : null);
        ctx.beginPath();
        ctx.strokeStyle = '#ff9ed2';
        ctx.lineWidth = 3;
        let first = true;
        pts.forEach(pt => {
            if (pt) {
                if (first) { ctx.moveTo(pt.x, pt.y); first = false; }
                else ctx.lineTo(pt.x, pt.y);
            }
        });
        ctx.stroke();
    };

    // 占い
    const showFortune = () => {
        const colors = ['ピンク', 'ブルー', 'イエロー'];
        const items = ['チョコ', 'シール', 'キラキラペン'];
        fortuneResult.innerHTML = `
            <div class="fortune-item">カラー: ${colors[Math.floor(Math.random()*3)]}</div>
            <div class="fortune-item">アイテム: ${items[Math.floor(Math.random()*3)]}</div>
        `;
        fortuneModal.style.display = 'block';
    };

    window.closeModal = () => fortuneModal.style.display = 'none';

    // 描画
    const renderEntries = () => {
        entriesContainer.innerHTML = '';
        [...entries].sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(e => {
            const div = document.createElement('div');
            div.className = 'entry-card';
            div.innerHTML = `
                <div class="entry-header">
                    <span>${e.date} ${moodIcons[e.mood]}</span>
                    <i class="fas fa-trash delete-icon" onclick="deleteEntry('${e.id}')"></i>
                </div>
                <div>${e.text.replace(/\n/g, '<br>')}</div>
            `;
            entriesContainer.appendChild(div);
        });
    };

    window.deleteEntry = (id) => {
        if (confirm('消す？')) {
            entries = entries.filter(e => e.id !== id);
            localStorage.setItem('puri-diary-entries', JSON.stringify(entries));
            renderEntries();
            drawChart();
        }
    };

    diaryForm.onsubmit = (e) => {
        e.preventDefault();
        const mood = document.querySelector('input[name="mood"]:checked').value;
        entries.push({ id: Date.now().toString(), date: dateInput.value, mood, text: textInput.value.trim() });
        localStorage.setItem('puri-diary-entries', JSON.stringify(entries));
        textInput.value = '';
        renderEntries();
        drawChart();
        showFortune();
    };

    // 初期化
    dateInput.value = new Date().toISOString().split('T')[0];
    renderEntries();
    drawChart();
    window.onresize = drawChart;
});
