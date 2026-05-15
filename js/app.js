/**
 * ぷりぷりダイアリー - Optimized for Mobile & Graph
 */

document.addEventListener('DOMContentLoaded', () => {
    let entries = JSON.parse(localStorage.getItem('puri-diary-entries')) || [];
    
    const diaryForm = document.getElementById('diary-form');
    const dateInput = document.getElementById('date-input');
    const textInput = document.getElementById('text-input');
    const entriesContainer = document.getElementById('entries-container');
    const charCount = document.getElementById('char-count');
    const praiseMessage = document.getElementById('praise-message');
    const fortuneModal = document.getElementById('fortune-modal');
    const fortuneResult = document.getElementById('fortune-result');
    const starsContainer = document.getElementById('stars-container');
    const canvas = document.getElementById('mood-chart');
    const ctx = canvas.getContext('2d');

    // BGM要素
    const bgmAudio = document.getElementById('bgm-audio');
    const bgmToggle = document.getElementById('bgm-toggle');
    let isPlaying = false;

    // BGM切り替え
    bgmToggle.addEventListener('click', () => {
        if (isPlaying) {
            bgmAudio.pause();
            bgmToggle.classList.remove('playing');
            bgmToggle.innerHTML = '<i class="fas fa-music"></i>';
        } else {
            bgmAudio.play().catch(e => console.log("Audio play failed:", e));
            bgmToggle.classList.add('playing');
            bgmToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
        isPlaying = !isPlaying;
    });

    const moodValues = { happy: 5, good: 4, normal: 3, sad: 2, cry: 1 };
    const moodIcons = { happy: '😊', good: '🙂', normal: '😐', sad: '😟', cry: '😭' };

    // グラフ描画
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

        // Canvasサイズ設定
        const rect = canvas.parentNode.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const padding = 20;
        const width = canvas.width - padding * 2;
        const height = canvas.height - padding * 2;
        const stepX = width / 6;

        // グリッド線（横線）
        ctx.strokeStyle = '#ffe0eb';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const y = padding + (height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + width, y);
            ctx.stroke();
        }

        // ライン描画
        const points = data.map((v, i) => {
            if (v === null) return null;
            return {
                x: padding + stepX * i,
                y: padding + height - ((v - 1) / 4) * height
            };
        });

        ctx.beginPath();
        ctx.strokeStyle = '#ff9ed2';
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        let first = true;
        points.forEach(p => {
            if (p) {
                if (first) {
                    ctx.moveTo(p.x, p.y);
                    first = false;
                } else {
                    ctx.lineTo(p.x, p.y);
                }
            }
        });
        ctx.stroke();

        // 点を描画
        points.forEach(p => {
            if (p) {
                ctx.fillStyle = '#ff9ed2';
                ctx.beginPath();
                ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    };

    // 占いロジック
    const showFortune = () => {
        const colors = ['さくらピンク', 'ソーダブルー', 'レモンイエロー', 'ミントグリーン', 'ラベンダー'];
        const items = ['キラキラのペン', 'お気に入りの靴', '甘いチョコ', 'ふわふわのタオル', 'かわいいシール'];
        const messages = ['きょうは 最高に ラッキーだよ！', 'いいことが ある予感...✨', '笑顔でいれば ハッピーになれるよ！'];

        const color = colors[Math.floor(Math.random() * colors.length)];
        const item = items[Math.floor(Math.random() * items.length)];
        const msg = messages[Math.floor(Math.random() * messages.length)];

        fortuneResult.innerHTML = `
            <p style="margin-bottom: 1rem; font-weight: bold; color: var(--secondary-color);">${msg}</p>
            <div class="fortune-item">
                <div class="fortune-label">ラッキーカラー</div>
                <div class="fortune-value">${color}</div>
            </div>
            <div class="fortune-item">
                <div class="fortune-label">ラッキーアイテム</div>
                <div class="fortune-value">${item}</div>
            </div>
        `;
        fortuneModal.style.display = 'block';
    };

    window.closeModal = () => {
        fortuneModal.style.display = 'none';
    };

    // その他基本機能
    const createStars = () => {
        for (let i = 0; i < 15; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            const size = Math.random() * 15 + 5;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.animation = `floating ${Math.random() * 3 + 2}s ease-in-out infinite`;
            starsContainer.appendChild(star);
        }
    };

    const renderEntries = () => {
        entriesContainer.innerHTML = '';
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        entries.forEach(entry => {
            const card = document.createElement('div');
            card.className = 'entry-card';
            card.innerHTML = `
                <div class="entry-header">
                    <span class="entry-date">${entry.date} ${moodIcons[entry.mood]}</span>
                    <button class="delete-btn" data-id="${entry.id}"><i class="fas fa-trash"></i></button>
                </div>
                <div class="entry-content">${escapeHTML(entry.text)}</div>
            `;
            card.querySelector('.delete-btn').onclick = (e) => {
                if(confirm('けしちゃう？')) {
                    entries = entries.filter(item => item.id !== entry.id);
                    localStorage.setItem('puri-diary-entries', JSON.stringify(entries));
                    renderEntries();
                    drawChart();
                }
            };
            entriesContainer.appendChild(card);
        });
    };

    const escapeHTML = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    textInput.oninput = () => {
        const len = textInput.value.length;
        charCount.textContent = len;
        praiseMessage.textContent = len > 30 ? 'すごい！👏' : '';
    };

    diaryForm.onsubmit = (e) => {
        e.preventDefault();
        const mood = document.querySelector('input[name="mood"]:checked').value;
        const newEntry = {
            id: Date.now().toString(),
            date: dateInput.value,
            mood: mood,
            text: textInput.value.trim()
        };
        entries.push(newEntry);
        localStorage.setItem('puri-diary-entries', JSON.stringify(entries));
        textInput.value = '';
        renderEntries();
        drawChart();
        showFortune();
    };

    // 初期化
    const now = new Date();
    dateInput.value = now.toISOString().split('T')[0];
    createStars();
    renderEntries();
    drawChart();
    
    // リサイズ時にグラフ再描画
    window.onresize = drawChart;
});
